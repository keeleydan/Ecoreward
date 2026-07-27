// ============================================================
// EcoLeey Backend — Admin Middleware
// File: middleware/adminMiddleware.js
//
// Restricts access to admin-only routes (e.g. the Admin
// Dashboard). Must run AFTER the `protect` middleware, since it
// relies on req.user already being populated.
// ============================================================

/**
 * adminOnly
 * Express middleware that only allows users with role = 'admin'
 * to proceed. Must be chained after `protect`.
 *
 * On success: calls next().
 * On failure: responds with 403 Forbidden.
 */
const adminOnly = (req, res, next) => {
  if (!req.user) {
    // Safety net in case adminOnly is used without protect by mistake
    return res.status(401).json({
      success: false,
      message: 'Not authorized — please log in',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied — administrator privileges required',
    });
  }

  next();
};

module.exports = { adminOnly };