// ============================================================
// EcoLeey Backend — User Controller
// File: controllers/userController.js
//
// Handles admin-level user management operations.
// All routes here require both `protect` and `adminOnly`.
// ============================================================

const User = require('../models/User');

// ============================================================
// GET ALL USERS
// GET /api/users
// Admin only — returns all registered users without passwords
// ============================================================
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(`Get all users error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while retrieving users',
    });
  }
};

// ============================================================
// GET SINGLE USER
// GET /api/users/:id
// Admin only — returns one user's full profile
// ============================================================
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(`Get user by ID error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while retrieving the user',
    });
  }
};

// ============================================================
// UPDATE USER STATUS
// PUT /api/users/:id/status
// Admin only — activate or deactivate a user account
// ============================================================
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be true or false',
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent an admin from deactivating their own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change the status of your own account',
      });
    }

    user.isActive = isActive;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User account ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error(`Update user status error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while updating user status',
    });
  }
};

// ============================================================
// DELETE USER
// DELETE /api/users/:id
// Admin only — permanently removes a user account
// ============================================================
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent an admin from deleting their own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'User account deleted successfully',
    });
  } catch (error) {
    console.error(`Delete user error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while deleting the user',
    });
  }
};

module.exports = { getAllUsers, getUserById, updateUserStatus, deleteUser };