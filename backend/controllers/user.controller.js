/**
 * controllers/user.controller.js
 *
 * Personal dashboard data and admin team analytics
 */

const User   = require("../models/User");
const { Result } = require("../models/Quiz");
const { asyncHandler } = require("../middleware/errorHandler");

// ── GET /api/users/dashboard ───────────────────────────────────
// Returns all data needed to render the personal dashboard
exports.getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Fetch user with populated badges
  const user = await User.findById(userId)
    .populate("badges.badge", "name icon color description category")
    .populate("bookmarks", "questionText topic subtopic difficulty");

  // ── Weak Topics Detection ──────────────────────────────────
  // Topics where accuracy < 60% and attempted > 2 times
  const weakTopics = [];
  if (user.topicStats) {
    user.topicStats.forEach((stats, subtopic) => {
      if (stats.total >= 3) {
        const accuracy = Math.round((stats.correct / stats.total) * 100);
        if (accuracy < 60) {
          weakTopics.push({ subtopic, accuracy, attempted: stats.total });
        }
      }
    });
    weakTopics.sort((a, b) => a.accuracy - b.accuracy); // Worst first
  }

  // ── Recent Activity (last 5 quizzes) ──────────────────────
  const recentResults = await Result.find({ user: userId })
    .sort("-createdAt")
    .limit(5)
    .select("topic subtopic score totalQuestions accuracy totalTimeTaken createdAt");

  // ── Performance trend (last 10 quizzes for chart) ─────────
  const trendData = await Result.find({ user: userId })
    .sort("-createdAt")
    .limit(10)
    .select("accuracy score totalQuestions createdAt topic");

  res.json({
    success: true,
    dashboard: {
      stats:         user.stats,
      streak:        user.streak,
      dailyGoal:     user.dailyGoal,
      weakTopics:    weakTopics.slice(0, 5), // Top 5 weakest
      badges:        user.badges,
      bookmarks:     user.bookmarks,
      recentResults,
      trendData:     trendData.reverse(), // Chronological order for chart
    },
  });
});

// ── GET /api/users/profile/:id ─────────────────────────────────
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password -bookmarks")
    .populate("badges.badge", "name icon color");

  if (!user || !user.isActive) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  res.json({ success: true, user });
});

// ── PATCH /api/users/profile ───────────────────────────────────
exports.updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "avatar", "dailyGoal"];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  res.json({ success: true, user });
});

// ── POST /api/users/bookmark/:questionId ──────────────────────
exports.toggleBookmark = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const user = await User.findById(req.user._id);

  const isBookmarked = user.bookmarks.includes(questionId);

  if (isBookmarked) {
    user.bookmarks = user.bookmarks.filter((id) => id.toString() !== questionId);
  } else {
    user.bookmarks.push(questionId);
  }

  await user.save();

  res.json({
    success: true,
    bookmarked: !isBookmarked,
    message: isBookmarked ? "Bookmark removed." : "Question bookmarked.",
  });
});

// ── GET /api/users/all (Admin only) ───────────────────────────
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "user", isActive: true })
    .select("name email stats streak createdAt")
    .sort("-stats.averageAccuracy");

  res.json({ success: true, users });
});

// ── GET /api/leaderboard ───────────────────────────────────────
exports.getLeaderboard = asyncHandler(async (req, res) => {
  const { metric = "accuracy", limit = 10 } = req.query;

  let sortField;
  switch (metric) {
    case "accuracy":   sortField = "-stats.averageAccuracy";  break;
    case "quizzes":    sortField = "-stats.totalQuizzes";     break;
    case "streak":     sortField = "-streak.current";         break;
    default:           sortField = "-stats.averageAccuracy";
  }

  const users = await User.find({ role: "user", isActive: true })
    .select("name avatar stats streak badges")
    .populate("badges.badge", "icon")
    .sort(sortField)
    .limit(Number(limit));

  const leaderboard = users.map((u, i) => ({
    rank:            i + 1,
    _id:             u._id,
    name:            u.name,
    avatar:          u.avatar,
    totalQuizzes:    u.stats.totalQuizzes,
    averageAccuracy: u.stats.averageAccuracy,
    streak:          u.streak.current,
    badgeCount:      u.badges.length,
  }));

  res.json({ success: true, leaderboard });
});

// ── GET /api/users/team-analytics (Admin only) ────────────────
exports.getTeamAnalytics = asyncHandler(async (req, res) => {
  // Overall team stats
  const users = await User.find({ role: "user", isActive: true })
    .select("name stats topicStats streak");

  // Aggregate team-level topic weaknesses
  const teamTopicStats = {};
  users.forEach((user) => {
    if (user.topicStats) {
      user.topicStats.forEach((stats, subtopic) => {
        if (!teamTopicStats[subtopic]) {
          teamTopicStats[subtopic] = { correct: 0, total: 0 };
        }
        teamTopicStats[subtopic].correct += stats.correct;
        teamTopicStats[subtopic].total   += stats.total;
      });
    }
  });

  // Convert to array and compute accuracy
  const teamWeakTopics = Object.entries(teamTopicStats)
    .filter(([, s]) => s.total >= 5)
    .map(([subtopic, s]) => ({
      subtopic,
      accuracy: Math.round((s.correct / s.total) * 100),
      attempted: s.total,
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 10);

  // Summary stats
  const avgAccuracy = users.length
    ? Math.round(users.reduce((sum, u) => sum + u.stats.averageAccuracy, 0) / users.length)
    : 0;

  const avgQuizzes = users.length
    ? Math.round(users.reduce((sum, u) => sum + u.stats.totalQuizzes, 0) / users.length)
    : 0;

  res.json({
    success: true,
    analytics: {
      totalMembers:  users.length,
      avgAccuracy,
      avgQuizzes,
      teamWeakTopics,
      members: users.map((u) => ({
        _id:             u._id,
        name:            u.name,
        totalQuizzes:    u.stats.totalQuizzes,
        averageAccuracy: u.stats.averageAccuracy,
        streak:          u.streak.current,
      })),
    },
  });
});
