<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { quizApi } from '@/api/quiz'
import EmptyState from '@/components/EmptyState.vue'

const loading = ref(true)
const loadError = ref(false)
const progress = ref(null)

onShow(() => {
  fetchRecords()
})

async function fetchRecords() {
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

function goToReview(levelId) {
  uni.navigateTo({ url: `/pages/quiz/review?levelId=${levelId}` })
}

function getStatusLabel(status) {
  const map = { passed: '已通关', failed: '未通过', available: '未开始', in_progress: '进行中', locked: '未解锁' }
  return map[status] || status
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
      @action="fetchRecords"
    />

    <EmptyState v-else-if="!loading && (!progress?.categories || progress.categories.length === 0)" message="暂无答题记录" />

    <view v-else class="records-content">
      <view
        v-for="(cat, ci) in (progress?.categories || [])"
        :key="cat.categoryId"
        class="category-group"
      >
        <view class="group-header">
          <text class="cat-icon">{{ getCategoryIcon(cat, ci) }}</text>
          <text class="cat-name">{{ cat.name }}</text>
        </view>
        <view class="level-records">
          <view
            v-for="level in (cat.levels || [])"
            :key="level.levelId"
            class="level-record"
            :class="{ passed: level.status === 'passed' }"
            @click="level.status === 'passed' ? goToReview(level.levelId) : null"
          >
            <text class="level-no">第{{ level.levelNo }}关</text>
            <text class="level-status">{{ getStatusLabel(level.status) }}</text>
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

.category-group {
  margin-bottom: 28rpx;
}

.group-header {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.cat-icon {
  font-size: 32rpx;
  margin-right: 10rpx;
}

.cat-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.level-records {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.level-record {
  background: #fff;
  border-radius: 10rpx;
  padding: 14rpx 20rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.level-record.passed {
  background: rgba(76, 175, 80, 0.1);
}

.level-no {
  font-size: 24rpx;
  color: #666;
}

.level-status {
  font-size: 24rpx;
  color: #999;
}

.level-record.passed .level-status {
  color: #4CAF50;
}
</style>
