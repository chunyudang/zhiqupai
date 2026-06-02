// 识趣派 — 用户 API

import { get, put, del, uploadFile } from './request'

export const userApi = {
  /**
   * 获取个人信息
   */
  getProfile() {
    return get('/users/profile')
  },

  /**
   * 修改个人信息
   * @param {object} data { nickname? }
   */
  updateProfile(data) {
    return put('/users/profile', data)
  },

  /**
   * 上传头像
   * @param {string} filePath 本地文件路径
   * @returns {Promise<{ url: string }>}
   */
  uploadAvatar(filePath) {
    return uploadFile(filePath, '/api/v1/users/upload/avatar')
  },

  /**
   * 注销账号
   * @param {string} confirmPassword 确认密码
   */
  deleteAccount(confirmPassword) {
    return del('/users/account', { confirmPassword })
  }
}
