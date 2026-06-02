<script setup>
defineProps({
  icon: {
    type: String,
    default: '📭'
  },
  message: {
    type: String,
    default: '暂无数据'
  },
  actionText: {
    type: String,
    default: ''
  },
  showAction: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['action'])
</script>

<template>
  <view class="empty-state">
    <text class="empty-icon">{{ icon }}</text>
    <text class="empty-message">{{ message }}</text>
    <button v-if="showAction || actionText" class="empty-action" @click="emit('action')">
      {{ actionText }}
    </button>
  </view>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-message {
  font-size: 28rpx;
  color: #999;
  text-align: center;
}

.empty-action {
  margin-top: 32rpx;
  padding: 12rpx 48rpx;
  font-size: 28rpx;
  color: #FF6B35;
  background: rgba(255, 107, 53, 0.1);
  border: none;
  border-radius: 40rpx;
}
</style>
