/**
 * models/User.js
 *
 * Defines the User schema for MongoDB.
 * Stores authentication info, performance stats, badges, and streaks.
 */

const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // ── Basic Info ─────────────────────────────────────────────
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Never return password in queries by default
    },

    // ── Role ───────────────────────────────────────────────────
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // ── Performance Stats ──────────────────────────────────────
    stats: {
      totalQuizzes:        { type: Number, default: 0 },
      totalCorrect:        { type: Number, default: 0 },
      totalQuestions:      { type: Number, default: 0 },
      totalTimeTaken:      { type: Number, default: 0 }, // in seconds
      averageAccuracy:     { type: Number, default: 0 }, // percentage 0-100
      averageTimePerQ:     { type: Number, default: 0 }, // in seconds
    },

    // ── Topic Performance (for weak topic detection) ───────────
    // Example: { "Percentages": { correct: 5, total: 10 }, ... }
    topicStats: {
      type: Map,
      of: new mongoose.Schema(
        {
          correct: { type: Number, default: 0 },
          total:   { type: Number, default: 0 },
        },
        { _id: false }
      ),
      default: {},
    },

    // ── Bookmarked Questions ───────────────────────────────────
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],

    // ── Gamification ───────────────────────────────────────────
    badges: [
      {
        badge:     { type: mongoose.Schema.Types.ObjectId, ref: "Badge" },
        awardedAt: { type: Date, default: Date.now },
      },
    ],
    streak: {
      current:  { type: Number, default: 0 }, // consecutive days active
      longest:  { type: Number, default: 0 },
      lastDate: { type: Date },               // last day user was active
    },
    dailyGoal: {
      target:    { type: Number, default: 10 }, // questions per day
      todayDone: { type: Number, default: 0 },
      date:      { type: Date },
    },

    // ── Account Status ─────────────────────────────────────────
    isActive: { type: Boolean, default: true },
    avatar:   { type: String, default: "" }, // URL or initials fallback
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ── Pre-save Hook: Hash password before storing ────────────────
// This runs automatically before every .save() call
userSchema.pre("save", async function (next) {
  // Only hash if the password field was modified (or is new)
  if (!this.isModified("password")) return next();

  // bcrypt salt rounds: 12 is a good balance of security vs speed
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance Method: Compare entered password with hash ────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Instance Method: Update streak ────────────────────────────
userSchema.methods.updateStreak = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize to midnight

  const lastActive = this.streak.lastDate
    ? new Date(this.streak.lastDate)
    : null;

  if (lastActive) {
    lastActive.setHours(0, 0, 0, 0);
    const diff = (today - lastActive) / (1000 * 60 * 60 * 24); // days

    if (diff === 1) {
      // Active yesterday → extend streak
      this.streak.current += 1;
    } else if (diff > 1) {
      // Missed a day → reset streak
      this.streak.current = 1;
    }
    // diff === 0 means same day, don't change streak
  } else {
    this.streak.current = 1; // First ever activity
  }

  if (this.streak.current > this.streak.longest) {
    this.streak.longest = this.streak.current;
  }

  this.streak.lastDate = today;
};

module.exports = mongoose.model("User", userSchema);
