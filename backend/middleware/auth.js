/**
 * middleware/auth.js
 *
 * Express middleware for JWT authentication and role-based authorization.
 *
 * HOW IT WORKS:
 * 1. Client sends: Authorization: Bearer <token>  in request headers
 * 2. protect() extracts and verifies the token
 * 3. Attaches the user object to req.user for downstream handlers
 * 4. restrictTo() checks that req.user has the required role
 */

const { verifyToken } = require("../utils/jwt");
const User = require("../models/User");

/**
 * protect - Middleware that ensures the request has a valid JWT.
 * Apply to any route that requires login.
 *
 * Usage: router.get("/profile", protect, getProfile)
 */
const protect = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Please log in to continue.",
      });
    }

    // 2. Verify the token (throws if expired or tampered)
    const decoded = verifyToken(token);

    // 3. Find the user in the database
    const user = await User.findById(decoded.id).select("-password");
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or account deactivated.",
      });
    }

    // 4. Attach user to request object for use in route handlers
    req.user = user;
    next();
  } catch (err) {
    // Handle specific JWT errors with friendly messages
    let message = "Invalid or expired token. Please log in again.";
    if (err.name === "TokenExpiredError") message = "Session expired. Please log in again.";
    if (err.name === "JsonWebTokenError")  message = "Invalid token. Please log in again.";

    return res.status(401).json({ success: false, message });
  }
};

/**
 * restrictTo - Factory that returns middleware restricting access by role.
 * Must be used AFTER protect().
 *
 * Usage: router.delete("/user/:id", protect, restrictTo("admin"), deleteUser)
 *
 * @param {...string} roles - Allowed roles (e.g., "admin", "user")
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action requires one of: [${roles.join(", ")}]`,
      });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
