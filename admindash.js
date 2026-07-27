/* ============================================================
   ECOLEEY — ADMIN DASHBOARD JAVASCRIPT
   File: java/admindash.js
   Linked by: user/adminbo.html

   Backend integration:
   - All endpoints are listed in ENDPOINTS below.
   - apiFetch() is the wrapper to use once the Node.js + MongoDB
     backend is live — replace MOCK_* data and simulate* calls.
   - Session/auth is read from sessionStorage 'ecoreward_admin'.
============================================================ */
'use strict';

// ============================================================
// CONFIG — API base & endpoints
// ============================================================
const API_BASE = 'http://localhost:5000/api';
const ENDPOINTS = {
  dashboard:     `${API_BASE}/admin/dashboard`,     // GET
  users:         `${API_BASE}/users`,                // GET / POST
  userById:      id => `${API_BASE}/users/${id}`,     // GET / PUT / DELETE
  deposits:      `${API_BASE}/deposits`,              // GET / POST
  depositById:   id => `${API_BASE}/deposits/${id}`,  // PUT (approve/reject)
  withdrawals:   `${API_BASE}/withdrawals`,           // GET
  withdrawalById:id => `${API_BASE}/withdrawals/${id}`, // PUT
  rvm:           `${API_BASE}/rvm`,                   // GET / POST
  rvmById:       id => `${API_BASE}/rvm/${id}`,       // PUT / DELETE
  leaderboard:   `${API_BASE}/leaderboard`,           // GET
  analytics:     `${API_BASE}/analytics`,             // GET
  content:       `${API_BASE}/content`,               // GET / POST
  contentById:   id => `${API_BASE}/content/${id}`,   // DELETE
  notifications: `${API_BASE}/notifications`,         // GET
  settings:      `${API_BASE}/settings`,              // PUT
};

const SESSION_KEY = 'ecoreward_current_user';

async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('adminToken');
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ============================================================
// AUTH GUARD
// ============================================================
const _raw = sessionStorage.getItem(SESSION_KEY);
if (!_raw) {
  // No active admin session — redirect to login
  window.location.href = '../authen.html';
}
let ADMIN;
try { ADMIN = JSON.parse(_raw); } catch (e) { ADMIN = {}; }
// Admin session uses 'fullName' from the backend response
ADMIN.name  = ADMIN.fullName || ADMIN.name || 'Admin';
ADMIN.email = ADMIN.email    || '';
ADMIN.role  = ADMIN.role     || 'Administrator';

// ============================================================
// MOCK DATA
// ============================================================
const MOCK_USERS = [
  { id: 'U001', name: 'Amaka Okonkwo',   email: 'amaka@example.com',   phone: '0803 111 2222', wallet: 4820, status: 'Active',    joined: '2025-01-12', deposits: 64, earnings: 9640 },
  { id: 'U002', name: 'Bello Adewale',   email: 'bello@example.com',   phone: '0805 222 3333', wallet: 3910, status: 'Active',    joined: '2025-01-20', deposits: 52, earnings: 7820 },
  { id: 'U003', name: 'Chidinma Eze',    email: 'chidinma@example.com',phone: '0807 333 4444', wallet: 3540, status: 'Active',    joined: '2025-02-02', deposits: 48, earnings: 7080 },
  { id: 'U004', name: 'Damilola Fashola',email: 'dami@example.com',    phone: '0809 444 5555', wallet: 2900, status: 'Suspended', joined: '2025-02-15', deposits: 39, earnings: 5800 },
  { id: 'U005', name: 'Emeka Nwosu',     email: 'emeka@example.com',   phone: '0811 555 6666', wallet: 2480, status: 'Active',    joined: '2025-03-01', deposits: 33, earnings: 4960 },
  { id: 'U006', name: 'Fatima Ibrahim',  email: 'fatima@example.com',  phone: '0813 666 7777', wallet: 2100, status: 'Inactive',  joined: '2025-03-10', deposits: 28, earnings: 4200 },
  { id: 'U007', name: 'Gbolahan Tijani', email: 'gbolahan@example.com',phone: '0815 777 8888', wallet: 1850, status: 'Active',    joined: '2025-03-22', deposits: 24, earnings: 3700 },
  { id: 'U008', name: 'Hauwa Mohammed',  email: 'hauwa@example.com',   phone: '0817 888 9999', wallet: 1600, status: 'Active',    joined: '2025-04-05', deposits: 21, earnings: 3200 },
  { id: 'U009', name: 'Ikenna Obi',      email: 'ikenna@example.com',  phone: '0819 999 0000', wallet: 1200, status: 'Active',    joined: '2025-04-18', deposits: 16, earnings: 2400 },
  { id: 'U010', name: 'Josephine Akpan', email: 'josephine@example.com',phone:'0821 000 1111', wallet: 980,  status: 'Suspended', joined: '2025-05-02', deposits: 13, earnings: 1960 },
  { id: 'U011', name: 'Kelechi Madu',    email: 'kelechi@example.com', phone: '0823 111 2222', wallet: 820,  status: 'Active',    joined: '2025-05-14', deposits: 11, earnings: 1640 },
  { id: 'U012', name: 'Ngozi Nwankwo',   email: 'ngozi@example.com',   phone: '0825 222 3333', wallet: 2500, status: 'Active',    joined: '2025-05-28', deposits: 18, earnings: 3000 },
];

const MOCK_DEPOSITS = [
  { id: 'D2001', user: 'Amaka Okonkwo',   material: 'Plastic Bottles', qty: 10, points: 150, reward: 15, date: '2025-06-08', status: 'Approved' },
  { id: 'D2002', user: 'Bello Adewale',   material: 'Glass Bottles',   qty: 4,  points: 120, reward: 12, date: '2025-06-08', status: 'Approved' },
  { id: 'D2003', user: 'Chidinma Eze',    material: 'Aluminium Cans',  qty: 15, points: 300, reward: 30, date: '2025-06-07', status: 'Pending'  },
  { id: 'D2004', user: 'Damilola Fashola',material: 'Plastic Bottles', qty: 8,  points: 120, reward: 12, date: '2025-06-07', status: 'Pending'  },
  { id: 'D2005', user: 'Emeka Nwosu',     material: 'Glass Bottles',   qty: 6,  points: 180, reward: 18, date: '2025-06-06', status: 'Rejected'  },
  { id: 'D2006', user: 'Fatima Ibrahim',  material: 'Aluminium Cans',  qty: 20, points: 400, reward: 40, date: '2025-06-05', status: 'Approved' },
  { id: 'D2007', user: 'Gbolahan Tijani', material: 'Plastic Bottles', qty: 12, points: 180, reward: 18, date: '2025-06-04', status: 'Approved' },
  { id: 'D2008', user: 'Hauwa Mohammed',  material: 'Plastic Containers', qty: 5, points: 90, reward: 9, date: '2025-06-03', status: 'Pending' },
];

const MOCK_WITHDRAWALS = [
  { id: 'W3001', user: 'Amaka Okonkwo',   bank: 'GTBank',  account: '0123456789', amount: 500, date: '2025-06-08', status: 'Pending'  },
  { id: 'W3002', user: 'Bello Adewale',   bank: 'Zenith Bank', account: '0234567891', amount: 1200, date: '2025-06-07', status: 'Approved' },
  { id: 'W3003', user: 'Chidinma Eze',    bank: 'Access Bank', account: '0345678912', amount: 800, date: '2025-06-06', status: 'Pending'  },
  { id: 'W3004', user: 'Damilola Fashola',bank: 'UBA',     account: '0456789123', amount: 350, date: '2025-06-05', status: 'Rejected'  },
  { id: 'W3005', user: 'Emeka Nwosu',     bank: 'Opay',    account: '0567891234', amount: 600, date: '2025-06-04', status: 'Approved' },
  { id: 'W3006', user: 'Fatima Ibrahim',  bank: 'Kuda Bank', account: '0678912345', amount: 950, date: '2025-06-03', status: 'Pending'  },
];

const MOCK_WALLET_TX = [
  { user: 'Amaka Okonkwo',   desc: 'Recycling reward credit', amount: 15,   date: '2025-06-08', status: 'Completed' },
  { user: 'Bello Adewale',   desc: 'Withdrawal payout — Zenith', amount: -1200, date: '2025-06-07', status: 'Completed' },
  { user: 'Chidinma Eze',    desc: 'Recycling reward credit', amount: 30,   date: '2025-06-07', status: 'Completed' },
  { user: 'Emeka Nwosu',     desc: 'Withdrawal payout — Opay', amount: -600, date: '2025-06-04', status: 'Completed' },
  { user: 'Fatima Ibrahim',  desc: 'Recycling reward credit', amount: 40,   date: '2025-06-05', status: 'Completed' },
  { user: 'Gbolahan Tijani', desc: 'Withdrawal payout — pending review', amount: -950, date: '2025-06-03', status: 'Pending' },
];

const MOCK_RVMS = [
  { id: 'RVM-001', location: 'Jabi Lake Mall, Abuja',     status: 'Active',      capacity: '78%', maintenance: '2025-05-20' },
  { id: 'RVM-002', location: 'Wuse II Market, Abuja',     status: 'Active',      capacity: '45%', maintenance: '2025-05-28' },
  { id: 'RVM-003', location: 'University of Abuja',       status: 'Active',      capacity: '92%', maintenance: '2025-06-01' },
  { id: 'RVM-004', location: 'Ikeja City Mall, Lagos',    status: 'Maintenance', capacity: '12%', maintenance: '2025-06-10' },
  { id: 'RVM-005', location: 'Victoria Island, Lagos',    status: 'Active',      capacity: '63%', maintenance: '2025-05-15' },
  { id: 'RVM-006', location: 'Lekki Phase 1, Lagos',      status: 'Inactive',    capacity: '0%',  maintenance: '2025-04-30' },
  { id: 'RVM-007', location: 'UNILAG Campus, Lagos',      status: 'Active',      capacity: '55%', maintenance: '2025-05-25' },
];

const MOCK_CONTENT = [
  { id: 'C001', title: 'Why Recycling Matters', category: 'Awareness',  date: '2025-05-01', status: 'Published' },
  { id: 'C002', title: 'How Reverse Vending Machines Work', category: 'Technology', date: '2025-05-05', status: 'Published' },
  { id: 'C003', title: 'Understanding Deposit Return Systems', category: 'Global', date: '2025-05-12', status: 'Published' },
  { id: 'C004', title: 'Plastic vs Glass: Recycling Differences', category: 'Education', date: '2025-06-01', status: 'Draft' },
  { id: 'C005', title: '10 Daily Recycling Tips', category: 'Tips', date: '2025-06-05', status: 'Published' },
];

const MOCK_NOTIFICATIONS = [
  { icon: 'fa-user-plus',  color: 'green', title: 'New User Registered',  desc: 'Kelechi Madu just created an account.', time: '12 minutes ago', read: false },
  { icon: 'fa-recycle',    color: 'blue',  title: 'New Deposit Logged',   desc: 'Chidinma Eze deposited 15 aluminium cans.', time: '1 hour ago', read: false },
  { icon: 'fa-money-bill-wave', color: 'gold', title: 'Withdrawal Request', desc: 'Fatima Ibrahim requested ₦950 withdrawal.', time: '3 hours ago', read: false },
  { icon: 'fa-triangle-exclamation', color: 'red', title: 'Machine Fault Alert', desc: 'RVM-004 at Ikeja City Mall reported a fault.', time: '5 hours ago', read: true },
  { icon: 'fa-user-plus',  color: 'green', title: 'New User Registered',  desc: 'Ngozi Nwankwo just created an account.', time: '1 day ago', read: true },
];

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Amaka Okonkwo',   points: 4820, items: 64, reward: 9640 },
  { rank: 2, name: 'Bello Adewale',   points: 3910, items: 52, reward: 7820 },
  { rank: 3, name: 'Chidinma Eze',    points: 3540, items: 48, reward: 7080 },
  { rank: 4, name: 'Damilola Fashola',points: 2900, items: 39, reward: 5800 },
  { rank: 5, name: 'Emeka Nwosu',     points: 2480, items: 33, reward: 4960 },
  { rank: 6, name: 'Fatima Ibrahim',  points: 2100, items: 28, reward: 4200 },
  { rank: 7, name: 'Gbolahan Tijani', points: 1850, items: 24, reward: 3700 },
  { rank: 8, name: 'Hauwa Mohammed',  points: 1600, items: 21, reward: 3200 },
];

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const RECYCLING_TREND   = [4200, 4800, 5100, 6200, 7400, 8900, 9600, 10200, 11000, 11800, 12500, 13200];
const USER_GROWTH       = [120, 180, 240, 310, 410, 520, 610, 700, 790, 860, 920, 980];
const REWARD_PAYMENTS   = [120000, 145000, 168000, 190000, 220000, 260000, 290000, 310000, 335000, 360000, 390000, 420000];
const MATERIAL_DIST     = { labels: ['Plastic Bottles', 'Glass Bottles', 'Aluminium Cans'], data: [52, 28, 20] };

const sectionTitles = {
  overview: ['Dashboard Overview', 'Platform performance at a glance'],
  users: ['User Management', 'View, edit, and manage all registered users'],
  deposits: ['Recycling Deposits', 'Review and approve recycling deposit submissions'],
  withdrawals: ['Withdrawal Requests', 'Approve or reject user withdrawal requests'],
  wallet: ['Wallet Management', 'Monitor platform-wide wallet activity'],
  rvm: ['RVM Management', 'Manage Reverse Vending Machine stations'],
  leaderboard: ['Leaderboard Management', 'View and manage the community leaderboard'],
  analytics: ['Analytics', 'Detailed platform performance metrics'],
  content: ['Educational Content', 'Manage recycling education articles'],
  notifications: ['Notifications', 'System alerts and platform activity'],
  settings: ['Settings', 'Configure platform-wide settings'],
  profile: ['Admin Profile', 'Manage your administrator account'],
};

// ============================================================
// HELPERS
// ============================================================
const $ = id => document.getElementById(id);
const txt = (id, val) => { try { const el = $(id); if (el) el.textContent = val; } catch(e) {} };
const naira = n => '₦' + Number(n).toLocaleString('en-NG');
function initials(name) { if (!name) return '?'; const p = name.trim().split(' ').filter(Boolean); return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase(); }
function fmtDate(str) { return new Date(str).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }); }
function delay(ms) { return new Promise(res => setTimeout(res, ms)); }
function statusBadgeClass(s) { return { Active: 'badge-green', Approved: 'badge-green', Published: 'badge-green', Completed: 'badge-green', Pending: 'badge-gold', Draft: 'badge-gold', Maintenance: 'badge-gold', Suspended: 'badge-red', Rejected: 'badge-red', Inactive: 'badge-gray' }[s] || 'badge-gray'; }

// ============================================================
// NAVIGATION
// ============================================================
function go(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const sec = $('sec-' + id);
  if (sec) sec.classList.add('active');
  document.querySelectorAll(`.nav-link[data-section="${id}"]`).forEach(l => l.classList.add('active'));
  const [title, sub] = sectionTitles[id] || ['Dashboard', ''];
  txt('ptTitle', title); txt('ptSub', sub);
  closeSidebar(); closeProfileDropdown();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (id === 'analytics') setTimeout(renderAnalyticsCharts, 50);
}

function openSidebar() { $('sidebar').classList.add('open'); $('sidebarOverlay').classList.add('show'); $('hamburger').classList.add('open'); }
function closeSidebar() { $('sidebar').classList.remove('open'); $('sidebarOverlay').classList.remove('show'); $('hamburger').classList.remove('open'); }
function toggleProfileDropdown() { $('profileDropdown').classList.toggle('show'); $('userPill').classList.toggle('open'); }
function closeProfileDropdown() { $('profileDropdown').classList.remove('show'); $('userPill').classList.remove('open'); }

function initHeader() {
  const ini = initials(ADMIN.name);
  txt('topbarAvatar', ini); txt('topbarUserName', ADMIN.name.split(' ')[0]);
  txt('sidebarAvatar', ini); txt('sidebarUserName', ADMIN.name); txt('sidebarUserRole', ADMIN.role || 'Administrator');
}

// ============================================================
// REAL DATA LOADERS — fetch from live backend
// ============================================================

// Fetches all registered users from MongoDB via the backend API
// and REPLACES the MOCK_USERS array entirely so that pagination,
// search, and filtering all work on real data consistently.
async function fetchRealUsers() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/users`, {
      headers: { Authorization: 'Bearer ' + token }
    });

    if (!res.ok) {
      console.warn('Could not load real users — keeping mock data. Status:', res.status);
      return;
    }

    const data = await res.json();
    const users = data.users || data || [];

    if (!users.length) return;

    // Replace the entire MOCK_USERS array with real database users
    // so every part of the UI (table, pagination, search, filters)
    // automatically works on live data without any other changes
    MOCK_USERS.length = 0;
    users.forEach(u => {
      MOCK_USERS.push({
        id:       u._id ? u._id.toString().slice(-6).toUpperCase() : '—',
        _mongoId: u._id,
        name:     u.fullName || '—',
        email:    u.email    || '—',
        phone:    u.phone    || '—',
        wallet:   u.walletBalance || 0,
        status:   u.isActive ? 'Active' : 'Inactive',
        joined:   u.createdAt ? u.createdAt.slice(0, 10) : '—',
        deposits: u.totalRecycled || 0,
        earnings: u.totalEarned   || 0,
      });
    });

    // Re-render the users table now that MOCK_USERS has real data
    userState.page = 1;
    renderUsersTable();

    // Update the total users stat card
    txt('ovTotalUsers', users.length.toLocaleString());

  } catch (err) {
    console.warn('fetchRealUsers error:', err.message);
  }
}

// ============================================================
// OVERVIEW
// API: GET /api/admin/dashboard
// ============================================================
function initOverview() {
  txt('ovTotalUsers', MOCK_USERS.length.toLocaleString() === '12' ? '4,850' : MOCK_USERS.length.toLocaleString());
  txt('ovTotalUsers', '4,850');
  txt('ovBottlesRecycled', '152,000');
  txt('ovRewardsPaid', naira(5500000));
  txt('ovActiveRVMs', MOCK_RVMS.filter(r => r.status === 'Active').length + 6 + '');
  txt('ovActiveRVMs', '24');
  txt('ovPendingWithdrawals', MOCK_WITHDRAWALS.filter(w => w.status === 'Pending').length.toString());
  txt('ovPendingWithdrawals', '38');
  txt('ovCarbonSaved', '3,200kg');
  renderOverviewCharts();
}

let chartRefs = {};
function renderOverviewCharts() {
  const ctx1 = $('chartRecyclingTrend');
  if (ctx1 && !chartRefs.trend) {
    chartRefs.trend = new Chart(ctx1, {
      type: 'line',
      data: { labels: MONTH_LABELS, datasets: [{ label: 'Bottles Recycled', data: RECYCLING_TREND, borderColor: '#22713A', backgroundColor: 'rgba(34,113,58,.08)', fill: true, tension: .4, pointRadius: 3, pointBackgroundColor: '#22713A' }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,.05)' } }, x: { grid: { display: false } } } }
    });
  }
  const ctx2 = $('chartMaterialDist');
  if (ctx2 && !chartRefs.material) {
    chartRefs.material = new Chart(ctx2, {
      type: 'pie',
      data: { labels: MATERIAL_DIST.labels, datasets: [{ data: MATERIAL_DIST.data, backgroundColor: ['#22713A', '#3498DB', '#D4AF37'] }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } } }
    });
  }
  const ctx3 = $('chartUserGrowth');
  if (ctx3 && !chartRefs.growth) {
    chartRefs.growth = new Chart(ctx3, {
      type: 'bar',
      data: { labels: MONTH_LABELS, datasets: [{ label: 'New Users', data: USER_GROWTH, backgroundColor: '#3498DB', borderRadius: 6, maxBarThickness: 26 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,.05)' } }, x: { grid: { display: false } } } }
    });
  }
  const ctx4 = $('chartRewardPayments');
  if (ctx4 && !chartRefs.rewards) {
    chartRefs.rewards = new Chart(ctx4, {
      type: 'line',
      data: { labels: MONTH_LABELS, datasets: [{ label: 'Rewards Paid (₦)', data: REWARD_PAYMENTS, borderColor: '#D4AF37', backgroundColor: 'rgba(212,175,55,.15)', fill: true, tension: .4, pointRadius: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,.05)' } }, x: { grid: { display: false } } } }
    });
  }
}

function renderAnalyticsCharts() {
  const ctx1 = $('chartAnalyticsLine');
  if (ctx1 && !chartRefs.aLine) {
    chartRefs.aLine = new Chart(ctx1, { type: 'line', data: { labels: MONTH_LABELS, datasets: [{ label: 'Deposits', data: RECYCLING_TREND.map(v => Math.round(v / 40)), borderColor: '#22713A', backgroundColor: 'rgba(34,113,58,.08)', fill: true, tension: .4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });
  }
  const ctx2 = $('chartAnalyticsBar');
  if (ctx2 && !chartRefs.aBar) {
    chartRefs.aBar = new Chart(ctx2, { type: 'bar', data: { labels: MONTH_LABELS, datasets: [{ label: 'Revenue', data: REWARD_PAYMENTS.map(v => Math.round(v / 1000)), backgroundColor: '#D4AF37', borderRadius: 6, maxBarThickness: 24 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });
  }
  const ctx3 = $('chartAnalyticsPie');
  if (ctx3 && !chartRefs.aPie) {
    chartRefs.aPie = new Chart(ctx3, { type: 'pie', data: { labels: MATERIAL_DIST.labels, datasets: [{ data: MATERIAL_DIST.data, backgroundColor: ['#22713A', '#3498DB', '#D4AF37'] }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } } } });
  }
  const ctx4 = $('chartAnalyticsHeat');
  if (ctx4 && !chartRefs.aHeat) {
    chartRefs.aHeat = new Chart(ctx4, { type: 'bar', data: { labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], datasets: [{ label: 'Activity Level', data: [40, 65, 58, 80, 95, 120, 70], backgroundColor: ['#DCEFE1','#B7E0C5','#8FCFA7','#67BD89','#3FA770','#22713A','#67BD89'], borderRadius: 6, maxBarThickness: 30 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });
  }
}

// ============================================================
// USER MANAGEMENT
// API: GET /api/users, GET/PUT/DELETE /api/users/:id
// ============================================================
let userState = { search: '', filter: 'all', page: 1, perPage: 6 };

function getFilteredUsers() {
  return MOCK_USERS.filter(u => {
    const matchesSearch = !userState.search || u.name.toLowerCase().includes(userState.search.toLowerCase()) || u.email.toLowerCase().includes(userState.search.toLowerCase());
    const matchesFilter = userState.filter === 'all' || u.status.toLowerCase() === userState.filter;
    return matchesSearch && matchesFilter;
  });
}

function renderUsersTable() {
  const all = getFilteredUsers();
  const totalPages = Math.max(1, Math.ceil(all.length / userState.perPage));
  userState.page = Math.min(userState.page, totalPages);
  const start = (userState.page - 1) * userState.perPage;
  const pageData = all.slice(start, start + userState.perPage);

  const tbody = $('usersBody');
  if (tbody) {
    tbody.innerHTML = pageData.length ? pageData.map(u => `
      <tr>
        <td>${u.id}</td>
        <td><div class="cell-user"><div class="avatar-sm">${initials(u.name)}</div><div><div class="cell-user-name">${u.name}</div><div class="cell-user-email">${u.email}</div></div></div></td>
        <td>${u.email}</td>
        <td>${u.phone}</td>
        <td style="font-weight:700;">${naira(u.wallet)}</td>
        <td><span class="badge ${statusBadgeClass(u.status)}">${u.status}</span></td>
        <td>
          <div class="row-actions">
            <span class="icon-action ia-view" title="View" onclick="openUserDetail('${u.id}')"><i class="fa-solid fa-eye"></i></span>
            <span class="icon-action ia-edit" title="Edit" onclick="showToast('Edit user form would open here.','info')"><i class="fa-solid fa-pen"></i></span>
            <span class="icon-action ia-del" title="Suspend/Delete" onclick="confirmDeleteUser('${u.id}')"><i class="fa-solid fa-trash"></i></span>
          </div>
        </td>
      </tr>`).join('')
      : `<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-mute);">No users found.</td></tr>`;
  }
  renderPagination('usersPagination', userState.page, totalPages, p => { userState.page = p; renderUsersTable(); });
}

function openUserDetail(id) {
  const u = MOCK_USERS.find(x => x.id === id);
  if (!u) return;
  $('userDetailBody').innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;">
      <div class="avatar-sm" style="width:52px;height:52px;font-size:1rem;">${initials(u.name)}</div>
      <div><div style="font-family:'Syne',sans-serif;font-weight:800;font-size:1.05rem;">${u.name}</div><span class="badge ${statusBadgeClass(u.status)}">${u.status}</span></div>
    </div>
    <div class="detail-row"><span>Email</span><span>${u.email}</span></div>
    <div class="detail-row"><span>Phone</span><span>${u.phone}</span></div>
    <div class="detail-row"><span>Date Joined</span><span>${fmtDate(u.joined)}</span></div>
    <div class="detail-row"><span>Wallet Balance</span><span>${naira(u.wallet)}</span></div>
    <div class="detail-row"><span>Total Deposits</span><span>${u.deposits} items</span></div>
    <div class="detail-row"><span>Total Earnings</span><span>${naira(u.earnings)}</span></div>`;
  openModal('userDetailModal');
}

function confirmDeleteUser(id) {
  pendingAction = { type: 'deleteUser', id };
  $('confirmModalTitle').textContent = 'Suspend this user?';
  $('confirmModalText').textContent = 'This will restrict the user\'s access to the platform. You can reactivate them later.';
  openModal('confirmActionModal');
}

// ============================================================
// DEPOSITS
// API: GET /api/deposits, PUT /api/deposits/:id
// ============================================================
let depositState = { search: '', filter: 'all', page: 1, perPage: 6 };
function getFilteredDeposits() {
  return MOCK_DEPOSITS.filter(d => {
    const matchesSearch = !depositState.search || d.user.toLowerCase().includes(depositState.search.toLowerCase()) || d.material.toLowerCase().includes(depositState.search.toLowerCase());
    const matchesFilter = depositState.filter === 'all' || d.status.toLowerCase() === depositState.filter;
    return matchesSearch && matchesFilter;
  });
}
function renderDepositsTable() {
  const all = getFilteredDeposits();
  const totalPages = Math.max(1, Math.ceil(all.length / depositState.perPage));
  depositState.page = Math.min(depositState.page, totalPages);
  const start = (depositState.page - 1) * depositState.perPage;
  const pageData = all.slice(start, start + depositState.perPage);

  const tbody = $('depositsBody');
  if (tbody) {
    tbody.innerHTML = pageData.length ? pageData.map(d => `
      <tr>
        <td>${d.id}</td><td>${d.user}</td><td><span class="badge badge-green">${d.material}</span></td>
        <td>${d.qty}</td><td>${d.points} pts</td><td style="font-weight:700;">${naira(d.reward)}</td><td>${fmtDate(d.date)}</td>
        <td><span class="badge ${statusBadgeClass(d.status)}">${d.status}</span></td>
        <td>
          <div class="row-actions">
            <span class="icon-action ia-view" title="View" onclick="showToast('Viewing deposit ${d.id}','info')"><i class="fa-solid fa-eye"></i></span>
            ${d.status === 'Pending' ? `<span class="icon-action ia-approve" title="Approve" onclick="updateDepositStatus('${d.id}','Approved')"><i class="fa-solid fa-check"></i></span>
            <span class="icon-action ia-del" title="Reject" onclick="updateDepositStatus('${d.id}','Rejected')"><i class="fa-solid fa-xmark"></i></span>` : ''}
          </div>
        </td>
      </tr>`).join('')
      : `<tr><td colspan="9" style="text-align:center;padding:30px;color:var(--text-mute);">No deposits found.</td></tr>`;
  }
  renderPagination('depositsPagination', depositState.page, totalPages, p => { depositState.page = p; renderDepositsTable(); });
}
function updateDepositStatus(id, status) {
  const d = MOCK_DEPOSITS.find(x => x.id === id);
  if (d) { d.status = status; renderDepositsTable(); showToast(`Deposit ${id} marked as ${status}.`, 'success'); }
}

// ============================================================
// WITHDRAWALS
// API: GET /api/withdrawals, PUT /api/withdrawals/:id
// ============================================================
function initWithdrawals() {
  const pending = MOCK_WITHDRAWALS.filter(w => w.status === 'Pending').length;
  const approved = MOCK_WITHDRAWALS.filter(w => w.status === 'Approved').length;
  const rejected = MOCK_WITHDRAWALS.filter(w => w.status === 'Rejected').length;
  txt('wdPendingCount', pending); txt('wdApprovedCount', approved); txt('wdRejectedCount', rejected);
  renderWithdrawalsTable();
}
function renderWithdrawalsTable() {
  const tbody = $('withdrawalsBody');
  if (!tbody) return;
  tbody.innerHTML = MOCK_WITHDRAWALS.map(w => `
    <tr>
      <td>${w.user}</td><td>${w.bank}</td><td>${w.account}</td><td style="font-weight:700;">${naira(w.amount)}</td><td>${fmtDate(w.date)}</td>
      <td><span class="badge ${statusBadgeClass(w.status)}">${w.status}</span></td>
      <td>
        <div class="row-actions">
          <span class="icon-action ia-view" title="View" onclick="showToast('Viewing withdrawal ${w.id}','info')"><i class="fa-solid fa-eye"></i></span>
          ${w.status === 'Pending' ? `<span class="icon-action ia-approve" title="Approve" onclick="confirmWithdrawal('${w.id}','Approved')"><i class="fa-solid fa-check"></i></span>
          <span class="icon-action ia-del" title="Reject" onclick="confirmWithdrawal('${w.id}','Rejected')"><i class="fa-solid fa-xmark"></i></span>` : ''}
        </div>
      </td>
    </tr>`).join('');
}
function confirmWithdrawal(id, action) {
  pendingAction = { type: 'withdrawal', id, action };
  $('confirmModalTitle').textContent = `${action} this withdrawal?`;
  $('confirmModalText').textContent = `This will mark the withdrawal request as ${action.toLowerCase()}. This action will notify the user.`;
  openModal('confirmActionModal');
}

// ============================================================
// WALLET MANAGEMENT
// ============================================================
function initWallet() {
  txt('wmTotalPaid', naira(2450000));
  txt('wmPendingPayments', naira(MOCK_WITHDRAWALS.filter(w => w.status === 'Pending').reduce((a, w) => a + w.amount, 0)));
  txt('wmTotalTx', MOCK_WALLET_TX.length.toString());
  const tbody = $('walletTxBody');
  if (!tbody) return;
  tbody.innerHTML = MOCK_WALLET_TX.map(t => `
    <tr>
      <td>${t.user}</td><td>${t.desc}</td>
      <td style="font-weight:700;color:${t.amount > 0 ? 'var(--green-500)' : 'var(--red)'};">${t.amount > 0 ? '+' : ''}${naira(t.amount)}</td>
      <td>${fmtDate(t.date)}</td><td><span class="badge ${statusBadgeClass(t.status)}">${t.status}</span></td>
    </tr>`).join('');
}

// ============================================================
// RVM MANAGEMENT
// API: GET/POST /api/rvm, PUT/DELETE /api/rvm/:id
// ============================================================
function renderRvmTable() {
  const tbody = $('rvmBody');
  if (!tbody) return;
  tbody.innerHTML = MOCK_RVMS.map(r => `
    <tr>
      <td>${r.id}</td><td>${r.location}</td>
      <td><span class="badge ${statusBadgeClass(r.status)}">${r.status}</span></td>
      <td>${r.capacity}</td><td>${fmtDate(r.maintenance)}</td>
      <td>
        <div class="row-actions">
          <span class="icon-action ia-edit" title="Edit" onclick="showToast('Edit form for ${r.id} would open here.','info')"><i class="fa-solid fa-pen"></i></span>
          <span class="icon-action ia-approve" title="Deactivate" onclick="toggleRvmStatus('${r.id}')"><i class="fa-solid fa-power-off"></i></span>
          <span class="icon-action ia-del" title="Delete" onclick="confirmDeleteRvm('${r.id}')"><i class="fa-solid fa-trash"></i></span>
        </div>
      </td>
    </tr>`).join('');
}
function toggleRvmStatus(id) {
  const r = MOCK_RVMS.find(x => x.id === id);
  if (r) { r.status = r.status === 'Active' ? 'Inactive' : 'Active'; renderRvmTable(); showToast(`${id} is now ${r.status}.`, 'success'); }
}
function confirmDeleteRvm(id) {
  pendingAction = { type: 'deleteRvm', id };
  $('confirmModalTitle').textContent = 'Delete this RVM station?';
  $('confirmModalText').textContent = 'This will permanently remove the machine record from the system.';
  openModal('confirmActionModal');
}
async function handleAddRvm(e) {
  e.preventDefault();
  const id = $('rvmId').value.trim(), location = $('rvmLocation').value.trim();
  const lat = $('rvmLat').value, lng = $('rvmLng').value, cap = $('rvmCapacity').value, status = $('rvmStatus').value;
  if (!id || !location) { showToast('Machine ID and location are required.', 'error'); return; }
  const btn = e.target.querySelector('button[type="submit"]');
  setLoading(btn, true);
  await delay(500);
  MOCK_RVMS.unshift({ id, location, status, capacity: (cap || 0) + '%', maintenance: new Date().toISOString().slice(0, 10) });
  renderRvmTable(); e.target.reset(); setLoading(btn, false);
  showToast('New RVM machine added successfully!', 'success');
}

// ============================================================
// LEADERBOARD MANAGEMENT
// ============================================================
function renderLeaderboardTable() {
  const tbody = $('lbAdminBody');
  if (!tbody) return;
  tbody.innerHTML = MOCK_LEADERBOARD.map(u => `
    <tr>
      <td>${u.rank <= 3 ? ['🥇','🥈','🥉'][u.rank - 1] : u.rank}</td>
      <td><div class="cell-user"><div class="avatar-sm">${initials(u.name)}</div><div class="cell-user-name">${u.name}</div></div></td>
      <td style="font-weight:700;color:var(--gold-light);">${u.points.toLocaleString()} pts</td>
      <td>${u.items}</td><td style="font-weight:700;">${naira(u.reward)}</td>
    </tr>`).join('');
}
function resetLeaderboard() { showToast('Monthly leaderboard has been reset.', 'success'); }
function generateRankings() { showToast('Rankings regenerated based on latest data.', 'success'); }

// ============================================================
// CONTENT MANAGEMENT
// API: GET/POST /api/content, DELETE /api/content/:id
// ============================================================
function renderContentTable() {
  const tbody = $('contentBody');
  if (!tbody) return;
  tbody.innerHTML = MOCK_CONTENT.map(c => `
    <tr>
      <td>${c.title}</td><td><span class="badge badge-blue">${c.category}</span></td><td>${fmtDate(c.date)}</td>
      <td><span class="badge ${statusBadgeClass(c.status)}">${c.status}</span></td>
      <td>
        <div class="row-actions">
          <span class="icon-action ia-edit" title="Edit" onclick="showToast('Edit content form would open here.','info')"><i class="fa-solid fa-pen"></i></span>
          ${c.status === 'Draft' ? `<span class="icon-action ia-approve" title="Publish" onclick="publishContent('${c.id}')"><i class="fa-solid fa-upload"></i></span>` : ''}
          <span class="icon-action ia-del" title="Delete" onclick="confirmDeleteContent('${c.id}')"><i class="fa-solid fa-trash"></i></span>
        </div>
      </td>
    </tr>`).join('');
}
function publishContent(id) { const c = MOCK_CONTENT.find(x => x.id === id); if (c) { c.status = 'Published'; renderContentTable(); showToast('Content published successfully!', 'success'); } }
function confirmDeleteContent(id) {
  pendingAction = { type: 'deleteContent', id };
  $('confirmModalTitle').textContent = 'Delete this content?';
  $('confirmModalText').textContent = 'This will permanently remove the educational article from the platform.';
  openModal('confirmActionModal');
}
async function handleAddContent(e) {
  e.preventDefault();
  const title = $('contentTitle').value.trim(), category = $('contentCategory').value, desc = $('contentDesc').value.trim();
  if (!title || !desc) { showToast('Title and description are required.', 'error'); return; }
  const btn = e.target.querySelector('button[type="submit"]');
  setLoading(btn, true);
  await delay(500);
  MOCK_CONTENT.unshift({ id: 'C' + (Math.random() * 900 + 100).toFixed(0), title, category, date: new Date().toISOString().slice(0, 10), status: 'Published' });
  renderContentTable(); e.target.reset(); setLoading(btn, false);
  showToast('Content published successfully!', 'success');
}

// ============================================================
// NOTIFICATIONS
// ============================================================
function initNotifications() {
  const unread = MOCK_NOTIFICATIONS.filter(n => !n.read).length;
  txt('notifUnreadCount', unread); txt('topbarNotifCount', unread); txt('navNotifBadge', unread);
  const badge = $('topbarNotifBadge'); if (badge) badge.style.display = unread > 0 ? 'flex' : 'none';
  const list = $('notifList');
  if (!list) return;
  const colorMap = { green: ['var(--green-50)', 'var(--green-500)'], blue: ['var(--blue-bg)', 'var(--blue)'], gold: ['var(--gold-light)', '#8a6d12'], red: ['var(--red-bg)', 'var(--red)'] };
  list.innerHTML = MOCK_NOTIFICATIONS.map(n => `
    <div class="notif-item">
      <div class="notif-icon" style="background:${colorMap[n.color][0]};color:${colorMap[n.color][1]};"><i class="fa-solid ${n.icon}"></i></div>
      <div class="notif-body"><div class="notif-title">${n.title}</div><div class="notif-desc">${n.desc}</div><div class="notif-time">${n.time}</div></div>
      <div class="notif-dot ${n.read ? 'read' : ''}"></div>
    </div>`).join('');
}

// ============================================================
// PAGINATION HELPER
// ============================================================
function renderPagination(containerId, current, totalPages, onClick) {
  const c = $(containerId);
  if (!c) return;
  if (totalPages <= 1) { c.innerHTML = ''; return; }
  let html = `<button class="page-btn" ${current === 1 ? 'disabled' : ''} data-page="${current - 1}"><i class="fa-solid fa-chevron-left"></i></button>`;
  for (let i = 1; i <= totalPages; i++) html += `<button class="page-btn ${i === current ? 'active' : ''}" data-page="${i}">${i}</button>`;
  html += `<button class="page-btn" ${current === totalPages ? 'disabled' : ''} data-page="${current + 1}"><i class="fa-solid fa-chevron-right"></i></button>`;
  c.innerHTML = html;
  c.querySelectorAll('.page-btn').forEach(btn => btn.addEventListener('click', () => { const p = parseInt(btn.dataset.page); if (p >= 1 && p <= totalPages) onClick(p); }));
}

// ============================================================
// ADMIN PROFILE
// ============================================================
function initAdminProfile() {
  txt('apInitials', initials(ADMIN.name)); txt('apName', ADMIN.name); txt('apEmail', ADMIN.email);
  txt('apRole', ADMIN.role || 'Administrator'); txt('apLastLogin', new Date().toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }));
  const n = $('apEditName'); if (n) n.value = ADMIN.name;
  const e = $('apEditEmail'); if (e) e.value = ADMIN.email;
}
async function handleAdminProfileUpdate(e) {
  e.preventDefault();
  const name = $('apEditName').value.trim(), email = $('apEditEmail').value.trim();
  if (!name || !email) { showToast('Name and email are required.', 'error'); return; }
  ADMIN.name = name; ADMIN.email = email;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(ADMIN));
  initHeader(); initAdminProfile();
  showToast('Admin profile updated successfully!', 'success');
}

// ============================================================
// MODAL / TOAST / LOADING UTILITIES
// ============================================================
let pendingAction = null;
function openModal(id) { $(id).classList.add('show'); }
function closeModal(id) { $(id).classList.remove('show'); }
function setLoading(btn, isLoading) {
  if (!btn) return;
  if (isLoading) { btn.dataset.originalHtml = btn.innerHTML; btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing...`; btn.disabled = true; }
  else { btn.innerHTML = btn.dataset.originalHtml || btn.innerHTML; btn.disabled = false; }
}
function showToast(message, type = 'success') {
  const stack = $('toastStack'); if (!stack) return;
  const icon = type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-circle-xmark' : 'fa-circle-info';
  const el = document.createElement('div'); el.className = `toast ${type}`; el.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
  stack.appendChild(el); requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 350); }, 3800);
}
function confirmLogout() { sessionStorage.removeItem(SESSION_KEY); window.location.href = '../authen.html'; }

function executeConfirmedAction() {
  if (!pendingAction) return;
  const { type, id, action } = pendingAction;
  if (type === 'deleteUser') { const u = MOCK_USERS.find(x => x.id === id); if (u) { u.status = 'Suspended'; renderUsersTable(); showToast('User suspended successfully.', 'success'); } }
  if (type === 'withdrawal') { const w = MOCK_WITHDRAWALS.find(x => x.id === id); if (w) { w.status = action; renderWithdrawalsTable(); initWithdrawals(); showToast(`Withdrawal ${action.toLowerCase()}.`, 'success'); } }
  if (type === 'deleteRvm') { const idx = MOCK_RVMS.findIndex(x => x.id === id); if (idx > -1) { MOCK_RVMS.splice(idx, 1); renderRvmTable(); showToast('RVM deleted successfully.', 'success'); } }
  if (type === 'deleteContent') { const idx = MOCK_CONTENT.findIndex(x => x.id === id); if (idx > -1) { MOCK_CONTENT.splice(idx, 1); renderContentTable(); showToast('Content deleted successfully.', 'success'); } }
  pendingAction = null;
  closeModal('confirmActionModal');
}

// ============================================================
// THEME
// ============================================================
function initTheme() { setTheme(localStorage.getItem('ecoleey_admin_theme') || 'light', false); }
function setTheme(mode, persist = true) {
  document.body.classList.toggle('dark-mode', mode === 'dark');
  const toggle = $('darkModeToggle'); if (toggle) toggle.checked = mode === 'dark';
  if (persist) localStorage.setItem('ecoleey_admin_theme', mode);
}

// ============================================================
// SETTINGS
// ============================================================
async function handleSettingsSave(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  setLoading(btn, true);
  // ── Backend integration point ──
  // try { await apiFetch(ENDPOINTS.settings, { method: 'PUT', body: JSON.stringify({...}) }); } catch (err) { showToast(err.message,'error'); setLoading(btn,false); return; }
  await delay(500);
  setLoading(btn, false);
  showToast('Settings saved successfully!', 'success');
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // Wrap each init in try/catch so one failing section
  // never prevents the rest of the dashboard from loading
  const safeInit = (fn, name) => {
    try { fn(); }
    catch(e) { console.warn(`Init failed for ${name}:`, e.message); }
  };

  safeInit(initHeader,           'header');
  safeInit(initOverview,         'overview');
  safeInit(renderUsersTable,     'usersTable');
  safeInit(fetchRealUsers,       'fetchRealUsers');
  safeInit(renderDepositsTable,  'depositsTable');
  safeInit(initWithdrawals,      'withdrawals');
  safeInit(initWallet,           'wallet');
  safeInit(renderRvmTable,       'rvmTable');
  safeInit(renderLeaderboardTable,'leaderboard');
  safeInit(renderContentTable,   'contentTable');
  safeInit(initNotifications,    'notifications');
  safeInit(initAdminProfile,     'adminProfile');
  safeInit(initTheme,            'theme');

  document.querySelectorAll('.nav-link[data-section]').forEach(link => link.addEventListener('click', () => go(link.dataset.section)));

  $('hamburger').addEventListener('click', () => { $('sidebar').classList.contains('open') ? closeSidebar() : openSidebar(); });
  $('sidebarOverlay').addEventListener('click', closeSidebar);

  $('userPill').addEventListener('click', e => { e.stopPropagation(); toggleProfileDropdown(); });
  document.addEventListener('click', e => { if (!$('userPill').contains(e.target) && !$('profileDropdown').contains(e.target)) closeProfileDropdown(); });

  // Search & filters — users
  $('userSearch').addEventListener('input', function () { userState.search = this.value; userState.page = 1; renderUsersTable(); });
  document.querySelectorAll('[data-user-filter]').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('[data-user-filter]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active'); userState.filter = btn.dataset.userFilter; userState.page = 1; renderUsersTable();
  }));

  // Search & filters — deposits
  $('depositSearch').addEventListener('input', function () { depositState.search = this.value; depositState.page = 1; renderDepositsTable(); });
  document.querySelectorAll('[data-deposit-filter]').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('[data-deposit-filter]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active'); depositState.filter = btn.dataset.depositFilter; depositState.page = 1; renderDepositsTable();
  }));

  // Forms
  $('addRvmForm').addEventListener('submit', handleAddRvm);
  $('addContentForm').addEventListener('submit', handleAddContent);
  $('adminProfileForm').addEventListener('submit', handleAdminProfileUpdate);
  $('settingsForm').addEventListener('submit', handleSettingsSave);

  // Leaderboard buttons
  $('resetLeaderboardBtn').addEventListener('click', resetLeaderboard);
  $('generateRankingsBtn').addEventListener('click', generateRankings);

  // Mark all notifications read
  $('markAllReadBtn').addEventListener('click', () => {
    document.querySelectorAll('.notif-dot').forEach(d => d.classList.add('read'));
    txt('notifUnreadCount', 0); txt('topbarNotifCount', 0); txt('navNotifBadge', 0);
    const badge = $('topbarNotifBadge'); if (badge) badge.style.display = 'none';
  });

  // Dark mode toggle in settings
  const dm = $('darkModeToggle'); if (dm) dm.addEventListener('change', () => setTheme(dm.checked ? 'dark' : 'light'));

  // Modals — generic close
  document.querySelectorAll('[data-modal-close]').forEach(el => el.addEventListener('click', () => closeModal(el.dataset.modalClose)));
  document.querySelectorAll('.modal-overlay').forEach(ov => ov.addEventListener('click', e => { if (e.target === ov) closeModal(ov.id); }));

  // Confirm action modal buttons
  $('confirmActionBtn').addEventListener('click', executeConfirmedAction);

  // Logout
  document.querySelectorAll('[data-logout-trigger]').forEach(btn => btn.addEventListener('click', () => openModal('logoutModal')));
  $('logoutConfirmBtn').addEventListener('click', confirmLogout);

  // Topbar quick search → users
  $('topbarSearchInput').addEventListener('input', function () {
    if (this.value.length > 1) { go('users'); $('userSearch').value = this.value; userState.search = this.value; renderUsersTable(); }
  });

  setTimeout(() => { const l = $('loader'); if (l) l.classList.add('hidden'); }, 450);
  go('overview');
});