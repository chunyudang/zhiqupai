<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { quizApi } from '@/api/quiz'
import NavBar from '@/components/NavBar.vue'
import TabBar from '@/components/TabBar.vue'
import Skeleton from '@/components/Skeleton.vue'
import EmptyState from '@/components/EmptyState.vue'

const userStore = useUserStore()
const loading = ref(true)
const loadError = ref(false)
const categories = ref([])

onShow(() => {
  if (userStore.isLoggedIn) {
    fetchCategories()
  } else if (userStore.autoLoginDone) {
    loading.value = false
  }
})

async function fetchCategories() {
  loading.value = true
  loadError.value = false
  try {
    const data = await quizApi.getCategories()
    categories.value = data
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}

function goToLevels(category) {
  uni.navigateTo({ url: `/pages/quiz/levels?id=${category.id}&name=${encodeURIComponent(category.name)}` })
}

function goToLogin() {
  uni.navigateTo({ url: '/pages/login/login' })
}

// 学科图标
function getIcon(cat, index) {
  return cat.icon || ['🔬', '📐', '📚', '🗺️', '🌍'][index] || '📖'
}
</script>

<template>
  <view class="home-page">
    <NavBar title="识趣派" :showBack="false">
      <template #right>
        <text style="font-size: 26rpx; color: #FF6B35;" @click="goToLogin" v-if="!userStore.isLoggedIn">登录</text>
      </template>
    </NavBar>

    <!-- 未登录：欢迎页 -->
    <view v-if="!userStore.isLoggedIn && !loading" class="welcome-area">
      <text class="welcome-icon">🦉</text>
      <text class="welcome-title">欢迎来到识趣派</text>
      <text class="welcome-desc">轻学习 · 强激励的答题闯关APP</text>
      <button class="login-btn" @click="goToLogin">立即登录</button>
    </view>

    <!-- 已登录：学科列表 -->
    <template v-if="userStore.isLoggedIn">
      <view class="section-header">
        <text class="section-title">选择学科</text>
      </view>

      <Skeleton v-if="loading" type="card" :count="3" />

      <EmptyState
        v-else-if="loadError"
        message="加载失败"
        :showAction="true"
        actionText="重试"
        @action="fetchCategories"
      />

      <EmptyState v-else-if="categories.length === 0" message="暂无学科数据" />

      <view v-else class="category-list">
        <view
          v-for="(cat, index) in categories"
          :key="cat.id"
          class="category-card"
          @click="goToLevels(cat)"
        >
          <text class="category-icon">{{ getIcon(cat, index) }}</text>
          <view class="category-info">
            <text class="category-name">{{ cat.name }}</text>
            <text class="category-desc">{{ cat.description || '' }}</text>
            <view class="category-progress">
              <view class="progress-bar">
                <view
                  class="progress-fill"
                  :style="{ width: cat.totalLevels ? (cat.passedCount / cat.totalLevels * 100) + '%' : '0%' }"
                />
              </view>
              <text class="progress-text">{{ cat.passedCount }}/{{ cat.totalLevels || 5 }} 关</text>
            </view>
          </view>
          <text class="category-arrow">›</text>
        </view>
      </view>
    </template>

    <TabBar :currentIndex="0" />
  </view>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 120rpx;
}

.welcome-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 40rpx 60rpx;
}

.welcome-icon {
  font-size: 120rpx;
}

.welcome-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-top: 24rpx;
}

.welcome-desc {
  font-size: 26rpx;
  color: #999;
  margin-top: 12rpx;
}

.login-btn {
  margin-top: 60rpx;
  width: 400rpx;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  background: #FF6B35;
  color: #fff;
  font-size: 32rpx;
  border: none;
  border-radius: 44rpx;
}

.section-header {
  padding: 24rpx 24rpx 12rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.category-list {
  padding: 0 24rpx;
}

.category-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 16rpx;
}

.category-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.category-info {
  flex: 1;
}

.category-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.category-desc {
  font-size: 24rpx;
  color: #999;
  margin-top: 6rpx;
  display: block;
}

.category-progress {
  display: flex;
  align-items: center;
  margin-top: 12rpx;
}

.progress-bar {
  flex: 1;
  height: 8rpx;
  background: #f0f0f0;
  border-radius: 4rpx;
  margin-right: 12rpx;
}

.progress-fill {
  height: 100%;
  background: #FF6B35;
  border-radius: 4rpx;
  transition: width 0.3s;
}

.progress-text {
  font-size: 22rpx;
  color: #999;
  white-space: nowrap;
}

.category-arrow {
  font-size: 32rpx;
  color: #ccc;
}
</style>
