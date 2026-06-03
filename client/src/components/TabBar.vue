<template>
  <view class="page-footer">
    <view class="c-position-f" :style="{ paddingBottom: safeAreaBottom + 'px' }">
      <view
        v-for="(tab, index) in tabs"
        :key="tab.pagePath"
        class="tab-item"
        :class="{ curr: currentIndex === index }"
        @click="switchTab(tab, index)"
      >
        <view class="ft-cont">
          <view class="ft-icon" :class="'icon-' + tab.iconClass"></view>
          <view class="ft-tit">{{ tab.text }}</view>
        </view>
        <!-- 未读消息角标 -->
        <view v-if="index === 3 && messagesStore.unreadCount.total > 0" class="tab-badge">
          <text class="badge-text">{{ messagesStore.unreadCount.total > 99 ? '99+' : messagesStore.unreadCount.total }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { useMessagesStore } from '@/stores/messages'

const props = defineProps({
  currentIndex: {
    type: Number,
    default: 0
  }
})

const messagesStore = useMessagesStore()

const systemInfo = uni.getSystemInfoSync()
const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0

const tabs = [
  { pagePath: 'pages/index/index', text: '首页', iconClass: 'index' },
  { pagePath: 'pages/placeholder/quiz', text: '竞猜', iconClass: 'activity' },
  { pagePath: 'pages/placeholder/shop', text: '商城', iconClass: 'growthBook' },
  { pagePath: 'pages/messages/index', text: '消息', iconClass: 'msg' },
  { pagePath: 'pages/profile/index', text: '我的', iconClass: 'user' }
]

function switchTab(tab, index) {
  // 竞猜和商城是预留 Tab
  if (index === 1 || index === 2) {
    uni.showToast({ title: '功能完善中……', icon: 'none', duration: 1500 })
    return
  }
  if (index === props.currentIndex) return
  uni.switchTab({ url: '/' + tab.pagePath })
}
</script>

<style lang="scss" scoped>
.page-footer {
  height: 112rpx;
  box-sizing: border-box;
}

.page-footer .c-position-f {
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 20;
  width: 100%;
  height: 112rpx;
  background: #fff;
  text-align: center;
  font-size: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.tab-item {
  position: relative;
  display: inline-block;
  vertical-align: top;
  width: 20%;
  height: 100%;
  line-height: 110rpx;
  color: $uni-text-color;
}

.tab-item .ft-cont {
  display: inline-block;
  vertical-align: middle;
  line-height: 1;
}

.tab-item .ft-cont .ft-icon {
  display: block;
  width: 48rpx;
  height: 48rpx;
  margin: 0 auto 7rpx;
  background-repeat: no-repeat;
  background-position: 0 0;
  background-size: 100% 100%;
}

.tab-item .ft-cont .ft-icon.icon-index {
  background-image: url('/static/tab/index.png');
}

.tab-item .ft-cont .ft-icon.icon-activity {
  background-image: url('/static/tab/activity.png');
}

.tab-item .ft-cont .ft-icon.icon-growthBook {
  background-image: url('/static/tab/growthBook.png');
}

.tab-item .ft-cont .ft-icon.icon-msg {
  background-image: url('/static/tab/msg.png');
}

.tab-item .ft-cont .ft-icon.icon-user {
  background-image: url('/static/tab/user.png');
}

.tab-item .ft-cont .ft-tit {
  text-align: center;
  color: $uni-text-color;
  font-size: 20rpx;
}

.tab-item.curr .ft-tit {
  color: $uni-color-primary;
  font-weight: bold;
}

.tab-item.curr .ft-icon.icon-index {
  background-image: url('/static/tab/index-curr.png');
}

.tab-item.curr .ft-icon.icon-activity {
  background-image: url('/static/tab/activity-curr.png');
}

.tab-item.curr .ft-icon.icon-growthBook {
  background-image: url('/static/tab/growthBook-curr.png');
}

.tab-item.curr .ft-icon.icon-msg {
  background-image: url('/static/tab/msg-curr.png');
}

.tab-item.curr .ft-icon.icon-user {
  background-image: url('/static/tab/user-curr.png');
}

/* 未读消息角标 */
.tab-badge {
  position: absolute;
  top: 4rpx;
  right: 50%;
  margin-right: -52rpx;
  min-width: 32rpx;
  height: 32rpx;
  background: #F44336;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6rpx;
}

.badge-text {
  font-size: 18rpx;
  color: #fff;
  line-height: 1;
}
</style>
