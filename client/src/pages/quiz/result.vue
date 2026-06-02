<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { QUIZ_CONFIG, OPTION_LABELS } from '@/utils/constants'
import NavBar from '@/components/NavBar.vue'

const levelId = ref(0)
const categoryId = ref(0)
const result = ref(null)
const questions = ref([])
const answers = ref([])

onLoad(() => {
  const app = getApp()
  const data = app.globalData?.quizResult

  if (!data) {
    uni.showToast({ title: '数据异常', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1000)
    return
  }

  result.value = data
  levelId.value = data.levelId
  categoryId.value = data.categoryId
  questions.value = data.questions || []
  answers.value = data.answers || []

  // 清除 globalData
  app.globalData.quizResult = null
})

function handleRetry() {
  uni.redirectTo({ url: `/pages/quiz/playing?levelId=${levelId.value}&categoryId=${categoryId.value}` })
}

function handleNextLevel() {
  uni.navigateBack()
}

function goBack() {
  uni.navigateBack()
}

// 合并题目和答案数据用于展示
const details = computed(() => {
  if (!questions.value.length || !answers.value.length) return []
  return questions.value.map((q, i) => {
    const ans = answers.value[i] || {}
    const answerIndex = OPTION_LABELS.indexOf(ans.selectedAnswer)
    return {
      ...q,
      selectedLabel: ans.selectedAnswer || '—',
      selectedIndex: answerIndex,
      isCorrect: result.value?.details?.[i]?.isCorrect || false
    }
  })
})

import { computed } from 'vue'
</script>

<template>
  <view class="result-page">
    <NavBar title="答题结果" />

    <view v-if="result" class="result-content">
      <!-- 结果头部 -->
      <view class="result-header" :class="{ passed: result.isPassed, failed: !result.isPassed }">
        <text class="result-icon">{{ result.isPassed ? '🎉' : '😔' }}</text>
        <text class="result-title">{{ result.isPassed ? '恭喜通关！' : '未通过' }}</text>
        <text v-if="result.isReplay" class="replay-tip">（重复答题，不计分）</text>
      </view>

      <!-- 得分卡片 -->
      <view class="score-card">
        <view class="score-main">
          <text class="score-num">{{ result.isReplay ? 0 : result.score }}</text>
          <text class="score-unit">分</text>
        </view>
        <view class="score-detail">
          <view class="detail-item">
            <text class="detail-label">答对</text>
            <text class="detail-value correct">{{ result.correctCount }}/{{ result.totalQuestions }}</text>
          </view>
          <view class="detail-divider" />
          <view class="detail-item">
            <text class="detail-label">正确率</text>
            <text class="detail-value">{{ Math.round((result.correctCount / result.totalQuestions) * 100) }}%</text>
          </view>
          <view class="detail-divider" />
          <view class="detail-item">
            <text class="detail-label">通关要求</text>
            <text class="detail-value">{{ QUIZ_CONFIG.PASS_SCORE }}/{{ QUIZ_CONFIG.QUESTIONS_PER_LEVEL }}</text>
          </view>
        </view>
      </view>

      <!-- 答题明细 -->
      <view class="detail-section">
        <text class="section-title">答题明细</text>
        <view class="detail-list">
          <view
            v-for="(item, index) in details"
            :key="item.id"
            class="detail-card"
            :class="{ correct: item.isCorrect, wrong: !item.isCorrect }"
          >
            <view class="detail-header">
              <text class="detail-num">第{{ index + 1 }}题</text>
              <text class="detail-result">{{ item.isCorrect ? '✓ 正确' : '✕ 错误' }}</text>
            </view>
            <text class="detail-question">{{ item.content }}</text>
            <view class="detail-answer">
              <text class="answer-label">你的答案：</text>
              <text class="answer-value" :class="{ 'text-correct': item.isCorrect, 'text-wrong': !item.isCorrect }">
                {{ item.selectedLabel }}{{ item.selectedIndex !== -1 ? '. ' + item.options[item.selectedIndex] : '' }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-bar">
        <button class="action-btn secondary-btn" @click="goBack">返回关卡</button>
        <button v-if="!result.isPassed" class="action-btn primary-btn" @click="handleRetry">再来一次</button>
        <button v-else class="action-btn primary-btn" @click="handleNextLevel">下一关</button>
      </view>
    </view>
  </view>
</template>

<style scoped>
.result-page {
  min-height: 100vh;
  background: #F5F5F5;
}

.result-content {
  padding: 24rpx;
}

.result-header {
  text-align: center;
  padding: 40rpx 0 24rpx;
}

.result-icon {
  font-size: 80rpx;
  display: block;
}

.result-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-top: 12rpx;
  display: block;
}

.passed .result-title { color: #4CAF50; }
.failed .result-title { color: #F44336; }

.replay-tip {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-top: 8rpx;
}

.score-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 36rpx 24rpx;
  margin-bottom: 24rpx;
}

.score-main {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 24rpx;
}

.score-num {
  font-size: 72rpx;
  font-weight: bold;
  color: #FF6B35;
}

.score-unit {
  font-size: 28rpx;
  color: #999;
  margin-left: 8rpx;
}

.score-detail {
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24rpx;
}

.detail-label {
  font-size: 24rpx;
  color: #999;
}

.detail-value {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-top: 4rpx;
}

.correct { color: #4CAF50 !important; }

.detail-divider {
  width: 2rpx;
  height: 50rpx;
  background: #eee;
}

.detail-section {
  margin-bottom: 32rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.detail-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  border-left: 6rpx solid #eee;
}

.detail-card.correct {
  border-left-color: #4CAF50;
}

.detail-card.wrong {
  border-left-color: #F44336;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.detail-num {
  font-size: 24rpx;
  color: #999;
}

.detail-result {
  font-size: 24rpx;
  font-weight: 500;
}

.detail-card.correct .detail-result { color: #4CAF50; }
.detail-card.wrong .detail-result { color: #F44336; }

.detail-question {
  font-size: 26rpx;
  color: #333;
  line-height: 1.5;
}

.detail-answer {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
}

.answer-label {
  font-size: 24rpx;
  color: #999;
}

.answer-value {
  font-size: 24rpx;
}

.text-correct { color: #4CAF50; }
.text-wrong { color: #F44336; }

.action-bar {
  display: flex;
  gap: 20rpx;
  padding-bottom: 40rpx;
}

.action-btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: 600;
  border: none;
  border-radius: 44rpx;
}

.primary-btn {
  background: #FF6B35;
  color: #fff;
}

.secondary-btn {
  background: #f5f5f5;
  color: #666;
}
</style>
