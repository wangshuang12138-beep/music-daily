// auth.js - 认证模块
// 注意：这是纯前端方案，仅用于演示，不适合生产环境

console.log('[Auth] 脚本加载中...');

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
  try {
    return atob(encoded.split('').reverse().join(''));
  } catch (e) {
    console.error('[Auth] 解码失败:', e);
    return '';
  }
}

// 全局暴露 doLogin
window.doLogin = function() {
  console.log('[Auth] 登录按钮被点击');
  
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const errorDiv = document.getElementById('loginError');
  
  if (!usernameInput || !passwordInput) {
    console.error('[Auth] 找不到输入框');
    alert('页面加载错误，请刷新重试');
    return;
  }
  
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  
  console.log('[Auth] 用户名:', username);
  
  // 验证
  const validUser = decode(ENCODED_CREDS.username);
  const validPass = decode(ENCODED_CREDS.password);
  
  console.log('[Auth] 验证中...');
  
  if (username === validUser && password === validPass) {
    console.log('[Auth] 登录成功');
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
    console.log('[Auth] 登录失败');
    errorDiv.style.display = 'block';
  }
};

// 全局暴露 doLogout
window.doLogout = function() {
  console.log('[Auth] 退出登录');
  localStorage.removeItem(AUTH_KEY);
  showLoginPage();
};

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
  console.log('[Auth] 显示登录页');
  const loginPage = document.getElementById('loginPage');
  const adminPage = document.getElementById('adminPage');
  
  if (loginPage) loginPage.style.display = 'block';
  if (adminPage) adminPage.style.display = 'none';
}

function showAdminPage() {
  console.log('[Auth] 显示管理页');
  const loginPage = document.getElementById('loginPage');
  const adminPage = document.getElementById('adminPage');
  
  if (loginPage) loginPage.style.display = 'none';
  if (adminPage) adminPage.style.display = 'block';
  
  // 加载数据
  if (typeof loadData === 'function') {
    loadData();
  }
}

// 页面加载时检查
document.addEventListener('DOMContentLoaded', function() {
  console.log('[Auth] DOM 加载完成');
  
  // 绑定回车登录
  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    passwordInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        window.doLogin();
      }
    });
  }
  
  // 检查登录状态
  if (checkAuth()) {
    showAdminPage();
  } else {
    showLoginPage();
  }
});

console.log('[Auth] 脚本加载完成');
