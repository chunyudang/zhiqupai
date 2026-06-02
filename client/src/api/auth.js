// 识趣派 — 认证 API

import { post } from './request'

export const authApi = {
  /**
   * 用户注册
   * @param {string} phone 手机号
   * @param {string} password 密码
   * @param {string} nickname 昵称（可选）
   */
  register(phone, password, nickname) {
    return post('/auth/register', { phone, password, nickname }, { skipAuth: true })
  },

  /**
   * 用户登录
   * @param {string} phone 手机号
   * @param {string} password 密码
   */
  login(phone, password) {
    return post('/auth/login', { phone, password }, { skipAuth: true })
  },

  /**
   * 刷新 accessToken
   * @param {string} refreshToken 刷新令牌
   */
  refreshToken(refreshToken) {
    return post('/auth/refresh', { refreshToken }, { skipAuth: true, silent: true })
  },

  /**
   * 退出登录
   */
  logout() {
    return post('/auth/logout')
  }
}
