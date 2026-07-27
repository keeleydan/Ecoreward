// ============================================================
// EcoLeey Backend — Email Utility
// File: utils/sendEmail.js
//
// Sends transactional emails using Nodemailer with Gmail
// (or any SMTP provider). Configured via environment variables.
//
// To use Gmail:
//  1. In your Google Account → Security → enable 2-Step Verification
//  2. Go to Security → App Passwords
//  3. Generate an App Password for "Mail"
//  4. Paste that 16-character password into .env as EMAIL_PASS
//     (NOT your regular Gmail password)
// ============================================================

const nodemailer = require('nodemailer');

// ── Transporter ──────────────────────────────────────────────
// Created once and reused for every email sent.
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// ── Main sendEmail function ───────────────────────────────────
/**
 * @param {object} options
 * @param {string} options.to      - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.html    - HTML body of the email
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"EcoLeey" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    // Log the error but don't crash the main request —
    // a failed email should never prevent login/registration
    // from completing successfully.
    console.error(`Email send error to ${to}: ${error.message}`);
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;