// ============================================================
// EcoLeey Backend — User Routes
// File: routes/userRoutes.js
//
// All routes here require authentication (protect) and
// admin privileges (adminOnly).
// ============================================================

const express = require('express');
const router  = express.Router();

const {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
} = require('../controllers/userController');

const { protect }    = require('../middleware/authMiddleware');
const { adminOnly }  = require('../middleware/adminMiddleware');

// All routes below require a valid JWT AND admin role
router.use(protect, adminOnly);

router.get('/',           getAllUsers);
router.get('/:id',        getUserById);
router.put('/:id/status', updateUserStatus);
router.delete('/:id',     deleteUser);

module.exports = router;