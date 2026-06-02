<script setup>
// NavBar — 自定义导航栏（全端统一，适配状态栏和安全区）
// #ifdef APP-PLUS
import { onBackPress } from '@dcloudio/uni-app'
// #endif

defineProps({
  title: {
    type: String,
    default: ''
  },
  showBack: {
    type: Boolean,
    default: true
  },
  bgColor: {
    type: String,
    default: '#FFFFFF'
  }
})

const systemInfo = uni.getSystemInfoSync()
const statusBarHeight = systemInfo.statusBarHeight || 0
const navBarHeight = 44 // px，标准导航栏高度

function goBack() {
  uni.navigateBack({ delta: 1 })
}

// #ifdef APP-PLUS
onBackPress(() => {
  goBack()
  return true
})
// #endif
</script>

<template>
  <view class="navbar" :style="{ backgroundColor: bgColor }">
    <!-- 状态栏占位 -->
    <view :style="{ height: statusBarHeight + 'px' }" />
    <!-- 导航栏主体 -->
    <view class="navbar-content" :style="{ height: navBarHeight + 'px' }">
      <view class="navbar-left">
        <view v-if="showBack" class="back-btn" @click="goBack">
          <text class="back-icon">←</text>
        </view>
        <slot name="left" />
      </view>
      <view class="navbar-title">
        <text class="title-text">{{ title }}</text>
        <slot name="title" />
      </view>
      <view class="navbar-right">
        <slot name="right" />
      </view>
    </view>
  </view>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
}

.navbar-left,
.navbar-right {
  width: 100rpx;
  display: flex;
  align-items: center;
}

.navbar-right {
  justify-content: flex-end;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 36rpx;
  color: #333;
  font-weight: bold;
}

.navbar-title {
  flex: 1;
  text-align: center;
}

.title-text {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}
</style>
