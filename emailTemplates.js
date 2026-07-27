// ============================================================
// EcoLeey Backend — Email Templates
// File: utils/emailTemplates.js
//
// HTML email templates for all transactional emails.
// Each function receives the relevant data and returns an
// object with { subject, html } ready to pass into sendEmail().
// ============================================================

// ── Shared layout wrapper ─────────────────────────────────────
const layout = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EcoLeey</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f7f4; font-family: 'Arial', sans-serif; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(10,46,20,0.1); }
    .header { background: linear-gradient(135deg, #0A2E14, #1A6E2E); padding: 32px 40px; text-align: center; }
    .header-logo { font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
    .header-logo span { color: #D4AF37; }
    .header-tagline { font-size: 13px; color: rgba(255,255,255,0.65); margin-top: 6px; }
    .body { padding: 36px 40px; }
    .greeting { font-size: 22px; font-weight: 700; color: #0A2E14; margin-bottom: 16px; }
    .text { font-size: 15px; color: #4A5550; line-height: 1.7; margin-bottom: 16px; }
    .highlight-box { background: #F0F9F2; border-left: 4px solid #22713A; border-radius: 8px; padding: 16px 20px; margin: 24px 0; }
    .highlight-box p { margin: 0; font-size: 14px; color: #1A5527; }
    .btn { display: inline-block; background: linear-gradient(135deg, #1A6E2E, #22913C); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 15px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ECF0EE; font-size: 14px; }
    .detail-row span:first-child { color: #7C8B82; }
    .detail-row span:last-child { font-weight: 700; color: #0A2E14; }
    .divider { height: 1px; background: #ECF0EE; margin: 28px 0; }
    .footer { background: #0A2E14; padding: 24px 40px; text-align: center; }
    .footer p { font-size: 12px; color: rgba(255,255,255,0.45); margin: 4px 0; }
    .footer a { color: #D4AF37; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-logo">Eco<span>Leey</span></div>
      <div class="header-tagline">Recycle. Earn. Sustain.</div>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} EcoLeey Nigeria Ltd. All rights reserved.</p>
      <p>African University of Science and Technology, Abuja</p>
      <p style="margin-top:10px;"><a href="#">Privacy Policy</a> &nbsp;·&nbsp; <a href="#">Terms of Service</a></p>
    </div>
  </div>
</body>
</html>`;

// ── 1. Welcome / Registration Email ─────────────────────────
const welcomeEmail = ({ fullName, email }) => ({
  subject: '🌿 Welcome to EcoLeey — Your Account is Ready!',
  html: layout(`
    <div class="greeting">Welcome, ${fullName}! 👋</div>
    <p class="text">
      Thank you for joining EcoLeey — Nigeria's leading recycling reward platform.
      Your account has been created successfully and you're all set to start
      recycling and earning real rewards.
    </p>
    <div class="highlight-box">
      <p>♻️ &nbsp;Deposit recyclable bottles and cans into any EcoLeey RVM to earn <strong>EcoPoints</strong> instantly credited to your wallet.</p>
    </div>
    <p class="text">Here's what you can do right now:</p>
    <p class="text">
      ✅ &nbsp;Find your nearest <strong>Reverse Vending Machine</strong> location<br/>
      ✅ &nbsp;Schedule an <strong>RVM visit</strong> from your dashboard<br/>
      ✅ &nbsp;Track your <strong>recycling history</strong> and environmental impact<br/>
      ✅ &nbsp;Withdraw your rewards directly to your <strong>Nigerian bank account</strong>
    </p>
    <div class="divider"></div>
    <div class="detail-row"><span>Registered Email</span><span>${email}</span></div>
    <div class="detail-row"><span>Account Status</span><span>Active ✅</span></div>
    <div class="detail-row"><span>Starting Balance</span><span>₦0.00</span></div>
    <div class="divider"></div>
    <p class="text">
      If you did not create this account, please contact us immediately at
      <a href="mailto:support@ecoleey.ng" style="color:#1A6E2E;">support@ecoleey.ng</a>.
    </p>
  `),
});

// ── 2. Login Notification Email ───────────────────────────────
const loginEmail = ({ fullName, email, loginTime, loginDate }) => ({
  subject: '🔐 New Login to Your EcoLeey Account',
  html: layout(`
    <div class="greeting">Hello, ${fullName} 👋</div>
    <p class="text">
      We noticed a new login to your EcoLeey account. If this was you, no action
      is needed — you can safely ignore this email.
    </p>
    <div class="highlight-box">
      <p>🔐 &nbsp;A login was detected on your account. Review the details below.</p>
    </div>
    <div class="divider"></div>
    <div class="detail-row"><span>Account Email</span><span>${email}</span></div>
    <div class="detail-row"><span>Login Date</span><span>${loginDate}</span></div>
    <div class="detail-row"><span>Login Time</span><span>${loginTime}</span></div>
    <div class="divider"></div>
    <p class="text">
      If you did <strong>not</strong> perform this login, please change your password
      immediately and contact our support team at
      <a href="mailto:support@ecoleey.ng" style="color:#1A6E2E;">support@ecoleey.ng</a>.
    </p>
  `),
});

module.exports = { welcomeEmail, loginEmail };