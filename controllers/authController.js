// ============================================================
// EcoLeey Backend — Auth Controller
// File: controllers/authController.js
//
// Handles user registration, login, profile retrieval/updates,
// password changes, and logout. Generates JWTs for authenticated
// sessions and never exposes password data in any response.
// ============================================================

const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const { welcomeEmail, loginEmail } = require('../utils/emailTemplates');

// ── Helper: basic email format check ────────────────────────
const isValidEmail = (email) => /^[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}$/.test(email);

// ── Helper: basic phone format check (digits, spaces, +, -) ─
const isValidPhone = (phone) => /^[+\d][\d\s-]{6,}$/.test(phone);

// ── Helper: build a public-safe user object ─────────────────
// Strips the password and other internal fields before sending
// user data back to the client.
const toPublicUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  role: user.role,
  walletBalance: user.walletBalance,
  ecoPoints: user.ecoPoints,
  totalRecycled: user.totalRecycled,
  totalEarned: user.totalEarned,
  profileImage: user.profileImage,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
});

// ── Helper: derive the correct dashboard for a given role ───
// Lets the frontend redirect to the right dashboard immediately
// after login or registration, without needing extra logic.
const getDashboardRoute = (role) =>
  role === 'admin' ? '/admin/dashboard.html' : '/user/dashboard.html';

// ============================================================
// 1. REGISTER USER
// POST /api/auth/register
// ============================================================
const registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // ── Validate required fields ──────────────────────────────
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, phone, and password are all required',
      });
    }

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    // ── Validate email format ─────────────────────────────────
    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // ── Validate phone format ─────────────────────────────────
    if (!isValidPhone(trimmedPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number',
      });
    }

    // ── Validate password length ──────────────────────────────
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    // ── Check for duplicate email ──────────────────────────────
    const existingEmail = await User.findOne({ email: trimmedEmail });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    // ── Check for duplicate phone number ───────────────────────
    const existingPhone = await User.findOne({ phone: trimmedPhone });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: 'An account with this phone number already exists',
      });
    }

    // ── Create the user ─────────────────────────────────────────
    // Password hashing is handled automatically by the
    // pre('save') middleware defined in models/User.js.
    // Role always defaults to 'user' — it is never accepted
    // from the request body, so users cannot self-assign
    // admin privileges.
    const user = await User.create({
      fullName: trimmedFullName,
      email: trimmedEmail,
      phone: trimmedPhone,
      password,
      role: 'user',
      walletBalance: 0,
      ecoPoints: 0,
      totalEarned: 0,
      totalRecycled: 0,
      isVerified: false,
    });

    // ── Generate JWT for the newly registered user ─────────────
    const token = generateToken(user._id, user.role);

    // Send welcome email — runs in the background so it never
    // delays the registration response reaching the client.
    const welcome = welcomeEmail({ fullName: user.fullName, email: user.email });
    sendEmail({ to: user.email, subject: welcome.subject, html: welcome.html })
      .catch(err => console.error('Welcome email failed:', err.message));

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: toPublicUser(user),
      redirectTo: getDashboardRoute(user.role),
    });
  } catch (error) {
    console.error(`Register error: ${error.message}`);

    // Handle duplicate key errors that slip through (race conditions)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(409).json({
        success: false,
        message: `An account with this ${field} already exists`,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Something went wrong while creating your account',
    });
  }
};

// ============================================================
// 2. LOGIN USER
// POST /api/auth/login
// ============================================================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // ── Find the user by email ──────────────────────────────────
    const user = await User.findOne({ email: trimmedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // ── Block deactivated accounts ───────────────────────────────
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'This account has been deactivated. Please contact support.',
      });
    }

    // ── Verify password using the model's comparePassword method ─
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // ── Update lastLogin timestamp ────────────────────────────────
    user.lastLogin = new Date();
    await user.save();

    // ── Generate JWT ───────────────────────────────────────────────
    const token = generateToken(user._id, user.role);

    // Send login notification email in the background
    const now = new Date();
    const loginNotif = loginEmail({
      fullName:  user.fullName,
      email:     user.email,
      loginDate: now.toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      loginTime: now.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: true }),
    });
    sendEmail({ to: user.email, subject: loginNotif.subject, html: loginNotif.html })
      .catch(err => console.error('Login email failed:', err.message));

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: toPublicUser(user),
      redirectTo: getDashboardRoute(user.role),
    });
  } catch (error) {
    console.error(`Login error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while logging in',
    });
  }
};

// ============================================================
// 3. GET CURRENT LOGGED-IN USER
// GET /api/auth/me
// (Requires the `protect` middleware — uses req.user from the JWT)
// ============================================================
const getCurrentUser = async (req, res) => {
  try {
    // req.user was already attached by the `protect` middleware
    // and already excludes the password field.
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error(`Get current user error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while retrieving your profile',
    });
  }
};

// ============================================================
// 4. LOGOUT
// POST /api/auth/logout
// JWT is stateless, so logout is handled by the frontend
// discarding its stored token. This endpoint simply confirms
// the action for consistency with the rest of the API.
// ============================================================
const logoutUser = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error(`Logout error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while logging out',
    });
  }
};

// ============================================================
// 5. UPDATE PROFILE
// PUT /api/auth/profile
// (Requires the `protect` middleware)
// ============================================================
const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, profileImage } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // ── Only allow specific fields to be updated ────────────────
    // role, walletBalance, ecoPoints, totalEarned, and
    // totalRecycled are intentionally never touched here.
    if (fullName !== undefined) {
      const trimmedFullName = fullName.trim();
      if (!trimmedFullName) {
        return res.status(400).json({
          success: false,
          message: 'Full name cannot be empty',
        });
      }
      user.fullName = trimmedFullName;
    }

    if (phone !== undefined) {
      const trimmedPhone = phone.trim();
      if (!isValidPhone(trimmedPhone)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid phone number',
        });
      }

      // Ensure the new phone number isn't already used by another account
      const existingPhone = await User.findOne({
        phone: trimmedPhone,
        _id: { $ne: user._id },
      });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: 'This phone number is already in use by another account',
        });
      }

      user.phone = trimmedPhone;
    }

    if (profileImage !== undefined) {
      user.profileImage = profileImage;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error(`Update profile error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while updating your profile',
    });
  }
};

// ============================================================
// 6. CHANGE PASSWORD
// PUT /api/auth/change-password
// (Requires the `protect` middleware)
// ============================================================
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long',
      });
    }

    // Need the full document (with password field) to verify and re-save
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // ── Verify the current password ───────────────────────────
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // ── Set new password — hashing handled by pre('save') hook ─
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error(`Change password error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while changing your password',
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  updateProfile,
  changePassword,
};
