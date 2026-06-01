<template>
  <view class="empty-state">
    <view class="empty-icon">{{ icon }}</view>
    <text class="empty-text">{{ message }}</text>
    <text v-if="actionText" class="empty-action" @click="onAction">{{ actionText }}</text>
  </view>
</template>

<script setup>
defineProps({
  icon: { type: String, default: '📭' },
  message: { type: String, required: true },
  actionText: { type: String, default: '' },
})

const emit = defineEmits(['action'])

const onAction = () => {
  emit('action')
}
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 24rpx;
  opacity: 0.4;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  text-align: center;
}

.empty-action {
  margin-top: 24rpx;
  font-size: 28rpx;
  color: #FF6B35;
  padding: 12rpx 40rpx;
  border: 1rpx solid #FF6B35;
  border-radius: 40rpx;
}
</style>
