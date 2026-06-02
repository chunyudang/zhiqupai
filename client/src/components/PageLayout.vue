<script setup>
// PageLayout — 统一页面容器（安全区 + 状态机）
defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: '加载失败'
  },
  empty: {
    type: Boolean,
    default: false
  },
  emptyMessage: {
    type: String,
    default: '暂无数据'
  },
  emptyIcon: {
    type: String,
    default: '📭'
  },
  showFooter: {
    type: Boolean,
    default: false
  },
  padding: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['retry'])
</script>

<template>
  <view class="page-layout" :class="{ 'page-padding': padding, 'has-footer': showFooter }">
    <slot name="header" />

    <!-- 加载中 -->
    <view v-if="loading" class="page-loading">
      <slot name="loading">
        <view class="loading-spinner" />
        <text class="loading-text">加载中...</text>
      </slot>
    </view>

    <!-- 加载失败 -->
    <view v-else-if="error" class="page-error">
      <text class="error-icon">😕</text>
      <text class="error-message">{{ errorMessage }}</text>
      <button class="retry-btn" @click="emit('retry')">重试</button>
    </view>

    <!-- 空数据 -->
    <view v-else-if="empty" class="page-empty">
      <text class="empty-icon">{{ emptyIcon }}</text>
      <text class="empty-message">{{ emptyMessage }}</text>
      <slot name="empty-action" />
    </view>

    <!-- 正常内容 -->
    <slot v-else />
  </view>
</template>

<style scoped>
.page-layout {
  min-height: 100vh;
  background-color: #F5F5F5;
}

.page-padding {
  padding: 24rpx;
}

.has-footer {
  padding-bottom: calc(100rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
}

.page-loading,
.page-error,
.page-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #f0f0f0;
  border-top-color: #FF6B35;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 20rpx;
  font-size: 26rpx;
  color: #999;
}

.error-icon,
.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.error-message,
.empty-message {
  font-size: 28rpx;
  color: #999;
}

.retry-btn {
  margin-top: 32rpx;
  padding: 12rpx 48rpx;
  font-size: 28rpx;
  color: #FF6B35;
  background: rgba(255, 107, 53, 0.1);
  border: none;
  border-radius: 40rpx;
}
</style>
