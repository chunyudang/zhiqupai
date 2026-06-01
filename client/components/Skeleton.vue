<template>
  <view class="skeleton" :class="type">
    <template v-if="type === 'card'">
      <view class="skeleton-line skeleton-title"></view>
      <view class="skeleton-line skeleton-text"></view>
      <view class="skeleton-line skeleton-text short"></view>
    </template>
    <template v-else-if="type === 'list'">
      <view v-for="i in count" :key="i" class="skeleton-list-item">
        <view class="skeleton-avatar"></view>
        <view class="skeleton-list-content">
          <view class="skeleton-line skeleton-title"></view>
          <view class="skeleton-line skeleton-text short"></view>
        </view>
      </view>
    </template>
    <template v-else>
      <view class="skeleton-line skeleton-title"></view>
      <view class="skeleton-line skeleton-text"></view>
    </template>
  </view>
</template>

<script setup>
defineProps<{
  type?: 'card' | 'list' | 'text'
  count?: number
}>()
</script>

<style scoped>
.skeleton {
  padding: 24rpx;
}

.skeleton-line {
  height: 28rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8rpx;
  margin-bottom: 20rpx;
}

.skeleton-title {
  width: 60%;
  height: 36rpx;
}

.skeleton-text {
  width: 90%;
}

.skeleton-text.short {
  width: 70%;
}

.skeleton-list-item {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.skeleton-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.skeleton-list-content {
  flex: 1;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
