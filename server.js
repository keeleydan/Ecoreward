// ============================================================
// EcoLeey Backend — Server Entry Point
// File: server.js
// ============================================================

const express = require('express');
const dotenv  = require('dotenv');
const cors    = require('cors');
const connectDB   = require('./config/db');
const authRoutes  = require('./routes/authRoutes');
const userRoutes  = require('./routes/userRoutes');

// Load environment variables
dotenv.config();

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Explicitly allow Live Server (127.0.0.1:5500 / localhost:5500)
// and any other local dev origin so fetch() calls from the
// frontend don't get blocked by the browser's CORS policy.
app.use(cors({
  origin: [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://127.0.0.1:3000',
    'http://localhost:3000',
  ],
  credentials: true,
}));

// ── Database ────────────────────────────────────────────────
connectDB();

// ── Root health-check ───────────────────────────────────────
app.get('/', (req, res) => {
  try {
    res.status(200).json({ message: 'EcoLeey API Running' });
  } catch (error) {
    console.error(`Root route error: ${error.message}`);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// ── API Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// ── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
