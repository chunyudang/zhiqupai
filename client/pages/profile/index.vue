<template>
  <view class="profile-page">
    <!-- Not logged in -->
    <view v-if="!isLoggedIn" class="center-state">
      <text class="empty-icon">👤</text>
      <text class="empty-text">请先登录</text>
      <button class="login-btn" @click="goLogin">去登录</button>
    </view>

    <!-- User profile -->
    <template v-else>
      <!-- User card -->
      <view class="user-card">
        <view class="user-avatar">
          <text class="avatar-text">{{ avatarText }}</text>
        </view>
        <view class="user-info">
          <text class="user-name">{{ userInfo.nickname || '用户' + (userInfo.phone || '') }}</text>
          <text class="user-phone">{{ userInfo.phone || '' }}</text>
        </view>
      </view>

      <!-- Stats cards -->
      <view class="stats-row">
        <view class="stat-card" @click="goPoints">
          <text class="stat-value">{{ pointsBalance }}</text>
          <text class="stat-label">积分余额</text>
        </view>
        <view class="stat-card" @click="goRecords">
          <text class="stat-value">{{ totalQuiz || 0 }}</text>
          <text class="stat-label">累计答题</text>
        </view>
        <view class="stat-card" @click="goStats">
          <text class="stat-value">{{ totalPassed || 0 }}</text>
          <text class="stat-label">已通关</text>
        </view>
      </view>

      <!-- Menu list -->
      <view class="menu-list">
        <view class="menu-item" @click="goCheckin">
          <text class="menu-icon">📅</text>
          <text class="menu-text">签到日历</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="goRecords">
          <text class="menu-icon">📋</text>
          <text class="menu-text">答题记录</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="goPoints">
          <text class="menu-icon">💰</text>
          <text class="menu-text">积分明细</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="goStats">
          <text class="menu-icon">📊</text>
          <text class="menu-text">数据统计</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="goSettings">
          <text class="menu-icon">⚙️</text>
          <text class="menu-text">设置</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>

      <!-- Logout -->
      <view class="logout-section">
        <button class="logout-btn" @click="handleLogout">退出登录</button>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getProgress } from '../../api/quiz.js'
import { getProfile } from '../../api/user.js'
import { clearAuth } from '../../api/request.js'

const isLoggedIn = ref(false)
const userInfo = ref({})
const pointsBalance = ref(0)
const totalQuiz = ref(0)
const totalPassed = ref(0)

const avatarText = ref('?')

const loadProfile = async () => {
  const stored = uni.getStorageSync('isLoggedIn')
  isLoggedIn.value = !!stored
  if (!isLoggedIn.value) return

  // Load user info from API
  try {
    const profile = await getProfile()
    userInfo.value = profile || {}
    avatarText.value = (profile.nickname || '用')[0] || '?'
  } catch (err) {
    console.error('[Profile] getProfile error:', err)
    avatarText.value = '?'
  }

  // Load progress
  try {
    const progress = await getProgress()
    pointsBalance.value = progress.pointsBalance || 0
    totalQuiz.value = progress.totalQuiz || 0
    totalPassed.value = progress.totalPassed || 0
  } catch (err) {
    console.error('[Profile] loadProfile error:', err)
  }
}

const goLogin = () => {
  uni.navigateTo({ url: '/pages/login/login' })
}

const goCheckin = () => uni.navigateTo({ url: '/pages/profile/checkin' })
const goRecords = () => uni.navigateTo({ url: '/pages/profile/records' })
const goPoints = () => uni.navigateTo({ url: '/pages/profile/points' })
const goStats = () => uni.navigateTo({ url: '/pages/profile/stats' })
const goSettings = () => uni.navigateTo({ url: '/pages/profile/settings' })

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        clearAuth()
        uni.removeStorageSync('isLoggedIn')
        uni.removeStorageSync('userInfo')
        uni.showToast({ title: '已退出', icon: 'none' })
        loadProfile()
      }
    }
  })
}

onShow(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #F5F5F5;
}

.center-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.login-btn {
  width: 240rpx;
  height: 80rpx;
  line-height: 80rpx;
  background: #FF6B35;
  color: #FFFFFF;
  font-size: 30rpx;
  font-weight: bold;
  border-radius: 40rpx;
  border: none;
}

.login-btn::after {
  border: none;
}

/* User card */
.user-card {
  display: flex;
  align-items: center;
  padding: 48rpx 32rpx;
  background: linear-gradient(135deg, #FF6B35, #FF8C5A);
}

.user-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.5);
}

.avatar-text {
  font-size: 44rpx;
  color: #FFFFFF;
  font-weight: bold;
}

.user-info {
  flex: 1;
}

.user-name {
  display: block;
  font-size: 36rpx;
  color: #FFFFFF;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.user-phone {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

/* Stats */
.stats-row {
  display: flex;
  padding: 24rpx;
  gap: 16rpx;
  margin-top: -20rpx;
}

.stat-card {
  flex: 1;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx 16rpx;
  text-align: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.stat-value {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #FF6B35;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 22rpx;
  color: #999;
}

/* Menu list */
.menu-list {
  margin: 0 24rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #F5F5F5;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: #FAFAFA;
}

.menu-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.menu-text {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.menu-arrow {
  font-size: 36rpx;
  color: #CCC;
}

/* Logout */
.logout-section {
  padding: 40rpx 24rpx;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: #FFFFFF;
  color: #FF4D4F;
  font-size: 30rpx;
  border-radius: 44rpx;
  border: 1rpx solid #FF4D4F;
}

.logout-btn::after {
  border: none;
}
</style>
