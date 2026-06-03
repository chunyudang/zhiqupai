<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { checkinApi } from '@/api/checkin'
import { getCurrentMonth, getMonthDays, getMonthFirstDayOfWeek } from '@/utils/time'
import Skeleton from '@/components/Skeleton.vue'
import EmptyState from '@/components/EmptyState.vue'
import Toast from '@/components/Toast.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

const toastRef = ref(null)
const loading = ref(true)
const loadError = ref(false)
const checkingIn = ref(false)

// 日历数据
const yearMonth = ref(getCurrentMonth())
const calendarData = ref(null)
const days = ref([])

// 补签弹窗
const showMakeupModal = ref(false)
const makeupConfirmDate = ref('')

onLoad(() => {
  fetchCalendar()
})

async function fetchCalendar() {
  loading.value = true
  loadError.value = false
  try {
    const data = await checkinApi.getCalendar(yearMonth.value)
    calendarData.value = data
    buildCalendarGrid()
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}

function buildCalendarGrid() {
  const monthDays = getMonthDays(yearMonth.value)
  const firstDayOfWeek = getMonthFirstDayOfWeek(yearMonth.value)
  const cells = []

  // 填充上个月空白
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push({ type: 'empty', date: '', day: '' })
  }

  // 填充当月日期
  for (let d = 1; d <= monthDays; d++) {
    const dateStr = `${yearMonth.value}-${String(d).padStart(2, '0')}`
    const record = (calendarData.value?.days || []).find((r) => r.date === dateStr)
    cells.push({
      type: 'date',
      date: dateStr,
      day: d,
      status: record?.status || 'future',
      pointsEarned: record?.pointsEarned || 0
    })
  }

  days.value = cells
}

async function handleCheckin() {
  if (checkingIn.value) return
  checkingIn.value = true
  try {
    const data = await checkinApi.checkin()
    toastRef.value?.show(`签到成功！+${data.earnedPoints} 积分`, { type: 'success' })
    fetchCalendar()
  } catch (err) {
    toastRef.value?.show(err.message || '签到失败', { type: 'error' })
  } finally {
    checkingIn.value = false
  }
}

function handleDayClick(cell) {
  if (cell.status === 'missed') {
    makeupConfirmDate.value = cell.date
    showMakeupModal.value = true
  }
}

async function confirmMakeup() {
  showMakeupModal.value = false
  try {
    const data = await checkinApi.makeupCheckin(makeupConfirmDate.value)
    toastRef.value?.show('补签成功', { type: 'success' })
    fetchCalendar()
  } catch (err) {
    toastRef.value?.show(err.message || '补签失败', { type: 'error' })
  }
}

function prevMonth() {
  const [year, month] = yearMonth.value.split('-').map(Number)
  const date = new Date(year, month - 2, 1)
  yearMonth.value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  fetchCalendar()
}

function nextMonth() {
  const [year, month] = yearMonth.value.split('-').map(Number)
  const date = new Date(year, month, 1)
  yearMonth.value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  fetchCalendar()
}

function formatYm(str) {
  const [y, m] = str.split('-')
  return `${y}年${parseInt(m)}月`
}

// 星期标题
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const statusClass = {
  signed: 'day-signed',
  makeup: 'day-makeup',
  missed: 'day-missed',
  today: 'day-today',
  future: 'day-future'
}
</script>

<template>
  <view class="page">
    <Skeleton v-if="loading" type="card" :count="1" />
    <EmptyState v-else-if="loadError" message="加载失败" :showAction="true" actionText="重试" @action="fetchCalendar" />
    <view v-else class="checkin-content">
      <!-- 签到信息 -->
      <view class="checkin-info">
        <view class="info-left">
          <text class="checkin-tip">连续签到 {{ calendarData?.consecutiveDays || 0 }} 天</text>
          <text class="makeup-remaining">剩余补签 {{ calendarData?.maxMakeupRemaining || 0 }} 次</text>
        </view>
        <button class="checkin-btn" :disabled="checkingIn" @click="handleCheckin">
          {{ checkingIn ? '签到中...' : '立即签到' }}
        </button>
      </view>

      <!-- 月份导航 -->
      <view class="month-nav">
        <text class="nav-arrow" @click="prevMonth">‹</text>
        <text class="month-title">{{ formatYm(yearMonth) }}</text>
        <text class="nav-arrow" @click="nextMonth">›</text>
      </view>

      <!-- 星期标题 -->
      <view class="week-header">
        <text v-for="wd in weekDays" :key="wd" class="week-day">{{ wd }}</text>
      </view>

      <!-- 日期网格 -->
      <view class="day-grid">
        <view v-for="(cell, idx) in days" :key="idx" class="day-cell" :class="statusClass[cell.status] || ''"
          @click="handleDayClick(cell)">
          <text v-if="cell.day" class="day-num">{{ cell.day }}</text>
          <text v-if="cell.pointsEarned > 0" class="day-points">+{{ cell.pointsEarned }}</text>
        </view>
      </view>

      <!-- 图例 -->
      <view class="legend">
        <view class="legend-item">
          <view class="dot signed-dot" /><text>已签到</text>
        </view>
        <view class="legend-item">
          <view class="dot makeup-dot" /><text>补签</text>
        </view>
        <view class="legend-item">
          <view class="dot missed-dot" /><text>可补签</text>
        </view>
        <view class="legend-item">
          <view class="dot today-dot" /><text>今日</text>
        </view>
      </view>
    </view>

    <Toast ref="toastRef" />
    <ConfirmModal :show="showMakeupModal" title="补签确认" :message="`补签 ${makeupConfirmDate} 消耗 50 积分，确定吗？`"
      confirmText="补签" @confirm="confirmMakeup" @cancel="showMakeupModal = false" />
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #F5F5F5;
  padding: 24rpx;
}

.checkin-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #FF6B35, #FF8C60);
  border-radius: 16rpx;
  padding: 24rpx 28rpx;
  margin-bottom: 24rpx;
}

.info-left {
  display: flex;
  flex-direction: column;
}

.checkin-tip {
  font-size: 28rpx;
  color: #fff;
  font-weight: 500;
}

.makeup-remaining {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4rpx;
}

.checkin-btn {
  padding: 14rpx 32rpx;
  background: #fff;
  color: #FF6B35;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
  border-radius: 36rpx;
}

.checkin-btn[disabled] {
  opacity: 0.6;
}

.month-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.nav-arrow {
  font-size: 44rpx;
  color: #333;
  padding: 10rpx 32rpx;
}

.month-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  min-width: 180rpx;
  text-align: center;
}

.week-header {
  display: flex;
  margin-bottom: 12rpx;
}

.week-day {
  flex: 1;
  text-align: center;
  font-size: 24rpx;
  color: #999;
  padding: 10rpx 0;
}

.day-grid {
  display: flex;
  flex-wrap: wrap;
}

.day-cell {
  width: calc(100% / 7);
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
}

.day-num {
  font-size: 28rpx;
  color: #333;
}

.day-points {
  font-size: 18rpx;
  color: #FF6B35;
  margin-top: 2rpx;
}

.day-signed {
  background: rgba(255, 107, 53, 0.1);
}

.day-makeup {
  background: rgba(255, 152, 0, 0.1);
}

.day-today {
  border: 2rpx solid #FF6B35;
}

.day-future,
.day-missed {
  opacity: 0.5;
}

.legend {
  display: flex;
  justify-content: center;
  gap: 24rpx;
  margin-top: 24rpx;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 22rpx;
  color: #999;
}

.dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  margin-right: 8rpx;
}

.signed-dot {
  background: rgba(255, 107, 53, 0.3);
}

.makeup-dot {
  background: rgba(255, 152, 0, 0.3);
}

.missed-dot {
  background: #ddd;
}

.today-dot {
  background: #FF6B35;
}
</style>
