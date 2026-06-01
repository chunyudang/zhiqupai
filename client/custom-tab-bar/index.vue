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
      <view v-if="tab.badge" class="tab-badge">{{ tab.badge > 99 ? '99+' : tab.badge }}</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const tabs = [
  { text: '首页', icon: '🏠', pagePath: '/pages/index/index', badge: 0 },
  { text: '竞猜', icon: '❓', pagePath: '/pages/placeholder/quiz', badge: 0, isPlaceholder: true },
  { text: '商城', icon: '🎁', pagePath: '/pages/placeholder/shop', badge: 0, isPlaceholder: true },
  { text: '消息', icon: '💬', pagePath: '/pages/messages/index', badge: 0 },
  { text: '我的', icon: '👤', pagePath: '/pages/profile/index', badge: 0 },
]

const selected = ref(0)

const switchTab = (index) => {
  const tab = tabs[index]
  if (tab.isPlaceholder) {
    uni.showToast({ title: '功能完善中……', icon: 'none', duration: 2000 })
    return
  }
  selected.value = index
  uni.switchTab({ url: tab.pagePath })
}
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
