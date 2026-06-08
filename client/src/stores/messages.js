// 识趣派 — 消息 Store（纯 ES6 单例，替代 Pinia）

import { ref } from 'vue'

// ---- 内部响应式状态 ----
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

/**
 * 兼容旧 useMessagesStore() 调用方式
 * 通过 getter 导出，访问行为与 Pinia 一致
 */
export function useMessagesStore() {
  return {
    get unreadCount() { return unreadCount.value },
    fetchUnreadCount,
    decrement,
    resetAll
  }
}
