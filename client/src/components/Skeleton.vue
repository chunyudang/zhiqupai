<script setup>
defineProps({
  type: {
    type: String,
    default: 'card',
    validator: (v) => ['card', 'list', 'text', 'avatar'].includes(v)
  },
  count: {
    type: Number,
    default: 1
  }
})
</script>

<template>
  <view class="skeleton" v-for="n in count" :key="n">
    <!-- 卡片骨架 -->
    <view v-if="type === 'card'" class="skeleton-card">
      <view class="shimmer" style="height: 200rpx; border-radius: 12rpx;" />
      <view class="shimmer" style="height: 36rpx; width: 60%; margin-top: 20rpx; border-radius: 8rpx;" />
      <view class="shimmer" style="height: 28rpx; width: 80%; margin-top: 12rpx; border-radius: 8rpx;" />
    </view>

    <!-- 列表骨架 -->
    <view v-else-if="type === 'list'" class="skeleton-list">
      <view class="shimmer" style="width: 80rpx; height: 80rpx; border-radius: 12rpx; flex-shrink: 0;" />
      <view style="flex: 1; margin-left: 20rpx;">
        <view class="shimmer" style="height: 32rpx; width: 50%; border-radius: 8rpx;" />
        <view class="shimmer" style="height: 28rpx; width: 70%; margin-top: 12rpx; border-radius: 8rpx;" />
      </view>
    </view>

    <!-- 文字骨架 -->
    <view v-else-if="type === 'text'" class="skeleton-text">
      <view class="shimmer" style="height: 28rpx; width: 100%; border-radius: 6rpx;" />
      <view class="shimmer" style="height: 28rpx; width: 85%; margin-top: 16rpx; border-radius: 6rpx;" />
      <view class="shimmer" style="height: 28rpx; width: 65%; margin-top: 16rpx; border-radius: 6rpx;" />
    </view>

    <!-- 头像骨架 -->
    <view v-else-if="type === 'avatar'" class="skeleton-avatar">
      <view class="shimmer" style="width: 120rpx; height: 120rpx; border-radius: 50%;" />
      <view class="shimmer" style="height: 32rpx; width: 120rpx; margin-top: 16rpx; border-radius: 8rpx;" />
    </view>
  </view>
</template>

<style scoped>
.skeleton {
  margin-bottom: 24rpx;
}

.skeleton-card {
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
}

.skeleton-list {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  background: #fff;
  border-radius: 12rpx;
}

.skeleton-text {
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
}

.skeleton-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx;
}

.shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
