<template>
  <view class="records-page">
    <!-- Loading -->
    <view v-if="loading" class="loading-state">
      <view v-for="i in 4" :key="i" class="sk-item">
        <Skeleton type="card" />
      </view>
    </view>

    <template v-else>
      <!-- Empty -->
      <view v-if="groupedRecords.length === 0" class="center-state">
        <EmptyState icon="📋" message="暂无答题记录" action-text="去答题" @action="goHome" />
      </view>

      <!-- Grouped by category -->
      <view v-for="group in groupedRecords" :key="group.categoryId" class="category-group">
        <view class="group-header">
          <text class="group-icon">{{ group.icon }}</text>
          <text class="group-name">{{ group.categoryName }}</text>
          <text class="group-summary">{{ group.passedCount }}/{{ group.totalCount }} 通关</text>
        </view>

        <view
          v-for="record in group.records"
          :key="record.levelId"
          class="record-item"
          @click="viewReview(record)"
        >
          <view class="record-info">
            <text class="record-name">第{{ record.levelNo }}关 · {{ record.levelName }}</text>
            <text class="record-time">{{ formatTime(record.completedAt) }}</text>
          </view>
          <view class="record-stats">
            <view class="record-score" :class="{ passed: record.status === 'passed' }">
              <text class="rs-value">{{ record.bestScore }}/6</text>
              <text class="rs-label">{{ record.status === 'passed' ? '通关' : '未通过' }}</text>
            </view>
            <view class="record-duration">
              <text class="rd-value">{{ formatDuration(record.bestTime) }}</text>
              <text class="rd-label">用时</text>
            </view>
          </view>
          <text class="record-arrow">›</text>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getProgress } from '../../api/quiz.js'
import Skeleton from '../../components/Skeleton.vue'
import EmptyState from '../../components/EmptyState.vue'

const CATEGORY_ICONS = {
  '历史人文': '📜',
  '科学技术': '🔬',
  '地理探索': '🌍',
  '艺术鉴赏': '🎨',
  '生活常识': '🍳',
}

const loading = ref(true)
const groupedRecords = ref([])

const formatTime = (timeStr) => {
  if (!timeStr) return '--'
  try {
    const d = new Date(timeStr)
    return `${d.getMonth() + 1}月${d.getDate()}日`
  } catch {
    return '--'
  }
}

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return '--:--'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const loadRecords = async () => {
  loading.value = true
  try {
    const progress = await getProgress()
    const categories = progress.categories || []

    const groups = categories
      .map((cat) => {
        const records = (cat.levels || [])
          .filter((l) => l.status === 'passed' || l.status === 'failed')
          .sort((a, b) => a.levelNo - b.levelNo)

        return {
          categoryId: cat.id,
          categoryName: cat.name || '未知学科',
          icon: CATEGORY_ICONS[cat.name] || '📚',
          totalCount: cat.totalLevels || 5,
          passedCount: (cat.levels || []).filter((l) => l.status === 'passed').length,
          records: records.map((l) => ({
            levelId: l.levelId,
            levelName: l.levelName,
            levelNo: l.levelNo,
            status: l.status,
            bestScore: l.bestScore || 0,
            bestTime: l.bestTime || 0,
            completedAt: l.completedAt,
          })),
        }
      })
      .filter((g) => g.records.length > 0)

    groupedRecords.value = groups
  } catch (err) {
    console.error('[Records] loadRecords error:', err)
  } finally {
    loading.value = false
  }
}

const viewReview = (record) => {
  uni.navigateTo({
    url: `/pages/quiz/review?levelId=${record.levelId}`,
  })
}

const goHome = () => {
  uni.switchTab({ url: '/pages/index/index' })
}

onLoad(() => {
  loadRecords()
})
</script>

<style scoped>
.records-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 40rpx;
}

.loading-state {
  padding: 24rpx;
}

.sk-item {
  margin-bottom: 16rpx;
}

.center-state {
  padding: 120rpx 0;
}

/* Category group */
.category-group {
  margin: 0 24rpx 24rpx;
}

.group-header {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
}

.group-icon {
  font-size: 32rpx;
  margin-right: 10rpx;
}

.group-name {
  flex: 1;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.group-summary {
  font-size: 24rpx;
  color: #FF6B35;
}

/* Record item */
.record-item {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border-radius: 14rpx;
  padding: 24rpx 20rpx;
  margin-bottom: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
}

.record-item:active {
  background: #FAFAFA;
}

.record-info {
  flex: 1;
  overflow: hidden;
}

.record-name {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 4rpx;
}

.record-time {
  font-size: 22rpx;
  color: #CCC;
}

.record-stats {
  display: flex;
  gap: 20rpx;
  margin-right: 12rpx;
  text-align: center;
}

.record-score {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rs-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #999;
}

.record-score.passed .rs-value {
  color: #52C41A;
}

.rs-label {
  font-size: 18rpx;
  color: #CCC;
}

.record-duration {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rd-value {
  font-size: 24rpx;
  color: #666;
  font-variant-numeric: tabular-nums;
}

.rd-label {
  font-size: 18rpx;
  color: #CCC;
}

.record-arrow {
  font-size: 36rpx;
  color: #CCC;
  flex-shrink: 0;
}
</style>
