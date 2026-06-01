<template>
  <view class="stats-page">
    <!-- Loading -->
    <view v-if="loading" class="loading-state">
      <view v-for="i in 4" :key="i" class="sk-card">
        <Skeleton type="card" />
      </view>
    </view>

    <template v-else>
      <!-- Overview cards -->
      <view class="overview-section">
        <view class="overview-card">
          <text class="ov-value">{{ stats.totalQuiz || 0 }}</text>
          <text class="ov-label">累计答题</text>
        </view>
        <view class="overview-card">
          <text class="ov-value">{{ stats.totalPassed || 0 }}/25</text>
          <text class="ov-label">已通关卡</text>
        </view>
        <view class="overview-card">
          <text class="ov-value">{{ stats.bestAccuracy || 0 }}%</text>
          <text class="ov-label">最高正确率</text>
        </view>
        <view class="overview-card">
          <text class="ov-value">{{ stats.totalPoints || 0 }}</text>
          <text class="ov-label">累计积分</text>
        </view>
      </view>

      <!-- Category progress -->
      <view class="category-section">
        <text class="section-title">学科通关进度</text>
        <view
          v-for="cat in progressList"
          :key="cat.id"
          class="cat-progress-item"
        >
          <view class="cat-header">
            <text class="cat-icon">{{ cat.icon }}</text>
            <text class="cat-name">{{ cat.name }}</text>
            <text class="cat-count">{{ cat.passed }}/{{ cat.total }}</text>
          </view>
          <view class="cat-progress-bar">
            <view class="cat-progress-fill" :style="{ width: cat.percent + '%' }"></view>
          </view>
        </view>
      </view>

      <!-- Empty state if no categories -->
      <view v-if="progressList.length === 0" class="center-state">
        <EmptyState icon="📊" message="暂无统计数据" />
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getProgress } from '../../api/quiz.js'
import { getBalance } from '../../api/points.js'
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
const stats = ref({})
const progressList = ref([])

const loadStats = async () => {
  loading.value = true
  try {
    const [progress, balance] = await Promise.all([
      getProgress(),
      getBalance(),
    ])

    stats.value = {
      totalQuiz: progress.totalQuiz || 0,
      totalPassed: progress.totalPassed || 0,
      bestAccuracy: progress.bestAccuracy || 0,
      totalPoints: balance.balance || progress.pointsBalance || 0,
    }

    // Build category progress list
    const list = (progress.categories || []).map((cat) => ({
      id: cat.id,
      name: cat.name || '未知学科',
      icon: CATEGORY_ICONS[cat.name] || '📚',
      passed: cat.passedLevels || 0,
      total: cat.totalLevels || 5,
      percent: cat.totalLevels > 0 ? Math.round((cat.passedLevels || 0) / cat.totalLevels * 100) : 0,
    }))
    progressList.value = list
  } catch (err) {
    console.error('[Stats] loadStats error:', err)
  } finally {
    loading.value = false
  }
}

onLoad(() => {
  loadStats()
})
</script>

<style scoped>
.stats-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 40rpx;
}

.loading-state {
  padding: 24rpx;
}

.sk-card {
  margin-bottom: 16rpx;
}

.center-state {
  padding: 120rpx 0;
}

/* Overview cards */
.overview-section {
  display: flex;
  flex-wrap: wrap;
  padding: 24rpx;
  gap: 16rpx;
}

.overview-card {
  width: calc(50% - 8rpx);
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 32rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.ov-value {
  font-size: 44rpx;
  font-weight: bold;
  color: #FF6B35;
  margin-bottom: 12rpx;
  font-variant-numeric: tabular-nums;
}

.ov-label {
  font-size: 24rpx;
  color: #999;
}

/* Category progress */
.category-section {
  margin: 0 24rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
}

.cat-progress-item {
  margin-bottom: 24rpx;
}

.cat-progress-item:last-child {
  margin-bottom: 0;
}

.cat-header {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.cat-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.cat-name {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.cat-count {
  font-size: 24rpx;
  color: #999;
}

.cat-progress-bar {
  height: 12rpx;
  background: #F0F0F0;
  border-radius: 6rpx;
  overflow: hidden;
}

.cat-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF6B35, #FF8C5A);
  border-radius: 6rpx;
  transition: width 0.5s ease;
  min-width: 0;
}
</style>
