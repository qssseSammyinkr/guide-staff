const backendURL = "/api";

// -------- LOGIN --------
async function login(){
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const res = await fetch(`${backendURL}/login`,{
    method:"POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({username,password})
  });
  const data = await res.json();
  if(data.success){
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    window.location.href = data.user.role==="owner"?"owner.html":"tools.html";
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
  setInterval(fetchNotices, 5000);
}

// -------- NOTICES --------
async function fetchNotices(){
  const res = await fetch(`${backendURL}/notices`);
  const notices = await res.json();
  const list = document.getElementById('notices-list');
  if(!list) return;
  list.innerHTML = '';
  notices.forEach(n=>{
    const li = document.createElement('li');
    li.textContent = `[${n.date}] ${n.user}: ${n.notice}`;
    list.appendChild(li);
  });
}

async function sendNotice(){
  const noticeText = prompt("Enter announcement:");
  if(!noticeText) return;
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  await fetch(`${backendURL}/notices`,{
    method:"POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({user: currentUser.username, notice: noticeText})
  });
  fetchNotices();
}
