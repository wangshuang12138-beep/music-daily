// auth.js - 认证模块
// 注意：这是纯前端方案，仅用于演示，不适合生产环境

// 简单的混淆（base64 + 反转）
const ENCODED_CREDS = {
  // btoa('admin') -> 'YWRtaW4=' -> 反转 -> '=4nimdRAY'
  username: '=4nimdRAY',
  // btoa('admin123') -> 'YWRtaW4xMjM=' -> 反转 -> '=MzIxNmltZGFZ'
  password: '=MzIxNmltZGFZ'
};

const AUTH_KEY = 'md_admin_auth';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24小时

function encode(str) {
  return btoa(str).split('').reverse().join('');
}

function decode(encoded) {
  return atob(encoded.split('').reverse().join(''));
}

function doLogin() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('loginError');
  
  // 验证
  const validUser = decode(ENCODED_CREDS.username);
  const validPass = decode(ENCODED_CREDS.password);
  
  if (username === validUser && password === validPass) {
    // 登录成功，存储 session
    const session = {
      user: username,
      loginAt: Date.now(),
      expires: Date.now() + SESSION_DURATION
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    
    // 跳转
    showAdminPage();
    errorDiv.style.display = 'none';
  } else {
    errorDiv.style.display = 'block';
  }
}

function doLogout() {
  localStorage.removeItem(AUTH_KEY);
  showLoginPage();
}

function checkAuth() {
  const sessionStr = localStorage.getItem(AUTH_KEY);
  if (!sessionStr) return false;
  
  try {
    const session = JSON.parse(sessionStr);
    if (Date.now() > session.expires) {
      localStorage.removeItem(AUTH_KEY);
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

function showLoginPage() {
  document.getElementById('loginPage').style.display = 'block';
  document.getElementById('adminPage').style.display = 'none';
}

function showAdminPage() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('adminPage').style.display = 'block';
  
  // 加载数据
  if (typeof loadData === 'function') {
    loadData();
  }
}

// 页面加载时检查
window.addEventListener('DOMContentLoaded', () => {
  if (checkAuth()) {
    showAdminPage();
  } else {
    showLoginPage();
  }
  
  // 回车登录
  document.getElementById('password')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') doLogin();
  });
});
