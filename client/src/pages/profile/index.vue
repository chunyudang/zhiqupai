<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { useMessagesStore } from '@/stores/messages'
import { pointsApi } from '@/api/points'
import NavBar from '@/components/NavBar.vue'
import TabBar from '@/components/TabBar.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

const userStore = useUserStore()
const messagesStore = useMessagesStore()
const loading = ref(false)
const balance = ref(0)
const todayEarned = ref(0)
const showLogoutModal = ref(false)

onShow(() => {
  if (userStore.isLoggedIn) {
    fetchPoints()
  }
})

async function fetchPoints() {
  try {
    const data = await pointsApi.getBalance()
    balance.value = data.balance
    todayEarned.value = data.todayEarned
  } catch {
    // 静默
  }
}

function navigateTo(url) {
  uni.navigateTo({ url })
}

async function handleLogout() {
  showLogoutModal.value = false
  await userStore.logout()
  uni.switchTab({ url: '/pages/index/index' })
}
</script>

<template>
  <view class="profile-page">
    <NavBar title="我的" :showBack="false" />

    <view class="page-content">
      <!-- 用户卡片 -->
      <view class="user-card" v-if="userStore.isLoggedIn">
        <view class="avatar-area" @click="navigateTo('/pages/profile/settings')">
          <image
            v-if="userStore.userInfo?.avatar"
            :src="userStore.userInfo?.avatar"
            class="avatar-img"
            mode="aspectFill"
          />
          <text v-else class="avatar-placeholder">👤</text>
        </view>
        <view class="user-info">
          <text class="user-nickname">{{ userStore.userInfo?.nickname || '未设置昵称' }}</text>
          <text class="user-phone">{{ userStore.userInfo?.phone || '' }}</text>
        </view>
      </view>

      <!-- 未登录 -->
      <view v-else class="guest-card">
        <text class="guest-icon">🦉</text>
        <text class="guest-text">登录后查看更多</text>
        <button class="guest-btn" @click="navigateTo('/pages/login/login')">立即登录</button>
      </view>

      <!-- 积分统计 -->
      <view class="stats-row">
        <view class="stat-card" @click="navigateTo('/pages/profile/points')">
          <text class="stat-value">{{ balance }}</text>
          <text class="stat-label">积分余额</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ todayEarned }}</text>
          <text class="stat-label">今日获得</text>
        </view>
        <view class="stat-card" @click="navigateTo('/pages/profile/checkin')">
          <text class="stat-value">📅</text>
          <text class="stat-label">每日签到</text>
        </view>
      </view>

      <!-- 功能菜单 -->
      <view class="menu-section">
        <view class="menu-item" @click="navigateTo('/pages/profile/stats')">
          <text>📊</text>
          <text class="menu-text">数据统计</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="navigateTo('/pages/profile/records')">
          <text>📋</text>
          <text class="menu-text">答题记录</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="navigateTo('/pages/profile/points')">
          <text>💰</text>
          <text class="menu-text">积分明细</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="navigateTo('/pages/profile/settings')">
          <text>⚙️</text>
          <text class="menu-text">设置</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>

      <!-- 退出登录 -->
      <view v-if="userStore.isLoggedIn" class="logout-section">
        <button class="logout-btn" @click="showLogoutModal = true">退出登录</button>
      </view>
    </view>

    <TabBar :currentIndex="4" />
    <ConfirmModal
      :show="showLogoutModal"
      title="退出登录"
      message="确定要退出当前账号吗？"
      @confirm="handleLogout"
      @cancel="showLogoutModal = false"
    />
  </view>
</template>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #F5F5F5;
}

.page-content {
  padding: 24rpx;
  padding-bottom: 120rpx;
}

.user-card {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #FF6B35, #FF8C60);
  border-radius: 16rpx;
  padding: 32rpx 24rpx;
  margin-bottom: 24rpx;
}

.avatar-area {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.avatar-placeholder {
  font-size: 48rpx;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-nickname {
  font-size: 34rpx;
  font-weight: bold;
  color: #fff;
}

.user-phone {
  font-size: 24rpx;
  color: rgba(255,255,255,0.8);
  margin-top: 4rpx;
}

.guest-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 48rpx 24rpx;
  margin-bottom: 24rpx;
}

.guest-icon {
  font-size: 80rpx;
}

.guest-text {
  font-size: 28rpx;
  color: #999;
  margin: 16rpx 0;
}

.guest-btn {
  padding: 12rpx 48rpx;
  font-size: 28rpx;
  color: #FF6B35;
  background: rgba(255, 107, 53, 0.1);
  border: none;
  border-radius: 40rpx;
}

.stats-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.stat-card {
  flex: 1;
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx 0;
  text-align: center;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.stat-label {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}

.menu-section {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 1px solid #f5f5f5;
  font-size: 30rpx;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-text {
  flex: 1;
  color: #333;
  margin-left: 16rpx;
}

.menu-arrow {
  font-size: 28rpx;
  color: #ccc;
}

.logout-section {
  margin-top: 40rpx;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  background: #fff;
  color: #F44336;
  font-size: 30rpx;
  border: none;
  border-radius: 44rpx;
}
</style>
