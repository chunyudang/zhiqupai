<template>
	<view class="page-footer">
	  <view class="c-position-f">
	    <navigator :url="indexFlag === 1 ? '#' : '/pages/index/index'" :class="{'curr': indexFlag === 1}" open-type="redirect" hover-class="none">
	      <view class="ft-cont">
	        <view class="ft-icon icon1"></view>
	        <view class="ft-tit">首页</view>
	      </view>
	    </navigator>
	 <!--  <navigator :url="indexFlag === 2 ? '#' : '/pages/ai/ai'" :class="{'curr': indexFlag === 2}" open-type="redirect" hover-class="none">
	      <view class="ft-cont">
	        <view class="ft-icon icon2"></view>
	        <view class="ft-tit">智能体</view>
	      </view>
	    </navigator> -->
		<!-- <navigator :url="indexFlag === 2 ? '#' : '/pages/onsiteActivities/list'" :class="{'curr': indexFlag === 2}" open-type="redirect" hover-class="none">
		  <view class="ft-cont">
		    <view class="ft-icon icon2-new"></view>
		    <view class="ft-tit">在园活动</view>
		  </view>
		</navigator> -->
		<navigator :url="indexFlag === 2 ? '#' : '/pages/webview/digitalWebview'" :class="{'curr': indexFlag === 2}" open-type="navigate" hover-class="none">
		  <view class="ft-cont">
		    <view class="ft-icon icon2-data-view"></view>
		    <view class="ft-tit">数智驾驶舱</view>
		  </view>
		</navigator>
	    <view class="ft-add" @click="showRichAlert()">
	      <image src="../../static/tab/add.png" mode="widthFix"></image>
	    </view>
	  <!-- <navigator url="/pages/growthBook/index" :class="{'curr': indexFlag === 3}" open-type="redirect" hover-class="none">
	      <view class="ft-cont">
	        <view class="ft-icon icon3"></view>
	        <view class="ft-tit">成长册</view>
	      </view>
	    </navigator> -->
		<!-- <navigator url="/pages/home/index" :class="{'curr': indexFlag === 3}" open-type="redirect" hover-class="none">
		  <view class="ft-cont">
		    <view class="ft-icon icon3-new"></view>
		    <view class="ft-tit">家园共育</view>
		  </view>
		</navigator> -->
		<!-- <navigator url="/pages/digital/index" :class="{'curr': indexFlag === 3}" open-type="redirect" hover-class="none">
		    <view class="ft-cont">
		      <view class="ft-icon icon3-school"></view>
		      <view class="ft-tit">数智校园</view>
		    </view>
		  </navigator> -->
		   <navigator :url="indexFlag === 3 ? '#' : '/pages/ai/ai'" :class="{'curr': indexFlag === 3}" open-type="redirect" hover-class="none">
		       <view class="ft-cont">
		         <view class="ft-icon icon2"></view>
		         <view class="ft-tit">智能体</view>
		       </view>
		     </navigator>
	    <navigator :url="indexFlag === 4 ? '#' : '/pages/user/user'" :class="{'curr': indexFlag === 4}" open-type="redirect" hover-class="none">
	      <view class="ft-cont">
	        <view class="ft-icon icon4"></view>
	        <view class="ft-tit">我的</view>
	      </view>
	    </navigator>
	  </view>
	</view>
	<indexMask :show="show" @close="close" />
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref } from "vue";
import indexMask from "@/components/indexMask/indexMask.vue"

const show = ref(false)
const props = defineProps({
  indexFlag: {
    type: Number,
    default: 1,
  },
});
const showRichAlert = () => {
	show.value = true
}
const close = () => {
	show.value = false
}
</script>

<style lang="scss" scoped>
/* 底部 */
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
}

.page-footer .c-position-f navigator {
  position: relative;
  display: inline-block;
  vertical-align: top;
  width: 20%;
  height: 100%;
  line-height: 110rpx;
  color: $uni-text-color;
}

.page-footer .ft-cont {
  display: inline-block;
  vertical-align: middle;
  line-height: 1;
}

.page-footer .ft-cont .ft-icon {
  display: block;
  width: 48rpx;
  height: 48rpx;
  margin: 0 auto 7rpx;
  background-repeat: no-repeat;
  background-position: 0 0;
  background-size: 100% 100%;
}
// 图片服务器地址需更换
.page-footer .ft-cont .ft-icon.icon1 {
  background-image: url('../../static/tab/index.png');
}

.page-footer .ft-cont .ft-icon.icon2 {
  background-image: url('../../static/tab/AI.png');
}
.page-footer .ft-cont .ft-icon.icon2-new {
  background-image: url('../../static/tab/activity.png');
}
.page-footer .ft-cont .ft-icon.icon2-data-view {
  background-image: url('../../static/tab/data-view.png');
}
.page-footer .ft-cont .ft-icon.icon3 {
  background-image: url('../../static/tab/growthBook.png');
}
.page-footer .ft-cont .ft-icon.icon3-new {
  background-image: url('../../static/tab/edu.png');
}
.page-footer .ft-cont .ft-icon.icon3-school{
	background-image: url('../../static/tab/school-zh.png');
}
.page-footer .ft-cont .ft-icon.icon4 {
  background-image: url('../../static/tab/user.png');
}

.page-footer .ft-cont .ft-tit {
  text-align: center;
  color: $uni-text-color;
  font-size: 20rpx;
}

.page-footer .c-position-f navigator.curr .ft-tit {
  color: $uni-color-primary;
  font-weight: bold;
}

.page-footer .c-position-f navigator.curr .ft-icon.icon1 {
  background-image: url('../../static/tab/index-curr.png');
}

.page-footer .c-position-f navigator.curr .ft-icon.icon2 {
  background-image: url('../../static/tab/AI-curr.png');
}
.page-footer .c-position-f navigator.curr .ft-icon.icon3 {
  background-image: url('../../static/tab/growthBook-curr.png');
}
.page-footer .c-position-f navigator.curr .ft-icon.icon4 {
  background-image: url('../../static/tab/user-curr.png');
}
.page-footer .c-position-f navigator.curr .ft-icon.icon2-new {
  background-image: url('../../static/tab/activity-curr.png');
}
.page-footer .c-position-f navigator.curr .ft-icon.icon2-data-view {
  background-image: url('../../static/tab/data-view-curr.png');
}
.page-footer .c-position-f navigator.curr .ft-icon.icon3-new {
  background-image: url('../../static/tab/edu-curr.png');
}
.page-footer .c-position-f navigator.curr .ft-icon.icon3-school {
  background-image: url('../../static/tab/school-zh-a.png');
}
.ft-add{background: #fff;padding: 20rpx;display: inline-block;border-radius: 100%;position: relative;top: -15rpx;}
.ft-add image{width: 88rpx;height: 88rpx;}
</style>
