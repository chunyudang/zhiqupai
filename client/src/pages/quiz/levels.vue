<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { quizApi } from '@/api/quiz'
import { LEVEL_STATUS_LABELS, DIFFICULTY_LABELS } from '@/utils/constants'
import Skeleton from '@/components/Skeleton.vue'
import EmptyState from '@/components/EmptyState.vue'

const categoryId = ref(0)
const categoryName = ref('')
const loading = ref(true)
const loadError = ref(false)
const levels = ref([])

onLoad((options) => {
  categoryId.value = Number(options.id)
  categoryName.value = decodeURIComponent(options.name || '')
  uni.setNavigationBarTitle({ title: categoryName.value || '关卡选择' })
  fetchLevels()
})

async function fetchLevels() {
  loading.value = true
  loadError.value = false
  try {
    const data = await quizApi.getLevels(categoryId.value)
    levels.value = data
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}

function handleLevelClick(level) {
  if (level.status === 'locked') {
    uni.showToast({ title: '请先通关前一关', icon: 'none' })
    return
  }
  if (level.status === 'passed') {
    uni.navigateTo({ url: `/pages/quiz/review?levelId=${level.id}` })
    return
  }
  uni.navigateTo({ url: `/pages/quiz/playing?levelId=${level.id}&categoryId=${categoryId.value}` })
}

function getStatusClass(status) {
  return `status-${status}`
}
</script>

<template>
  <view class="page">
    <Skeleton v-if="loading" type="list" :count="5" />

    <EmptyState
      v-else-if="loadError"
      message="加载失败"
      :showAction="true"
      actionText="重试"
      @action="fetchLevels"
    />

    <EmptyState v-else-if="levels.length === 0" message="暂无关卡数据" />

    <view v-else class="level-list">
      <view
        v-for="level in levels"
        :key="level.id"
        class="level-card"
        :class="getStatusClass(level.status)"
        @click="handleLevelClick(level)"
      >
        <view class="level-num">{{ level.levelNo }}</view>
        <view class="level-info">
          <view class="level-top">
            <text class="level-name">{{ level.name }}</text>
            <text class="level-difficulty">{{ DIFFICULTY_LABELS[level.difficulty] || level.difficulty }}</text>
          </view>
          <view class="level-bottom">
            <text class="level-status">{{ LEVEL_STATUS_LABELS[level.status] || level.status }}</text>
            <text v-if="level.bestScore !== null && level.bestScore !== undefined" class="level-score">
              最佳 {{ level.bestScore }}/6 分
            </text>
          </view>
        </view>
        <text class="level-arrow">›</text>
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

.level-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.level-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx 24rpx;
}

.status-locked {
  opacity: 0.5;
}

.level-num {
  width: 64rpx;
  height: 64rpx;
  background: #FF6B35;
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.status-locked .level-num {
  background: #ccc;
}

.status-passed .level-num {
  background: #4CAF50;
}

.level-info {
  flex: 1;
}

.level-top {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.level-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
}

.level-difficulty {
  font-size: 22rpx;
  padding: 2rpx 12rpx;
  background: #f0f0f0;
  border-radius: 8rpx;
  color: #666;
}

.level-bottom {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 8rpx;
}

.level-status {
  font-size: 24rpx;
  color: #999;
}

.level-score {
  font-size: 24rpx;
  color: #FF6B35;
}

.level-arrow {
  font-size: 32rpx;
  color: #ccc;
}
</style>
