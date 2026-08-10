// ============================================================
// This is the foundation schema of the entire EcoLeey backend.
// It supports registration, login, JWT authentication, the
// user dashboard, wallet/EcoPoints management, recycling
// history, the leaderboard, notifications, the admin dashboard,
// withdrawal requests, RVM visit scheduling, and future email
// verification / password reset flows.
// ============================================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── Schema Definition ────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    // ── Personal Information ────────────────────────────────
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },

    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    walletBalance: {
      type: Number,
      default: 0,
    },

    ecoPoints: {
      type: Number,
      default: 0,
    },

    totalEarned: {
      type: Number,
      default: 0,
    },

    totalRecycled: {
      type: Number,
      default: 0,
    },

    profileImage: {
      type: String,
      default: 'default-profile.png',
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    passwordResetToken: {
      type: String,
      default: null,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Pre-Save Middleware: Password Hashing ───────────────────
// Runs automatically before every save(). Only re-hashes the
// password if it has actually been changed.
//
// NOTE: This uses the modern async pre-save pattern (no `next`
// callback parameter). Mongoose detects that this function
// returns a Promise and automatically waits for it — this is
// required for compatibility with Mongoose 9.
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── Instance Method: comparePassword ────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Export ───────────────────────────────────────────────────
module.exports = mongoose.model('User', userSchema);
