/**
 * server.js - Main entry point for the Aptitude Platform API
 *
 * Loads environment variables, connects to MongoDB, registers all
 * middleware and routes, then starts the HTTP server.
 */
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// ── Route imports ──────────────────────────────────────────────
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const questionRoutes = require("./routes/question.routes");
const quizRoutes = require("./routes/quiz.routes");
const resultRoutes = require("./routes/result.routes");
const noteRoutes = require("./routes/note.routes");
const badgeRoutes = require("./routes/badge.routes");
const leaderboardRoutes = require("./routes/leaderboard.routes");
const practiceRoutes = require("./routes/practice.routes");

const { errorHandler } = require("./middleware/errorHandler");

const app = express();

// ── Security & Utility Middleware ──────────────────────────────
app.use(helmet()); // Sets secure HTTP headers
app.use(morgan("dev")); // Logs HTTP requests in development

// CORS - Allow requests from the React frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Rate limiting - Prevent brute-force attacks (100 req / 15 min per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});
app.use("/api/", limiter);

// Parse JSON and URL-encoded bodies
app.use(express.json({ limit: "10mb" })); // 10mb for bulk JSON uploads
app.use(express.urlencoded({ extended: true }));

// ── Routes ─────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/practice", practiceRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Aptitude Platform API is running 🚀" });
});

// ── Global Error Handler (must be last middleware) ─────────────
app.use(errorHandler);

// ── Database Connection & Server Start ─────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📋 Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1); // Exit process on DB failure
  });
