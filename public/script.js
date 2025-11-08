// public/script.js — Core Pastris Panel (completo)
// Features:
// - Login POST /api/login
// - Dashboard: tabs, logout, badges
// - Load users GET /api/users
// - Load logs GET /api/logs
// - Polling for updates (every 5s)
// - Notifications dropdown (recent activity)
// - showAlert visual alerts
// - Owner-only: remove user (DELETE /api/users) with logging

/* =========================
   Utility helpers
   ========================= */
function showAlert(message, type = "info") {
  // ensure container
  let container = document.getElementById("alert-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "alert-container";
    document.body.appendChild(container);
  }

  const el = document.createElement("div");
  el.className = `alert ${type}`;
  el.textContent = message;
  container.appendChild(el);

  // auto remove
  setTimeout(() => {
    el.classList.add("fade-out");
    setTimeout(() => el.remove(), 900);
  }, 3800);
}

async function fetchJSON(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `HTTP ${res.status}`);
  }
  return res.json();
}

function escapeHtml(s) {
  if (!s) return "";
  return s.replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

/* inject fallback styles for alerts if not in CSS */
(function ensureAlertStyles() {
  if (document.getElementById("cp-alert-styles")) return;
  const css = `
    #alert-container { position: fixed; top: 12px; right: 12px; z-index:9999; display:flex;flex-direction:column;gap:8px; }
    .alert { padding:10px 14px; border-radius:8px; font-weight:600; box-shadow:0 6px 18px rgba(0,0,0,0.4); animation: slideIn .25s ease; }
    .alert.info { background:#008cff; color:#fff; }
    .alert.success { background:#00ff88; color:#071; }
    .alert.error { background:#ff4b4b; color:#fff; }
    @keyframes slideIn { from { transform: translateX(24px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
    .fade-out { opacity: 0; transform: translateX(24px); transition: all .9s ease; }
    .remove-user-btn, .remove-user { background:#ff5b5b; color:white; border:none; padding:6px 10px; border-radius:6px; cursor:pointer; }
    .remove-user-btn:hover { opacity:0.95; }
    .staff-row { display:flex; justify-content:space-between; align-items:center; padding:8px 6px; border-bottom:1px solid #111; }
    .small-note { color:#aaa; font-size:0.86em; }
  `;
  const s = document.createElement("style");
  s.id = "cp-alert-styles";
  s.textContent = css;
  document.head.appendChild(s);
})();

/* =========================
   LOGIN page logic (index.html)
   ========================= */
if (document.getElementById("login-form")) {
  (function initLogin() {
    const form = document.getElementById("login-form");
    const errorMsg = document.getElementById("error-msg");

    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      errorMsg.textContent = "";

      const username = (document.getElementById("username")?.value || "").trim();
      const role = (document.getElementById("role")?.value || "").trim();
      const password = (document.getElementById("password")?.value || "").trim();

      if (!username || !role || !password) {
        errorMsg.textContent = "Please fill username, role and password.";
        showAlert("Please complete all fields", "error");
        return;
      }

      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, role, password })
        });
        const data = await res.json();

        if (data.success) {
          // store minimal client-side info for UI only
          localStorage.setItem("cp_user", username);
          localStorage.setItem("cp_role", role);
          showAlert("✅ Login success — Redirecting...", "success");
          setTimeout(() => window.location.href = "/dashboard.html", 700);
        } else {
          errorMsg.textContent = data.message || "Login failed.";
          showAlert("❌ " + (data.message || "Login failed"), "error");
        }
      } catch (err) {
        console.error("Login request failed", err);
        errorMsg.textContent = "Network or server error.";
        showAlert("❌ Network or server error", "error");
      }
    });
  })();
}

/* =========================
   DASHBOARD page logic (dashboard.html)
   ========================= */
if (document.body && document.querySelector(".dashboard") ) {
  (function initDashboard() {
    const user = localStorage.getItem("cp_user");
    const role = localStorage.getItem("cp_role");
    const userNameEl = document.getElementById("user-name");
    const userBadgeEl = document.getElementById("user-badge");
    const tabs = document.querySelectorAll(".tab-btn");
    const sections = document.querySelectorAll(".tab-content");
    const logoutBtn = document.getElementById("logout");
    const logsContainer = document.getElementById("logs-container");
    const staffListContainer = document.getElementById("staff-list");
    const notifIcon = document.getElementById("notification-icon");
    const notifDropdown = document.getElementById("notification-dropdown");
    const notifList = document.getElementById("notif-list");
    const securityContent = document.getElementById("security-content");

    if (!user || !role) {
      // not logged in
      window.location.href = "/index.html";
      return;
    }

    // render user header
    if (userNameEl) userNameEl.textContent = user;
    if (userBadgeEl) {
      userBadgeEl.textContent = role.toUpperCase();
      userBadgeEl.className = "badge " + role;
    }

    // tab navigation
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const tgt = tab.dataset.tab;
        tabs.forEach(t => t.classList.remove("active"));
        sections.forEach(s => s.classList.remove("active"));
        tab.classList.add("active");
        const el = document.getElementById(tgt);
        if (el) el.classList.add("active");
      });
    });

    // logout
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("cp_user");
      localStorage.removeItem("cp_role");
      window.location.href = "/index.html";
    });

    // notifications dropdown behaviour
    let notifOpen = false;
    if (notifIcon && notifDropdown) {
      notifIcon.addEventListener("click", (e) => {
        notifOpen = !notifOpen;
        notifDropdown.style.display = notifOpen ? "flex" : "none";
      });
      document.addEventListener("click", (ev) => {
        if (!notifIcon.contains(ev.target) && !notifDropdown.contains(ev.target)) {
          notifOpen = false;
          notifDropdown.style.display = "none";
        }
      });
    }

    /* Polling & UI updates */
    let lastLogCount = 0;

    async function loadLogs() {
      try {
        const data = await fetchJSON("/api/logs");
        const logs = data.logs || [];
        // update logs tab
        if (logsContainer) {
          if (logs.length === 0) {
            logsContainer.textContent = "No logs found.";
          } else {
            logsContainer.textContent = logs.map(l => {
              const action = l.action ? ` — ${l.action}` : "";
              const time = l.time || l.timestamp || (new Date(l.time).toLocaleString && l.time) || l.time;
              return `[${l.time || l.timestamp || ""}] ${l.username} (${l.role}) from ${l.ip}${action}`;
            }).join("
");
          }
        }

        // update notifications dropdown (last 8)
        const recent = logs.slice(-8).reverse();
        if (notifList) {
          notifList.innerHTML = recent.map(l => {
            const action = l.action ? ` — ${escapeHtml(l.action)}` : "";
            return `<li>[${escapeHtml(l.time)}] <strong>${escapeHtml(l.username)}</strong> (${escapeHtml(l.role)})${action}</li>`;
          }).join("");
        }

        if (logs.length > lastLogCount) {
          // show small alert about new events
          const newCount = logs.length - lastLogCount;
          showAlert(`🔔 ${newCount} new event(s)`, "info");
        }
        lastLogCount = logs.length;
      } catch (err) {
        console.warn("loadLogs error:", err);
      }
    }

    async function loadStaffList() {
      try {
        const data = await fetchJSON("/api/users");
        const users = data.users || [];

        if (staffListContainer) {
          if (users.length === 0) {
            staffListContainer.innerHTML = "<p>No staff registered yet.</p>";
          } else {
            staffListContainer.innerHTML = users.map(u => {
              return `
                <div class="staff-row">
                  <div>
                    <strong>${escapeHtml(u.username)}</strong>
                    <div class="small-note">${escapeHtml(u.role)} • ${escapeHtml(u.ip)}</div>
                  </div>
                  <div>
                    ${role === "owner" ? `<button class="remove-user-btn" data-username="${escapeHtml(u.username)}">Remove</button>` : ""}
                  </div>
                </div>
              `;
            }).join("");
          }
        }

        // attach remove handlers (owner)
        if (role === "owner") {
          document.querySelectorAll(".remove-user-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
              const usernameToRemove = btn.dataset.username;
              if (!confirm(`Confirm remove access for ${usernameToRemove}?`)) return;
              try {
                const res = await fetch("/api/users", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ username: usernameToRemove, by: user })
                });
                const j = await res.json();
                if (j.success) {
                  showAlert(`✅ Removed ${usernameToRemove}`, "success");
                  await loadUsersForSecurity();
                  await loadStaffList();
                  await loadLogs();
                } else {
                  showAlert(`❌ ${j.message || "Could not remove user"}`, "error");
                }
              } catch (err) {
                console.error("Remove user failed", err);
                showAlert("❌ Network error when removing user", "error");
              }
            });
          });
        }
      } catch (err) {
        console.warn("loadStaffList error:", err);
        if (staffListContainer) staffListContainer.innerHTML = "<p>Error loading staff list.</p>";
      }
    }

    async function loadUsersForSecurity() {
      try {
        const data = await fetchJSON("/api/users");
        const users = data.users || [];
        if (!securityContent) return;
        if (users.length === 0) {
          securityContent.innerHTML = "<p>No users registered.</p>";
          return;
        }
        const tableHtml = `
          <table style="width:100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="padding:8px; text-align:left;">Username</th>
                <th style="padding:8px; text-align:left;">Role</th>
                <th style="padding:8px; text-align:left;">IP</th>
                <th style="padding:8px; text-align:left;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(u => `
                <tr>
                  <td style="padding:8px;">${escapeHtml(u.username)}</td>
                  <td style="padding:8px;">${escapeHtml(u.role)}</td>
                  <td style="padding:8px;">${escapeHtml(u.ip)}</td>
                  <td style="padding:8px;"><button class="remove-user" data-username="${escapeHtml(u.username)}">Remove</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        securityContent.innerHTML = tableHtml;

        // attach handlers for owner-run removes
        document.querySelectorAll(".remove-user").forEach(btn => {
          btn.addEventListener("click", async () => {
            const username = btn.dataset.username;
            if (!confirm(`Remove access for ${username}?`)) return;
            try {
              const res = await fetch("/api/users", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, by: user })
              });
              const j = await res.json();
              if (j.success) {
                showAlert(`✅ Removed ${username}`, "success");
                await loadUsersForSecurity();
                await loadStaffList();
                await loadLogs();
              } else {
                showAlert(`❌ ${j.message || "Failed to remove"}`, "error");
              }
            } catch (err) {
              console.error("remove user failed", err);
              showAlert("❌ Network error", "error");
            }
          });
        });
      } catch (err) {
        console.error("loadUsersForSecurity error", err);
        if (securityContent) securityContent.innerHTML = "<p>Error loading security data.</p>";
      }
    }

    // initial loads
    loadLogs();
    loadStaffList();
    if (role === "owner") loadUsersForSecurity();

    // polling
    const POLL_MS = 5000;
    const pollHandle = setInterval(async () => {
      await loadLogs();
      await loadStaffList();
      if (role === "owner") await loadUsersForSecurity();
    }, POLL_MS);

    // stop polling on leave
    window.addEventListener("beforeunload", () => clearInterval(pollHandle));
  })();
}

/* end of file */
