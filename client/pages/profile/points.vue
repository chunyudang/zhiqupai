<template>
  <view class="points-page">
    <!-- Month filter -->
    <view class="filter-bar">
      <view class="filter-arrow" @click="prevMonth">◀</view>
      <text class="filter-text">{{ displayMonth }}</text>
      <view class="filter-arrow" :class="{ disabled: isCurrentMonth }" @click="nextMonth">▶</view>
    </view>

    <!-- Balance header -->
    <view class="balance-card">
      <text class="balance-label">当前积分</text>
      <text class="balance-value">{{ balance }}</text>
    </view>

    <!-- Transaction list -->
    <view v-if="loading" class="loading-state">
      <view v-for="i in 5" :key="i" class="sk-item">
        <Skeleton type="list" />
      </view>
    </view>

    <view v-else-if="transactions.length === 0" class="center-state">
      <EmptyState icon="💰" message="暂无积分记录" />
    </view>

    <view v-else class="transactions-list">
      <view v-for="tx in transactions" :key="tx.id" class="tx-item">
        <view class="tx-left">
          <text class="tx-source">{{ sourceLabel(tx.source) }}</text>
          <text class="tx-time">{{ formatDateTime(tx.createdAt) }}</text>
        </view>
        <view class="tx-right">
          <text class="tx-amount" :class="{ positive: tx.amount > 0, negative: tx.amount < 0 }">
            {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount }}
          </text>
          <text class="tx-balance">余额: {{ tx.balanceAfter }}</text>
        </view>
      </view>

      <!-- Load more -->
      <view v-if="hasMore" class="load-more" @click="loadMore">
        <text>{{ loadingMore ? '加载中...' : '加载更多' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { getBalance, getTransactions } from '../../api/points.js'
import Skeleton from '../../components/Skeleton.vue'
import EmptyState from '../../components/EmptyState.vue'

const SOURCE_LABELS = {
  quiz: '答题',
  checkin: '签到',
  makeup: '补签消耗',
  admin: '系统',
}

const now = new Date()
const loading = ref(true)
const loadingMore = ref(false)
const balance = ref(0)
const transactions = ref([])

const filterYear = ref(now.getFullYear())
const filterMonth = ref(now.getMonth() + 1)
const currentPage = ref(1)
const hasMore = ref(false)

const displayMonth = computed(() => {
  return `${filterYear.value}年${filterMonth.value}月`
})

const isCurrentMonth = computed(() => {
  return (
    filterYear.value >= now.getFullYear() &&
    filterMonth.value >= now.getMonth() + 1
  )
})

const sourceLabel = (source) => {
  return SOURCE_LABELS[source] || source || '其他'
}

const formatDateTime = (timeStr) => {
  if (!timeStr) return ''
  try {
    const d = new Date(timeStr)
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  } catch {
    return ''
  }
}

const loadData = async (append = false) => {
  if (!append) {
    loading.value = true
    currentPage.value = 1
  }

  try {
    const [balanceData, txData] = await Promise.all([
      getBalance(),
      getTransactions({
        page: currentPage.value,
        pageSize: 20,
        year: filterYear.value,
        month: filterMonth.value,
      }),
    ])

    balance.value = balanceData.balance || 0

    const list = txData.list || []
    const pagination = txData.pagination || {}

    if (append) {
      transactions.value = [...transactions.value, ...list]
    } else {
      transactions.value = list
    }

    hasMore.value = currentPage.value < (pagination.totalPages || 0)
  } catch (err) {
    console.error('[Points] loadData error:', err)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadMore = () => {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  currentPage.value++
  loadData(true)
}

const prevMonth = () => {
  if (filterMonth.value === 1) {
    filterYear.value--
    filterMonth.value = 12
  } else {
    filterMonth.value--
  }
  loadData()
}

const nextMonth = () => {
  if (isCurrentMonth.value) return
  if (filterMonth.value === 12) {
    filterYear.value++
    filterMonth.value = 1
  } else {
    filterMonth.value++
  }
  loadData()
}

onLoad(() => {
  loadData()
})

onReachBottom(() => {
  loadMore()
})
</script>

<style scoped>
.points-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 40rpx;
}

/* Filter */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 24rpx;
  background: #FFFFFF;
}

.filter-arrow {
  font-size: 28rpx;
  color: #FF6B35;
  padding: 8rpx 32rpx;
}

.filter-arrow.disabled {
  color: #D0D0D0;
}

.filter-text {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  min-width: 180rpx;
  text-align: center;
}

/* Balance */
.balance-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 36rpx 0 40rpx;
  background: linear-gradient(135deg, #FF6B35, #FF8C5A);
}

.balance-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8rpx;
}

.balance-value {
  font-size: 60rpx;
  font-weight: bold;
  color: #FFFFFF;
}

/* Loading */
.loading-state {
  padding: 24rpx;
}

.sk-item {
  margin-bottom: 16rpx;
}

.center-state {
  padding: 120rpx 0;
}

/* Transaction list */
.transactions-list {
  padding: 16rpx 24rpx;
}

.tx-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #FFFFFF;
  border-radius: 12rpx;
  padding: 24rpx 20rpx;
  margin-bottom: 10rpx;
}

.tx-left {
  flex: 1;
  overflow: hidden;
}

.tx-source {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 4rpx;
}

.tx-time {
  font-size: 22rpx;
  color: #CCC;
}

.tx-right {
  text-align: right;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.tx-amount {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 4rpx;
}

.tx-amount.positive {
  color: #52C41A;
}

.tx-amount.negative {
  color: #FF4D4F;
}

.tx-balance {
  font-size: 22rpx;
  color: #CCC;
}

/* Load more */
.load-more {
  text-align: center;
  padding: 24rpx;
  font-size: 26rpx;
  color: #999;
}
</style>
