// 识趣派 — Token 存储管理
// accessToken 存内存（userStore ref），refreshToken 通过 uni.setStorageSync 持久化本地

const REFRESH_TOKEN_KEY = 'refreshToken'

/**
 * 获取持久化的 refreshToken
 * @returns {string|null}
 */
export function getRefreshToken() {
  return uni.getStorageSync(REFRESH_TOKEN_KEY) || null
}

/**
 * 保存 refreshToken 到本地
 * @param {string} token
 */
export function setRefreshToken(token) {
  uni.setStorageSync(REFRESH_TOKEN_KEY, token)
}

/**
 * 清除本地 refreshToken
 */
export function removeRefreshToken() {
  uni.removeStorageSync(REFRESH_TOKEN_KEY)
}
