// 消息模块 API
import { get, put } from './request.js'

/**
 * 消息列表
 */
export const getMessages = (params) => {
  return get('/messages', params)
}

/**
 * 标记单条已读
 */
export const markRead = (id) => {
  return put(`/messages/${id}/read`)
}

/**
 * 全部已读
 */
export const markAllRead = () => {
  return put('/messages/read-all')
}

/**
 * 未读消息数
 */
export const getUnreadCount = () => {
  return get('/messages/unread-count')
}
