<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { quizApi } from '@/api/quiz'
import { OPTION_LABELS } from '@/utils/constants'
import Skeleton from '@/components/Skeleton.vue'
import EmptyState from '@/components/EmptyState.vue'

const levelId = ref(0)
const loading = ref(true)
const loadError = ref(false)
const review = ref(null)

onLoad((options) => {
  levelId.value = Number(options.levelId)
  fetchReview()
})

async function fetchReview() {
  loading.value = true
  loadError.value = false
  try {
    const data = await quizApi.getReview(levelId.value)
    review.value = data
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <view class="page">
    <Skeleton v-if="loading" type="list" :count="3" />

    <EmptyState
      v-else-if="loadError"
      message="加载失败"
      :showAction="true"
      actionText="重试"
      @action="fetchReview"
    />

    <view v-else-if="review" class="review-content">
      <!-- 回顾头部 -->
      <view class="review-header" :class="{ passed: review.isPassed }">
        <text class="review-icon">{{ review.isPassed ? '🎉' : '😔' }}</text>
        <view class="header-info">
          <text class="header-title">{{ review.levelName }}</text>
          <text class="header-score">答对 {{ review.correctCount }}/{{ review.totalQuestions }}</text>
        </view>
      </view>

      <!-- 题目列表（含正确答案和解释） -->
      <view class="question-list">
        <view
          v-for="(item, idx) in review.details"
          :key="item.questionId"
          class="question-card"
          :class="{ correct: item.isCorrect, wrong: !item.isCorrect }"
        >
          <view class="q-header">
            <text class="q-num">第{{ idx + 1 }}题</text>
            <text class="q-result">{{ item.isCorrect ? '✓' : '✕' }}</text>
          </view>
          <text class="q-content">{{ item.content }}</text>

          <view class="q-options">
            <view
              v-for="(opt, oi) in item.options"
              :key="oi"
              class="q-option"
              :class="{
                'is-correct': OPTION_LABELS[oi] === item.correctAnswer,
                'is-selected': OPTION_LABELS[oi] === item.selectedAnswer,
                'is-wrong-selected': OPTION_LABELS[oi] === item.selectedAnswer && !item.isCorrect
              }"
            >
              <text class="option-dot">{{ OPTION_LABELS[oi] }}</text>
              <text class="option-text">{{ opt }}</text>
              <text v-if="OPTION_LABELS[oi] === item.correctAnswer" class="option-mark">✓</text>
            </view>
          </view>

          <view v-if="item.explanation" class="q-explanation">
            <text class="explanation-label">解析：</text>
            <text class="explanation-text">{{ item.explanation }}</text>
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

.review-header {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 24rpx;
}

.review-icon {
  font-size: 56rpx;
  margin-right: 20rpx;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.header-score {
  font-size: 26rpx;
  color: #999;
  margin-top: 4rpx;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.question-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  border-left: 6rpx solid #eee;
}

.question-card.correct {
  border-left-color: #4CAF50;
}

.question-card.wrong {
  border-left-color: #F44336;
}

.q-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.q-num {
  font-size: 24rpx;
  color: #999;
}

.q-result {
  font-size: 30rpx;
  font-weight: bold;
}

.question-card.correct .q-result { color: #4CAF50; }
.question-card.wrong .q-result { color: #F44336; }

.q-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
}

.q-options {
  margin-top: 16rpx;
}

.q-option {
  display: flex;
  align-items: center;
  padding: 14rpx 16rpx;
  border-radius: 8rpx;
  margin-bottom: 8rpx;
  background: #fafafa;
}

.q-option.is-correct {
  background: rgba(76, 175, 80, 0.1);
}

.q-option.is-wrong-selected {
  background: rgba(244, 67, 54, 0.1);
}

.option-dot {
  width: 40rpx;
  height: 40rpx;
  line-height: 40rpx;
  text-align: center;
  background: #f0f0f0;
  border-radius: 50%;
  font-size: 24rpx;
  color: #666;
  margin-right: 12rpx;
  flex-shrink: 0;
}

.q-option.is-correct .option-dot {
  background: #4CAF50;
  color: #fff;
}

.q-option.is-wrong-selected .option-dot {
  background: #F44336;
  color: #fff;
}

.option-text {
  flex: 1;
  font-size: 26rpx;
  color: #333;
}

.option-mark {
  color: #4CAF50;
  font-weight: bold;
}

.q-explanation {
  background: #f9f9f9;
  border-radius: 8rpx;
  padding: 16rpx;
  margin-top: 12rpx;
}

.explanation-label {
  font-size: 24rpx;
  color: #FF6B35;
  font-weight: 500;
}

.explanation-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
}
</style>
