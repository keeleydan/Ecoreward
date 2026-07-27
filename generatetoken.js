// ============================================================
// EcoLeey Backend — JWT Token Generator
// File: utils/generateToken.js
//
// Generates a signed JSON Web Token for an authenticated user.
// The token is used by the frontend to prove identity on every
// subsequent request, and is verified by authMiddleware.js.
// ============================================================

const jwt = require('jsonwebtoken');

/**
 * generateToken
 * Creates a signed JWT containing the user's id and role.
 *
 * @param {string} id   - The MongoDB _id of the user
 * @param {string} role - The user's role ('user' or 'admin')
 * @returns {string} A signed JWT valid for 7 days
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = generateToken;