<template>
  <teleport to="body">
    <view v-if="visible" class="toast-overlay" @click="hide">
      <view class="toast" :class="type">
        <text v-if="type === 'success'" class="toast-icon">✓</text>
        <text v-if="type === 'error'" class="toast-icon">✕</text>
        <text class="toast-msg">{{ message }}</text>
      </view>
    </view>
  </teleport>
</template>

<script setup>
import { ref } from 'vue'

type ToastType = 'success' | 'error' | 'warning' | 'info'

const visible = ref(false)
const message = ref('')
const type = ref<ToastType>('info')
let timer: number | null = null

const show = (msg: string, t: ToastType = 'info', duration: number = 2000) => {
  message.value = msg
  type.value = t
  visible.value = true
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    visible.value = false
  }, duration) as unknown as number
}

const hide = () => {
  visible.value = false
  if (timer) clearTimeout(timer)
}

defineExpose({ show, hide })
</script>

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
  z-index: 9999;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  padding: 20rpx 40rpx;
  border-radius: 16rpx;
  background-color: rgba(0, 0, 0, 0.75);
  pointer-events: auto;
}

.toast-icon {
  margin-right: 12rpx;
  font-size: 28rpx;
  font-weight: bold;
}

.toast.success .toast-icon { color: #52c41a; }
.toast.error .toast-icon { color: #ff4d4f; }
.toast.warning .toast-icon { color: #faad14; }
.toast.info .toast-icon { color: #1890ff; }

.toast-msg {
  font-size: 28rpx;
  color: #fff;
  max-width: 500rpx;
  word-break: break-all;
}
</style>
