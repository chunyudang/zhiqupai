<script setup>
// S-02 商品详情页
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { shopApi } from '@/api/shop'
import { pointsApi } from '@/api/points'
import { GOODS_CATEGORY_LABELS, STOCK_STATUS_LABELS } from '@/utils/constants'
import ConfirmModal from '@/components/ConfirmModal.vue'

// 状态
const goodsId = ref(null)
const goods = ref(null)
const loading = ref(true)
const loadError = ref(false)
const exchanging = ref(false)
const balance = ref(0)

// 确认弹窗
const showConfirm = ref(false)

// 获取商品详情
async function fetchDetail() {
  loading.value = true
  loadError.value = false
  try {
    goods.value = await shopApi.getGoodsDetail(goodsId.value)
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}

// 获取积分余额
async function fetchBalance() {
  try {
    const data = await pointsApi.getBalance()
    balance.value = data.balance
  } catch {
    // 静默
  }
}

// 点击兑换
function handleExchange() {
  if (!goods.value?.canExchange || exchanging.value) return
  showConfirm.value = true
}

// 确认兑换
async function doExchange() {
  showConfirm.value = false
  exchanging.value = true
  try {
    const result = await shopApi.exchangeGoods({ goodsId: goodsId.value })
    // 跳转成功页（用 redirectTo 避免返回详情页重复兑换）
    const name = encodeURIComponent(result.goodsName)
    const code = encodeURIComponent(result.code || '')
    uni.redirectTo({
      url: `/pages/shop/success?name=${name}&cost=${result.pointsCost}&code=${code}`
    })
  } catch {
    // request.js 全局 toast 已处理
    // 刷新详情（按钮状态可能因库存/余额变化而改变）
    fetchDetail()
    fetchBalance()
  } finally {
    exchanging.value = false
  }
}

// 获取分类标签
function getCategoryLabel(category) {
  return GOODS_CATEGORY_LABELS[category] || category
}

// 获取库存状态标签
function getStockLabel(status) {
  return STOCK_STATUS_LABELS[status] || status
}

// 库存状态颜色
function getStockColor(status) {
  if (status === 'tense') return '#FF9800'
  if (status === 'low') return '#F44336'
  if (status === 'out') return '#999'
  return '#4CAF50'
}

// 封面图兜底
function getCoverUrl(url) {
  if (!url) return ''
  return url
}

// 生命周期
onLoad((options) => {
  goodsId.value = Number(options.id)
  if (goodsId.value) {
    fetchDetail()
    fetchBalance()
  } else {
    loadError.value = true
    loading.value = false
  }
})
</script>

<template>
  <view class="page">
    <!-- 加载中 -->
    <view v-if="loading" class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 加载失败 -->
    <view v-else-if="loadError" class="error-state">
      <text class="error-icon">😕</text>
      <text class="error-text">商品加载失败</text>
      <button class="retry-btn" @click="fetchDetail">重新加载</button>
    </view>

    <!-- 商品详情 -->
    <template v-else-if="goods">
      <!-- 封面大图 -->
      <view class="cover-section">
        <image
          v-if="goods.coverImage"
          :src="getCoverUrl(goods.coverImage)"
          mode="aspectFill"
          class="cover-img"
        />
        <view v-else class="cover-placeholder">
          <text class="placeholder-icon">🎁</text>
          <text class="placeholder-text">商品图片</text>
        </view>
      </view>

      <!-- 商品信息卡片 -->
      <view class="info-card">
        <!-- 分类标签 -->
        <view class="category-tag">
          <text class="tag-text">{{ getCategoryLabel(goods.category) }}</text>
        </view>

        <!-- 商品名称 -->
        <text class="goods-name">{{ goods.name }}</text>

        <!-- 积分价格 -->
        <view class="price-row">
          <text class="price-value">{{ goods.pointsPrice }}</text>
          <text class="price-unit"> 积分</text>
        </view>

        <!-- 附加信息行 -->
        <view class="meta-row">
          <view class="meta-item">
            <text class="meta-label">库存：</text>
            <text class="meta-value" :style="{ color: getStockColor(goods.stockStatus) }">
              {{ getStockLabel(goods.stockStatus) }}
              <text v-if="goods.remainingStock > 0 && goods.remainingStock <= 20">
                (剩余{{ goods.remainingStock }})
              </text>
            </text>
          </view>
          <view class="meta-item">
            <text class="meta-label">已兑换：</text>
            <text class="meta-value">{{ goods.exchangeCount }}人</text>
          </view>
        </view>
      </view>

      <!-- 商品描述 -->
      <view v-if="goods.description" class="section-card">
        <text class="section-title">商品描述</text>
        <text class="section-content">{{ goods.description }}</text>
      </view>

      <!-- 兑换须知 -->
      <view class="section-card">
        <text class="section-title">兑换须知</text>
        <view class="notice-list">
          <text class="notice-item">• 每人限兑 {{ goods.exchangeLimit }} 次</text>
          <text class="notice-item">• 兑换成功后不支持退还积分</text>
          <text v-if="goods.category === 'code'" class="notice-item">• 兑换码请尽快使用，过期无效</text>
        </view>
      </view>

      <!-- 底部占位（避免被固定底栏遮挡） -->
      <view class="bottom-placeholder" />

      <!-- 固定底部栏 -->
      <view class="bottom-bar">
        <view class="balance-info">
          <text class="balance-label">当前积分：</text>
          <text class="balance-value">{{ balance }}</text>
        </view>
        <button
          class="exchange-btn"
          :class="{ disabled: !goods.canExchange || exchanging }"
          :disabled="!goods.canExchange || exchanging"
          @click="handleExchange"
        >
          <text v-if="exchanging">兑换中...</text>
          <text v-else-if="goods.canExchange">立即兑换</text>
          <text v-else>{{ goods.exchangeHint || '不可兑换' }}</text>
        </button>
      </view>
    </template>

    <!-- 确认兑换弹窗 -->
    <ConfirmModal
      :show="showConfirm"
      title="确认兑换"
      :message="goods ? `消耗 ${goods.pointsPrice} 积分兑换「${goods.name}」？` : ''"
      confirmText="确认兑换"
      @confirm="doExchange"
      @cancel="showConfirm = false"
    />
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #F5F5F5;
}

/* 加载 / 错误状态 */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 20rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}

.error-icon {
  font-size: 80rpx;
}

.error-text {
  font-size: 28rpx;
  color: #666;
}

.retry-btn {
  padding: 16rpx 48rpx;
  font-size: 28rpx;
  color: #fff;
  background: #FF6B35;
  border: none;
  border-radius: 12rpx;
}

/* 封面大图 */
.cover-section {
  width: 100%;
  height: 420rpx;
  background: #f0f0f0;
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.placeholder-icon {
  font-size: 100rpx;
}

.placeholder-text {
  font-size: 26rpx;
  color: #ccc;
}

/* 商品信息卡片 */
.info-card {
  background: #fff;
  margin: -40rpx 24rpx 0;
  padding: 28rpx;
  border-radius: 16rpx;
  position: relative;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.category-tag {
  display: inline-block;
  background: #FFF5F0;
  padding: 6rpx 16rpx;
  border-radius: 6rpx;
  margin-bottom: 12rpx;
}

.tag-text {
  font-size: 22rpx;
  color: #FF6B35;
}

.goods-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  display: block;
  line-height: 1.4;
}

.price-row {
  display: flex;
  align-items: baseline;
  margin-top: 16rpx;
}

.price-value {
  font-size: 56rpx;
  font-weight: bold;
  color: #FF6B35;
}

.price-unit {
  font-size: 26rpx;
  color: #FF6B35;
  margin-left: 4rpx;
}

.meta-row {
  display: flex;
  gap: 32rpx;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1px solid #f5f5f5;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-label {
  font-size: 24rpx;
  color: #999;
}

.meta-value {
  font-size: 24rpx;
  color: #666;
}

/* 描述 / 须知卡片 */
.section-card {
  background: #fff;
  margin: 24rpx;
  padding: 28rpx;
  border-radius: 16rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.section-content {
  font-size: 28rpx;
  color: #555;
  line-height: 1.8;
  white-space: pre-wrap;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.notice-item {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

/* 底部占位 */
.bottom-placeholder {
  height: 180rpx;
}

/* 固定底部栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 24rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.06);
  z-index: 100;
}

.balance-info {
  display: flex;
  align-items: center;
}

.balance-label {
  font-size: 24rpx;
  color: #999;
}

.balance-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.exchange-btn {
  padding: 0 56rpx;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 30rpx;
  color: #fff;
  background: linear-gradient(135deg, #FF6B35, #FF8C60);
  border: none;
  border-radius: 40rpx;
  font-weight: 600;
}

.exchange-btn.disabled {
  background: #e0e0e0;
  color: #999;
  font-weight: 400;
}
</style>
