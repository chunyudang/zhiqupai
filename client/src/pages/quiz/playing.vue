<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { quizApi } from '@/api/quiz'
import { QUIZ_CONFIG, OPTION_LABELS } from '@/utils/constants'
import NavBar from '@/components/NavBar.vue'

// 去掉选项文本中的 A./A、/A: 等前缀标识
function cleanOptionText(options) {
  const arr = typeof options === 'string' ? JSON.parse(options) : options
  if (!Array.isArray(arr)) return []
  return arr.map((opt) => String(opt).replace(/^[A-Z][.、:：)\]）]\s*/, '').trim())
}

const levelId = ref(0)
const categoryId = ref(0)
const pageState = ref('loading') // loading | countdown | playing | submitting | error
const errorMsg = ref('')

// 答题数据
const attemptId = ref('')
const questions = ref([])
const currentIndex = ref(0)
const answers = ref([]) // [{ questionId, selectedAnswer, timeTaken }]
const countdownNum = ref(3) // 3-2-1 倒计时
const timeLeft = ref(20) // 每题倒计时
let timerInterval = null
let countdownInterval = null

onLoad((options) => {
  levelId.value = Number(options.levelId)
  categoryId.value = Number(options.categoryId)
  startQuiz()
})

onBeforeUnmount(() => {
  clearAllTimers()
})

function clearAllTimers() {
  if (timerInterval) clearInterval(timerInterval)
  if (countdownInterval) clearInterval(countdownInterval)
}

async function startQuiz() {
  pageState.value = 'loading'
  try {
    const data = await quizApi.startQuiz(levelId.value)
    attemptId.value = data.attemptId
    questions.value = data.questions.map((q) => ({
      ...q,
      options: cleanOptionText(q.options)
    }))
    currentIndex.value = 0
    countdownNum.value = QUIZ_CONFIG.COUNTDOWN_START

    // 初始化答案数组
    answers.value = questions.value.map((q) => ({
      questionId: q.id,
      selectedAnswer: '',
      timeTaken: 0
    }))

    // 3-2-1 倒计时
    pageState.value = 'countdown'
    countdownInterval = setInterval(() => {
      countdownNum.value--
      if (countdownNum.value <= 0) {
        clearInterval(countdownInterval)
        startQuestion()
      }
    }, 1000)
  } catch (err) {
    pageState.value = 'error'
    errorMsg.value = err.message || '加载失败'
  }
}

function startQuestion() {
  pageState.value = 'playing'
  timeLeft.value = QUIZ_CONFIG.TIME_PER_QUESTION
  answers.value[currentIndex.value].timeTaken = 0

  timerInterval = setInterval(() => {
    timeLeft.value--
    answers.value[currentIndex.value].timeTaken++

    if (timeLeft.value <= 0) {
      // 超时，自动跳到下一题
      clearInterval(timerInterval)
      nextQuestion()
    }
  }, 1000)
}

function selectAnswer(optionIndex) {
  if (pageState.value !== 'playing') return
  clearInterval(timerInterval)

  const selectedAnswer = OPTION_LABELS[optionIndex]
  answers.value[currentIndex.value].selectedAnswer = selectedAnswer

  // 短暂显示选中状态后进入下一题
  setTimeout(() => {
    nextQuestion()
  }, 500)
}

function nextQuestion() {
  if (currentIndex.value < QUIZ_CONFIG.QUESTIONS_PER_LEVEL - 1) {
    currentIndex.value++
    startQuestion()
  } else {
    submitQuiz()
  }
}

async function submitQuiz() {
  pageState.value = 'submitting'
  clearAllTimers()

  try {
    const result = await quizApi.submitQuiz(attemptId.value, answers.value)
    // 将结果保存到 globalData 供 result 页面使用
    const app = getApp()
    app.globalData = app.globalData || {}
    app.globalData.quizResult = {
      ...result,
      levelId: levelId.value,
      categoryId: categoryId.value,
      questions: questions.value,
      answers: answers.value
    }
    uni.redirectTo({ url: '/pages/quiz/result' })
  } catch (err) {
    pageState.value = 'error'
    errorMsg.value = err.message || '提交失败'
  }
}

// 计算进度百分比
const progressPercent = computed(() => {
  return ((currentIndex.value) / QUIZ_CONFIG.QUESTIONS_PER_LEVEL) * 100
})
</script>

<template>
  <view class="playing-page">
    <NavBar title="答题中" @back="uni.navigateBack()" />

    <!-- 加载中 -->
    <view v-if="pageState === 'loading'" class="state-box">
      <view class="spinner" />
      <text>加载题目中...</text>
    </view>

    <!-- 3-2-1 倒计时 -->
    <view v-else-if="pageState === 'countdown'" class="countdown-box">
      <text class="countdown-num">{{ countdownNum }}</text>
    </view>

    <!-- 错误 -->
    <view v-else-if="pageState === 'error'" class="state-box">
      <text class="error-text">{{ errorMsg }}</text>
      <button class="retry-btn" @click="startQuiz">重试</button>
    </view>

    <!-- 提交中 -->
    <view v-else-if="pageState === 'submitting'" class="state-box">
      <view class="spinner" />
      <text>提交中...</text>
    </view>

    <!-- 答题中 -->
    <view v-else-if="pageState === 'playing' && questions.length > 0" class="quiz-area">
      <!-- 进度条 -->
      <view class="progress-section">
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: ((currentIndex + 1) / QUIZ_CONFIG.QUESTIONS_PER_LEVEL * 100) + '%' }" />
        </view>
        <text class="progress-text">{{ currentIndex + 1 }}/{{ QUIZ_CONFIG.QUESTIONS_PER_LEVEL }}</text>
      </view>

      <!-- 倒计时 -->
      <view class="timer-section">
        <view class="timer-ring" :class="{ 'timer-warning': timeLeft <= 5 }">
          <text class="timer-num">{{ timeLeft }}</text>
          <text class="timer-unit">秒</text>
        </view>
      </view>

      <!-- 题目 -->
      <view class="question-section">
        <text class="question-text">{{ questions[currentIndex].content }}</text>
      </view>

      <!-- 选项 -->
      <view class="options-section">
        <button
          v-for="(option, oi) in questions[currentIndex].options"
          :key="oi"
          class="option-btn"
          :class="{ selected: answers[currentIndex].selectedAnswer === OPTION_LABELS[oi] }"
          @click="selectAnswer(oi)"
        >
          <text class="option-label">{{ OPTION_LABELS[oi] }}</text>
          <text class="option-text">{{ option }}</text>
        </button>
      </view>
    </view>
  </view>
</template>

<style scoped>
.playing-page {
  min-height: 100vh;
  background: #F5F5F5;
}

.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
  font-size: 28rpx;
  color: #999;
}

.spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #f0f0f0;
  border-top-color: #FF6B35;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 20rpx;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.countdown-box {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80vh;
}

.countdown-num {
  font-size: 200rpx;
  font-weight: bold;
  color: #FF6B35;
  animation: pulse 0.5s ease-out;
}

@keyframes pulse {
  0% { transform: scale(1.5); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}

.error-text {
  color: #F44336;
  margin-bottom: 24rpx;
}

.retry-btn {
  padding: 12rpx 48rpx;
  font-size: 28rpx;
  color: #FF6B35;
  background: rgba(255, 107, 53, 0.1);
  border: none;
  border-radius: 40rpx;
}

.quiz-area {
  padding: 24rpx;
}

.progress-section {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.progress-bar {
  flex: 1;
  height: 10rpx;
  background: #eee;
  border-radius: 5rpx;
  margin-right: 12rpx;
}

.progress-fill {
  height: 100%;
  background: #FF6B35;
  border-radius: 5rpx;
  transition: width 0.3s;
}

.progress-text {
  font-size: 24rpx;
  color: #999;
}

.timer-section {
  display: flex;
  justify-content: center;
  margin-bottom: 40rpx;
}

.timer-ring {
  width: 120rpx;
  height: 120rpx;
  border: 6rpx solid #FF6B35;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s;
}

.timer-warning {
  border-color: #F44336;
}

.timer-num {
  font-size: 44rpx;
  font-weight: bold;
  color: #333;
}

.timer-unit {
  font-size: 22rpx;
  color: #999;
}

.question-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx 24rpx;
  margin-bottom: 32rpx;
}

.question-text {
  font-size: 32rpx;
  line-height: 1.6;
  color: #333;
}

.options-section {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.option-btn {
  display: flex;
  align-items: center;
  width: 100%;
  background: #fff;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  padding: 24rpx 24rpx;
  margin: 0;
  margin-left: 0;
  margin-right: 0;
  font-size: 28rpx;
  text-align: left;
  transition: all 0.2s;
  box-sizing: border-box;
}

.option-btn::after {
  border: none;
}

.option-btn.selected {
  border-color: #FF6B35;
  background: rgba(255, 107, 53, 0.05);
}

.option-label {
  width: 48rpx;
  height: 48rpx;
  line-height: 48rpx;
  text-align: center;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 26rpx;
  font-weight: bold;
  color: #666;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.option-btn.selected .option-label {
  background: #FF6B35;
  color: #fff;
}

.option-text {
  color: #333;
  flex: 1;
}
</style>
