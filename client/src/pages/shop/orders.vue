<script setup>
// S-04 兑换记录页
import { ref } from 'vue'
import { onShow, onReachBottom } from '@dcloudio/uni-app'
import { shopApi } from '@/api/shop'
import { PAGE_SIZE } from '@/utils/constants'
import { formatDateTime } from '@/utils/time'
import Skeleton from '@/components/Skeleton.vue'
import EmptyState from '@/components/EmptyState.vue'

// 状态
const orders = ref([])
const loading = ref(true)
const loadError = ref(false)
const page = ref(1)
const hasMore = ref(true)
const loadingMore = ref(false)

// 兑换码弹窗
const showCodeModal = ref(false)
const selectedCode = ref('')
const selectedGoodsName = ref('')

// 获取订单列表
async function fetchOrders(reset = false) {
  if (reset) {
    page.value = 1
    orders.value = []
    loading.value = true
    loadError.value = false
  }

  try {
    const data = await shopApi.getOrders({ page: page.value, pageSize: PAGE_SIZE })
    if (reset) {
      orders.value = data.list
    } else {
      orders.value = [...orders.value, ...data.list]
    }
    hasMore.value = data.pagination.page < data.pagination.totalPages
  } catch {
    if (reset) loadError.value = true
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 加载更多
function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  page.value++
  fetchOrders(false)
}

// 查看兑换码
function viewCode(order) {
  if (!order.code) return
  selectedCode.value = order.code
  selectedGoodsName.value = order.goodsName
  showCodeModal.value = true
}

// 复制兑换码
function copyCode() {
  uni.setClipboardData({
    data: selectedCode.value,
    success: () => {
      uni.showToast({ title: '已复制', icon: 'success' })
    }
  })
}

// 跳转商城
function goToShop() {
  uni.switchTab({ url: '/pages/placeholder/shop' })
}

// 封面图兜底
function getCoverUrl(url) {
  if (!url) return ''
  return url
}

// 生命周期
onShow(() => {
  fetchOrders(true)
})

onReachBottom(() => {
  loadMore()
})
</script>

<template>
  <view class="page">
    <!-- 加载中 -->
    <Skeleton v-if="loading" type="list" :count="5" />

    <!-- 加载失败 -->
    <EmptyState
      v-else-if="loadError"
      message="加载失败"
      :showAction="true"
      actionText="重试"
      @action="fetchOrders(true)"
    />

    <!-- 空状态 -->
    <EmptyState
      v-else-if="orders.length === 0"
      icon="📦"
      message="暂无兑换记录"
      :showAction="true"
      actionText="去商城看看"
      @action="goToShop"
    />

    <!-- 订单列表 -->
    <view v-else class="order-list">
      <view
        v-for="item in orders"
        :key="item.id"
        class="order-item"
        @click="viewCode(item)"
      >
        <!-- 封面缩略图 -->
        <view class="order-cover">
          <image
            v-if="item.coverImage"
            :src="getCoverUrl(item.coverImage)"
            mode="aspectFill"
            class="cover-img"
          />
          <view v-else class="cover-placeholder">
            <text class="placeholder-icon">🎁</text>
          </view>
        </view>

        <!-- 订单信息 -->
        <view class="order-info">
          <text class="order-name">{{ item.goodsName }}</text>
          <text class="order-time">{{ formatDateTime(item.exchangedAt) }}</text>
        </view>

        <!-- 右侧：积分消耗 + 兑换码标签 -->
        <view class="order-right">
          <text class="order-cost">-{{ item.pointsCost }} 积分</text>
          <view v-if="item.code" class="code-tag" @click.stop="viewCode(item)">
            <text class="code-tag-text">查看兑换码</text>
          </view>
          <text v-else class="order-status">{{ item.status === 'success' ? '兑换成功' : '已退回' }}</text>
        </view>
      </view>

      <!-- 加载更多 -->
      <view v-if="loadingMore" class="loading-more">
        <text>加载中...</text>
      </view>
      <view v-else-if="!hasMore && orders.length > 0" class="no-more">
        <text>— 没有更多了 —</text>
      </view>
    </view>

    <!-- 兑换码弹窗 -->
    <view v-if="showCodeModal" class="modal-overlay" @click="showCodeModal = false">
      <view class="modal-box" @click.stop>
        <text class="modal-title">兑换码</text>
        <text class="modal-goods">{{ selectedGoodsName }}</text>
        <view class="code-display">
          <text class="code-text" selectable>{{ selectedCode }}</text>
        </view>
        <view class="modal-actions">
          <button class="modal-btn cancel-btn" @click="showCodeModal = false">关闭</button>
          <button class="modal-btn copy-btn" @click="copyCode">复制兑换码</button>
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

/* 订单列表 */
.order-list {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1px solid #f5f5f5;
  gap: 20rpx;
}

.order-item:last-child {
  border-bottom: none;
}

/* 封面缩略图 */
.order-cover {
  width: 100rpx;
  height: 100rpx;
  border-radius: 12rpx;
  overflow: hidden;
  flex-shrink: 0;
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
}

.placeholder-icon {
  font-size: 48rpx;
}

/* 订单信息 */
.order-info {
  flex: 1;
  min-width: 0;
}

.order-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.order-time {
  font-size: 22rpx;
  color: #999;
  margin-top: 6rpx;
  display: block;
}

/* 右侧 */
.order-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  gap: 8rpx;
}

.order-cost {
  font-size: 26rpx;
  font-weight: 600;
  color: #F44336;
}

.code-tag {
  background: #FFF5F0;
  border: 1rpx solid #FF6B35;
  border-radius: 6rpx;
  padding: 4rpx 12rpx;
}

.code-tag-text {
  font-size: 20rpx;
  color: #FF6B35;
}

.order-status {
  font-size: 22rpx;
  color: #4CAF50;
}

/* 加载更多 */
.loading-more,
.no-more {
  text-align: center;
  padding: 24rpx;
  font-size: 24rpx;
  color: #999;
}

/* 兑换码弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-box {
  width: 580rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx 32rpx;
}

.modal-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
  display: block;
  text-align: center;
}

.modal-goods {
  font-size: 26rpx;
  color: #666;
  display: block;
  text-align: center;
  margin-top: 12rpx;
}

.code-display {
  margin-top: 32rpx;
  padding: 24rpx;
  background: #F8F8F8;
  border-radius: 12rpx;
  text-align: center;
}

.code-text {
  font-size: 40rpx;
  font-weight: bold;
  color: #FF6B35;
  letter-spacing: 4rpx;
  user-select: text;
}

.modal-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 36rpx;
}

.modal-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  font-size: 30rpx;
  border: none;
  border-radius: 12rpx;
  padding: 0;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.copy-btn {
  background: #FF6B35;
  color: #fff;
}
</style>
