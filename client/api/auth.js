// 认证模块 API
import { post, setAccessToken } from './request.js'

/**
 * 用户注册
 */
export const register = (phone: string, password: string, nickname?: string) => {
  return post('/auth/register', { phone, password, nickname }, false, true)
}

/**
 * 用户登录
 * 成功后存储 token
 */
export const login = async (phone: string, password: string) => {
  const data = await post<{
    accessToken: string
    refreshToken: string
    expiresIn: number
    user: {
      id: number
      phone: string
      nickname: string
      avatar: string | null
      pointsBalance: number
    }
  }>('/auth/login', { phone, password }, false, true)

  // 存储 token
  setAccessToken(data.accessToken)
  uni.setStorageSync('refreshToken', data.refreshToken)

  return data
}

/**
 * 刷新 Token
 */
export const refreshToken = (refreshToken: string) => {
  return post<{ accessToken: string }>('/auth/refresh', { refreshToken }, false)
}

/**
 * 退出登录
 */
export const logout = () => {
  return post('/auth/logout')
}
