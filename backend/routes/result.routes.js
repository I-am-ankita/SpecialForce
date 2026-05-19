// routes/result.routes.js
const express = require("express");
const r = express.Router();
const { protect } = require("../middleware/auth");
const { Result } = require("../models/Quiz");
const { asyncHandler } = require("../middleware/errorHandler");

r.use(protect);
// Retry wrong questions from a result
r.get("/:id/retry", asyncHandler(async (req, res) => {
  const result = await Result.findOne({ _id: req.params.id, user: req.user._id })
    .populate("answers.question");
  if (!result) return res.status(404).json({ success: false, message: "Result not found." });

  const wrongQuestions = result.answers
    .filter(a => !a.isCorrect && a.question)
    .map(a => ({
      _id: a.question._id,
      questionText: a.question.questionText,
      options: a.question.options,
      topic: a.question.topic,
      subtopic: a.question.subtopic,
      difficulty: a.question.difficulty,
      suggestedTime: a.question.suggestedTime,
    }));

  res.json({ success: true, questions: wrongQuestions });
}));

module.exports = r;
