<template>
  <view class="checkin-page">
    <!-- Loading -->
    <view v-if="loading" class="loading-state">
      <view v-for="i in 5" :key="i" class="sk-item">
        <Skeleton type="card" />
      </view>
    </view>

    <!-- Main content -->
    <template v-else>
      <!-- Header stats -->
      <view class="checkin-header">
        <view class="header-card">
          <text class="header-label">连续签到</text>
          <text class="header-value">{{ streakDays }} 天</text>
        </view>
        <view class="header-card">
          <text class="header-label">本月补签</text>
          <text class="header-value">{{ makeupCount }}/{{ makeupLimit }} 次</text>
        </view>
      </view>

      <!-- Today sign-in button -->
      <view class="today-section">
        <button
          v-if="!todayCheckedIn"
          class="checkin-btn"
          :disabled="checkingIn"
          @click="doCheckin"
        >
          {{ checkingIn ? '签到中...' : '签到 +' + todayPoints + ' 分' }}
        </button>
        <view v-else class="checked-in-badge">
          <text class="checked-icon">✅</text>
          <text class="checked-text">今日已签到 +{{ todayPoints }} 分</text>
        </view>
      </view>

      <!-- Month selector -->
      <view class="month-selector">
        <view class="month-arrow" @click="prevMonth">◀</view>
        <text class="month-text">{{ currentYear }}年{{ currentMonth }}月</text>
        <view class="month-arrow" @click="nextMonth">▶</view>
      </view>

      <!-- Weekday headers -->
      <view class="weekday-row">
        <text v-for="d in weekDays" :key="d" class="weekday-item">{{ d }}</text>
      </view>

      <!-- Calendar grid -->
      <view class="calendar-grid">
        <!-- Empty cells for first weekday offset -->
        <view
          v-for="i in firstDayOffset"
          :key="'empty-' + i"
          class="day-cell day-empty"
        ></view>

        <!-- Day cells -->
        <view
          v-for="day in daysInMonth"
          :key="day"
          class="day-cell"
          :class="dayClass(day)"
          @click="handleDayClick(day)"
        >
          <text class="day-number">{{ day }}</text>
          <text v-if="dayPoints(day) > 0" class="day-points">+{{ dayPoints(day) }}</text>
          <view v-if="isCheckedIn(day)" class="day-checked-icon">✓</view>
          <view v-else-if="canMakeup(day)" class="day-makeup-badge">补签 {{ makeupCost }}分</view>
          <view v-else-if="isToday(day)" class="day-today-dot"></view>
        </view>
      </view>

      <!-- Legend -->
      <view class="legend">
        <view class="legend-item">
          <view class="legend-dot legend-checked"></view>
          <text>已签到</text>
        </view>
        <view class="legend-item">
          <view class="legend-dot legend-makeup"></view>
          <text>可补签</text>
        </view>
        <view class="legend-item">
          <view class="legend-dot legend-future"></view>
          <text>未来</text>
        </view>
      </view>

      <!-- Rules info -->
      <view class="rules-section">
        <text class="rules-title">签到规则</text>
        <text class="rules-text">连续签到第1天+1分、第2天+2分...第7天+7分，第8天起固定+7分</text>
        <text class="rules-text">自然月初或断签后重新从第1天开始</text>
        <text class="rules-text">补签消耗{{ makeupCost }}积分/次，每月限{{ makeupLimit }}次</text>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { checkin, makeupCheckin, getCalendar } from '../../api/checkin.js'
import Skeleton from '../../components/Skeleton.vue'

const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const makeupCost = 50
const makeupLimit = 5

const loading = ref(true)
const checkingIn = ref(false)

const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const checkinRecords = ref([])
const streakDays = ref(0)
const makeupCount = ref(0)
const todayPoints = ref(1)

const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 0).getDate()
})

const firstDayOffset = computed(() => {
  return new Date(currentYear.value, currentMonth.value - 1, 1).getDay()
})

const today = computed(() => {
  const now = new Date()
  if (now.getFullYear() === currentYear.value && now.getMonth() + 1 === currentMonth.value) {
    return now.getDate()
  }
  return -1
})

const todayCheckedIn = computed(() => {
  return checkinRecords.value.some(
    (r) => r.date === todayDateStr() && !r.isMakeup
  )
})

const todayDateStr = () => {
  const m = String(currentMonth.value).padStart(2, '0')
  const d = String(today.value).padStart(2, '0')
  return `${currentYear.value}-${m}-${d}`
}

const isToday = (day) => {
  return day === today.value
}

const isCheckedIn = (day) => {
  const dateStr = dateKey(day)
  return checkinRecords.value.some((r) => r.date === dateStr)
}

const canMakeup = (day) => {
  if (day >= today.value) return false
  const dateStr = dateKey(day)
  const alreadyChecked = checkinRecords.value.some((r) => r.date === dateStr)
  if (alreadyChecked) return false
  // Can makeup if within same month and hasn't exceeded limit
  if (makeupCount.value >= makeupLimit) return false
  // Only allow makeup for past but same month
  return true
}

const dayClass = (day) => {
  if (isCheckedIn(day)) return 'day-checked'
  if (canMakeup(day)) return 'day-makeup'
  if (isToday(day)) return 'day-today'
  if (day > today.value) return 'day-future'
  return 'day-missed'
}

const dateKey = (day) => {
  const m = String(currentMonth.value).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${currentYear.value}-${m}-${d}`
}

const dayPoints = (day) => {
  const record = checkinRecords.value.find((r) => r.date === dateKey(day))
  return record ? record.pointsEarned || 0 : 0
}

const loadCalendar = async () => {
  loading.value = true
  try {
    const data = await getCalendar({
      year: currentYear.value,
      month: currentMonth.value,
    })
    checkinRecords.value = data.records || []
    streakDays.value = data.streakDays || 0
    makeupCount.value = data.makeupCount || 0
    todayPoints.value = data.todayPoints || Math.min(streakDays.value + 1, 7)
  } catch (err) {
    console.error('[Checkin] loadCalendar error:', err)
    checkinRecords.value = []
  } finally {
    loading.value = false
  }
}

const doCheckin = async () => {
  checkingIn.value = true
  try {
    const result = await checkin()
    uni.showToast({ title: `签到成功 +${result.pointsEarned || todayPoints.value} 分`, icon: 'success' })
    await loadCalendar()
  } catch (err) {
    console.error('[Checkin] doCheckin error:', err)
  } finally {
    checkingIn.value = false
  }
}

const handleDayClick = async (day) => {
  if (canMakeup(day)) {
    uni.showModal({
      title: '补签确认',
      content: `补签 ${currentYear.value}年${currentMonth.value}月${day}日，将消耗 ${makeupCost} 积分，确定补签吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await makeupCheckin(dateKey(day))
            uni.showToast({ title: '补签成功', icon: 'success' })
            await loadCalendar()
          } catch (err) {
            console.error('[Checkin] makeup error:', err)
          }
        }
      },
    })
  }
}

const prevMonth = () => {
  if (currentMonth.value === 1) {
    currentYear.value--
    currentMonth.value = 12
  } else {
    currentMonth.value--
  }
  loadCalendar()
}

const nextMonth = () => {
  const now = new Date()
  const isFuture =
    currentYear.value > now.getFullYear() ||
    (currentYear.value === now.getFullYear() && currentMonth.value >= now.getMonth() + 1)
  if (isFuture) return

  if (currentMonth.value === 12) {
    currentYear.value++
    currentMonth.value = 1
  } else {
    currentMonth.value++
  }
  loadCalendar()
}

onLoad(() => {
  loadCalendar()
})
</script>

<style scoped>
.checkin-page {
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

/* Header stats */
.checkin-header {
  display: flex;
  padding: 24rpx;
  gap: 16rpx;
}

.header-card {
  flex: 1;
  background: linear-gradient(135deg, #FF6B35, #FF8C5A);
  border-radius: 16rpx;
  padding: 28rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8rpx;
}

.header-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #FFFFFF;
}

/* Today section */
.today-section {
  padding: 0 24rpx 24rpx;
}

.checkin-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  background: linear-gradient(135deg, #FF6B35, #FF8C5A);
  color: #FFFFFF;
  font-size: 34rpx;
  font-weight: bold;
  border-radius: 48rpx;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.3);
}

.checkin-btn::after {
  border: none;
}

.checkin-btn[disabled] {
  opacity: 0.6;
}

.checked-in-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 96rpx;
  background: #F6FFED;
  border-radius: 48rpx;
  border: 2rpx solid #B7EB8F;
}

.checked-icon {
  font-size: 36rpx;
  margin-right: 12rpx;
}

.checked-text {
  font-size: 30rpx;
  color: #52C41A;
  font-weight: bold;
}

/* Month selector */
.month-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
  margin: 0 24rpx;
  background: #FFFFFF;
  border-radius: 16rpx 16rpx 0 0;
}

.month-arrow {
  font-size: 32rpx;
  color: #FF6B35;
  padding: 8rpx 24rpx;
}

.month-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  min-width: 200rpx;
  text-align: center;
}

/* Weekday row */
.weekday-row {
  display: flex;
  margin: 0 24rpx;
  background: #FFFFFF;
  padding: 16rpx 0;
}

.weekday-item {
  flex: 1;
  text-align: center;
  font-size: 24rpx;
  color: #999;
}

/* Calendar grid */
.calendar-grid {
  display: flex;
  flex-wrap: wrap;
  margin: 0 24rpx;
  background: #FFFFFF;
  border-radius: 0 0 16rpx 16rpx;
  padding: 0 8rpx 16rpx;
}

.day-cell {
  width: calc(100% / 7);
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 12rpx;
}

.day-empty {
  background: transparent;
}

.day-number {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 2rpx;
}

.day-points {
  font-size: 18rpx;
  color: #FF6B35;
}

.day-checked-icon {
  position: absolute;
  top: 6rpx;
  right: 8rpx;
  font-size: 20rpx;
  color: #52C41A;
}

.day-makeup-badge {
  position: absolute;
  bottom: 6rpx;
  left: 50%;
  transform: translateX(-50%);
  font-size: 16rpx;
  color: #FF6B35;
  background: #FFF5F0;
  padding: 2rpx 8rpx;
  border-radius: 6rpx;
  white-space: nowrap;
}

.day-today-dot {
  position: absolute;
  bottom: 8rpx;
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #FF6B35;
}

/* Day states */
.day-checked {
  background: #F6FFED;
}

.day-checked .day-number {
  color: #52C41A;
}

.day-makeup {
  background: #FFF5F0;
}

.day-today {
  background: #FFF0E8;
  border: 2rpx solid #FF6B35;
}

.day-today .day-number {
  font-weight: bold;
  color: #FF6B35;
}

.day-future .day-number {
  color: #D0D0D0;
}

.day-missed .day-number {
  color: #CCC;
}

/* Legend */
.legend {
  display: flex;
  justify-content: center;
  gap: 40rpx;
  padding: 24rpx;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 22rpx;
  color: #999;
}

.legend-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  margin-right: 8rpx;
}

.legend-checked {
  background: #F6FFED;
  border: 2rpx solid #52C41A;
}

.legend-makeup {
  background: #FFF5F0;
  border: 2rpx solid #FF6B35;
}

.legend-future {
  background: #F5F5F5;
  border: 2rpx solid #D9D9D9;
}

/* Rules */
.rules-section {
  margin: 0 24rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
}

.rules-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.rules-text {
  display: block;
  font-size: 24rpx;
  color: #999;
  line-height: 1.8;
}
</style>
