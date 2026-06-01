<template>
  <view v-if="visible" class="modal-overlay" @click="onCancel">
    <view class="modal" @click.stop>
      <view class="modal-header">
        <text class="modal-title">{{ title }}</text>
      </view>
      <view class="modal-body">
        <text class="modal-message">{{ message }}</text>
      </view>
      <view class="modal-footer">
        <view class="modal-btn cancel" @click="onCancel">{{ cancelText }}</view>
        <view class="modal-btn confirm" :class="{ danger: danger }" @click="onConfirm">{{ confirmText }}</view>
      </view>
    </view>
  </view>
</template>

<script setup>
const props = withDefaults(defineProps<{
  visible: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}>(), {
  title: '确认操作',
  message: '确定要执行此操作吗？',
  confirmText: '确定',
  cancelText: '取消',
  danger: false,
})

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const onConfirm = () => {
  emit('confirm')
}

const onCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal {
  width: 560rpx;
  background-color: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}

.modal-header {
  padding: 40rpx 40rpx 0;
  text-align: center;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.modal-body {
  padding: 32rpx 40rpx;
  text-align: center;
}

.modal-message {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.modal-footer {
  display: flex;
  border-top: 1rpx solid #eee;
}

.modal-btn {
  flex: 1;
  text-align: center;
  padding: 28rpx 0;
  font-size: 30rpx;
  cursor: pointer;
}

.modal-btn.cancel {
  color: #999;
  border-right: 1rpx solid #eee;
}

.modal-btn.confirm {
  color: #FF6B35;
  font-weight: 600;
}

.modal-btn.confirm.danger {
  color: #FF4D4F;
}
</style>
