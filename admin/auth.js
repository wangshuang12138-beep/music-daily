// auth.js - 认证模块

const VALID_USERNAME = 'admin';
const VALID_PASSWORD = 'admin123';

const AUTH_KEY = 'md_admin_auth';
const SESSION_DURATION = 24 * 60 * 60 * 1000;

// 显示/隐藏密码
window.togglePassword = function() {
  const pwdInput = document.getElementById('password');
  const toggleBtn = document.getElementById('togglePwd');
  
  if (!pwdInput || !toggleBtn) {
    alert('错误：找不到密码输入框或切换按钮');
    return;
  }
  
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
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const errorDiv = document.getElementById('loginError');
  
  if (!usernameInput || !passwordInput) {
    alert('页面错误：找不到输入框');
    return;
  }
  
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  
  // 调试信息
  const debugInfo = [
    '=== 登录调试 ===',
    '输入的用户名: [' + username + ']',
    '输入的密码: [' + password + ']',
    '密码长度: ' + password.length,
    '预期的用户名: [' + VALID_USERNAME + ']',
    '预期的密码: [' + VALID_PASSWORD + ']',
    '用户名匹配: ' + (username === VALID_USERNAME),
    '密码匹配: ' + (password === VALID_PASSWORD)
  ].join('\n');
  
  console.log(debugInfo);
  
  if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    // 登录成功
    const session = {
      user: username,
      loginAt: Date.now(),
      expires: Date.now() + SESSION_DURATION
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    
    if (errorDiv) errorDiv.style.display = 'none';
    
    alert('登录成功！正在跳转...');
    window.showAdminPage();
  } else {
    // 登录失败 - 显示调试信息
    alert(debugInfo);
    if (errorDiv) errorDiv.style.display = 'block';
  }
};

// 退出
window.doLogout = function() {
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
  const loginPage = document.getElementById('loginPage');
  const adminPage = document.getElementById('adminPage');
  
  if (loginPage) loginPage.style.display = 'block';
  if (adminPage) adminPage.style.display = 'none';
};

// 显示管理页
window.showAdminPage = function() {
  const loginPage = document.getElementById('loginPage');
  const adminPage = document.getElementById('adminPage');
  
  if (loginPage) loginPage.style.display = 'none';
  if (adminPage) adminPage.style.display = 'block';
  
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
  // 检查元素是否存在
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const toggleBtn = document.getElementById('togglePwd');
  
  // 初始化提示
  const initMsg = [
    '=== 页面初始化 ===',
    '用户名输入框: ' + (usernameInput ? '存在' : '不存在'),
    '密码输入框: ' + (passwordInput ? '存在' : '不存在'),
    '眼睛按钮: ' + (toggleBtn ? '存在' : '不存在')
  ].join('\n');
  
  console.log(initMsg);
  
  // 绑定回车登录
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
