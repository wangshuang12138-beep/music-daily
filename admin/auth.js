// auth.js - 认证模块

console.log('[Auth] ========== 脚本加载 ==========');

// 硬编码凭证
const VALID_USERNAME = 'admin';
const VALID_PASSWORD = 'admin123';

const AUTH_KEY = 'md_admin_auth';
const SESSION_DURATION = 24 * 60 * 60 * 1000;

// 显示/隐藏密码
window.togglePassword = function() {
  console.log('[Auth] 切换密码显示');
  
  const pwdInput = document.getElementById('password');
  const toggleBtn = document.getElementById('togglePwd');
  
  if (!pwdInput || !toggleBtn) {
    console.error('[Auth] 找不到元素!');
    return;
  }
  
  console.log('[Auth] 当前类型:', pwdInput.type);
  
  if (pwdInput.type === 'password') {
    pwdInput.type = 'text';
    toggleBtn.textContent = '🙈';
    console.log('[Auth] 已切换为明文');
  } else {
    pwdInput.type = 'password';
    toggleBtn.textContent = '👁️';
    console.log('[Auth] 已切换为密文');
  }
};

// 登录
window.doLogin = function() {
  console.log('[Auth] ========== 登录点击 ==========');
  
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const errorDiv = document.getElementById('loginError');
  
  if (!usernameInput || !passwordInput) {
    console.error('[Auth] 找不到输入框!');
    alert('页面错误：找不到输入框');
    return;
  }
  
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  
  console.log('[Auth] 用户名:', username);
  console.log('[Auth] 密码长度:', password.length);
  console.log('[Auth] 预期用户名:', VALID_USERNAME);
  console.log('[Auth] 预期密码:', VALID_PASSWORD);
  
  if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    console.log('[Auth] 验证通过!');
    
    // 存储 session
    const session = {
      user: username,
      loginAt: Date.now(),
      expires: Date.now() + SESSION_DURATION
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    
    // 隐藏错误
    if (errorDiv) errorDiv.style.display = 'none';
    
    // 切换页面
    window.showAdminPage();
  } else {
    console.log('[Auth] 验证失败!');
    console.log('[Auth] 用户名匹配:', username === VALID_USERNAME);
    console.log('[Auth] 密码匹配:', password === VALID_PASSWORD);
    if (errorDiv) errorDiv.style.display = 'block';
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
  console.log('[Auth] 检查登录状态:', sessionStr ? '有session' : '无session');
  
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
  console.log('[Auth] ========== 初始化 ==========');
  
  // 检查元素是否存在
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const toggleBtn = document.getElementById('togglePwd');
  
  console.log('[Auth] 用户名输入框:', usernameInput ? '存在' : '不存在');
  console.log('[Auth] 密码输入框:', passwordInput ? '存在' : '不存在');
  console.log('[Auth] 眼睛按钮:', toggleBtn ? '存在' : '不存在');
  
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

console.log('[Auth] 脚本加载完成');
