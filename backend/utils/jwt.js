/**
 * utils/jwt.js
 *
 * Helpers for creating and verifying JWT tokens.
 * A JWT (JSON Web Token) is a signed string containing user info,
 * used to authenticate API requests without storing sessions.
 */

const jwt = require("jsonwebtoken");

/**
 * Generate a signed JWT token for a user.
 * @param {Object} payload - Data to embed (usually { id, role })
 * @returns {string} Signed JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * Verify a JWT token and return its decoded payload.
 * Throws an error if the token is invalid or expired.
 * @param {string} token - JWT string to verify
 * @returns {Object} Decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
