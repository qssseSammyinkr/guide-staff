let users = {
  owner: 'OwnerPass!23',
  subowner: 'SubPass!23',
  executive: 'ExecPass!23',
  manager: 'ManagePass!23',
  dev: 'DevPass!23',
  moderator: 'ModPass!23',
  helper: 'HelpPass!23'
};

function login() {
  const username = document.getElementById('username').value.toLowerCase();
  const password = document.getElementById('password').value;
  const error = document.getElementById('error');

  if (users[username] && users[username] === password) {
    localStorage.setItem('user', username);
    window.location.href = 'dashboard.html';
  } else {
    error.textContent = 'Invalid credentials!';
  }
}

function logout() {
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const user = localStorage.getItem('user');
  if ((path.includes('dashboard.html') || path.includes('admin.html')) && !user) {
    window.location.href = 'login.html';
    return;
  }
  if (path.includes('dashboard.html')) {
    document.getElementById('welcome').textContent = `Welcome, ${user.charAt(0).toUpperCase() + user.slice(1)}!`;
  }
  if (path.includes('admin.html')) {
    if (user !== 'owner') {
      alert('Only Owner can access Admin Panel!');
      window.location.href = 'dashboard.html';
      return;
    }
    populateStaffTable();
  }
});

function goToAdmin() {
  const user = localStorage.getItem('user');
  if (user === 'owner') {
    window.location.href = 'admin.html';
  } else {
    alert('Only Owner can access Admin Panel!');
  }
}

function goBack() {
  window.location.href = 'dashboard.html';
}

// Admin panel functions
function populateStaffTable() {
  const tbody = document.querySelector('#staffTable tbody');
  tbody.innerHTML = '';
  for (const [user, pass] of Object.entries(users)) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${user}</td><td>${user}</td><td>${pass}</td>
                    <td><button onclick="removeStaff('${user}')">Remove</button></td>`;
    tbody.appendChild(tr);
  }
}

function addStaff() {
  const role = document.getElementById('newRole').value.toLowerCase();
  const username = document.getElementById('newUser').value.toLowerCase();
  const password = document.getElementById('newPass').value;
  if (!role || !username || !password) {
    alert('Fill all fields');
    return;
  }
  users[username] = password;
  populateStaffTable();
  document.getElementById('newRole').value = '';
  document.getElementById('newUser').value = '';
  document.getElementById('newPass').value = '';
}

function removeStaff(username) {
  if (username === 'owner') {
    alert('Cannot remove Owner!');
    return;
  }
  delete users[username];
  populateStaffTable();
}