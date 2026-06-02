<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { quizApi } from '@/api/quiz'
import EmptyState from '@/components/EmptyState.vue'

const loading = ref(true)
const loadError = ref(false)
const progress = ref(null)

onShow(() => {
  fetchProgress()
})

async function fetchProgress() {
  loading.value = true
  loadError.value = false
  try {
    const data = await quizApi.getProgress()
    progress.value = data
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}

function getCategoryIcon(cat, index) {
  return ['🔬', '📐', '📚', '🗺️', '🌍'][index] || '📖'
}
</script>

<template>
  <view class="page">
    <EmptyState
      v-if="loadError"
      message="加载失败"
      :showAction="true"
      actionText="重试"
      @action="fetchProgress"
    />

    <view v-else-if="progress" class="stats-content">
      <!-- 总览 -->
      <view class="overview-card">
        <text class="overview-title">学习总览</text>
        <view class="overview-stats">
          <view class="ov-stat">
            <text class="ov-value primary">{{ progress.totalPassed }}</text>
            <text class="ov-label">已通关</text>
          </view>
          <view class="ov-stat">
            <text class="ov-value">{{ progress.totalLevels }}</text>
            <text class="ov-label">总关卡</text>
          </view>
          <view class="ov-stat">
            <text class="ov-value primary">{{ progress.totalLevels ? Math.round(progress.totalPassed / progress.totalLevels * 100) : 0 }}%</text>
            <text class="ov-label">完成率</text>
          </view>
        </view>
        <view class="ov-progress">
          <view class="ov-bar" :style="{ width: progress.totalLevels ? (progress.totalPassed / progress.totalLevels * 100) + '%' : '0%' }" />
        </view>
      </view>

      <!-- 各科进度 -->
      <text class="section-title">各学科进度</text>
      <view class="category-stats">
        <view
          v-for="(cat, index) in (progress.categories || [])"
          :key="cat.categoryId"
          class="cat-stat-card"
        >
          <view class="cat-header">
            <text class="cat-icon">{{ getCategoryIcon(cat, index) }}</text>
            <text class="cat-name">{{ cat.name }}</text>
            <text class="cat-progress">{{ cat.passedCount }}/{{ cat.totalCount || 5 }}</text>
          </view>
          <view class="cat-bar-wrap">
            <view
              class="cat-bar"
              :style="{ width: cat.totalCount ? (cat.passedCount / (cat.totalCount || 5) * 100) + '%' : '0%' }"
            />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #F5F5F5;
  padding: 24rpx;
}

.overview-card {
  background: linear-gradient(135deg, #FF6B35, #FF8C60);
  border-radius: 16rpx;
  padding: 32rpx 24rpx 24rpx;
  margin-bottom: 32rpx;
}

.overview-title {
  font-size: 28rpx;
  color: rgba(255,255,255,0.8);
  display: block;
  margin-bottom: 20rpx;
}

.overview-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20rpx;
}

.ov-stat {
  text-align: center;
}

.ov-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
  display: block;
}

.ov-value.primary {
  font-size: 56rpx;
}

.ov-label {
  font-size: 24rpx;
  color: rgba(255,255,255,0.8);
}

.ov-progress {
  height: 10rpx;
  background: rgba(255,255,255,0.3);
  border-radius: 5rpx;
}

.ov-bar {
  height: 100%;
  background: #fff;
  border-radius: 5rpx;
  transition: width 0.5s;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.category-stats {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.cat-stat-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
}

.cat-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.cat-icon {
  font-size: 36rpx;
  margin-right: 12rpx;
}

.cat-name {
  flex: 1;
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.cat-progress {
  font-size: 26rpx;
  color: #FF6B35;
  font-weight: 500;
}

.cat-bar-wrap {
  height: 10rpx;
  background: #f0f0f0;
  border-radius: 5rpx;
}

.cat-bar {
  height: 100%;
  background: #FF6B35;
  border-radius: 5rpx;
  transition: width 0.5s;
}
</style>
