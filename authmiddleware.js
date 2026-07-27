// ============================================================
// EcoLeey Backend — Authentication Middleware
// File: middleware/authMiddleware.js
//
// Protects private routes by requiring a valid JWT. Reads the
// token from the Authorization header, verifies it, and attaches
// the authenticated user (minus the password) to req.user.
// ============================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect
 * Express middleware that guards private routes.
 *
 * Expects: Authorization: Bearer <token>
 *
 * On success: attaches the authenticated user to req.user and
 * calls next().
 * On failure: responds with 401 Unauthorized.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Expect the format: "Authorization: Bearer <token>"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // No token provided at all
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — no token provided',
      });
    }

    // Verify the token's signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — invalid or expired token',
      });
    }

    // Fetch the user associated with this token, excluding the password
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — user no longer exists',
      });
    }

    // Block access for deactivated accounts
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'This account has been deactivated',
      });
    }

    // Attach the authenticated user to the request for downstream handlers
    req.user = user;
    next();
  } catch (error) {
    console.error(`Auth middleware error: ${error.message}`);
    res.status(401).json({
      success: false,
      message: 'Not authorized',
    });
  }
};

module.exports = { protect };