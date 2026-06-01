<template>
  <view class="tab-bar">
    <view
      v-for="(tab, index) in tabs"
      :key="index"
      class="tab-item"
      :class="{ active: selected === index }"
      @click="switchTab(index)"
    >
      <view class="tab-icon">{{ tab.icon }}</view>
      <view class="tab-text">{{ tab.text }}</view>
      <!-- Unread badge for messages tab -->
      <view v-if="index === 3 && unreadTotal > 0" class="tab-badge">{{ unreadTotal > 99 ? '99+' : unreadTotal }}</view>
      <view v-if="tab.badge" class="tab-badge">{{ tab.badge > 99 ? '99+' : tab.badge }}</view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getUnreadCount } from '../api/messages.js'

const tabs = [
  { text: '首页', icon: '🏠', pagePath: '/pages/index/index', badge: 0 },
  { text: '竞猜', icon: '❓', pagePath: '/pages/placeholder/quiz', badge: 0, isPlaceholder: true },
  { text: '商城', icon: '🎁', pagePath: '/pages/placeholder/shop', badge: 0, isPlaceholder: true },
  { text: '消息', icon: '💬', pagePath: '/pages/messages/index', badge: 0 },
  { text: '我的', icon: '👤', pagePath: '/pages/profile/index', badge: 0 },
]

const selected = ref(0)
const unreadTotal = ref(0)

const switchTab = (index) => {
  const tab = tabs[index]
  if (tab.isPlaceholder) {
    uni.showToast({ title: '功能完善中……', icon: 'none', duration: 2000 })
    return
  }
  selected.value = index
  uni.switchTab({ url: tab.pagePath })
}

const loadUnreadCount = async () => {
  try {
    const data = await getUnreadCount()
    if (data) {
      unreadTotal.value = (data.total || 0) + (data.system || 0) + (data.my_comment || 0) + (data.my_like || 0)
    }
  } catch {
    // Silently ignore errors in tab-bar
  }
}

// Load unread count when component is shown
// Use a watcher on selected to refresh when switching to message tab
watch(selected, (val) => {
  if (val === 3) {
    // Messages tab was selected, refresh unread count
    loadUnreadCount()
  }
})

// Also load initially
loadUnreadCount()
</script>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 100rpx;
  background-color: #fff;
  border-top: 1rpx solid #eee;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 999;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  position: relative;
  padding: 8rpx 0;
}

.tab-icon {
  font-size: 40rpx;
  line-height: 1.2;
}

.tab-text {
  font-size: 20rpx;
  color: #999;
  margin-top: 2rpx;
}

.tab-item.active .tab-text {
  color: #FF6B35;
}

.tab-badge {
  position: absolute;
  top: 0;
  right: 30rpx;
  min-width: 32rpx;
  height: 32rpx;
  line-height: 32rpx;
  text-align: center;
  font-size: 20rpx;
  color: #fff;
  background-color: #FF4D4F;
  border-radius: 16rpx;
  padding: 0 8rpx;
}
</style>
