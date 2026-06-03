<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { useMessagesStore } from '@/stores/messages'
import { messagesApi } from '@/api/messages'
import { MESSAGE_TYPE_LABELS } from '@/utils/constants'
import { formatRelative } from '@/utils/time'
import { PAGE_SIZE } from '@/utils/constants'
import NavBar from '@/components/NavBar.vue'
import Skeleton from '@/components/Skeleton.vue'
import EmptyState from '@/components/EmptyState.vue'

const userStore = useUserStore()
const messagesStore = useMessagesStore()

const loading = ref(true)
const loadError = ref(false)
const messages = ref([])
const activeTab = ref('all') // 'all' | 'system' | 'my_comment' | 'my_like'
const page = ref(1)
const hasMore = ref(true)
const loadingMore = ref(false)

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'system', label: '系统' },
  { key: 'my_comment', label: '评论' },
  { key: 'my_like', label: '赞过' }
]

onShow(() => {
  if (userStore.isLoggedIn) {
    fetchMessages(true)
  }
})

async function fetchMessages(reset = false) {
  if (reset) {
    page.value = 1
    messages.value = []
    loading.value = true
    loadError.value = false
  }

  const params = { page: page.value, pageSize: PAGE_SIZE }
  if (activeTab.value !== 'all') {
    params.type = activeTab.value
  }

  try {
    const data = await messagesApi.getMessages(params)
    if (reset) {
      messages.value = data.list
    } else {
      messages.value = [...messages.value, ...data.list]
    }
    hasMore.value = data.pagination.page < data.pagination.totalPages
  } catch {
    if (reset) loadError.value = true
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

async function markAsRead(msg) {
  if (msg.isRead) return
  try {
    await messagesApi.markRead(msg.id)
    msg.isRead = true
    messagesStore.decrement(msg.type)
  } catch {
    // 静默
  }
}

async function markAllRead() {
  try {
    await messagesApi.markAllRead()
    messages.value.forEach((m) => { m.isRead = true })
    messagesStore.resetAll()
  } catch {
    // 静默
  }
}

function switchTab(key) {
  activeTab.value = key
  fetchMessages(true)
}

function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  page.value++
  fetchMessages(false)
}

function getTypeLabel(type) {
  return MESSAGE_TYPE_LABELS[type] || type
}

function goToLogin() {
  uni.navigateTo({ url: '/pages/login/login' })
}
</script>

<template>
  <view class="messages-page">
    <NavBar title="消息" :showBack="false">
      <template #right>
        <text
          v-if="userStore.isLoggedIn && messages.length > 0"
          class="read-all-btn"
          @click="markAllRead"
        >全部已读</text>
      </template>
    </NavBar>

    <!-- 未登录 -->
    <view v-if="!userStore.isLoggedIn && !loading" class="guest-area">
      <text class="guest-text">登录后查看消息</text>
      <button class="guest-btn" @click="goToLogin">立即登录</button>
    </view>

    <!-- 已登录 -->
    <template v-if="userStore.isLoggedIn">
      <!-- Tab 切换 -->
      <view class="msg-tabs">
        <view
          v-for="tab in tabs"
          :key="tab.key"
          class="msg-tab"
          :class="{ active: activeTab === tab.key }"
          @click="switchTab(tab.key)"
        >
          {{ tab.label }}
        </view>
      </view>

      <Skeleton v-if="loading" type="list" :count="5" />

      <EmptyState
        v-else-if="loadError"
        message="加载失败"
        :showAction="true"
        actionText="重试"
        @action="fetchMessages(true)"
      />

      <EmptyState v-else-if="messages.length === 0" message="暂无消息" icon="📭" />

      <view v-else class="msg-list">
        <view
          v-for="msg in messages"
          :key="msg.id"
          class="msg-item"
          :class="{ unread: !msg.isRead }"
          @click="markAsRead(msg)"
        >
          <view class="msg-dot" v-if="!msg.isRead" />
          <view class="msg-content">
            <view class="msg-header">
              <text class="msg-type">{{ getTypeLabel(msg.type) }}</text>
              <text class="msg-time">{{ formatRelative(msg.createdAt) }}</text>
            </view>
            <text class="msg-title">{{ msg.title }}</text>
            <text class="msg-summary">{{ msg.summary || msg.content || '' }}</text>
          </view>
        </view>

        <view v-if="loadingMore" class="load-tip">加载中...</view>
        <view v-else-if="!hasMore && messages.length > 0" class="load-tip">— 没有更多了 —</view>
      </view>
    </template>

  </view>
</template>

<style scoped>
.messages-page {
  min-height: 100vh;
  background: #F5F5F5;
}

.read-all-btn {
  font-size: 26rpx;
  color: #FF6B35;
}

.guest-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 40rpx;
}

.guest-text {
  font-size: 28rpx;
  color: #999;
}

.guest-btn {
  margin-top: 32rpx;
  padding: 12rpx 48rpx;
  font-size: 28rpx;
  color: #FF6B35;
  background: rgba(255, 107, 53, 0.1);
  border: none;
  border-radius: 40rpx;
}

.msg-tabs {
  display: flex;
  background: #fff;
  padding: 0 24rpx;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 50;
}

.msg-tab {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
}

.msg-tab.active {
  color: #FF6B35;
  font-weight: 600;
}

.msg-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background: #FF6B35;
  border-radius: 2rpx;
}

.msg-list {
  padding: 0 24rpx 120rpx;
}

.msg-item {
  display: flex;
  align-items: flex-start;
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
  margin-top: 12rpx;
}

.msg-item.unread {
  background: #FFF8F5;
}

.msg-dot {
  width: 12rpx;
  height: 12rpx;
  background: #F44336;
  border-radius: 50%;
  margin-top: 8rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.msg-content {
  flex: 1;
}

.msg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.msg-type {
  font-size: 22rpx;
  color: #FF6B35;
  background: rgba(255, 107, 53, 0.1);
  padding: 2rpx 12rpx;
  border-radius: 8rpx;
}

.msg-time {
  font-size: 22rpx;
  color: #ccc;
}

.msg-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  margin-top: 8rpx;
  display: block;
}

.msg-summary {
  font-size: 26rpx;
  color: #999;
  margin-top: 6rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.load-tip {
  text-align: center;
  padding: 24rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
