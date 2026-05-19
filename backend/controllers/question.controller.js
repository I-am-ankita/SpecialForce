/**
 * controllers/question.controller.js
 *
 * Admin-facing endpoints for managing questions:
 * - CRUD operations
 * - Bulk JSON upload
 * - Stats and filtering
 */

const Question = require("../models/Question");
const { asyncHandler } = require("../middleware/errorHandler");

// ── GET /api/questions ─────────────────────────────────────────
// Supports filtering by topic, subtopic, difficulty, and pagination
exports.getQuestions = asyncHandler(async (req, res) => {
  const {
    topic,
    subtopic,
    difficulty,
    page     = 1,
    limit    = 20,
    sort     = "-createdAt",
  } = req.query;

  // Build dynamic filter object
  const filter = { isActive: true };
  if (topic)      filter.topic      = topic;
  if (subtopic)   filter.subtopic   = subtopic;
  if (difficulty) filter.difficulty = difficulty;

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Question.countDocuments(filter);

  const questions = await Question.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .populate("createdBy", "name");

  res.json({
    success: true,
    total,
    pages: Math.ceil(total / limit),
    currentPage: Number(page),
    questions,
  });
});

// ── GET /api/questions/:id ─────────────────────────────────────
exports.getQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id).populate("createdBy", "name");

  if (!question) {
    return res.status(404).json({ success: false, message: "Question not found." });
  }

  res.json({ success: true, question });
});

// ── POST /api/questions ────────────────────────────────────────
exports.createQuestion = asyncHandler(async (req, res) => {
  const question = await Question.create({
    ...req.body,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, question });
});

// ── PUT /api/questions/:id ─────────────────────────────────────
exports.updateQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!question) {
    return res.status(404).json({ success: false, message: "Question not found." });
  }

  res.json({ success: true, question });
});

// ── DELETE /api/questions/:id ──────────────────────────────────
// Soft delete — sets isActive to false rather than removing from DB
exports.deleteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!question) {
    return res.status(404).json({ success: false, message: "Question not found." });
  }

  res.json({ success: true, message: "Question deleted successfully." });
});

// ── POST /api/questions/bulk-upload ───────────────────────────
// Accepts an array of question objects in the request body
// Example: send { "questions": [ {...}, {...} ] }
exports.bulkUpload = asyncHandler(async (req, res) => {
  const { questions } = req.body;

  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please provide a non-empty 'questions' array.",
    });
  }

  if (questions.length > 500) {
    return res.status(400).json({
      success: false,
      message: "Maximum 500 questions per bulk upload.",
    });
  }

  // Attach the admin's ID to all questions
  const questionsWithCreator = questions.map((q) => ({
    ...q,
    createdBy: req.user._id,
  }));

  // ordered: false means it continues even if some documents fail validation
  const inserted = await Question.insertMany(questionsWithCreator, {
    ordered: false,
  });

  res.status(201).json({
    success: true,
    message: `Successfully uploaded ${inserted.length} questions.`,
    count: inserted.length,
  });
});

// ── GET /api/questions/most-wrong ─────────────────────────────
// Returns questions with lowest accuracy (most commonly missed)
exports.getMostWrongQuestions = asyncHandler(async (req, res) => {
  const questions = await Question.find({
    isActive: true,
    "stats.timesAttempted": { $gte: 5 }, // Only include if attempted at least 5 times
  })
    .sort({ "stats.timesAttempted": -1 }) // Sort by most attempted
    .limit(20)
    .select("questionText topic subtopic difficulty stats");

  // Sort by accuracy ascending (most wrong first) after computing virtual
  const sorted = questions
    .map((q) => ({
      ...q.toObject(),
      accuracyRate: q.accuracyRate,
    }))
    .sort((a, b) => a.accuracyRate - b.accuracyRate);

  res.json({ success: true, questions: sorted });
});

// ── GET /api/questions/topics ──────────────────────────────────
// Returns distinct topics and their subtopics for the UI
exports.getTopicsAndSubtopics = asyncHandler(async (req, res) => {
  const data = await Question.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: { topic: "$topic", subtopic: "$subtopic" },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: "$_id.topic",
        subtopics: {
          $push: { name: "$_id.subtopic", count: "$count" },
        },
        totalQuestions: { $sum: "$count" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({ success: true, topics: data });
});
