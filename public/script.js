// Guide Staff Dashboard - Core Pastris
// Frontend control script

// === CONFIG ===
const API_BASE = "/api"; // backend folder
const STORAGE_KEY = "guide_staff_user"; // localStorage key

// === HELPERS ===
async function postJSON(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}

async function getJSON(url) {
  const res = await fetch(url);
  return await res.json();
}

function saveUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function getUser() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
}

function clearUser() {
  localStorage.removeItem(STORAGE_KEY);
}

// === LOGIN LOGIC ===
async function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Please fill in all fields!");
    return;
  }

  const res = await postJSON(`${API_BASE}/login`, { username, password });

  if (res.success) {
    saveUser(res.user);
    window.location.href = "dashboard.html";
  } else {
    alert(res.message || "Access denied!");
  }
}

// === LOGOUT ===
function handleLogout() {
  clearUser();
  window.location.href = "index.html";
}

// === DASHBOARD INIT ===
async function initDashboard() {
  const user = getUser();
  const info = document.getElementById("userInfo");
  const logContainer = document.getElementById("logContainer");

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  // Display info
  info.innerHTML = `
    <p><strong>User:</strong> ${user.username}</p>
    <p><strong>Role:</strong> ${user.role}</p>
    <p><strong>IP:</strong> ${user.ip}</p>
  `;

  // Load logs
  const logs = await getJSON(`${API_BASE}/logs`);
  if (logs.success && Array.isArray(logs.data)) {
    logContainer.innerHTML = logs.data
      .map(
        (log) => `
        <div class="log-entry">
          <span>[${new Date(log.date).toLocaleString()}]</span>
          <strong>${log.username}</strong> (${log.ip}) - ${log.action}
        </div>
      `
      )
      .join("");
  } else {
    logContainer.innerHTML = "<p>No logs available.</p>";
  }
}

// === ROLE RESTRICTIONS ===
function isAuthorized(role) {
  const user = getUser();
  if (!user) return false;
  const roleOrder = ["helper", "mod", "admin", "owner"];
  return roleOrder.indexOf(user.role) >= roleOrder.indexOf(role);
}

// === EVENT BINDING ===
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const logoutBtn = document.getElementById("logoutBtn");
  const dashCheck = document.body.classList.contains("dashboard");

  if (loginForm) loginForm.addEventListener("submit", handleLogin);
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);
  if (dashCheck) initDashboard();
});