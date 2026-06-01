<template>
  <view class="categories-page">
    <view class="page-header">
      <text class="page-title">选择学科</text>
      <text class="page-subtitle">选择一个学科开始你的答题之旅</text>
    </view>

    <!-- Loading -->
    <view v-if="loading">
      <view v-for="i in 5" :key="i" class="cat-card skeleton-card">
        <Skeleton type="card" />
      </view>
    </view>

    <!-- Error -->
    <view v-else-if="loadError" class="center-state">
      <EmptyState
        icon="😕"
        message="加载失败"
        action-text="重新加载"
        @action="loadCategories"
      />
    </view>

    <!-- Category list -->
    <view v-else-if="categories.length > 0" class="cat-list">
      <view
        v-for="category in categories"
        :key="category.id"
        class="cat-card"
        @click="goLevels(category)"
      >
        <view class="card-header">
          <view class="card-icon-wrapper">
            <text class="card-icon">{{ getIcon(category.name) }}</text>
          </view>
          <view class="card-info">
            <text class="card-name">{{ category.name }}</text>
            <text class="card-desc">{{ category.description }}</text>
          </view>
          <text class="card-arrow">›</text>
        </view>
        <view class="card-progress">
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: calcProgress(category) + '%' }"></view>
          </view>
          <text class="progress-text">{{ category.passedCount || 0 }}/{{ category.totalLevels || 5 }} 通关</text>
        </view>
      </view>
    </view>

    <!-- Empty -->
    <view v-else class="center-state">
      <EmptyState icon="📚" message="暂无学科数据" />
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCategories } from '../../api/quiz.js'
import Skeleton from '../../components/Skeleton.vue'
import EmptyState from '../../components/EmptyState.vue'

const ICONS = {
  '历史人文': '📜',
  '科学技术': '🔬',
  '地理探索': '🌍',
  '艺术鉴赏': '🎨',
  '生活常识': '💡',
}

const categories = ref([])
const loading = ref(true)
const loadError = ref(false)

const getIcon = (name) => ICONS[name] || '📚'

const calcProgress = (cat) => {
  const p = cat.passedCount || 0
  const t = cat.totalLevels || 5
  return t > 0 ? Math.round((p / t) * 100) : 0
}

const loadCategories = async () => {
  loading.value = true
  loadError.value = false
  try {
    const data = await getCategories()
    categories.value = data || []
  } catch (err) {
    console.error('[Categories] loadCategories error:', err)
    loadError.value = true
  } finally {
    loading.value = false
  }
}

const goLevels = (category) => {
  uni.navigateTo({
    url: `/pages/quiz/levels?categoryId=${category.id}&categoryName=${encodeURIComponent(category.name)}`,
  })
}

onLoad(() => {
  loadCategories()
})
</script>

<style scoped>
.categories-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 20rpx;
}

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

.center-state {
  padding-top: 100rpx;
}

.cat-list {
  padding: 0 24rpx;
}

.cat-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.cat-card:active {
  transform: scale(0.98);
}

.skeleton-card {
  box-shadow: none;
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
