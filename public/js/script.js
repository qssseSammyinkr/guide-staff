import { supabase } from './supabase.js';

// -------- LOGIN --------
async function login(){
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .maybeSingle();

  if(data){
    localStorage.setItem('currentUser', JSON.stringify(data));
    window.location.href = data.role==="owner"?"owner.html":"tools.html";
  } else {
    document.getElementById('error-msg').textContent = "Incorrect username or password!";
  }
}

// -------- LOGOUT --------
function logout(){
  localStorage.removeItem('currentUser');
  window.location.href = "index.html";
}

// -------- DASHBOARD INIT --------
function initDashboard(){
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if(!user) window.location.href="index.html";
  document.getElementById('welcome-msg').textContent = `Welcome, ${user.username}!`;
  fetchNotices();
  setInterval(fetchNotices, 5000);
}

function initOwner(){
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if(!user || user.role!=="owner") window.location.href="index.html";
  document.getElementById('welcome-msg').textContent = `Welcome, ${user.username}!`;
  fetchNotices();
  fetchUsers();
  setInterval(fetchNotices, 5000);
}

// -------- NOTICES --------
async function fetchNotices(){
  const { data } = await supabase
    .from('notices')
    .select('*')
    .order('date', { ascending: false });

  const list = document.getElementById('notices-list');
  if(!list) return;
  list.innerHTML = '';

  if(data) {
    data.forEach(n=>{
      const li = document.createElement('li');
      li.textContent = `[${new Date(n.date).toLocaleString()}] ${n.user}: ${n.notice}`;
      list.appendChild(li);
    });
  }
}

async function sendNotice(){
  const noticeText = prompt("Enter announcement:");
  if(!noticeText) return;
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  await supabase
    .from('notices')
    .insert([{ user: currentUser.username, notice: noticeText }]);

  fetchNotices();
}

// -------- LOGS --------
async function showLogs(){
  const { data } = await supabase
    .from('logs')
    .select('*')
    .order('date', { ascending: false });

  const container = document.getElementById('action-container');
  container.innerHTML = '<h3>Action Logs</h3><ul id="logs-list"></ul>';
  const list = document.getElementById('logs-list');

  if(data) {
    data.forEach(l=>{
      const li = document.createElement('li');
      li.textContent = `[${new Date(l.date).toLocaleString()}] ${l.user}: ${l.action}`;
      list.appendChild(li);
    });
  }
}

// -------- REPORTS --------
async function showReports(){
  const { data } = await supabase
    .from('reports')
    .select('*')
    .order('date', { ascending: false });

  const container = document.getElementById('action-container');
  container.innerHTML = '<h3>Reports</h3><ul id="reports-list"></ul>';
  const list = document.getElementById('reports-list');

  if(data) {
    data.forEach(r=>{
      const li = document.createElement('li');
      li.textContent = `[${new Date(r.date).toLocaleString()}] ${r.user}: ${r.report}`;
      list.appendChild(li);
    });
  }
}

// -------- BANS --------
async function showBans(){
  const { data } = await supabase
    .from('bans')
    .select('*')
    .order('date', { ascending: false });

  const container = document.getElementById('action-container');
  container.innerHTML = '<h3>Ban Records</h3><ul id="bans-list"></ul>';
  const list = document.getElementById('bans-list');

  if(data) {
    data.forEach(b=>{
      const li = document.createElement('li');
      li.textContent = `[${new Date(b.date).toLocaleString()}] ${b.user}: ${b.ban}`;
      list.appendChild(li);
    });
  }
}

// -------- OWNER FUNCTIONS --------
async function registerUser(){
  const username = document.getElementById('new-username').value.trim();
  const password = document.getElementById('new-password').value.trim();

  if(!username || !password) {
    alert("Please enter username and password");
    return;
  }

  const { error } = await supabase
    .from('users')
    .insert([{ username, password, role: 'staff' }]);

  if(error) {
    alert("Error registering user: " + error.message);
  } else {
    alert("User registered successfully!");
    document.getElementById('new-username').value = '';
    document.getElementById('new-password').value = '';
    fetchUsers();
  }
}

async function fetchUsers(){
  const { data } = await supabase
    .from('users')
    .select('username, role, created_at')
    .order('created_at', { ascending: false });

  const list = document.getElementById('user-list');
  if(!list) return;
  list.innerHTML = '';

  if(data) {
    data.forEach(u=>{
      const li = document.createElement('li');
      li.textContent = `${u.username} (${u.role}) - Registered: ${new Date(u.created_at).toLocaleDateString()}`;
      list.appendChild(li);
    });
  }
}

window.login = login;
window.logout = logout;
window.initDashboard = initDashboard;
window.initOwner = initOwner;
window.sendNotice = sendNotice;
window.showLogs = showLogs;
window.showReports = showReports;
window.showBans = showBans;
window.registerUser = registerUser;
