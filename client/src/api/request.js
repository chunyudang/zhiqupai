// 识趣派 — HTTP 请求封装
// 四端统一：H5 开发走 Vite proxy，其他端直连

import { useUserStore } from '@/stores/user'

// 惰性获取 userStore，避免循环依赖（request → stores/user → api/auth → request）
function getUserStore() {
  return useUserStore()
}

// #ifdef H5
const BASE_URL = 'http://localhost:3000/api/v1';
// #endif
// #ifndef H5
const BASE_URL = 'http://192.168.50.143:3000/api/v1';
// #endif

// 服务端地址（用于拼接静态资源 URL，如头像）
// #ifdef H5
const SERVER_BASE = 'http://localhost:3000'
// #endif
// #ifndef H5
const SERVER_BASE = 'http://192.168.50.143:3000'
// #endif

// 上传文件的 base URL（不含 /api/v1 前缀，因 uni.uploadFile 需要完整 URL）
// #ifdef H5
const UPLOAD_BASE = 'http://localhost:3000';
// #endif
// #ifndef H5
const UPLOAD_BASE = 'http://192.168.50.143:3000';
// #endif

const AUTH_ERROR_CODES = [10001, 10002, 10003, 10005, 10006, 10007, 10008];
let isRefreshing = false;
let refreshQueue = [];

/**
 * 执行请求
 * @param {object} options 请求参数
 * @returns {Promise}
 */
function request(options = {}) {
  const { url, method = 'GET', data = {}, header = {}, showLoading = false, skipAuth = false } = options;

  if (showLoading) {
    uni.showLoading({ title: '加载中...', mask: true });
  }

  return new Promise((resolve, reject) => {
    const doRequest = (retryToken = null) => {
      const headers = { 'Content-Type': 'application/json', ...header };

      if (!skipAuth) {
        // 从 userStore 获取 accessToken（getter 自动解包）
        const userStore = getUserStore();
        const token = retryToken || userStore?.accessToken;
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      uni.request({
        url: `${BASE_URL}${url}`,
        method,
        data,
        header: headers,
        success: (res) => {
          const body = res.data;

          // 服务端统一返回 HTTP 200，错误码在 body.code
          if (body && body.code === 0) {
            resolve(body.data);
            return;
          }

          // Token 过期，尝试刷新
          if (body && AUTH_ERROR_CODES.includes(body.code) && !skipAuth) {
            handleTokenRefresh(body, resolve, reject, () => doRequest());
            return;
          }

          // 其他业务错误
          const error = new Error(body?.message || '请求失败');
          error.code = body?.code || -1;
          reject(error);

          if (!options.silent) {
            uni.showToast({ title: error.message, icon: 'none', duration: 2000 });
          }
        },
        fail: (err) => {
          const error = new Error('网络请求失败，请检查网络');
          error.original = err;
          reject(error);

          if (!options.silent) {
            uni.showToast({ title: error.message, icon: 'none', duration: 2000 });
          }
        },
        complete: () => {
          if (showLoading) {
            uni.hideLoading();
          }
        },
      });
    };

    doRequest();
  });
}

/**
 * 处理 Token 刷新
 */
function handleTokenRefresh(body, resolve, reject, retryRequest) {
  if (isRefreshing) {
    // 正在刷新，加入队列等待
    refreshQueue.push({ resolve, reject, retryRequest });
    return;
  }

  isRefreshing = true;

  const userStore = getUserStore();
  if (!userStore?.refreshToken) {
    isRefreshing = false;
    userStore?.clearAuth();
    navigateToLogin();
    const error = new Error(body?.message || '登录已过期，请重新登录');
    error.code = 10003;
    reject(error);
    return;
  }

  // 刷新 accessToken
  uni.request({
    url: `${BASE_URL}/auth/refresh`,
    method: 'POST',
    data: { refreshToken: userStore.refreshToken },
    success: (refreshRes) => {
      const refreshBody = refreshRes.data;

      if (refreshBody && refreshBody.code === 0) {
        const newToken = refreshBody.data.accessToken;
        userStore.setAccessToken(newToken);

        // 重试当前请求
        retryRequest();

        // 处理队列中的其他请求
        refreshQueue.forEach(({ retryRequest }) => retryRequest());
      } else {
        // refresh 也失败了，清除登录态
        userStore?.clearAuth();
        navigateToLogin();
        const error = new Error(refreshBody?.message || '登录已过期，请重新登录');
        reject(error);
        refreshQueue.forEach(({ reject }) => reject(error));
      }
    },
    fail: () => {
      userStore?.clearAuth();
      navigateToLogin();
      const error = new Error('网络异常，请重新登录');
      reject(error);
      refreshQueue.forEach(({ reject }) => reject(error));
    },
    complete: () => {
      isRefreshing = false;
      refreshQueue = [];
    },
  });
}

/**
 * 导航到登录页
 */
function navigateToLogin() {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  if (currentPage && currentPage.route !== 'pages/login/login') {
    uni.reLaunch({ url: '/pages/login/login' });
  }
}

/**
 * 上传文件（头像等）
 * @param {string} filePath 文件路径
 * @param {string} url 上传地址（相对于 UPLOAD_BASE）
 * @returns {Promise}
 */
function uploadFile(filePath, url = '/api/v1/users/upload/avatar') {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${UPLOAD_BASE}${url}`,
      filePath,
      name: 'file',
      header: {
        Authorization: `Bearer ${getUserStore()?.accessToken || ''}`,
      },
      success: (res) => {
        try {
          const body = JSON.parse(res.data);
          if (body && body.code === 0) {
            resolve(body.data);
          } else {
            const error = new Error(body?.message || '上传失败');
            error.code = body?.code || -1;
            reject(error);
            uni.showToast({ title: error.message, icon: 'none', duration: 2000 });
          }
        } catch {
          reject(new Error('上传响应异常'));
        }
      },
      fail: () => {
        reject(new Error('上传失败，请检查网络'));
      },
    });
  });
}

// 便捷方法
function get(url, params = {}, opts = {}) {
  let queryStr = '';
  if (params && Object.keys(params).length > 0) {
    const parts = [];
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    });
    if (parts.length > 0) {
      queryStr = '?' + parts.join('&');
    }
  }
  return request({ ...opts, url: url + queryStr, method: 'GET' });
}

function post(url, data = {}, opts = {}) {
  return request({ ...opts, url, method: 'POST', data });
}

function put(url, data = {}, opts = {}) {
  return request({ ...opts, url, method: 'PUT', data });
}

function del(url, data = {}, opts = {}) {
  return request({ ...opts, url, method: 'DELETE', data });
}

export { BASE_URL, UPLOAD_BASE, SERVER_BASE, request, uploadFile, get, post, put, del };
