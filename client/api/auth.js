// 认证模块 API
import { post, setAccessToken } from './request.js'

/**
 * 用户注册
 */
export const register = (phone, password, nickname) => {
  return post('/auth/register', { phone, password, nickname }, false, true)
}

/**
 * 用户登录
 * 成功后存储 token
 */
export const login = async (phone, password) => {
  const data = await post('/auth/login', { phone, password }, false, true)

  // 存储 token
  setAccessToken(data.accessToken)
  uni.setStorageSync('refreshToken', data.refreshToken)

  return data
}

/**
 * 刷新 Token
 */
export const refreshToken = (refreshToken) => {
  return post('/auth/refresh', { refreshToken }, false)
}

/**
 * 退出登录
 */
export const logout = () => {
  return post('/auth/logout')
}
