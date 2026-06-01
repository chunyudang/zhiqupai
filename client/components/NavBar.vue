<template>
  <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="nav-bar-content">
      <view class="nav-left" @click="goBack">
        <text v-if="showBack" class="nav-back">← 返回</text>
      </view>
      <view class="nav-center">
        <text class="nav-title">{{ title }}</text>
      </view>
      <view class="nav-right">
        <slot name="right"></slot>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  title: { type: String, required: true },
  showBack: { type: Boolean, default: false },
})

const emit = defineEmits(['back'])

const statusBarHeight = ref(0)

// #ifdef MP-WEIXIN
const systemInfo = uni.getSystemInfoSync()
statusBarHeight.value = systemInfo.statusBarHeight || 20
// #endif

const goBack = () => {
  emit('back')
  uni.navigateBack()
}
</script>

<style scoped>
.nav-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #fff;
}

.nav-bar-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  padding: 0 24rpx;
  position: relative;
}

.nav-left,
.nav-right {
  width: 120rpx;
  flex-shrink: 0;
}

.nav-center {
  flex: 1;
  text-align: center;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.nav-back {
  font-size: 28rpx;
  color: #FF6B35;
}
</style>
