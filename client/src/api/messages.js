// 识趣派 — 消息 API

import { get, put } from './request'

export const messagesApi = {
  /**
   * 消息列表
   * @param {object} params { page?, pageSize?, type? }
   */
  getMessages(params = {}) {
    return get('/messages', params)
  },

  /**
   * 单条标记已读
   * @param {number} id 消息 ID
   */
  markRead(id) {
    return put(`/messages/${id}/read`)
  },

  /**
   * 全部标记已读
   */
  markAllRead() {
    return put('/messages/read-all')
  },

  /**
   * 未读消息数
   */
  getUnreadCount() {
    return get('/messages/unread-count')
  }
}
