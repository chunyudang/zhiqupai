<template>
  <view class="messages-page">
    <!-- Not logged in -->
    <view v-if="!isLoggedIn" class="center-state">
      <text class="empty-icon">💬</text>
      <text class="empty-text">请先登录</text>
      <button class="login-btn" @click="goLogin">去登录</button>
    </view>

    <!-- Message tabs -->
    <template v-else>
      <view class="tab-bar">
        <view
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-item"
          :class="{ active: currentTab === tab.key }"
          @click="switchTab(tab.key)"
        >
          <text>{{ tab.label }}</text>
        </view>
      </view>

      <!-- Loading -->
      <view v-if="loading" class="loading-state">
        <view v-for="i in 3" :key="i" class="msg-skeleton">
          <Skeleton type="card" />
        </view>
      </view>

      <!-- Empty -->
      <view v-else-if="messages.length === 0" class="center-state">
        <EmptyState :icon="'📭'" message="暂无消息" />
      </view>

      <!-- Message list -->
      <view v-else class="msg-list">
        <view
          v-for="msg in messages"
          :key="msg.id"
          class="msg-item"
          :class="{ unread: !msg.isRead }"
          @click="handleMsgClick(msg)"
        >
          <view class="msg-left">
            <view class="msg-dot" v-if="!msg.isRead"></view>
          </view>
          <view class="msg-content">
            <text class="msg-title">{{ msg.title }}</text>
            <text class="msg-body">{{ msg.content }}</text>
          </view>
          <text class="msg-time">{{ formatTime(msg.createdAt) }}</text>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getMessages, markRead } from '../../api/messages.js'
import Skeleton from '../../components/Skeleton.vue'
import EmptyState from '../../components/EmptyState.vue'

const tabs = [
  { key: 'system', label: '系统消息' },
  { key: 'my_comment', label: '我的评论' },
  { key: 'my_like', label: '我赞过' },
]

const isLoggedIn = ref(false)
const currentTab = ref('system')
const messages = ref([])
const loading = ref(false)

const switchTab = (key) => {
  currentTab.value = key
  loadMessages()
}

const loadMessages = async () => {
  loading.value = true
  try {
    const data = await getMessages({ type: currentTab.value, page: 1, pageSize: 20 })
    messages.value = data.list || []
  } catch (err) {
    console.error('[Messages] loadMessages error:', err)
    messages.value = []
  } finally {
    loading.value = false
  }
}

const handleMsgClick = async (msg) => {
  if (!msg.isRead) {
    try {
      await markRead(msg.id)
      msg.isRead = true
    } catch (err) {
      console.error('[Messages] markRead error:', err)
    }
  }
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  try {
    const d = new Date(timeStr)
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
    return `${d.getMonth() + 1}/${d.getDate()}`
  } catch {
    return ''
  }
}

const goLogin = () => {
  uni.navigateTo({ url: '/pages/login/login' })
}

onShow(() => {
  isLoggedIn.value = !!uni.getStorageSync('isLoggedIn')
  if (isLoggedIn.value) {
    loadMessages()
  }
})
</script>

<style scoped>
.messages-page {
  min-height: 100vh;
  background: #F5F5F5;
}

.center-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.login-btn {
  width: 240rpx;
  height: 80rpx;
  line-height: 80rpx;
  background: #FF6B35;
  color: #FFFFFF;
  font-size: 30rpx;
  font-weight: bold;
  border-radius: 40rpx;
  border: none;
}

.login-btn::after {
  border: none;
}

/* Tabs */
.tab-bar {
  display: flex;
  background: #FFFFFF;
  padding: 0 24rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 28rpx;
  color: #999;
  position: relative;
}

.tab-item.active {
  color: #FF6B35;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 4rpx;
  background: #FF6B35;
  border-radius: 2rpx;
}

/* Loading */
.loading-state {
  padding: 24rpx;
}

.msg-skeleton {
  background: #FFFFFF;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

/* Message list */
.msg-list {
  padding: 16rpx 24rpx;
}

.msg-item {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border-radius: 12rpx;
  padding: 24rpx 20rpx;
  margin-bottom: 12rpx;
}

.msg-item:active {
  background: #FAFAFA;
}

.msg-left {
  margin-right: 16rpx;
}

.msg-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #FF4D4F;
}

.msg-content {
  flex: 1;
  overflow: hidden;
}

.msg-title {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 6rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.msg-body {
  display: block;
  font-size: 24rpx;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.msg-time {
  font-size: 22rpx;
  color: #CCC;
  flex-shrink: 0;
  margin-left: 16rpx;
}
</style>
