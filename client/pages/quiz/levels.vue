<template>
  <view class="levels-page">
    <!-- Loading state -->
    <view v-if="loading" class="loading-state">
      <view v-for="i in 5" :key="i" class="level-card skeleton-card">
        <Skeleton type="card" />
      </view>
    </view>

    <!-- Error state -->
    <view v-else-if="loadError" class="center-state">
      <EmptyState
        icon="😕"
        message="加载失败"
        action-text="重新加载"
        @action="loadLevels"
      />
    </view>

    <!-- Empty state -->
    <view v-else-if="levels.length === 0" class="center-state">
      <EmptyState icon="📭" message="暂无关卡数据" />
    </view>

    <!-- Level list -->
    <view v-else class="level-list">
      <view
        v-for="level in levels"
        :key="level.id"
        class="level-card"
        :class="{
          locked: level.status === 'locked',
          passed: level.status === 'passed',
          failed: level.status === 'failed'
        }"
        @click="handleLevelClick(level)"
      >
        <view class="level-header">
          <view class="level-badge" :class="statusClass(level.status)">
            <text>{{ statusIcon(level.status) }}</text>
          </view>
          <view class="level-info">
            <text class="level-name">第{{ level.levelNo }}关 · {{ level.name }}</text>
            <text class="level-difficulty">{{ difficultyText(level.difficulty) }}</text>
          </view>
        </view>

        <!-- Passed level details -->
        <view v-if="level.status === 'passed' || level.status === 'failed'" class="level-stats">
          <text v-if="level.bestScore" class="stat-item">
            最佳分数: {{ level.bestScore }}分
          </text>
          <text v-if="level.attempts" class="stat-item">
            挑战 {{ level.attempts }} 次
          </text>
        </view>

        <!-- Locked hint -->
        <view v-if="level.status === 'locked'" class="locked-hint">
          <text class="lock-text">🔒 需通关前一关解锁</text>
        </view>
      </view>
    </view>

    <!-- Navigation back & progress -->
    <view v-if="!loading && !loadError && levels.length > 0" class="page-footer">
      <text class="footer-progress">
        已通关 {{ passedCount }}/{{ levels.length }} 关
      </text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getLevels } from '../../api/quiz.js'
import Skeleton from '../../components/Skeleton.vue'
import EmptyState from '../../components/EmptyState.vue'

const categoryId = ref('')
const categoryName = ref('')
const levels = ref([])
const loading = ref(true)
const loadError = ref(false)

const passedCount = ref(0)

const DIFFICULTY_MAP = { easy: '入门', medium: '进阶', hard: '挑战' }

const difficultyText = (diff) => DIFFICULTY_MAP[diff] || diff || '入门'

const STATUS_CONFIG = {
  locked: { icon: '🔒', cls: 'status-locked' },
  available: { icon: '▶️', cls: 'status-available' },
  in_progress: { icon: '🔄', cls: 'status-progress' },
  passed: { icon: '✅', cls: 'status-passed' },
  failed: { icon: '😔', cls: 'status-failed' },
}

const statusIcon = (status) => (STATUS_CONFIG[status] || STATUS_CONFIG.locked).icon
const statusClass = (status) => (STATUS_CONFIG[status] || STATUS_CONFIG.locked).cls

const loadLevels = async () => {
  loading.value = true
  loadError.value = false

  try {
    const data = await getLevels(categoryId.value)
    levels.value = data || []
    passedCount.value = levels.value.filter((l) => l.status === 'passed').length
  } catch (err) {
    console.error('[Levels] loadLevels error:', err)
    loadError.value = true
  } finally {
    loading.value = false
  }
}

const handleLevelClick = (level) => {
  if (level.status === 'locked') {
    uni.showToast({ title: '需通关前一关解锁', icon: 'none', duration: 1500 })
    return
  }
  if (level.status === 'passed') {
    uni.navigateTo({ url: `/pages/quiz/review?levelId=${level.id}` })
    return
  }
  // available or in_progress or failed → start/resume quiz
  uni.navigateTo({
    url: `/pages/quiz/playing?levelId=${level.id}&categoryId=${categoryId.value}&categoryName=${encodeURIComponent(categoryName.value)}&levelName=${encodeURIComponent(level.name)}&levelNo=${level.levelNo}`,
  })
}

onLoad((options) => {
  if (options.categoryId) {
    categoryId.value = options.categoryId
  }
  if (options.categoryName) {
    categoryName.value = decodeURIComponent(options.categoryName)
    uni.setNavigationBarTitle({ title: categoryName.value })
  }
  if (categoryId.value) {
    loadLevels()
  }
})
</script>

<style scoped>
.levels-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding: 20rpx 24rpx;
  padding-bottom: 40rpx;
}

.loading-state,
.center-state {
  padding-top: 100rpx;
}

/* Level cards */
.level-list {
  display: flex;
  flex-direction: column;
}

.level-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  transition: transform 0.2s;
}

.level-card:active {
  transform: scale(0.98);
}

.level-card.locked {
  opacity: 0.55;
}

.level-card.skeleton-card {
  box-shadow: none;
}

.level-card.skeleton-card:active {
  transform: none;
}

.level-header {
  display: flex;
  align-items: center;
}

.level-badge {
  width: 60rpx;
  height: 60rpx;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  flex-shrink: 0;
  margin-right: 20rpx;
}

.status-locked { background: #F0F0F0; }
.status-available { background: #E8F5E9; }
.status-progress { background: #E3F2FD; }
.status-passed { background: #E8F5E9; }
.status-failed { background: #FFF3E0; }

.level-info {
  flex: 1;
  overflow: hidden;
}

.level-name {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 4rpx;
}

.level-difficulty {
  font-size: 24rpx;
  color: #999;
}

.level-stats {
  display: flex;
  gap: 24rpx;
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #F0F0F0;
}

.stat-item {
  font-size: 24rpx;
  color: #999;
}

.locked-hint {
  margin-top: 12rpx;
}

.lock-text {
  font-size: 24rpx;
  color: #CCC;
}

/* Footer */
.page-footer {
  text-align: center;
  padding-top: 20rpx;
}

.footer-progress {
  font-size: 24rpx;
  color: #999;
}
</style>
