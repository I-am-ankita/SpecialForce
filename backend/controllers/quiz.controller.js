/**
 * controllers/quiz.controller.js
 *
 * Handles the quiz lifecycle:
 * - getQuizQuestions: Fetch randomized questions for a quiz session
 * - submitQuiz: Save the user's answers, calculate score, update stats
 */

const Question = require("../models/Question");
const { Quiz, Result } = require("../models/Quiz");
const User = require("../models/User");
const { Badge } = require("../models/Note");
const { asyncHandler } = require("../middleware/errorHandler");

// ── GET /api/quizzes/questions ────────────────────────────────
// Fetches randomized questions for a quiz session.
// Does NOT reveal correct answers to the client.
exports.getQuizQuestions = asyncHandler(async (req, res) => {
  const { topic, subtopic, difficulty, count = 10, quizId } = req.query;

  let questions;

  if (quizId) {
    // Fetch questions from a specific pre-built quiz
    const quiz = await Quiz.findById(quizId).populate("questions");
    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found." });
    }
    questions = quiz.questions;
  } else {
    // Build a dynamic quiz from question pool
    const filter = { isActive: true };
    if (topic) filter.topic = topic;
    if (subtopic) filter.subtopic = subtopic;
    if (difficulty) filter.difficulty = difficulty;

    // MongoDB's $sample gives a random selection without replacement
    questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: Number(count) } },
    ]);
  }

  if (questions.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No questions found for the selected filters.",
    });
  }

  // Strip correct answers before sending to client
  // Users should not see correctOption until after submission
  const sanitized = questions.map((q) => ({
    _id: q._id,
    questionText: q.questionText,
    options: q.options,
    topic: q.topic,
    subtopic: q.subtopic,
    difficulty: q.difficulty,
    suggestedTime: q.suggestedTime,
    // correctOption is intentionally excluded
  }));

  res.json({ success: true, questions: sanitized, total: sanitized.length });
});

// ── POST /api/quizzes/submit ───────────────────────────────────
// Called when the user finishes a quiz (manual submit or auto-submit on timeout)
exports.submitQuiz = asyncHandler(async (req, res) => {
  const {
    topic,
    subtopic,
    difficulty,
    answers, // Array: [{ questionId, selectedOption, timeTaken }]
    totalTimeTaken,
    autoSubmitted = false,
  } = req.body;

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No answers provided." });
  }

  // Fetch the correct answers from DB for all submitted question IDs
  const questionIds = answers.map((a) => a.questionId);
  const questions = await Question.find({ _id: { $in: questionIds } });

  // Create a lookup map: { questionId -> question document }
  const questionMap = {};
  questions.forEach((q) => {
    questionMap[q._id.toString()] = q;
  });

  // ── Score each answer ────────────────────────────────────────
  let score = 0;
  const processedAnswers = [];
  const topicUpdates = {};

  for (const ans of answers) {
    const q = questionMap[ans.questionId];
    if (!q) continue;

    const isCorrect = ans.selectedOption === q.correctOption;
    if (isCorrect) score++;

    processedAnswers.push({
      question: q._id,
      selectedOption: ans.selectedOption ?? -1,
      isCorrect,
      timeTaken: ans.timeTaken || 0,
    });

    // Track per-topic stats for weak topic detection
    const key = q.subtopic;
    if (!topicUpdates[key]) topicUpdates[key] = { correct: 0, total: 0 };
    topicUpdates[key].total += 1;
    topicUpdates[key].correct += isCorrect ? 1 : 0;

    // Update global question stats (how often correct/wrong across all users)
    await Question.findByIdAndUpdate(q._id, {
      $inc: {
        "stats.timesAttempted": 1,
        "stats.timesCorrect": isCorrect ? 1 : 0,
      },
    });
  }

  // ── Save the Result document ─────────────────────────────────
  const result = await Result.create({
    user: req.user._id,
    quizTitle: `${topic || "Mixed"}${subtopic ? " - " + subtopic : ""} Quiz`,
    topic: topic || "Mixed",
    subtopic: subtopic || "",
    difficulty: difficulty || "Mixed",
    answers: processedAnswers,
    score,
    totalQuestions: processedAnswers.length,
    totalTimeTaken: totalTimeTaken || 0,
    autoSubmitted,
  });

  // ── Update User Stats ────────────────────────────────────────
  const user = await User.findById(req.user._id);

  user.stats.totalQuizzes += 1;
  user.stats.totalCorrect += score;
  user.stats.totalQuestions += processedAnswers.length;
  user.stats.totalTimeTaken += totalTimeTaken || 0;

  // Recalculate averages
  user.stats.averageAccuracy = Math.round(
    (user.stats.totalCorrect / user.stats.totalQuestions) * 100,
  );
  user.stats.averageTimePerQ = Math.round(
    user.stats.totalTimeTaken / user.stats.totalQuestions,
  );

  // Update topic-level stats
  for (const [subtopic, delta] of Object.entries(topicUpdates)) {
    const current = user.topicStats.get(subtopic) || { correct: 0, total: 0 };
    user.topicStats.set(subtopic, {
      correct: current.correct + delta.correct,
      total: current.total + delta.total,
    });
  }

  // Update streak
  user.updateStreak();

  // Update daily goal
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastDate = user.dailyGoal.date ? new Date(user.dailyGoal.date) : null;
  if (!lastDate || lastDate.getTime() !== today.getTime()) {
    user.dailyGoal.todayDone = processedAnswers.length;
    user.dailyGoal.date = today;
  } else {
    user.dailyGoal.todayDone += processedAnswers.length;
  }

  await user.save();

  // ── Check and Award Badges ─────────────────────────────────
  const newBadges = await checkAndAwardBadges(user, result);

  // ── Return full result with correct answers (now safe to reveal) ─
  const fullResult = await Result.findById(result._id).populate(
    "answers.question",
    "questionText options correctOption explanation",
  );

  res.json({
    success: true,
    result: fullResult,
    newBadges,
  });
});

// ── Helper: Badge awarding logic ───────────────────────────────
async function checkAndAwardBadges(user, result) {
  const allBadges = await Badge.find({ isActive: true });
  const earnedIds = user.badges.map((b) => b.badge.toString());
  const newBadges = [];

  for (const badge of allBadges) {
    if (earnedIds.includes(badge._id.toString())) continue; // Already earned

    let earned = false;
    const { type, value } = badge.criteria;

    switch (type) {
      case "quiz_count":
        earned = user.stats.totalQuizzes >= value;
        break;
      case "accuracy_threshold":
        earned = user.stats.averageAccuracy >= value;
        break;
      case "streak_days":
        earned = user.streak.current >= value;
        break;
      case "perfect_score":
        earned = result.score === result.totalQuestions;
        break;
      case "speed_demon":
        earned = result.totalTimeTaken <= value && result.totalQuestions >= 10;
        break;
    }

    if (earned) {
      user.badges.push({ badge: badge._id });
      newBadges.push(badge);
    }
  }

  if (newBadges.length > 0) {
    await user.save();
  }

  return newBadges;
}

// ── GET /api/quizzes/history ───────────────────────────────────
// Returns paginated quiz history for the logged-in user
exports.getHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const total = await Result.countDocuments({ user: req.user._id });
  const results = await Result.find({ user: req.user._id })
    .sort("-createdAt")
    .skip(skip)
    .limit(Number(limit))
    .select("-answers"); // Exclude detailed answers in list view

  res.json({
    success: true,
    total,
    pages: Math.ceil(total / limit),
    results,
  });
});

// ── GET /api/quizzes/result/:id ────────────────────────────────
// Returns one full result with answer explanations
exports.getResult = asyncHandler(async (req, res) => {
  const result = await Result.findOne({
    _id: req.params.id,
    user: req.user._id, // Ensure users can only see their own results
  }).populate(
    "answers.question",
    "questionText options correctOption explanation topic subtopic",
  );

  if (!result) {
    return res
      .status(404)
      .json({ success: false, message: "Result not found." });
  }

  res.json({ success: true, result });
});
