/**
 * models/Question.js
 *
 * Stores aptitude questions with options, answers, explanations,
 * topic tags, difficulty level, and usage statistics.
 */

const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    // ── Question Content ────────────────────────────────────────
    questionText: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },

    // Multiple choice options (A, B, C, D)
    options: {
      type: [String],
      required: [true, "Options are required"],
      validate: {
        validator: (arr) => arr.length === 4,
        message: "Exactly 4 options are required",
      },
    },

    // Index of correct option (0 = A, 1 = B, 2 = C, 3 = D)
    correctOption: {
      type: Number,
      required: [true, "Correct option index is required"],
      min: 0,
      max: 3,
    },

    // Detailed explanation shown after answering
    explanation: {
      type: String,
      default: "",
      trim: true,
    },

    // ── Categorization ──────────────────────────────────────────
    topic: {
      type: String,
      required: [true, "Topic is required"],
      enum: [
        "Quantitative Aptitude",
        "Logical Reasoning",
        "Verbal Ability",
        "Data Interpretation",
      ],
    },

    // Subtopic within the main topic
    subtopic: {
      type: String,
      required: [true, "Subtopic is required"],
      trim: true,
      // Examples: "Percentages", "Time & Work", "Syllogisms", "Reading Comprehension"
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },

    // Suggested time in seconds for this question
    suggestedTime: {
      type: Number,
      default: 60,
    },

    // ── Analytics ───────────────────────────────────────────────
    // Track how often this question is answered correctly/wrongly
    stats: {
      timesAttempted: { type: Number, default: 0 },
      timesCorrect:   { type: Number, default: 0 },
    },

    // ── Metadata ────────────────────────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [String], // Extra labels like "formula-based", "trick question"
  },
  {
    timestamps: true,
    // Add a virtual field for accuracy percentage
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Virtual: accuracy percentage for this question ─────────────
questionSchema.virtual("accuracyRate").get(function () {
  if (this.stats.timesAttempted === 0) return 0;
  return Math.round((this.stats.timesCorrect / this.stats.timesAttempted) * 100);
});

// ── Index for fast querying by topic/subtopic/difficulty ────────
questionSchema.index({ topic: 1, subtopic: 1, difficulty: 1 });
questionSchema.index({ "stats.timesAttempted": -1 }); // For "most attempted" queries

module.exports = mongoose.model("Question", questionSchema);
