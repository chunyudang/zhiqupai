<template>
  <view class="index-page">
    <!-- Not logged in state -->
    <template v-if="!isLoggedIn">
      <view class="welcome-section">
        <view class="welcome-logo">
          <text class="logo-emoji">🧠</text>
        </view>
        <text class="welcome-title">识趣派</text>
        <text class="welcome-desc">轻学习+强激励的答题闯关</text>
        <view class="welcome-features">
          <view class="feature-item">
            <text class="feature-icon">📚</text>
            <text class="feature-text">5大学科</text>
          </view>
          <view class="feature-item">
            <text class="feature-icon">🎯</text>
            <text class="feature-text">25个关卡</text>
          </view>
          <view class="feature-item">
            <text class="feature-icon">🎁</text>
            <text class="feature-text">积分奖励</text>
          </view>
        </view>
        <button class="login-btn" @click="goLogin">立即登录</button>
      </view>
    </template>

    <!-- Logged in state -->
    <template v-else>
      <!-- Page header -->
      <view class="page-header">
        <text class="page-title">选择学科</text>
        <text class="page-subtitle">选择一个学科开始你的答题之旅</text>
      </view>

      <!-- Loading skeleton -->
      <view v-if="loading">
        <view v-for="i in 5" :key="i" class="category-card skeleton-card">
          <Skeleton type="card" />
        </view>
      </view>

      <!-- Error state -->
      <view v-else-if="loadError">
        <EmptyState
          icon="😕"
          message="加载失败"
          action-text="重新加载"
          @action="loadCategories"
        />
      </view>

      <!-- Category list -->
      <view v-else-if="categories.length > 0" class="category-list">
        <view
          v-for="category in categories"
          :key="category.id"
          class="category-card"
          @click="goLevels(category)"
        >
          <view class="card-header">
            <view class="card-icon-wrapper">
              <text class="card-icon">{{ getCategoryIcon(category) }}</text>
            </view>
            <view class="card-info">
              <text class="card-name">{{ category.name }}</text>
              <text class="card-desc">{{ category.description }}</text>
            </view>
            <text class="card-arrow">›</text>
          </view>
          <view class="card-progress">
            <view class="progress-bar">
              <view
                class="progress-fill"
                :style="{ width: categoryProgress(category) + '%' }"
              ></view>
            </view>
            <text class="progress-text">
              {{ category.passedCount || 0 }}/{{ category.totalLevels || 5 }} 通关
            </text>
          </view>
        </view>
      </view>

      <!-- Empty state -->
      <view v-else>
        <EmptyState icon="📚" message="暂无学科数据" />
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getCategories } from '../../api/quiz.js'
import Skeleton from '../../components/Skeleton.vue'
import EmptyState from '../../components/EmptyState.vue'

const isLoggedIn = ref(false)
const loading = ref(false)
const loadError = ref(false)
const categories = ref([])

const CYAN = '#FF6B35'

// Category icon mapping
const ICON_MAP = {
  '历史人文': '📜',
  '科学技术': '🔬',
  '地理探索': '🌍',
  '艺术鉴赏': '🎨',
  '生活常识': '💡',
}

const getCategoryIcon = (category) => {
  return ICON_MAP[category.name] || '📚'
}

const categoryProgress = (category) => {
  const passed = category.passedCount || 0
  const total = category.totalLevels || 5
  return total > 0 ? Math.round((passed / total) * 100) : 0
}

const loadCategories = async () => {
  loading.value = true
  loadError.value = false

  try {
    const data = await getCategories()
    categories.value = data || []
  } catch (err) {
    console.error('[Index] loadCategories error:', err)
    loadError.value = true
  } finally {
    loading.value = false
  }
}

const goLogin = () => {
  uni.navigateTo({ url: '/pages/login/login' })
}

const goLevels = (category) => {
  uni.navigateTo({
    url: `/pages/quiz/levels?categoryId=${category.id}&categoryName=${encodeURIComponent(category.name)}`,
  })
}

onShow(() => {
  isLoggedIn.value = !!uni.getStorageSync('isLoggedIn')
  if (isLoggedIn.value) {
    loadCategories()
  }
})
</script>

<style scoped>
.index-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 20rpx;
}

/* Welcome section (not logged in) */
.welcome-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 60rpx 40rpx;
  background: linear-gradient(180deg, #FFF5F0 0%, #FFFFFF 60%);
}

.welcome-logo {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF6B35, #FF8C5A);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(255, 107, 53, 0.3);
}

.logo-emoji {
  font-size: 80rpx;
}

.welcome-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  letter-spacing: 8rpx;
  margin-bottom: 12rpx;
}

.welcome-desc {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 60rpx;
}

.welcome-features {
  display: flex;
  gap: 40rpx;
  margin-bottom: 80rpx;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.feature-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.feature-text {
  font-size: 24rpx;
  color: #666;
}

.login-btn {
  width: 100%;
  max-width: 500rpx;
  height: 96rpx;
  line-height: 96rpx;
  background: #FF6B35;
  color: #FFFFFF;
  font-size: 34rpx;
  font-weight: bold;
  border-radius: 48rpx;
  border: none;
  box-shadow: 0 6rpx 24rpx rgba(255, 107, 53, 0.4);
}

.login-btn::after {
  border: none;
}

/* Page header */
.page-header {
  padding: 32rpx 32rpx 20rpx;
}

.page-title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.page-subtitle {
  font-size: 26rpx;
  color: #999;
}

/* Category cards */
.category-list {
  padding: 0 24rpx;
}

.category-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  transition: transform 0.2s;
}

.category-card:active {
  transform: scale(0.98);
}

.skeleton-card {
  background: #FFFFFF;
  box-shadow: none;
}

.skeleton-card:active {
  transform: none;
}

.card-header {
  display: flex;
  align-items: center;
}

.card-icon-wrapper {
  width: 72rpx;
  height: 72rpx;
  border-radius: 16rpx;
  background: #FFF5F0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.card-icon {
  font-size: 40rpx;
}

.card-info {
  flex: 1;
  overflow: hidden;
}

.card-name {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 4rpx;
}

.card-desc {
  display: block;
  font-size: 24rpx;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-arrow {
  font-size: 40rpx;
  color: #CCC;
  flex-shrink: 0;
  margin-left: 12rpx;
}

.card-progress {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
}

.progress-bar {
  flex: 1;
  height: 12rpx;
  background: #F0F0F0;
  border-radius: 6rpx;
  overflow: hidden;
  margin-right: 16rpx;
}

.progress-fill {
  height: 100%;
  background: #FF6B35;
  border-radius: 6rpx;
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 24rpx;
  color: #999;
  flex-shrink: 0;
}
</style>
