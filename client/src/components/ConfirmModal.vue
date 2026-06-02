<script setup>
// ConfirmModal：确认弹窗，不用 teleport（小程序兼容）
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '提示'
  },
  message: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  danger: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <view v-if="show" class="modal-overlay" @click="emit('cancel')">
    <view class="modal-box" @click.stop>
      <text class="modal-title">{{ title }}</text>
      <text v-if="message" class="modal-message">{{ message }}</text>
      <view class="modal-actions">
        <button class="modal-btn cancel-btn" @click="emit('cancel')">
          {{ cancelText }}
        </button>
        <button
          class="modal-btn confirm-btn"
          :class="{ 'danger-btn': danger }"
          @click="emit('confirm')"
        >
          {{ confirmText }}
        </button>
      </view>
    </view>
  </view>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-box {
  width: 560rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx 32rpx 32rpx;
}

.modal-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
  display: block;
  text-align: center;
}

.modal-message {
  font-size: 28rpx;
  color: #666;
  display: block;
  text-align: center;
  margin-top: 16rpx;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 36rpx;
}

.modal-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  font-size: 30rpx;
  border: none;
  border-radius: 12rpx;
  padding: 0;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background: #FF6B35;
  color: #fff;
}

.danger-btn {
  background: #F44336;
}
</style>
