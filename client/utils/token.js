// Token 管理模块
// 原则：accessToken 仅存内存，refreshToken 存 localStorage（uni.setStorageSync）

import { setAccessToken, clearAuth, handleRefreshToken } from '../api/request.js'

/**
 * 存储 refreshToken 到本地
 */
const setRefreshToken = (token: string) => {
  uni.setStorageSync('refreshToken', token)
}

/**
 * 获取本地 refreshToken
 */
const getRefreshToken = (): string | null => {
  return uni.getStorageSync('refreshToken') || null
}

/**
 * 清除所有 token
 */
const clearAllTokens = () => {
  clearAuth()
}

/**
 * 自动登录：检查 refreshToken 并尝试刷新
 * @returns 是否自动登录成功
 */
const autoLogin = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  try {
    const newToken = await handleRefreshToken()
    return !!newToken
  } catch {
    clearAllTokens()
    return false
  }
}

export {
  setRefreshToken,
  getRefreshToken,
  clearAllTokens,
  autoLogin,
}
