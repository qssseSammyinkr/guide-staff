const users = {
  owner: "OwnerPass!23",
  subowner: "SubPass!23",
  executive: "ExecPass!23",
  manager: "ManagePass!23",
  dev: "DevPass!23",
  moderator: "ModPass!23",
  helper: "HelpPass!23"
};

function login() {
  const username = document.getElementById("username").value.toLowerCase();
  const password = document.getElementById("password").value;
  const error = document.getElementById("error");

  if (users[username] && users[username] === password) {
    localStorage.setItem("user", username);
    window.location.href = "dashboard.html";
  } else {
    error.textContent = "Invalid credentials!";
  }
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  if (path.includes("dashboard.html")) {
    const user = localStorage.getItem("user");
    if (!user) {
      window.location.href = "login.html";
      return;
    }
    document.getElementById("welcome").textContent = `Welcome, ${user.charAt(0).toUpperCase() + user.slice(1)}!`;
  }
});