// 识趣派 — 用户 Store（纯 ES6 单例，替代 Pinia）
// ES 模块天然单例，Vue3 ref/computed 在模块顶层使用与 Pinia 等效
// accessToken 仅存内存，refreshToken 通过 uni.setStorageSync 持久化

import { ref, computed } from 'vue';
import { getRefreshToken, setRefreshToken, removeRefreshToken } from '@/utils/token';

// ---- 内部响应式状态 ----
const accessToken = ref(null);    // 仅内存，不持久化
const refreshToken = ref(null);   // 暂存于此，真正持久化在 token.js
const userInfo = ref(null);       // { id, phone, nickname, avatar, pointsBalance }
const autoLoginDone = ref(false); // 自动登录是否已完成

const isLoggedIn = computed(() => !!accessToken.value);

// ---- Actions ----

/** 自动登录：读取本地 refreshToken → 刷新 accessToken → 获取用户信息 */
async function autoLogin() {
  const storedToken = getRefreshToken();
  if (!storedToken) {
    autoLoginDone.value = true;
    return false;
  }
  refreshToken.value = storedToken;

  try {
    const { authApi } = await import('@/api/auth');
    const res = await authApi.refreshToken(storedToken);
    accessToken.value = res.accessToken;
    await fetchProfile();
    autoLoginDone.value = true;
    return true;
  } catch {
    clearAuth();
    autoLoginDone.value = true;
    return false;
  }
}

/** 登录 */
async function login(phone, password) {
  const { authApi } = await import('@/api/auth');
  const res = await authApi.login(phone, password);
  accessToken.value = res.accessToken;
  refreshToken.value = res.refreshToken;
  setRefreshToken(res.refreshToken);
  userInfo.value = res.user;
  return res;
}

/** 注册 */
async function register(phone, password, nickname) {
  const { authApi } = await import('@/api/auth');
  const res = await authApi.register(phone, password, nickname);
  accessToken.value = res.accessToken;
  refreshToken.value = res.refreshToken;
  setRefreshToken(res.refreshToken);
  userInfo.value = res.user;
  return res;
}

/** 退出登录 */
async function logout() {
  try {
    const { authApi } = await import('@/api/auth');
    await authApi.logout();
  } catch {
    // 即使服务端失败也清除本地状态
  }
  clearAuth();
}

/** 获取用户信息 */
async function fetchProfile() {
  const { userApi } = await import('@/api/user');
  const res = await userApi.getProfile();
  userInfo.value = res;
  return res;
}

/** 更新用户信息 */
async function updateProfile(data) {
  const { userApi } = await import('@/api/user');
  const res = await userApi.updateProfile(data);
  userInfo.value = { ...userInfo.value, ...res };
  return res;
}

/** 更新头像 */
function updateAvatar(url) {
  if (userInfo.value) {
    userInfo.value.avatar = url;
  }
}

/** 刷新 accessToken（带队列防并发） */
let refreshPromise = null;
async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const { authApi } = await import('@/api/auth');
      const res = await authApi.refreshToken(refreshToken.value);
      accessToken.value = res.accessToken;
      return res.accessToken;
    } catch {
      clearAuth();
      throw new Error('Token 刷新失败');
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

/** 清除认证状态 */
function clearAuth() {
  accessToken.value = null;
  refreshToken.value = null;
  userInfo.value = null;
  removeRefreshToken();
}

/** 设置 accessToken（供 request.js interceptor 使用） */
function setAccessToken(token) {
  accessToken.value = token;
}

/**
 * 兼容旧 useUserStore() 调用方式
 * 通过 getter 导出，模板和脚本中访问行为与 Pinia 一致（自动解包 ref）
 */
export function useUserStore() {
  return {
    get accessToken()    { return accessToken.value; },
    get refreshToken()   { return refreshToken.value; },
    get userInfo()       { return userInfo.value; },
    get autoLoginDone()  { return autoLoginDone.value; },
    get isLoggedIn()     { return isLoggedIn.value; },
    // 内部 ref 引用（供 request.js 直接操作 .value）
    _accessToken: accessToken,
    _refreshToken: refreshToken,
    _userInfo: userInfo,
    autoLogin,
    login,
    register,
    logout,
    fetchProfile,
    updateProfile,
    updateAvatar,
    refreshAccessToken,
    clearAuth,
    setAccessToken,
  };
}
