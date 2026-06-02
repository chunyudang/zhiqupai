<script setup>
import { ref } from 'vue'
import { onShow, onReachBottom } from '@dcloudio/uni-app'
import { pointsApi } from '@/api/points'
import { POINTS_SOURCE_LABELS } from '@/utils/constants'
import { formatDateTime } from '@/utils/time'
import { PAGE_SIZE } from '@/utils/constants'
import Skeleton from '@/components/Skeleton.vue'
import EmptyState from '@/components/EmptyState.vue'

const balance = ref(0)
const todayEarned = ref(0)
const transactions = ref([])
const loading = ref(true)
const loadError = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const page = ref(1)
const filterMonth = ref('')

async function fetchBalance() {
  try {
    const data = await pointsApi.getBalance()
    balance.value = data.balance
    todayEarned.value = data.todayEarned
  } catch {
    // 静默
  }
}

async function fetchTransactions(reset = false) {
  if (reset) {
    page.value = 1
    transactions.value = []
    loading.value = true
    loadError.value = false
  }

  try {
    const params = { page: page.value, pageSize: PAGE_SIZE }
    if (filterMonth.value) params.month = filterMonth.value
    const data = await pointsApi.getTransactions(params)
    if (reset) {
      transactions.value = data.list
    } else {
      transactions.value = [...transactions.value, ...data.list]
    }
    const pagination = data.pagination
    hasMore.value = pagination.page < pagination.totalPages
  } catch {
    if (reset) loadError.value = true
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  page.value++
  fetchTransactions(false)
}

onShow(() => {
  fetchBalance()
  fetchTransactions(true)
})

onReachBottom(() => {
  loadMore()
})

function getSourceLabel(source) {
  return POINTS_SOURCE_LABELS[source] || source
}

function getAmountClass(amount) {
  return amount >= 0 ? 'amount-positive' : 'amount-negative'
}

function getAmountPrefix(amount) {
  return amount >= 0 ? '+' : ''
}
</script>

<template>
  <view class="page">
    <!-- 余额头部 -->
    <view class="balance-card">
      <text class="balance-label">积分余额</text>
      <text class="balance-value">{{ balance }}</text>
      <text class="balance-today">今日获得 {{ todayEarned }}</text>
    </view>

    <!-- 月份筛选 -->
    <view class="filter-row">
      <text class="filter-label">筛选月份：</text>
      <input
        v-model="filterMonth"
        type="text"
        placeholder="如 2026-06"
        class="filter-input"
        @confirm="fetchTransactions(true)"
      />
      <button class="filter-btn" @click="fetchTransactions(true)">确定</button>
    </view>

    <!-- 流水列表 -->
    <Skeleton v-if="loading" type="list" :count="5" />

    <EmptyState
      v-else-if="loadError"
      message="加载失败"
      :showAction="true"
      actionText="重试"
      @action="fetchTransactions(true)"
    />

    <EmptyState v-else-if="transactions.length === 0" message="暂无积分记录" />

    <view v-else class="transaction-list">
      <view
        v-for="item in transactions"
        :key="item.id"
        class="transaction-item"
      >
        <view class="tx-info">
          <text class="tx-desc">{{ item.description || getSourceLabel(item.source) }}</text>
          <text class="tx-time">{{ formatDateTime(item.createdAt) }}</text>
        </view>
        <text class="tx-amount" :class="getAmountClass(item.amount)">
          {{ getAmountPrefix(item.amount) }}{{ item.amount }}
        </text>
      </view>

      <!-- 加载更多 -->
      <view v-if="loadingMore" class="loading-more">
        <text>加载中...</text>
      </view>
      <view v-else-if="!hasMore && transactions.length > 0" class="no-more">
        <text>— 没有更多了 —</text>
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

.balance-card {
  background: linear-gradient(135deg, #FF6B35, #FF8C60);
  border-radius: 16rpx;
  padding: 36rpx 28rpx;
  text-align: center;
  margin-bottom: 24rpx;
}

.balance-label {
  font-size: 26rpx;
  color: rgba(255,255,255,0.8);
}

.balance-value {
  font-size: 80rpx;
  font-weight: bold;
  color: #fff;
  display: block;
  margin: 8rpx 0;
}

.balance-today {
  font-size: 24rpx;
  color: rgba(255,255,255,0.8);
}

.filter-row {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  gap: 12rpx;
}

.filter-label {
  font-size: 26rpx;
  color: #666;
}

.filter-input {
  flex: 1;
  height: 64rpx;
  background: #fff;
  border-radius: 8rpx;
  padding: 0 16rpx;
  font-size: 26rpx;
}

.filter-btn {
  padding: 10rpx 24rpx;
  font-size: 26rpx;
  color: #fff;
  background: #FF6B35;
  border: none;
  border-radius: 8rpx;
}

.transaction-list {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.transaction-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  border-bottom: 1px solid #f5f5f5;
}

.transaction-item:last-child {
  border-bottom: none;
}

.tx-info {
  flex: 1;
}

.tx-desc {
  font-size: 28rpx;
  color: #333;
  display: block;
}

.tx-time {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

.tx-amount {
  font-size: 32rpx;
  font-weight: 600;
}

.amount-positive {
  color: #4CAF50;
}

.amount-negative {
  color: #F44336;
}

.loading-more, .no-more {
  text-align: center;
  padding: 24rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
