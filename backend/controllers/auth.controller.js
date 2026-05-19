/**
 * controllers/auth.controller.js
 *
 * Handles user authentication:
 * - signup: Create a new account
 * - login:  Verify credentials and issue JWT
 * - getMe:  Return logged-in user's profile
 */

const User           = require("../models/User");
const { generateToken } = require("../utils/jwt");
const { asyncHandler } = require("../middleware/errorHandler");

// ── Helper: send token response ────────────────────────────────
// Creates a JWT and returns user info + token in the response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken({ id: user._id, role: user.role });

  // Remove password from response object
  const userData = user.toObject();
  delete userData.password;

  res.status(statusCode).json({
    success: true,
    token,
    user: userData,
  });
};

// ── POST /api/auth/signup ──────────────────────────────────────
exports.signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide name, email, and password.",
    });
  }

  // Check if email already registered
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: "An account with this email already exists.",
    });
  }

  // Create user — password is hashed by the pre-save hook in User model
  const user = await User.create({ name, email, password });

  sendTokenResponse(user, 201, res);
});

// ── POST /api/auth/login ───────────────────────────────────────
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and password.",
    });
  }

  // Find user and include password (normally excluded by select: false)
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user || !user.isActive) {
    // Use a generic message to avoid leaking whether email exists
    return res.status(401).json({
      success: false,
      message: "Invalid email or password.",
    });
  }

  // Compare entered password with stored hash
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password.",
    });
  }

  sendTokenResponse(user, 200, res);
});

// ── GET /api/auth/me ───────────────────────────────────────────
// Returns the currently logged-in user's profile (requires protect middleware)
exports.getMe = asyncHandler(async (req, res) => {
  // req.user is set by the protect middleware
  const user = await User.findById(req.user._id)
    .populate("badges.badge", "name icon color description")
    .populate("bookmarks", "questionText topic subtopic difficulty");

  res.json({ success: true, user });
});

// ── PATCH /api/auth/update-password ───────────────────────────
exports.updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Please provide current and new password.",
    });
  }

  // Fetch user WITH password
  const user = await User.findById(req.user._id).select("+password");
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Current password is incorrect.",
    });
  }

  user.password = newPassword; // Pre-save hook will hash it
  await user.save();

  sendTokenResponse(user, 200, res);
});
