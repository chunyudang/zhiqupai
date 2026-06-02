<script setup>
// Toast 组件：通过 ref.show() 调用，不用 teleport（小程序兼容）
import { ref } from 'vue'

const visible = ref(false)
const message = ref('')
const type = ref('info')
const duration = ref(2000)

let timer = null

function show(msg, opts = {}) {
  if (timer) clearTimeout(timer)

  message.value = msg
  type.value = opts.type || 'info'
  duration.value = opts.duration || 2000
  visible.value = true

  timer = setTimeout(() => {
    visible.value = false
  }, duration.value)
}

defineExpose({ show })

const iconMap = {
  success: '✓',
  error: '✕',
  warning: '!',
  info: 'ℹ'
}

const toastClass = {
  success: 'toast-success',
  error: 'toast-error',
  warning: 'toast-warning',
  info: 'toast-info'
}
</script>

<template>
  <view v-if="visible" class="toast-overlay">
    <view class="toast-box" :class="toastClass[type]">
      <text class="toast-icon">{{ iconMap[type] }}</text>
      <text class="toast-message">{{ message }}</text>
    </view>
  </view>
</template>

<style scoped>
.toast-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  pointer-events: none;
}

.toast-box {
  display: flex;
  align-items: center;
  padding: 20rpx 32rpx;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12rpx;
  max-width: 500rpx;
}

.toast-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
  font-weight: bold;
}

.toast-message {
  font-size: 28rpx;
  color: #fff;
  word-break: break-all;
}

.toast-success .toast-icon { color: #4CAF50; }
.toast-error .toast-icon { color: #F44336; }
.toast-warning .toast-icon { color: #FF9800; }
.toast-info .toast-icon { color: #fff; }
</style>
