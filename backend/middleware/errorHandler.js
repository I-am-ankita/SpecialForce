/**
 * middleware/errorHandler.js
 *
 * Global error handling middleware for Express.
 * Catches all errors thrown/passed via next(err) and returns
 * a clean JSON response instead of crashing or leaking stack traces.
 */

/**
 * errorHandler - Must be registered as the LAST middleware in server.js.
 * It receives errors from: throw new Error(), next(error), or async errors.
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 Internal Server Error
  let statusCode = err.statusCode || 500;
  let message    = err.message    || "Internal server error";

  // ── Mongoose Validation Error ──────────────────────────────
  // Happens when required fields are missing or enum values are wrong
  if (err.name === "ValidationError") {
    statusCode = 400;
    // Combine all validation messages into one readable string
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // ── MongoDB Duplicate Key Error ────────────────────────────
  // Happens when inserting a document with a duplicate unique field (e.g. email)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  }

  // ── Mongoose CastError ─────────────────────────────────────
  // Happens when an invalid ObjectId is passed (e.g. /users/not-an-id)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // In production, don't expose internal error details
  if (process.env.NODE_ENV === "production" && statusCode === 500) {
    message = "Something went wrong. Please try again later.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Include stack trace only in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * asyncHandler - Wraps async route handlers to automatically catch
 * rejected promises and pass them to errorHandler.
 *
 * Without this, you'd need try/catch in every async route handler.
 *
 * Usage: router.get("/", asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, asyncHandler };
