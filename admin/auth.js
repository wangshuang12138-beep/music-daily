// auth.js - 认证模块

console.log('[Auth] 脚本加载中...');

// 硬编码凭证（简单 base64 编码，仅用于演示）
const VALID_USERNAME = 'admin';
const VALID_PASSWORD = 'admin123';

const AUTH_KEY = 'md_admin_auth';
const SESSION_DURATION = 24 * 60 * 60 * 1000;

// 显示/隐藏密码
window.togglePassword = function() {
  const pwdInput = document.getElementById('password');
  const toggleBtn = document.getElementById('togglePwd');
  
  if (pwdInput.type === 'password') {
    pwdInput.type = 'text';
    toggleBtn.textContent = '🙈';
  } else {
    pwdInput.type = 'password';
    toggleBtn.textContent = '👁️';
  }
};

// 登录
window.doLogin = function() {
  console.log('[Auth] 登录按钮被点击');
  
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const errorDiv = document.getElementById('loginError');
  
  if (!usernameInput || !passwordInput) {
    console.error('[Auth] 找不到输入框');
    return;
  }
  
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  
  console.log('[Auth] 验证中... 用户名:', username);
  
  if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    console.log('[Auth] 登录成功！');
    
    // 存储 session
    const session = {
      user: username,
      loginAt: Date.now(),
      expires: Date.now() + SESSION_DURATION
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    
    // 隐藏错误
    errorDiv.style.display = 'none';
    
    // 切换页面
    window.showAdminPage();
  } else {
    console.log('[Auth] 登录失败');
    errorDiv.style.display = 'block';
  }
};

// 退出
window.doLogout = function() {
  console.log('[Auth] 退出登录');
  localStorage.removeItem(AUTH_KEY);
  window.showLoginPage();
};

// 检查登录状态
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

// 显示登录页
window.showLoginPage = function() {
  console.log('[Auth] 显示登录页');
  const loginPage = document.getElementById('loginPage');
  const adminPage = document.getElementById('adminPage');
  
  if (loginPage) loginPage.style.display = 'block';
  if (adminPage) adminPage.style.display = 'none';
};

// 显示管理页
window.showAdminPage = function() {
  console.log('[Auth] 显示管理页');
  const loginPage = document.getElementById('loginPage');
  const adminPage = document.getElementById('adminPage');
  
  if (loginPage) loginPage.style.display = 'none';
  if (adminPage) adminPage.style.display = 'block';
  
  // 加载数据
  if (typeof window.loadData === 'function') {
    window.loadData();
  }
};

// 页面加载时
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  console.log('[Auth] 初始化...');
  
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
    window.showAdminPage();
  } else {
    window.showLoginPage();
  }
}

console.log('[Auth] 脚本加载完成');
