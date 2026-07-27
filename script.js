// ─── API Configuration ─────────────────────────────────────────────────────────
// Your backend is running on port 5000.
// Your frontend is served by Live Server on port 5500.
const API_BASE_URL = 'http://localhost:5000/api/auth';

// ─── Auth Form Switching ──────────────────────────────────────────────────────

function showLogin() {
  document.getElementById('form-register').classList.remove('active');
  document.getElementById('form-login').classList.add('active');
  document.getElementById('tab-register').classList.remove('active');
  document.getElementById('tab-login').classList.add('active');
  document.getElementById('auth-title').textContent = 'Welcome Back';
  document.getElementById('auth-sub').textContent = 'Login to your Ecoleey account.';
}

function showRegister() {
  document.getElementById('form-login').classList.remove('active');
  document.getElementById('form-register').classList.add('active');
  document.getElementById('tab-login').classList.remove('active');
  document.getElementById('tab-register').classList.add('active');
  document.getElementById('auth-title').textContent = 'Create Your Account';
  document.getElementById('auth-sub').textContent = 'Start recycling and earning rewards today.';
}

// ─── Password Toggle ──────────────────────────────────────────────────────────

function togglePassword(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon  = document.getElementById(iconId);
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
}

// ─── Client-Side Validation ───────────────────────────────────────────────────

function validateRegister() {
  const name     = document.getElementById('reg-name').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const phone    = document.getElementById('reg-phone').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirm  = document.getElementById('reg-confirm').value;

  if (!name) {
    alert('Please enter your full name.');
    document.getElementById('reg-name').focus();
    return false;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert('Please enter a valid email address.');
    document.getElementById('reg-email').focus();
    return false;
  }
  if (!phone) {
    alert('Please enter your phone number.');
    document.getElementById('reg-phone').focus();
    return false;
  }
  if (password.length < 8) {
    alert('Password must be at least 8 characters long.');
    document.getElementById('reg-password').focus();
    return false;
  }
  if (password !== confirm) {
    alert('Passwords do not match.');
    document.getElementById('reg-confirm').focus();
    return false;
  }
  return true;
}

function validateLogin() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert('Please enter a valid email address.');
    document.getElementById('login-email').focus();
    return false;
  }
  if (!password) {
    alert('Please enter your password.');
    document.getElementById('login-password').focus();
    return false;
  }
  return true;
}

// ─── Session Helpers ──────────────────────────────────────────────────────────
// JWT saved to localStorage so it survives page reloads and
// can be sent in future API request headers.
// User profile saved to sessionStorage under 'ecoreward_current_user'
// which is the exact key dashboard.js already reads from.

function saveAuthSession(token, user) {
  localStorage.setItem('token', token);
  sessionStorage.setItem('ecoreward_current_user', JSON.stringify(user));
}

// ─── Role-Based Redirect ──────────────────────────────────────────────────────
// Routes users to the correct dashboard based on their role.
// Paths here are RELATIVE to wherever authen.html is served from,
// so they match your actual file and folder names exactly.

function redirectToDashboard(role) {
  if (role === 'admin') {
    // Admin dashboard — update this path if your file moves
    window.location.href = 'user/adminbo.html';
  } else {
    // Regular user dashboard
    window.location.href = 'user/dashboard.html';
  }
}

// ─── Button Loading State ────────────────────────────────────────────────────

function setButtonLoading(form, isLoading, loadingText) {
  const btn = form.querySelector('button[type="submit"]');
  if (!btn) return;
  if (isLoading) {
    btn.dataset.originalHtml = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${loadingText}`;
    btn.disabled = true;
  } else {
    btn.innerHTML = btn.dataset.originalHtml || btn.innerHTML;
    btn.disabled = false;
  }
}

// ─── Registration Handler ─────────────────────────────────────────────────────

document.getElementById('form-register').addEventListener('submit', async function (e) {
  e.preventDefault();
  if (!validateRegister()) return;

  const fullName = document.getElementById('reg-name').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const phone    = document.getElementById('reg-phone').value.trim();
  const password = document.getElementById('reg-password').value;

  const form = e.target;
  setButtonLoading(form, true, 'Creating Account...');

  try {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, phone, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Registration failed. Please try again.');
      setButtonLoading(form, false, '');
      return;
    }

    // Save JWT and user profile to storage
    saveAuthSession(data.token, data.user);

    form.reset();
    setButtonLoading(form, false, '');

    // Redirect based on role
    redirectToDashboard(data.user.role);

  } catch (err) {
    console.error('Registration error:', err);
    alert(
      'Unable to reach the server.\n\n' +
      'Please make sure your backend is running (npm run dev in the backend folder) ' +
      'and try again.'
    );
    setButtonLoading(form, false, '');
  }
});

// ─── Login Handler ────────────────────────────────────────────────────────────

document.getElementById('form-login').addEventListener('submit', async function (e) {
  e.preventDefault();
  if (!validateLogin()) return;

  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  const form = e.target;
  setButtonLoading(form, true, 'Logging In...');

  try {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Login failed. Please check your credentials.');
      setButtonLoading(form, false, '');
      return;
    }

    // Save JWT and user profile to storage
    saveAuthSession(data.token, data.user);

    setButtonLoading(form, false, '');

    // Redirect based on role
    redirectToDashboard(data.user.role);

  } catch (err) {
    console.error('Login error:', err);
    alert(
      'Unable to reach the server.\n\n' +
      'Please make sure your backend is running (npm run dev in the backend folder) ' +
      'and try again.'
    );
    setButtonLoading(form, false, '');
  }
});