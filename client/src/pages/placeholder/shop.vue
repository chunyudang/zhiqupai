<script setup>
// S-01 积分商城首页（tabBar 页面）
import { ref } from 'vue'
import { onShow, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'
import { shopApi } from '@/api/shop'
import { pointsApi } from '@/api/points'
import {
  PAGE_SIZE,
  GOODS_CATEGORY,
  GOODS_CATEGORY_LABELS,
  STOCK_STATUS,
  STOCK_STATUS_LABELS,
  GOODS_SORT
} from '@/utils/constants'
import NavBar from '@/components/NavBar.vue'
import Skeleton from '@/components/Skeleton.vue'
import EmptyState from '@/components/EmptyState.vue'

// 状态
const balance = ref(0)
const goodsList = ref([])
const loading = ref(true)
const loadError = ref(false)
const page = ref(1)
const hasMore = ref(true)
const loadingMore = ref(false)
const activeCategory = ref(GOODS_CATEGORY.ALL)
const activeSort = ref(GOODS_SORT.DEFAULT)

// 分类列表
const categoryList = Object.entries(GOODS_CATEGORY_LABELS).map(([key, label]) => ({
  code: key,
  label
}))

// 排序选项
const sortOptions = [
  { code: GOODS_SORT.DEFAULT, label: '综合' },
  { code: GOODS_SORT.PRICE_ASC, label: '价格↑' },
  { code: GOODS_SORT.PRICE_DESC, label: '价格↓' }
]

// 获取积分余额
async function fetchBalance() {
  try {
    const data = await pointsApi.getBalance()
    balance.value = data.balance
  } catch {
    // 静默
  }
}

// 获取商品列表
async function fetchGoods(reset = false) {
  if (reset) {
    page.value = 1
    goodsList.value = []
    loading.value = true
    loadError.value = false
  }

  try {
    const params = { page: page.value, pageSize: PAGE_SIZE }
    if (activeCategory.value !== GOODS_CATEGORY.ALL) {
      params.category = activeCategory.value
    } else {
      params.category = 'all'
    }
    if (activeSort.value) {
      params.sort = activeSort.value
    }
    const data = await shopApi.getGoodsList(params)
    if (reset) {
      goodsList.value = data.list
    } else {
      goodsList.value = [...goodsList.value, ...data.list]
    }
    hasMore.value = data.pagination.page < data.pagination.totalPages
  } catch {
    if (reset) loadError.value = true
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 切换分类
function switchCategory(code) {
  if (activeCategory.value === code) return
  activeCategory.value = code
  fetchGoods(true)
}

// 切换排序
function switchSort(code) {
  if (activeSort.value === code) return
  activeSort.value = code
  fetchGoods(true)
}

// 加载更多
function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  page.value++
  fetchGoods(false)
}

// 跳转商品详情
function goToDetail(id) {
  uni.navigateTo({ url: `/pages/shop/detail?id=${id}` })
}


// 跳转积分明细
function goToPoints() {
  uni.navigateTo({ url: '/pages/profile/points' })
}

// 库存状态标签颜色
function getStockColor(status) {
  if (status === STOCK_STATUS.TENSE) return '#FF9800'
  if (status === STOCK_STATUS.LOW) return '#F44336'
  if (status === STOCK_STATUS.OUT) return '#999'
  return ''
}

// 是否售罄
function isSoldOut(item) {
  return item.stockStatus === STOCK_STATUS.OUT
}

// 封面图兜底
function getCoverUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return url
}

// 生命周期
onShow(() => {
  fetchBalance()
  fetchGoods(true)
})

onReachBottom(() => {
  loadMore()
})

onPullDownRefresh(async () => {
  await Promise.all([fetchBalance(), fetchGoods(true)])
  uni.stopPullDownRefresh()
})
</script>

<template>
  <view class="page">
    <!-- 自定义导航栏 -->
    <NavBar title="积分商城" :showBack="false" />

    <!-- 积分余额卡片 -->
    <view class="balance-card" @click="goToPoints">
      <view class="balance-info">
        <text class="balance-label">我的积分</text>
        <text class="balance-value">{{ balance }}</text>
      </view>
      <text class="balance-arrow">查看明细 ›</text>
    </view>

    <!-- 分类 Tab 栏 -->
    <scroll-view scroll-x class="category-scroll">
      <view class="category-list">
        <view
          v-for="cat in categoryList"
          :key="cat.code"
          class="category-item"
          :class="{ active: activeCategory === cat.code }"
          @click="switchCategory(cat.code)"
        >
          <text>{{ cat.label }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 排序栏 -->
    <view class="sort-bar">
      <view
        v-for="opt in sortOptions"
        :key="opt.code"
        class="sort-item"
        :class="{ active: activeSort === opt.code }"
        @click="switchSort(opt.code)"
      >
        <text>{{ opt.label }}</text>
      </view>
    </view>

    <!-- 商品列表 -->
    <Skeleton v-if="loading" type="card" :count="4" />

    <EmptyState
      v-else-if="loadError"
      message="加载失败"
      :showAction="true"
      actionText="重试"
      @action="fetchGoods(true)"
    />

    <EmptyState
      v-else-if="goodsList.length === 0"
      icon="🛍️"
      message="暂无商品"
    />

    <view v-else class="goods-grid">
      <view
        v-for="item in goodsList"
        :key="item.id"
        class="goods-card"
        :class="{ 'sold-out': isSoldOut(item) }"
        @click="goToDetail(item.id)"
      >
        <!-- 封面图 -->
        <view class="cover-wrap">
          <image
            v-if="item.coverImage"
            :src="getCoverUrl(item.coverImage)"
            mode="aspectFill"
            class="cover-img"
          />
          <view v-else class="cover-placeholder">
            <text class="placeholder-icon">🎁</text>
          </view>
          <!-- 库存状态角标 -->
          <view
            v-if="item.stockStatus !== 'sufficient'"
            class="stock-badge"
            :style="{ backgroundColor: getStockColor(item.stockStatus) }"
          >
            <text class="stock-badge-text">{{ STOCK_STATUS_LABELS[item.stockStatus] }}</text>
          </view>
        </view>

        <!-- 商品信息 -->
        <view class="goods-info">
          <text class="goods-name">{{ item.name }}</text>
          <view class="goods-price-row">
            <text class="price-value">{{ item.pointsPrice }}</text>
            <text class="price-unit"> 积分</text>
          </view>
          <text class="exchange-count">{{ item.exchangeCount }}人已兑换</text>
        </view>
      </view>

      <!-- 加载更多 -->
      <view v-if="loadingMore" class="loading-more">
        <text>加载中...</text>
      </view>
      <view v-else-if="!hasMore && goodsList.length > 0" class="no-more">
        <text>— 没有更多了 —</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #F5F5F5;
}


/* 积分余额卡片 */
.balance-card {
  margin: 24rpx;
  padding: 32rpx 28rpx;
  background: linear-gradient(135deg, #FF6B35, #FF8C60);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.balance-info {
  display: flex;
  flex-direction: column;
}

.balance-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.balance-value {
  font-size: 64rpx;
  font-weight: bold;
  color: #fff;
  margin-top: 4rpx;
}

.balance-arrow {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.2);
  padding: 10rpx 20rpx;
  border-radius: 24rpx;
}

/* 分类 Tab 栏 */
.category-scroll {
  background: #fff;
  white-space: nowrap;
  border-bottom: 1px solid #f0f0f0;
}

.category-list {
  display: inline-flex;
  padding: 0 24rpx;
  gap: 8rpx;
}

.category-item {
  display: inline-block;
  padding: 20rpx 28rpx;
  font-size: 28rpx;
  color: #666;
  white-space: nowrap;
  position: relative;
}

.category-item.active {
  color: #FF6B35;
  font-weight: 600;
}

.category-item.active::after {
  content: '';
  position: absolute;
  bottom: 4rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 48rpx;
  height: 6rpx;
  background: #FF6B35;
  border-radius: 3rpx;
}

/* 排序栏 */
.sort-bar {
  display: flex;
  padding: 16rpx 24rpx;
  gap: 24rpx;
  background: #fff;
  margin-bottom: 2rpx;
}

.sort-item {
  padding: 10rpx 20rpx;
  font-size: 24rpx;
  color: #666;
  border-radius: 24rpx;
  background: #f5f5f5;
}

.sort-item.active {
  color: #fff;
  background: #FF6B35;
}

/* 商品网格 */
.goods-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  padding: 24rpx;
}

.goods-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.goods-card.sold-out {
  opacity: 0.55;
}

/* 封面图 */
.cover-wrap {
  position: relative;
  width: 100%;
  height: 260rpx;
  overflow: hidden;
  background: #f5f5f5;
}

.cover-img {
  width: 100%;
  height: 100%;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
}

.placeholder-icon {
  font-size: 80rpx;
}

/* 库存角标 */
.stock-badge {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.stock-badge-text {
  font-size: 20rpx;
  color: #fff;
}

/* 商品信息 */
.goods-info {
  padding: 16rpx;
}

.goods-name {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  min-height: 72rpx;
}

.goods-price-row {
  display: flex;
  align-items: baseline;
  margin-top: 12rpx;
}

.price-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #FF6B35;
}

.price-unit {
  font-size: 22rpx;
  color: #FF6B35;
  margin-left: 4rpx;
}

.exchange-count {
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
  display: block;
}

/* 加载更多 */
.loading-more,
.no-more {
  grid-column: 1 / -1;
  text-align: center;
  padding: 24rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
