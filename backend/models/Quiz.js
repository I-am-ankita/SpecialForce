/**
 * models/Quiz.js
 *
 * A Quiz is a configuration template — it defines which questions,
 * topic, time limit, etc. A Result stores one user's attempt at a quiz.
 */

const mongoose = require("mongoose");

// ── Quiz Schema ────────────────────────────────────────────────────────────
const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
    },
    description: { type: String, default: "" },

    topic: { type: String, required: true },
    subtopic: { type: String, default: "" }, // Empty = mixed subtopics

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Mixed"],
      default: "Mixed",
    },

    // List of questions in this quiz (can be pre-set or generated on-the-fly)
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],

    questionCount: { type: Number, default: 10 },

    // Total time for the quiz in seconds (e.g. 600 = 10 minutes)
    totalTime: { type: Number, required: true, default: 600 },

    // Time allowed per question in seconds (for per-question timer mode)
    timePerQuestion: { type: Number, default: 60 },

    // Whether questions are randomized each attempt
    randomize: { type: Boolean, default: true },

    quizType: {
      type: String,
      enum: ["practice", "timed", "daily"],
      default: "practice",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// ── Result Schema ──────────────────────────────────────────────────────────
// Stores a single user's attempt at a quiz
const resultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: false, // ← dynamic quizzes have no pre-built Quiz document
      default: null,
    },

    // Snapshot of quiz info (in case quiz is later deleted)
    quizTitle: { type: String },
    topic: { type: String },
    subtopic: { type: String },
    difficulty: { type: String },

    // Per-answer breakdown
    answers: [
      {
        question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
        selectedOption: { type: Number, default: -1 }, // -1 = not answered (skipped/timeout)
        isCorrect: { type: Boolean, default: false },
        timeTaken: { type: Number, default: 0 }, // seconds on this question
      },
    ],

    // Summary stats
    score: { type: Number, default: 0 }, // number of correct answers
    totalQuestions: { type: Number, required: true },
    accuracy: { type: Number, default: 0 }, // percentage 0-100
    totalTimeTaken: { type: Number, default: 0 }, // total seconds for quiz
    averageTimePerQ: { type: Number, default: 0 }, // average seconds per question

    // Was the quiz submitted before time ran out?
    autoSubmitted: { type: Boolean, default: false },

    // Percentile rank at time of submission (recalculated periodically)
    percentile: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// ── Pre-save: calculate derived fields ────────────────────────
resultSchema.pre("save", function (next) {
  if (this.totalQuestions > 0) {
    this.accuracy = Math.round((this.score / this.totalQuestions) * 100);
  }
  if (this.answers.length > 0) {
    this.averageTimePerQ = Math.round(
      this.totalTimeTaken / this.answers.length,
    );
  }
  next();
});

// ── Index for fast leaderboard/history queries ─────────────────
resultSchema.index({ user: 1, createdAt: -1 });
resultSchema.index({ quiz: 1, score: -1 });

const Quiz = mongoose.model("Quiz", quizSchema);
const Result = mongoose.model("Result", resultSchema);

module.exports = { Quiz, Result };
