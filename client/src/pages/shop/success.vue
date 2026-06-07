<script setup>
// S-03 兑换成功页
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import NavBar from '@/components/NavBar.vue'

// 状态
const goodsName = ref('')
const pointsCost = ref(0)
const code = ref('')

// 复制兑换码
function copyCode() {
  if (!code.value) return
  uni.setClipboardData({
    data: code.value,
    success: () => {
      uni.showToast({ title: '已复制', icon: 'success' })
    }
  })
}

// 查看兑换记录
function goToOrders() {
  uni.redirectTo({ url: '/pages/shop/orders' })
}

// 返回商城
function goToShop() {
  uni.switchTab({ url: '/pages/placeholder/shop' })
}

// 接收参数
onLoad((options) => {
  goodsName.value = decodeURIComponent(options.name || '')
  pointsCost.value = Number(options.cost || 0)
  code.value = decodeURIComponent(options.code || '')
})
</script>

<template>
  <view class="page">
    <!-- 自定义导航栏 -->
    <NavBar title="兑换成功" :showBack="false" />

    <view class="content">
      <!-- 成功图标 -->
      <view class="success-icon-wrap">
        <view class="success-circle">
          <text class="success-check">✓</text>
        </view>
      </view>

      <!-- 成功文字 -->
      <text class="success-title">兑换成功！</text>
      <text class="goods-name">{{ goodsName }}</text>

      <!-- 消耗积分 -->
      <view class="cost-card">
        <text class="cost-label">消耗积分</text>
        <text class="cost-value">-{{ pointsCost }}</text>
      </view>

      <!-- 兑换码卡片（仅兑换码类商品） -->
      <view v-if="code" class="code-card">
        <text class="code-label">兑换码</text>
        <view class="code-display">
          <text class="code-text" selectable>{{ code }}</text>
        </view>
        <button class="copy-btn" @click="copyCode">复制兑换码</button>
        <text class="code-tip">请尽快使用，过期无效</text>
      </view>

      <!-- 操作按钮 -->
      <view class="action-group">
        <button class="action-btn primary-btn" @click="goToOrders">查看兑换记录</button>
        <button class="action-btn secondary-btn" @click="goToShop">返回商城</button>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #F5F5F5;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 40rpx 40rpx;
}

/* 成功图标动画 */
@keyframes success-pop {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

.success-icon-wrap {
  animation: success-pop 0.5s ease-out;
  margin-bottom: 24rpx;
}

.success-circle {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #4CAF50, #66BB6A);
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-check {
  font-size: 72rpx;
  color: #fff;
  font-weight: bold;
}

/* 文字 */
.success-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}

.goods-name {
  font-size: 28rpx;
  color: #666;
  margin-top: 12rpx;
}

/* 消耗积分卡片 */
.cost-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: #fff;
  margin-top: 40rpx;
  padding: 28rpx 32rpx;
  border-radius: 16rpx;
  box-sizing: border-box;
}

.cost-label {
  font-size: 28rpx;
  color: #666;
}

.cost-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #F44336;
}

/* 兑换码卡片 */
.code-card {
  width: 100%;
  background: #fff;
  margin-top: 24rpx;
  padding: 28rpx 32rpx;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

.code-label {
  font-size: 26rpx;
  color: #999;
  align-self: flex-start;
}

.code-display {
  width: 100%;
  margin-top: 16rpx;
  padding: 24rpx;
  background: #FFF5F0;
  border: 2rpx dashed #FF6B35;
  border-radius: 12rpx;
  text-align: center;
  box-sizing: border-box;
}

.code-text {
  font-size: 44rpx;
  font-weight: bold;
  color: #FF6B35;
  letter-spacing: 4rpx;
  user-select: text;
}

.copy-btn {
  width: 100%;
  height: 76rpx;
  line-height: 76rpx;
  margin-top: 20rpx;
  font-size: 30rpx;
  color: #FF6B35;
  background: #fff;
  border: 2rpx solid #FF6B35;
  border-radius: 38rpx;
  padding: 0;
}

.code-tip {
  font-size: 22rpx;
  color: #999;
  margin-top: 12rpx;
}

/* 操作按钮组 */
.action-group {
  width: 100%;
  margin-top: 60rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.action-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 32rpx;
  border-radius: 44rpx;
  border: none;
  padding: 0;
  font-weight: 500;
}

.primary-btn {
  background: linear-gradient(135deg, #FF6B35, #FF8C60);
  color: #fff;
}

.secondary-btn {
  background: #fff;
  color: #FF6B35;
  border: 2rpx solid #FF6B35;
}
</style>
