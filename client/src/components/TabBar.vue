<script setup>
// TabBar — 自定义底部导航栏（全端统一，适配底部安全区）
import { useMessagesStore } from '@/stores/messages'
import { safeAreaBottom } from '@/utils/platform'

const props = defineProps({
  currentIndex: {
    type: Number,
    default: 0
  }
})

const messagesStore = useMessagesStore()

const tabs = [
  { path: '/pages/index/index', text: '首页', icon: '🏠', activeIcon: '🏠' },
  { path: '/pages/placeholder/quiz', text: '竞猜', icon: '🎯', activeIcon: '🎯' },
  { path: '/pages/placeholder/shop', text: '商城', icon: '🛍️', activeIcon: '🛍️' },
  { path: '/pages/messages/index', text: '消息', icon: '💬', activeIcon: '💬' },
  { path: '/pages/profile/index', text: '我的', icon: '👤', activeIcon: '👤' }
]

function switchTab(tab, index) {
  // 竞猜和商城是预留 Tab
  if (index === 1 || index === 2) {
    uni.showToast({ title: '功能完善中……', icon: 'none', duration: 1500 })
    return
  }
  if (index === props.currentIndex) return
  uni.switchTab({ url: tab.path })
}
</script>

<template>
  <view class="tabbar" :style="{ paddingBottom: safeAreaBottom + 'px' }">
    <view
      v-for="(tab, index) in tabs"
      :key="tab.path"
      class="tab-item"
      :class="{ active: currentIndex === index }"
      @click="switchTab(tab, index)"
    >
      <view class="tab-icon-wrapper">
        <text class="tab-icon">{{ tab.icon }}</text>
        <view
          v-if="index === 3 && messagesStore.unreadCount.total > 0"
          class="tab-badge"
        >
          <text class="badge-text">{{ messagesStore.unreadCount.total > 99 ? '99+' : messagesStore.unreadCount.total }}</text>
        </view>
      </view>
      <text class="tab-text">{{ tab.text }}</text>
    </view>
  </view>
</template>

<style scoped>
.tabbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-around;
  background: #fff;
  border-top: 1px solid #eee;
  padding-top: 10rpx;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8rpx 0;
  min-width: 100rpx;
}

.tab-icon-wrapper {
  position: relative;
}

.tab-icon {
  font-size: 40rpx;
}

.tab-text {
  font-size: 20rpx;
  color: #999;
  margin-top: 4rpx;
}

.tab-item.active .tab-text {
  color: #FF6B35;
  font-weight: 500;
}

.tab-badge {
  position: absolute;
  top: -8rpx;
  right: -16rpx;
  min-width: 32rpx;
  height: 32rpx;
  background: #F44336;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6rpx;
}

.badge-text {
  font-size: 18rpx;
  color: #fff;
  line-height: 1;
}
</style>
