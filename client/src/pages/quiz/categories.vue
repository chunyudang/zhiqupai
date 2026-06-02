<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { quizApi } from '@/api/quiz'
import Skeleton from '@/components/Skeleton.vue'
import EmptyState from '@/components/EmptyState.vue'

const loading = ref(true)
const loadError = ref(false)
const categories = ref([])

onShow(() => {
  fetchCategories()
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

function getIcon(cat, index) {
  return cat.icon || ['🔬', '📐', '📚', '🗺️', '🌍'][index] || '📖'
}
</script>

<template>
  <view class="page">
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
          <view class="progress-row">
            <view class="progress-bar">
              <view
                class="progress-fill"
                :style="{ width: cat.totalLevels ? (cat.passedCount / cat.totalLevels * 100) + '%' : '0%' }"
              />
            </view>
            <text class="progress-label">{{ cat.passedCount }}/{{ cat.totalLevels || 5 }}</text>
          </view>
        </view>
        <text class="arrow">›</text>
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

.category-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.category-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx 24rpx;
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
  display: block;
}

.progress-row {
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

.progress-label {
  font-size: 22rpx;
  color: #999;
}

.arrow {
  font-size: 32rpx;
  color: #ccc;
}
</style>
