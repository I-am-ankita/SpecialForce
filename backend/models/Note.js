/**
 * models/Note.js  — Topic-wise notes and formula sheets
 * models/Badge.js — Achievement definitions
 */

const mongoose = require("mongoose");

// ── Note Schema ────────────────────────────────────────────────
const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Note title is required"],
      trim: true,
    },

    // Markdown content — rendered on the frontend with a markdown parser
    content: {
      type: String,
      required: [true, "Note content is required"],
    },

    topic: {
      type: String,
      required: true,
      enum: [
        "Quantitative Aptitude",
        "Logical Reasoning",
        "Verbal Ability",
        "Data Interpretation",
        "General",
      ],
    },

    subtopic: { type: String, default: "" },

    noteType: {
      type: String,
      enum: ["concept", "formula", "shortcut", "example"],
      default: "concept",
    },

    // Notes can be global (admin-created) or personal (user-created)
    isPublic: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // For formula sheets — render with LaTeX or plain text
    hasFormulas: { type: Boolean, default: false },

    tags: [String],
  },
  { timestamps: true }
);

noteSchema.index({ topic: 1, subtopic: 1 });

// ── Badge Schema ───────────────────────────────────────────────
const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: "🏆",  // Emoji or icon name
    },
    color: {
      type: String,
      default: "#FFD700",  // Gold color
    },

    // Category for grouping in the UI
    category: {
      type: String,
      enum: ["accuracy", "streak", "completion", "speed", "topic", "social"],
      default: "completion",
    },

    // Criteria to earn this badge (evaluated in badge-check logic)
    criteria: {
      type: {
        type: String,
        enum: [
          "quiz_count",       // Complete N quizzes
          "accuracy_threshold",// Achieve X% accuracy
          "streak_days",      // Maintain N-day streak
          "topic_mastery",    // Complete N quizzes on a topic
          "perfect_score",    // Get 100% on a quiz
          "speed_demon",      // Complete quiz in under X seconds
        ],
      },
      value:   { type: Number }, // The threshold
      topic:   { type: String }, // Only for topic-based badges
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Note  = mongoose.model("Note",  noteSchema);
const Badge = mongoose.model("Badge", badgeSchema);

module.exports = { Note, Badge };
