// ============================================================
// EcoLeey Backend — Auth Routes
// File: routes/authRoutes.js
//
// Defines all authentication-related API endpoints and wires
// them to their corresponding controller functions. Protected
// routes use the `protect` middleware to require a valid JWT.
// ============================================================

const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  updateProfile,
  changePassword,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

// ── Public Routes ────────────────────────────────────────────
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// ── Protected Routes (require a valid JWT) ──────────────────
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;