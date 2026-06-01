<template>
  <view class="review-page">
    <!-- Loading -->
    <view v-if="loading" class="center-state">
      <view v-for="i in 6" :key="i" class="review-card skeleton-card">
        <Skeleton type="card" />
      </view>
    </view>

    <!-- Error -->
    <view v-else-if="loadError" class="center-state">
      <EmptyState icon="😕" message="加载回顾失败" action-text="重新加载" @action="loadReview" />
    </view>

    <!-- Empty -->
    <view v-else-if="questions.length === 0" class="center-state">
      <EmptyState icon="📭" message="暂无关卡数据" />
    </view>

    <!-- Review content -->
    <template v-else>
      <!-- Header -->
      <view class="review-header">
        <view class="header-score">
          <text class="header-emoji">{{ headerEmoji }}</text>
          <text class="header-title">{{ headerTitle }}</text>
        </view>
        <view class="header-stats">
          <text class="stat">正确 {{ correctCount }}/{{ questions.length }}</text>
          <text class="stat-sep">|</text>
          <text class="stat">总得分 {{ totalScore }}分</text>
        </view>
      </view>

      <!-- Question list -->
      <view class="question-list">
        <view
          v-for="(q, idx) in questions"
          :key="q.id"
          class="review-card"
          :class="{ correct: q.userAnswer === q.correctAnswer, wrong: q.userAnswer !== q.correctAnswer }"
        >
          <view class="review-card-header">
            <text class="q-num">Q{{ idx + 1 }}</text>
            <text class="q-icon">{{ q.userAnswer === q.correctAnswer ? '✓' : '✗' }}</text>
            <text class="q-time">{{ q.timeTaken || 0 }}s</text>
          </view>

          <text class="q-content">{{ q.content }}</text>

          <view class="q-options">
            <view
              v-for="(opt, oi) in q.options"
              :key="oi"
              class="q-option"
              :class="{
                'opt-correct': oi === q.correctAnswer,
                'opt-wrong': oi === q.userAnswer && oi !== q.correctAnswer,
                'opt-muted': oi !== q.correctAnswer && oi !== q.userAnswer,
              }"
            >
              <text class="opt-label">{{ LABELS[oi] }}.</text>
              <text class="opt-text">{{ opt }}</text>
            </view>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getReview } from '../../api/quiz.js'
import Skeleton from '../../components/Skeleton.vue'
import EmptyState from '../../components/EmptyState.vue'

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F']

const levelId = ref('')
const questions = ref([])
const totalScore = ref(0)
const loading = ref(true)
const loadError = ref(false)

const correctCount = computed(() => {
  return questions.value.filter((q) => q.userAnswer === q.correctAnswer).length
})

const headerEmoji = computed(() => {
  return correctCount.value >= 4 ? '🎉' : '😔'
})

const headerTitle = computed(() => {
  if (correctCount.value >= 4) return '通关成功'
  return '挑战失败'
})

const loadReview = async () => {
  loading.value = true
  loadError.value = false

  try {
    const data = await getReview(levelId.value)
    questions.value = data.questions || []
    totalScore.value = data.totalScore || 0
  } catch (err) {
    console.error('[Review] loadReview error:', err)
    loadError.value = true
  } finally {
    loading.value = false
  }
}

onLoad((options) => {
  levelId.value = options.levelId || ''
  if (levelId.value) {
    uni.setNavigationBarTitle({ title: '关卡回顾' })
    loadReview()
  }
})
</script>

<style scoped>
.review-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding: 20rpx 24rpx;
  padding-bottom: 60rpx;
}

.center-state {
  padding-top: 100rpx;
}

/* Header */
.review-header {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  text-align: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.header-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16rpx;
}

.header-emoji {
  font-size: 72rpx;
  margin-bottom: 8rpx;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.header-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12rpx;
}

.stat {
  font-size: 26rpx;
  color: #666;
}

.stat-sep {
  color: #E5E5E5;
}

/* Review cards */
.question-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.review-card {
  background: #FFFFFF;
  border-radius: 14rpx;
  padding: 24rpx;
  border-left: 6rpx solid #E5E5E5;
}

.review-card.correct {
  border-left-color: #52C41A;
}

.review-card.wrong {
  border-left-color: #FF4D4F;
}

.skeleton-card {
  border-left: none;
}

.review-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.q-num {
  font-size: 24rpx;
  color: #999;
  font-weight: bold;
  margin-right: 12rpx;
}

.q-icon {
  font-size: 28rpx;
  font-weight: bold;
  margin-right: 12rpx;
}

.review-card.correct .q-icon { color: #52C41A; }
.review-card.wrong .q-icon { color: #FF4D4F; }

.q-time {
  font-size: 22rpx;
  color: #CCC;
}

.q-content {
  display: block;
  font-size: 28rpx;
  color: #333;
  line-height: 1.7;
  margin-bottom: 16rpx;
}

.q-options {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.q-option {
  display: flex;
  align-items: center;
  padding: 14rpx 16rpx;
  border-radius: 10rpx;
  font-size: 26rpx;
}

.opt-correct {
  background: #F6FFED;
  color: #52C41A;
}

.opt-wrong {
  background: #FFF0F0;
  color: #FF4D4F;
}

.opt-muted {
  background: #FAFAFA;
  color: #CCC;
}

.opt-label {
  font-weight: bold;
  margin-right: 12rpx;
  flex-shrink: 0;
}

.opt-text {
  flex: 1;
  line-height: 1.5;
}
</style>
