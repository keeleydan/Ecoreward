// ============================================================
// EcoLeey Backend — Database Configuration
// Establishes the connection between the Node.js/Express server
// and the MongoDB database using Mongoose.
// ============================================================

const mongoose = require('mongoose');

/**
 * connectDB
 * Asynchronously connects to MongoDB using the connection string
 * stored in the MONGO_URI environment variable.
 *
 * On success: logs a confirmation message.
 * On failure: logs the error and terminates the process,
 * since the application cannot function without a database connection.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);

    // Exit the process with failure (1) — the app cannot run without a DB
    process.exit(1);
  }
};

module.exports = connectDB;
