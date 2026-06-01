<template>
  <view class="result-page">
    <!-- Loading / no data -->
    <view v-if="!result" class="center-state">
      <EmptyState icon="😕" message="暂无答题结果" action-text="返回首页" @action="goHome" />
    </view>

    <!-- Result display -->
    <template v-else>
      <!-- Result header -->
      <view class="result-header" :class="{ passed: result.passed, failed: !result.passed }">
        <text class="result-emoji">{{ result.passed ? '🎉' : '💪' }}</text>
        <text class="result-title">{{ result.passed ? '恭喜通关!' : '继续加油!' }}</text>
        <text class="result-subtitle">
          {{ result.passed ? `成功通过第${levelNo}关 · ${levelName}` : `第${levelNo}关挑战失败` }}
        </text>
      </view>

      <!-- Score card -->
      <view class="score-card">
        <view class="score-row">
          <view class="score-item">
            <text class="score-value">{{ result.totalScore || 0 }}</text>
            <text class="score-label">本次得分</text>
          </view>
          <view class="score-divider"></view>
          <view class="score-item">
            <text class="score-value">{{ correctCount }}/{{ totalQuestions }}</text>
            <text class="score-label">答对题数</text>
          </view>
          <view class="score-divider"></view>
          <view class="score-item">
            <text class="score-value">{{ avgTime }}s</text>
            <text class="score-label">平均用时</text>
          </view>
        </view>

        <view v-if="result.bonusEarned" class="bonus-tip">
          <text>🎁 通关奖励 +{{ result.bonusEarned }} 分</text>
        </view>
      </view>

      <!-- Per-question details -->
      <view class="details-section">
        <text class="section-title">答题详情</text>
        <view
          v-for="(q, idx) in sortedQuestions"
          :key="q.id"
          class="detail-item"
          :class="{ correct: isCorrect(q), wrong: !isCorrect(q) }"
        >
          <view class="detail-header">
            <text class="detail-number">Q{{ idx + 1 }}</text>
            <text class="detail-icon">{{ isCorrect(q) ? '✓' : '✗' }}</text>
            <text class="detail-time">{{ q.timeTaken || 0 }}s</text>
          </view>
          <text class="detail-content">{{ q.content }}</text>
          <view class="detail-answer">
            <text v-if="q.userAnswer >= 0">
              你的答案: {{ OPTION_LABELS[q.userAnswer] }}. {{ q.options[q.userAnswer] }}
            </text>
            <text v-else class="no-answer">未作答</text>
          </view>
          <text v-if="!isCorrect(q)" class="detail-correct">
            正确答案: {{ OPTION_LABELS[q.correctAnswer] }}. {{ q.options[q.correctAnswer] }}
          </text>
        </view>
      </view>

      <!-- Action buttons -->
      <view class="action-buttons">
        <template v-if="result.passed">
          <button class="btn-primary" @click="goNextLevel">下一关</button>
        </template>
        <button v-else class="btn-primary" @click="retryLevel">再来一次</button>
        <button class="btn-secondary" @click="goLevels">返回关卡列表</button>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import EmptyState from '../../components/EmptyState.vue'

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F']

const result = ref(null)
const questions = ref([])
const categoryName = ref('')
const levelId = ref('')
const levelName = ref('')
const levelNo = ref('')

const correctCount = computed(() => {
  return questions.value.filter((q) => q.userAnswer === q.correctAnswer).length
})

const totalQuestions = computed(() => questions.value.length)

const avgTime = computed(() => {
  if (questions.value.length === 0) return 0
  const total = questions.value.reduce((sum, q) => sum + (q.timeTaken || 0), 0)
  return Math.round(total / questions.value.length)
})

const isCorrect = (q) => q.userAnswer === q.correctAnswer

const sortedQuestions = computed(() => {
  return [...questions.value].sort((a, b) => (a.id || 0) - (b.id || 0))
})

const categoryId = ref('')

const goLevels = () => {
  uni.navigateBack({ delta: 1 })
}

const goHome = () => {
  uni.switchTab({ url: '/pages/index/index' })
}

const retryLevel = () => {
  uni.redirectTo({
    url: `/pages/quiz/playing?levelId=${levelId.value}&categoryId=${categoryId.value}&categoryName=${encodeURIComponent(categoryName.value)}&levelName=${encodeURIComponent(levelName.value)}&levelNo=${levelNo.value}`,
  })
}

const goNextLevel = () => {
  goHome()
}

onLoad(() => {
  const app = getApp()
  if (app.globalData && app.globalData.quizResult) {
    result.value = app.globalData.quizResult
    questions.value = app.globalData.quizQuestions || []
    categoryName.value = app.globalData.categoryName || ''
    categoryId.value = app.globalData.categoryId || ''
    levelId.value = app.globalData.levelId || ''
    levelName.value = app.globalData.levelName || ''
    levelNo.value = app.globalData.levelNo || ''

    // Clean up
    delete app.globalData.quizResult
    delete app.globalData.quizQuestions
    delete app.globalData.categoryId
    delete app.globalData.levelId
    delete app.globalData.levelName
    delete app.globalData.levelNo
    delete app.globalData.categoryName
  }
})
</script>

<style scoped>
.result-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 60rpx;
}

.center-state {
  padding-top: 200rpx;
}

/* Header */
.result-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 40rpx 40rpx;
  text-align: center;
}

.result-header.passed {
  background: linear-gradient(180deg, #F6FFED 0%, #F5F5F5 100%);
}

.result-header.failed {
  background: linear-gradient(180deg, #FFF5F0 0%, #F5F5F5 100%);
}

.result-emoji {
  font-size: 100rpx;
  margin-bottom: 16rpx;
}

.result-title {
  font-size: 44rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.result-subtitle {
  font-size: 28rpx;
  color: #999;
}

/* Score card */
.score-card {
  margin: 0 24rpx 32rpx;
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.score-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.score-value {
  font-size: 44rpx;
  font-weight: bold;
  color: #FF6B35;
  margin-bottom: 8rpx;
}

.score-label {
  font-size: 24rpx;
  color: #999;
}

.score-divider {
  width: 1rpx;
  height: 60rpx;
  background: #F0F0F0;
}

.bonus-tip {
  text-align: center;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #F0F0F0;
  font-size: 26rpx;
  color: #FF6B35;
}

/* Details */
.details-section {
  margin: 0 24rpx;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.detail-item {
  background: #FFFFFF;
  border-radius: 14rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 16rpx;
  border-left: 6rpx solid #E5E5E5;
}

.detail-item.correct {
  border-left-color: #52C41A;
}

.detail-item.wrong {
  border-left-color: #FF4D4F;
}

.detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.detail-number {
  font-size: 24rpx;
  color: #999;
  font-weight: bold;
  margin-right: 12rpx;
}

.detail-icon {
  font-size: 28rpx;
  font-weight: bold;
  margin-right: 12rpx;
}

.detail-item.correct .detail-icon { color: #52C41A; }
.detail-item.wrong .detail-icon { color: #FF4D4F; }

.detail-time {
  font-size: 22rpx;
  color: #CCC;
}

.detail-content {
  display: block;
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  margin-bottom: 12rpx;
}

.detail-answer {
  font-size: 24rpx;
  color: #666;
  padding: 12rpx 16rpx;
  background: #F9F9F9;
  border-radius: 8rpx;
  margin-bottom: 8rpx;
}

.no-answer {
  color: #CCC;
  font-style: italic;
}

.detail-correct {
  font-size: 24rpx;
  color: #52C41A;
  padding: 12rpx 16rpx;
  background: #F6FFED;
  border-radius: 8rpx;
  display: block;
}

/* Action buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 32rpx 24rpx;
  margin-top: 16rpx;
}

.btn-primary {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: #FF6B35;
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 44rpx;
  border: none;
}

.btn-primary::after {
  border: none;
}

.btn-secondary {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: #F5F5F5;
  color: #666;
  font-size: 30rpx;
  border-radius: 44rpx;
  border: none;
}

.btn-secondary::after {
  border: none;
}
</style>
