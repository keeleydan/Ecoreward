/* ============================================================
   EcoLeey — User Dashboard JavaScript
   File: java/dashboard.js
   Matches: user/dashboard.html (custom structure)

   HTML element IDs used in this file:
   Sidebar:    #sidebar, #overlay, #hbg
   Topbar:     #tb-title, #tb-av-txt, #tb-uname
   Sidebar:    #sb-av-txt, #sb-uname, #sb-email
   Overview:   #ov-greet, #ov-bal, #ov-items, #ov-earned, #ov-co2, #ov-tbody
   Profile:    #pf-ini, #pf-name, #pf-email, #pf-f-name, #pf-f-email,
               #pf-f-phone, #pf-f-addr, #pf-f-join
               #pf-form, #pf-edit-name, #pf-edit-email, #pf-edit-phone, #pf-edit-addr
               #pw-form, #pw-cur, #pw-new, #pw-cf
   Schedule:   #sch-form, #sch-loc, #sch-date, #sch-time, #sch-list
   History:    #hist-tbody, #hist-search, [data-filter]
   Wallet:     #wlt-bal, #wlt-earned, #wlt-withdrawn, #wlt-pending, #wlt-tbody
               #wd-form, #wd-bank, #wd-aname, #wd-anum, #wd-amt
   Leaderboard:#lb-rank, #lb-pts, #lb-list
   Notifs:     #notif-count, #notif-list
   Nav:        .sb-link[data-s], .sb-logout[data-logout]
   Sections:   .sec[id="s-*"]
============================================================ */
'use strict';

// ── API Configuration ─────────────────────────────────────────
const API_BASE = 'http://localhost:5000/api';
const SESSION_KEY = 'ecoreward_current_user';

// ── Auth Guard ────────────────────────────────────────────────
const _raw   = sessionStorage.getItem(SESSION_KEY);
const _token = localStorage.getItem('token');

if (!_raw && !_token) {
  window.location.href = '../authen.html';
}

if (!_raw && _token) {
  // sessionStorage was cleared on redirect — recover from backend
  fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: 'Bearer ' + _token }
  })
  .then(r => r.json())
  .then(data => {
    if (data && data.user) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
      window.location.reload();
    } else {
      localStorage.removeItem('token');
      window.location.href = '../authen.html';
    }
  })
  .catch(() => { window.location.href = '../authen.html'; });
}

// ── Parse user from session ───────────────────────────────────
let USER = {};
try { USER = JSON.parse(_raw || '{}'); } catch (e) { USER = {}; }

USER.fullName      = USER.fullName      || '';
USER.email         = USER.email         || '';
USER.phone         = USER.phone         || 'Not set';
USER.address       = USER.address       || 'Not set';
USER.joined        = USER.createdAt
  ? new Date(USER.createdAt).toLocaleDateString('en-NG', { year:'numeric', month:'long' })
  : 'Not available';
USER.walletBalance = USER.walletBalance !== undefined ? USER.walletBalance : 0;
USER.ecoPoints     = USER.ecoPoints     !== undefined ? USER.ecoPoints     : 0;
USER.totalRecycled = USER.totalRecycled !== undefined ? USER.totalRecycled : 0;
USER.totalEarned   = USER.totalEarned   !== undefined ? USER.totalEarned   : 0;

// ── Helpers ───────────────────────────────────────────────────
const $  = id => document.getElementById(id);
const txt = (id, val) => { const el = $(id); if (el) el.textContent = val; };
const naira = n => '₦' + Number(n || 0).toLocaleString('en-NG');

function initials(name) {
  if (!name) return '?';
  const p = name.trim().split(' ').filter(Boolean);
  return p.length === 1 ? p[0][0].toUpperCase()
    : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

function greetingWord() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function fmtDate(str) {
  return new Date(str).toLocaleDateString('en-NG',
    { year:'numeric', month:'short', day:'numeric' });
}

function showToast(msg, type = 'success') {
  // Simple toast — append to body
  const t = document.createElement('div');
  t.style.cssText = `
    position:fixed;bottom:24px;right:24px;z-index:9999;
    background:${type === 'success' ? '#22713A' : type === 'error' ? '#E74C3C' : '#3498DB'};
    color:#fff;padding:13px 20px;border-radius:10px;
    font-family:'Syne',sans-serif;font-weight:700;font-size:.85rem;
    box-shadow:0 6px 24px rgba(0,0,0,.18);
    opacity:0;transition:opacity .3s ease;max-width:320px;`;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.style.opacity = '1');
  setTimeout(() => {
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 350);
  }, 3500);
}

// ── Mock recycling history data ───────────────────────────────
// Replace with real API call once recycling history endpoint is built
const MOCK_HISTORY = [
  { date:'2025-06-05', material:'Plastic Bottles',  qty:10, pts:150, val:15 },
  { date:'2025-06-02', material:'Glass Bottles',    qty:4,  pts:120, val:12 },
  { date:'2025-05-28', material:'Aluminium Cans',   qty:15, pts:300, val:30 },
  { date:'2025-05-24', material:'Plastic Bottles',  qty:8,  pts:120, val:12 },
  { date:'2025-05-18', material:'Glass Bottles',    qty:6,  pts:180, val:18 },
  { date:'2025-05-12', material:'Aluminium Cans',   qty:20, pts:400, val:40 },
];

const MOCK_TX = [
  { date:'2025-06-05', type:'Credit',     desc:'Plastic Bottles deposit', amount:15   },
  { date:'2025-05-28', type:'Credit',     desc:'Aluminium Cans deposit',  amount:30   },
  { date:'2025-05-25', type:'Withdrawal', desc:'GTBank transfer',         amount:-500 },
];

const MOCK_LB = [
  { name:'Amaka Okonkwo',   pts:4820, init:'AO' },
  { name:'Bello Adewale',   pts:3910, init:'BA' },
  { name:'Chidinma Eze',    pts:3540, init:'CE' },
  { name:'Damilola Fashola',pts:2900, init:'DF' },
  { name:'Emeka Nwosu',     pts:2480, init:'EN' },
  { name:'Fatima Ibrahim',  pts:2100, init:'FI' },
  { name:'Gbolahan Tijani', pts:1850, init:'GT' },
  { name:'Hauwa Mohammed',  pts:1600, init:'HM' },
  { name:'Ikenna Obi',      pts:1200, init:'IO' },
];

const MOCK_NOTIFS = [
  { icon:'fa-coins',         color:'g',    title:'Welcome to EcoLeey!',      desc:'Your account is active. Start recycling to earn rewards.',  time:'Just now',   read:false },
  { icon:'fa-bell',          color:'blue', title:'Profile Setup',             desc:'Complete your profile to personalize your dashboard.',       time:'1 hour ago', read:true  },
  { icon:'fa-graduation-cap',color:'gold', title:'New Educational Content',   desc:'Check out our new article on Deposit Return Systems.',       time:'2 days ago', read:true  },
];

// ── Section navigation ────────────────────────────────────────
const SECTION_TITLES = {
  overview:'Dashboard Overview', profile:'My Profile',
  schedule:'Schedule Visit',     history:'Recycling History',
  wallet:'Wallet & Rewards',     leaderboard:'Leaderboard',
  education:'Education Center',  notifications:'Notifications',
  settings:'Settings',
};

function go(id) {
  // Hide all sections
  document.querySelectorAll('.sec').forEach(s => s.style.display = 'none');
  // Show target
  const target = $('s-' + id);
  if (target) target.style.display = 'block';
  // Update active nav link
  document.querySelectorAll('.sb-link').forEach(l => l.classList.remove('active'));
  document.querySelectorAll(`.sb-link[data-s="${id}"]`).forEach(l => l.classList.add('active'));
  // Update topbar title
  txt('tb-title', SECTION_TITLES[id] || 'Dashboard');
  // Close sidebar on mobile
  closeSidebar();
  window.scrollTo({ top:0, behavior:'smooth' });
}

// ── Sidebar ───────────────────────────────────────────────────
function openSidebar() {
  const sb = $('sidebar'), ov = $('overlay'), hb = $('hbg');
  if (sb) sb.classList.add('open');
  if (ov) ov.classList.add('show');
  if (hb) hb.classList.add('open');
}
function closeSidebar() {
  const sb = $('sidebar'), ov = $('overlay'), hb = $('hbg');
  if (sb) sb.classList.remove('open');
  if (ov) ov.classList.remove('show');
  if (hb) hb.classList.remove('open');
}

// ── Header ────────────────────────────────────────────────────
function initHeader() {
  const displayName = USER.fullName || USER.email || 'User';
  const ini = initials(displayName);
  const firstName = displayName.split(' ')[0];

  txt('tb-av-txt', ini);
  txt('tb-uname', firstName);
  txt('sb-av-txt', ini);
  txt('sb-uname', displayName);
  txt('sb-email', USER.email);
  txt('ov-greet', `${greetingWord()}, ${firstName}! 👋`);
}

// ── Overview ──────────────────────────────────────────────────
function initOverview() {
  txt('ov-bal',    naira(USER.walletBalance));
  txt('ov-items',  USER.totalRecycled.toString());
  txt('ov-earned', naira(USER.totalEarned));
  txt('ov-co2',    (USER.totalRecycled * 0.08).toFixed(1) + 'kg');

  const tbody = $('ov-tbody');
  if (!tbody) return;
  tbody.innerHTML = MOCK_HISTORY.slice(0, 5).map(r => `
    <tr>
      <td>${fmtDate(r.date)}</td>
      <td>${r.material}</td>
      <td>${r.qty}</td>
      <td>${r.pts} pts</td>
    </tr>`).join('') || '<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:20px;">No recycling activity yet.</td></tr>';
}

// ── Profile ───────────────────────────────────────────────────
function initProfile() {
  const ini = initials(USER.fullName || USER.email || 'U');
  txt('pf-ini',    ini);
  txt('pf-name',   USER.fullName || '—');
  txt('pf-email',  USER.email    || '—');
  txt('pf-f-name', USER.fullName || '—');
  txt('pf-f-email',USER.email    || '—');
  txt('pf-f-phone',USER.phone);
  txt('pf-f-addr', USER.address);
  txt('pf-f-join', USER.joined);

  const n = $('pf-edit-name');  if (n) n.value = USER.fullName || '';
  const e = $('pf-edit-email'); if (e) e.value = USER.email    || '';
  const p = $('pf-edit-phone'); if (p) p.value = USER.phone    || '';
}

async function handleProfileUpdate(e) {
  e.preventDefault();
  const fullName = ($('pf-edit-name')  || {}).value?.trim();
  const email    = ($('pf-edit-email') || {}).value?.trim();
  const phone    = ($('pf-edit-phone') || {}).value?.trim();
  const address  = ($('pf-edit-addr')  || {}).value?.trim();

  if (!fullName || !email) { showToast('Name and email are required.', 'error'); return; }

  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }

  try {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + (_token || localStorage.getItem('token')),
      },
      body: JSON.stringify({ fullName, phone }),
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.message || 'Update failed.', 'error'); return; }

    USER.fullName = fullName;
    USER.email    = email;
    USER.phone    = phone || USER.phone;
    USER.address  = address || USER.address;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(USER));
    initHeader();
    initProfile();
    showToast('Profile updated successfully!');
  } catch (err) {
    showToast('Could not reach server.', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Changes'; }
  }
}

async function handlePasswordUpdate(e) {
  e.preventDefault();
  const cur = ($('pw-cur') || {}).value;
  const nw  = ($('pw-new') || {}).value;
  const cf  = ($('pw-cf')  || {}).value;

  if (!cur || !nw || !cf)   { showToast('All password fields are required.', 'error'); return; }
  if (nw.length < 8)        { showToast('New password must be at least 8 characters.', 'error'); return; }
  if (nw !== cf)            { showToast('Passwords do not match.', 'error'); return; }

  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Updating...'; }

  try {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + (_token || localStorage.getItem('token')),
      },
      body: JSON.stringify({ currentPassword: cur, newPassword: nw }),
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.message || 'Password change failed.', 'error'); return; }
    showToast('Password changed successfully!');
    e.target.reset();
  } catch (err) {
    showToast('Could not reach server.', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-key"></i> Update Password'; }
  }
}

// ── Schedule ──────────────────────────────────────────────────
let APPOINTMENTS = [];

function renderAppointments() {
  const list = $('sch-list');
  if (!list) return;
  if (!APPOINTMENTS.length) {
    list.innerHTML = '<p style="color:var(--muted);font-size:.86rem;text-align:center;padding:16px 0;">No upcoming bookings.</p>';
    return;
  }
  list.innerHTML = APPOINTMENTS.map(a => `
    <div style="display:flex;align-items:flex-start;gap:12px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;">
      <i class="fa-solid fa-location-dot" style="color:var(--g500);margin-top:3px;"></i>
      <div>
        <div style="font-weight:700;font-size:.9rem;">${a.location}</div>
        <div style="font-size:.8rem;color:var(--muted);margin-top:2px;">${fmtDate(a.date)} · ${a.time}</div>
        <span style="display:inline-block;margin-top:6px;background:var(--g50);color:var(--g600);border-radius:999px;padding:2px 10px;font-size:.7rem;font-weight:700;">Upcoming</span>
      </div>
    </div>`).join('');
}

async function handleScheduleSubmit(e) {
  e.preventDefault();
  const location = ($('sch-loc')  || {}).value;
  const date     = ($('sch-date') || {}).value;
  const time     = ($('sch-time') || {}).value;

  if (!location || !date || !time) { showToast('Please fill in all fields.', 'error'); return; }

  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Booking...'; }

  await new Promise(r => setTimeout(r, 400)); // simulate API
  APPOINTMENTS.unshift({ location, date, time });
  renderAppointments();
  e.target.reset();
  if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-calendar-check"></i> Book Visit'; }
  showToast('Visit booked successfully!');
}

// ── Recycling History ─────────────────────────────────────────
let histState = { search:'', filter:'all' };

function getFilteredHistory() {
  const days = { today:1, week:7, month:30, all:99999 }[histState.filter];
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days);
  return MOCK_HISTORY.filter(r => {
    const inRange = new Date(r.date) >= cutoff;
    const match = !histState.search ||
      r.material.toLowerCase().includes(histState.search.toLowerCase());
    return inRange && match;
  });
}

function renderHistory() {
  const tbody = $('hist-tbody');
  if (!tbody) return;
  const data = getFilteredHistory();
  tbody.innerHTML = data.length
    ? data.map(r => `
        <tr>
          <td>${fmtDate(r.date)}</td>
          <td>${r.material}</td>
          <td>${r.qty}</td>
          <td>${r.pts} pts</td>
          <td style="font-weight:700;color:var(--g500);">₦${r.val}</td>
        </tr>`).join('')
    : '<tr><td colspan="5" style="text-align:center;padding:28px;color:var(--muted);">No records found.</td></tr>';
}

function initHistoryControls() {
  const search = $('hist-search');
  if (search) search.addEventListener('input', function () {
    histState.search = this.value; renderHistory();
  });
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(b => {
        b.className = 'btn btn-outline btn-sm';
      });
      btn.className = 'btn btn-primary btn-sm';
      histState.filter = btn.dataset.filter;
      renderHistory();
    });
  });
}

// ── Wallet ────────────────────────────────────────────────────
function initWallet() {
  txt('wlt-bal',       naira(USER.walletBalance));
  txt('wlt-earned',    naira(USER.totalEarned));
  txt('wlt-withdrawn', naira(0));
  txt('wlt-pending',   naira(0));

  const tbody = $('wlt-tbody');
  if (!tbody) return;
  tbody.innerHTML = MOCK_TX.map(t => {
    const isCredit = t.amount > 0;
    return `<tr>
      <td>${fmtDate(t.date)}</td>
      <td style="color:${isCredit ? 'var(--g500)' : 'var(--red)'};">${t.type}</td>
      <td>${t.desc}</td>
      <td style="font-weight:700;color:${isCredit ? 'var(--g500)' : 'var(--red)'};">${isCredit ? '+' : ''}₦${Math.abs(t.amount)}</td>
    </tr>`;
  }).join('') || '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--muted);">No transactions yet.</td></tr>';
}

async function handleWithdrawSubmit(e) {
  e.preventDefault();
  const bank  = ($('wd-bank')  || {}).value;
  const aname = ($('wd-aname') || {}).value?.trim();
  const anum  = ($('wd-anum')  || {}).value?.trim();
  const amt   = parseFloat(($('wd-amt') || {}).value);

  if (!bank || !aname || !anum || !amt) { showToast('Please fill in all fields.', 'error'); return; }
  if (anum.length !== 10)  { showToast('Account number must be 10 digits.', 'error'); return; }
  if (amt < 500)           { showToast('Minimum withdrawal is ₦500.', 'error'); return; }
  if (amt > USER.walletBalance) { showToast('Insufficient wallet balance.', 'error'); return; }

  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Submitting...'; }

  await new Promise(r => setTimeout(r, 500));
  if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit Withdrawal Request'; }
  e.target.reset();
  showToast('Withdrawal request submitted for review!');
}

// ── Leaderboard ───────────────────────────────────────────────
function initLeaderboard() {
  const myPts = USER.ecoPoints || 0;
  const all = [...MOCK_LB, { name: USER.fullName || 'You', pts: myPts, init: initials(USER.fullName || 'U'), isMe: true }]
    .sort((a, b) => b.pts - a.pts);
  const myRank = all.findIndex(u => u.isMe) + 1;

  txt('lb-rank', '#' + myRank);
  txt('lb-pts', myPts.toLocaleString() + ' pts');

  const list = $('lb-list');
  if (!list) return;
  const medals = ['🥇','🥈','🥉'];
  list.innerHTML = all.map((u, i) => {
    const r = i + 1;
    return `
      <div style="display:flex;align-items:center;gap:12px;padding:12px 0;
        border-bottom:1px solid var(--border);${u.isMe ? 'background:var(--g50);border-radius:8px;padding:12px;margin:0 -12px;border-bottom:none;' : ''}">
        <div style="width:36px;height:36px;border-radius:50%;
          background:${r<=3 ? ['#f3d77a','#c9d2d8','#e2b487'][r-1] : 'var(--surface)'};
          display:flex;align-items:center;justify-content:center;
          font-size:${r<=3?'1.1rem':'.8rem'};font-weight:800;flex-shrink:0;">
          ${r <= 3 ? medals[r-1] : r}
        </div>
        <div style="width:36px;height:36px;border-radius:50%;
          background:linear-gradient(135deg,#1A6E2E,#34965A);
          display:flex;align-items:center;justify-content:center;
          font-size:.75rem;font-weight:800;color:#fff;flex-shrink:0;">
          ${u.init || u.name[0]}
        </div>
        <div style="flex:1;font-weight:700;font-size:.88rem;">
          ${u.name}${u.isMe ? ' <span style="color:var(--g500);font-size:.7rem;">(You)</span>' : ''}
        </div>
        <div style="font-weight:700;color:var(--g500);font-size:.85rem;">${u.pts.toLocaleString()} pts</div>
      </div>`;
  }).join('');
}

// ── Notifications ─────────────────────────────────────────────
function initNotifications() {
  const unread = MOCK_NOTIFS.filter(n => !n.read).length;
  txt('notif-count', unread);

  const badge = document.querySelector('.tb-badge');
  if (badge) badge.textContent = unread > 0 ? unread : '';

  const list = $('notif-list');
  if (!list) return;

  const colorMap = {
    g:    ['#F0F9F2','#22713A'],
    blue: ['#E8F3FB','#3498DB'],
    gold: ['#F5E9C8','#8a6d12'],
    red:  ['#FDECEA','#E74C3C'],
  };

  list.innerHTML = MOCK_NOTIFS.map(n => {
    const [bg, color] = colorMap[n.color] || colorMap.g;
    return `
      <div style="display:flex;align-items:flex-start;gap:12px;padding:14px 0;
        border-bottom:1px solid var(--border);">
        <div style="width:40px;height:40px;border-radius:50%;background:${bg};color:${color};
          display:flex;align-items:center;justify-content:center;font-size:.9rem;flex-shrink:0;">
          <i class="fa-solid ${n.icon}"></i>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;font-size:.87rem;">${n.title}</div>
          <div style="font-size:.81rem;color:var(--muted);margin-top:2px;">${n.desc}</div>
          <div style="font-size:.7rem;color:#A9B6AF;margin-top:4px;">${n.time}</div>
        </div>
        <div class="notif-dot ${n.read ? 'read' : ''}" style="width:9px;height:9px;border-radius:50%;
          background:${n.read ? 'transparent' : '#22713A'};flex-shrink:0;margin-top:6px;"></div>
      </div>`;
  }).join('');
}

// ── Logout ────────────────────────────────────────────────────
function logout() {
  if (!confirm('Are you sure you want to logout?')) return;
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('token');
  window.location.href = '../authen.html';
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  console.log('[EcoLeey] USER loaded:', USER);
  console.log('[EcoLeey] fullName:', USER.fullName);

  // Run each section init safely
  const safe = (fn, name) => {
    try { fn(); console.log(`[EcoLeey] ${name} OK`); }
    catch (e) { console.error(`[EcoLeey] FAILED — ${name}:`, e.message); }
  };

  safe(initHeader,          'header');
  safe(initOverview,        'overview');
  safe(initProfile,         'profile');
  safe(renderAppointments,  'appointments');
  safe(renderHistory,       'history');
  safe(initHistoryControls, 'historyControls');
  safe(initWallet,          'wallet');
  safe(initLeaderboard,     'leaderboard');
  safe(initNotifications,   'notifications');

  // ── Nav links ────────────────────────────────────────────────
  document.querySelectorAll('.sb-link[data-s]').forEach(link => {
    link.addEventListener('click', () => go(link.dataset.s));
  });

  // ── Hamburger ────────────────────────────────────────────────
  const hbg = $('hbg');
  if (hbg) hbg.addEventListener('click', () => {
    const sb = $('sidebar');
    sb && sb.classList.contains('open') ? closeSidebar() : openSidebar();
  });

  // ── Overlay close ─────────────────────────────────────────────
  const overlay = $('overlay');
  if (overlay) overlay.addEventListener('click', closeSidebar);

  // ── Forms ─────────────────────────────────────────────────────
  const pfForm  = $('pf-form');   if (pfForm)  pfForm.addEventListener('submit',  handleProfileUpdate);
  const pwForm  = $('pw-form');   if (pwForm)  pwForm.addEventListener('submit',  handlePasswordUpdate);
  const schForm = $('sch-form');  if (schForm) schForm.addEventListener('submit', handleScheduleSubmit);
  const wdForm  = $('wd-form');   if (wdForm)  wdForm.addEventListener('submit',  handleWithdrawSubmit);

  // ── Logout button ─────────────────────────────────────────────
  document.querySelectorAll('[data-logout]').forEach(btn => {
    btn.addEventListener('click', logout);
  });

  // ── Show overview by default ──────────────────────────────────
  go('overview');
});