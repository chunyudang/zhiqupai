// 识趣派 — 消息 Store（Pinia）

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMessagesStore = defineStore('messages', () => {
  // ---- State ----
  const unreadCount = ref({
    total: 0,
    system: 0,
    myComment: 0,
    myLike: 0
  })

  // ---- Actions ----

  /** 获取未读消息数 */
  async function fetchUnreadCount() {
    try {
      const { messagesApi } = await import('@/api/messages')
      const res = await messagesApi.getUnreadCount()
      unreadCount.value = res
    } catch {
      // 静默失败
    }
  }

  /** 本地减少未读计数 */
  function decrement(type) {
    if (unreadCount.value[type] > 0) {
      unreadCount.value[type]--
    }
    if (unreadCount.value.total > 0) {
      unreadCount.value.total--
    }
  }

  /** 重置全部未读数 */
  function resetAll() {
    unreadCount.value = { total: 0, system: 0, myComment: 0, myLike: 0 }
  }

  return {
    unreadCount,
    fetchUnreadCount,
    decrement,
    resetAll
  }
})
