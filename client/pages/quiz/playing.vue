<template>
  <view class="playing-page">
    <!-- Loading / Starting quiz -->
    <view v-if="loading" class="center-state">
      <text class="loading-icon">⏳</text>
      <text class="loading-text">正在加载题目...</text>
    </view>

    <!-- Error -->
    <view v-else-if="loadError" class="center-state">
      <EmptyState
        icon="😕"
        message="加载题目失败"
        action-text="重新加载"
        @action="initQuiz"
      />
    </view>

    <!-- Countdown: 3, 2, 1, GO! -->
    <view v-else-if="countdownReady > 0" class="ready-overlay">
      <text class="ready-number">{{ countdownReady }}</text>
    </view>

    <!-- Quiz active -->
    <view v-else-if="questions.length > 0 && !finished" class="quiz-container">
      <!-- Top bar: progress + timer -->
      <view class="quiz-top-bar">
        <view class="progress-wrapper">
          <view class="progress-bar-bg">
            <view class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></view>
          </view>
          <text class="progress-label">{{ currentIndex + 1 }}/{{ questions.length }}</text>
        </view>

        <!-- Timer -->
        <view class="timer" :class="{ 'timer-danger': timer <= 5 }">
          <text class="timer-icon">⏱</text>
          <text class="timer-text">{{ timer }}s</text>
        </view>
      </view>

      <!-- Question card -->
      <view class="question-card">
        <text class="question-text">{{ currentQuestion.content }}</text>

        <!-- Options -->
        <view class="options-list">
          <view
            v-for="(option, idx) in currentQuestion.options"
            :key="idx"
            class="option-item"
            :class="optionClass(idx)"
            @click="selectOption(idx)"
          >
            <view class="option-badge" :class="optionBadgeClass(idx)">
              <text>{{ optionBadgeText(idx) }}</text>
            </view>
            <text class="option-text">{{ option }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Submitting -->
    <view v-else-if="submitting" class="center-state">
      <text class="loading-icon">📊</text>
      <text class="loading-text">正在提交答案...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { startQuiz, submitQuiz } from '../../api/quiz.js'
import EmptyState from '../../components/EmptyState.vue'

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F']
const ANSWER_DELAY = 1000
const READY_DELAY = 1000

const levelId = ref('')
const levelName = ref('')
const levelNo = ref('')
const categoryName = ref('')
const categoryId = ref('')
const attemptId = ref('')

const loading = ref(true)
const loadError = ref(false)
const submitting = ref(false)
const finished = ref(false)

const questions = ref([])
const currentIndex = ref(0)
const timer = ref(20)
const countdownReady = ref(0)
const selectedOption = ref(-1)
const isLocked = ref(false)

let timerInterval = null
let answerTime = 0

const currentQuestion = computed(() => questions.value[currentIndex.value] || {})

const progressPercent = computed(() => {
  if (questions.value.length === 0) return 0
  return Math.round((currentIndex.value / questions.value.length) * 100)
})

const optionClass = (idx) => ({
  'option-selected': selectedOption.value === idx && isLocked.value,
  'option-correct': isLocked.value && idx === currentQuestion.value.correctAnswer,
  'option-wrong': isLocked.value && selectedOption.value === idx && idx !== currentQuestion.value.correctAnswer,
  'option-disabled': isLocked.value,
})

const optionBadgeClass = (idx) => {
  if (!isLocked.value) return 'badge-default'
  if (idx === currentQuestion.value.correctAnswer) return 'badge-correct'
  if (selectedOption.value === idx && idx !== currentQuestion.value.correctAnswer) return 'badge-wrong'
  return 'badge-disabled'
}

const optionBadgeText = (idx) => {
  if (!isLocked.value) return OPTION_LABELS[idx] || idx
  if (idx === currentQuestion.value.correctAnswer) return '✓'
  if (selectedOption.value === idx && idx !== currentQuestion.value.correctAnswer) return '✗'
  return OPTION_LABELS[idx] || idx
}

const doCountdown = () => {
  return new Promise((resolve) => {
    countdownReady.value = 3
    const interval = setInterval(() => {
      countdownReady.value--
      if (countdownReady.value <= 0) {
        clearInterval(interval)
        resolve()
      }
    }, READY_DELAY)
  })
}

const startTimer = () => {
  timer.value = 20
  answerTime = Date.now()
  clearInterval(timerInterval)

  timerInterval = setInterval(() => {
    timer.value--
    if (timer.value <= 0) {
      clearInterval(timerInterval)
      if (!isLocked.value) {
        handleTimeout()
      }
    }
  }, 1000)
}

const handleTimeout = () => {
  isLocked.value = true
  selectedOption.value = -1
  setTimeout(() => {
    advanceQuestion()
  }, ANSWER_DELAY)
}

const selectOption = (idx) => {
  if (isLocked.value) return
  isLocked.value = true
  clearInterval(timerInterval)

  selectedOption.value = idx
  const timeTaken = Math.round((Date.now() - answerTime) / 1000)

  questions.value[currentIndex.value].userAnswer = idx
  questions.value[currentIndex.value].timeTaken = timeTaken

  setTimeout(() => {
    advanceQuestion()
  }, ANSWER_DELAY)
}

const advanceQuestion = () => {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
    selectedOption.value = -1
    isLocked.value = false
    startTimer()
  } else {
    submit()
  }
}

const initQuiz = async () => {
  loading.value = true
  loadError.value = false

  try {
    const data = await startQuiz(levelId.value)
    attemptId.value = data.attemptId
    questions.value = (data.questions || []).map((q) => ({
      ...q,
      userAnswer: -1,
      timeTaken: 0,
    }))

    if (questions.value.length === 0) {
      loadError.value = true
      return
    }

    loading.value = false
    await doCountdown()
    startTimer()
  } catch (err) {
    console.error('[Playing] startQuiz error:', err)
    loadError.value = true
    loading.value = false
  }
}

const submit = async () => {
  submitting.value = true
  clearInterval(timerInterval)

  try {
    const answers = questions.value.map((q) => ({
      questionId: q.id,
      selectedAnswer: q.userAnswer >= 0 ? q.userAnswer : -1,
      timeTaken: q.timeTaken || 0,
    }))

    const result = await submitQuiz(attemptId.value, answers)
    finished.value = true
    submitting.value = false

    const app = getApp()
    app.globalData = app.globalData || {}
    app.globalData.quizResult = result
    app.globalData.quizQuestions = questions.value
    app.globalData.categoryId = categoryId.value
    app.globalData.levelId = levelId.value
    app.globalData.levelName = levelName.value
    app.globalData.levelNo = levelNo.value
    app.globalData.categoryName = categoryName.value

    uni.redirectTo({ url: '/pages/quiz/result' })
  } catch (err) {
    console.error('[Playing] submit error:', err)
    submitting.value = false
    uni.showToast({ title: err.message || '提交失败', icon: 'none' })
  }
}

onLoad((options) => {
  levelId.value = options.levelId || ''
  categoryId.value = options.categoryId || ''
  categoryName.value = options.categoryName ? decodeURIComponent(options.categoryName) : ''
  levelName.value = options.levelName ? decodeURIComponent(options.levelName) : ''
  levelNo.value = options.levelNo || ''

  if (levelId.value) {
    uni.setNavigationBarTitle({ title: `第${levelNo.value}关 · ${levelName.value}` })
    initQuiz()
  }
})

onUnmounted(() => {
  clearInterval(timerInterval)
})
</script>

<style scoped>
.playing-page {
  min-height: 100vh;
  background: #F5F5F5;
  display: flex;
  flex-direction: column;
}

.center-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx;
}

.loading-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}

/* Ready countdown overlay */
.ready-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.ready-number {
  font-size: 160rpx;
  font-weight: bold;
  color: #FF6B35;
  animation: pulse 1s ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

/* Top bar */
.quiz-top-bar {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  background: #FFFFFF;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.progress-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
}

.progress-bar-bg {
  flex: 1;
  height: 10rpx;
  background: #F0F0F0;
  border-radius: 5rpx;
  overflow: hidden;
  margin-right: 16rpx;
}

.progress-bar-fill {
  height: 100%;
  background: #FF6B35;
  border-radius: 5rpx;
  transition: width 0.3s ease;
}

.progress-label {
  font-size: 26rpx;
  color: #999;
  flex-shrink: 0;
  min-width: 64rpx;
  text-align: right;
}

.timer {
  display: flex;
  align-items: center;
  padding: 8rpx 20rpx;
  border-radius: 40rpx;
  background: #F5F5F5;
  margin-left: 20rpx;
  flex-shrink: 0;
}

.timer-danger {
  background: #FFF0F0;
}

.timer-icon {
  font-size: 28rpx;
  margin-right: 6rpx;
}

.timer-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  font-variant-numeric: tabular-nums;
}

.timer-danger .timer-text {
  color: #FF4D4F;
}

/* Question */
.quiz-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.question-card {
  flex: 1;
  padding: 40rpx 32rpx;
}

.question-text {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.8;
  margin-bottom: 48rpx;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  border: 2rpx solid #F0F0F0;
  transition: all 0.2s;
}

.option-item:active {
  transform: scale(0.98);
}

.option-item.option-disabled {
  opacity: 0.5;
}

.option-item.option-selected {
  border-color: #FF6B35;
  background: #FFF5F0;
}

.option-item.option-correct {
  border-color: #52C41A;
  background: #F6FFED;
}

.option-item.option-wrong {
  border-color: #FF4D4F;
  background: #FFF0F0;
}

.option-badge {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 20rpx;
  font-size: 24rpx;
  font-weight: bold;
}

.badge-default {
  background: #F5F5F5;
  color: #999;
}

.badge-correct {
  background: #52C41A;
  color: #FFFFFF;
}

.badge-wrong {
  background: #FF4D4F;
  color: #FFFFFF;
}

.badge-disabled {
  background: #F5F5F5;
  color: #CCC;
}

.option-text {
  font-size: 30rpx;
  color: #333;
  flex: 1;
  line-height: 1.6;
}
</style>
