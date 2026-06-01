<template>
  <view class="settings-page">
    <!-- Profile section -->
    <view class="profile-section">
      <view class="avatar-area" @click="changeAvatar">
        <view class="avatar-circle">
          <text class="avatar-text">{{ avatarInitial }}</text>
        </view>
        <text class="avatar-hint">点击更换头像</text>
      </view>

      <view class="form-group">
        <text class="form-label">昵称</text>
        <input
          class="form-input"
          v-model="nickname"
          placeholder="请输入昵称（最多16字）"
          maxlength="16"
        />
      </view>

      <button class="save-profile-btn" :disabled="saving" @click="saveProfile">
        {{ saving ? '保存中...' : '保存' }}
      </button>
    </view>

    <!-- Notification settings -->
    <view class="settings-group">
      <view class="settings-item">
        <text class="si-label">消息通知</text>
        <switch
          :checked="notifyEnabled"
          @change="toggleNotify"
          color="#FF6B35"
        />
      </view>
    </view>

    <!-- Account management -->
    <view class="settings-group">
      <view class="settings-item" @click="handleLogout">
        <text class="si-label">退出登录</text>
        <text class="si-arrow">›</text>
      </view>
      <view class="settings-item danger" @click="handleDeleteAccount">
        <text class="si-label-danger">注销账号</text>
        <text class="si-arrow">›</text>
      </view>
    </view>

    <!-- About -->
    <view class="settings-group">
      <view class="settings-item">
        <text class="si-label">当前版本</text>
        <text class="si-value">v1.0.0</text>
      </view>
      <view class="settings-item" @click="showAgreement('user')">
        <text class="si-label">用户协议</text>
        <text class="si-arrow">›</text>
      </view>
      <view class="settings-item" @click="showAgreement('privacy')">
        <text class="si-label">隐私政策</text>
        <text class="si-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getProfile, updateProfile, uploadAvatar, deleteAccount } from '../../api/user.js'
import { clearAuth } from '../../api/request.js'

const nickname = ref('')
const avatarUrl = ref('')
const notifyEnabled = ref(true)
const saving = ref(false)

const avatarInitial = ref('?')

const loadProfile = async () => {
  try {
    const profile = await getProfile()
    nickname.value = profile.nickname || ''
    avatarUrl.value = profile.avatar || ''
    avatarInitial.value = (profile.nickname || '用')[0] || '?'
    notifyEnabled.value = profile.notifyEnabled !== false
  } catch (err) {
    console.error('[Settings] loadProfile error:', err)
  }
}

const saveProfile = async () => {
  if (!nickname.value.trim()) {
    uni.showToast({ title: '昵称不能为空', icon: 'none' })
    return
  }
  if (nickname.value.length > 16) {
    uni.showToast({ title: '昵称不能超过16字', icon: 'none' })
    return
  }

  saving.value = true
  try {
    await updateProfile({
      nickname: nickname.value.trim(),
      notifyEnabled: notifyEnabled.value,
    })
    avatarInitial.value = nickname.value.trim()[0] || '?'
    uni.showToast({ title: '保存成功', icon: 'success' })
  } catch (err) {
    console.error('[Settings] saveProfile error:', err)
  } finally {
    saving.value = false
  }
}

const changeAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const filePath = res.tempFilePaths[0]
      try {
        uni.showLoading({ title: '上传中...' })
        const result = await uploadAvatar(filePath)
        avatarUrl.value = result.avatar || result.url || ''
        uni.hideLoading()
        uni.showToast({ title: '头像更新成功', icon: 'success' })
      } catch (err) {
        uni.hideLoading()
        console.error('[Settings] uploadAvatar error:', err)
      }
    },
  })
}

const toggleNotify = async (e) => {
  notifyEnabled.value = e.detail.value
  try {
    await updateProfile({ notifyEnabled: notifyEnabled.value })
  } catch (err) {
    console.error('[Settings] toggleNotify error:', err)
  }
}

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        clearAuth()
        uni.removeStorageSync('isLoggedIn')
        uni.showToast({ title: '已退出', icon: 'none' })
        setTimeout(() => {
          uni.switchTab({ url: '/pages/index/index' })
        }, 500)
      }
    },
  })
}

const handleDeleteAccount = () => {
  uni.showModal({
    title: '注销账号',
    content: '注销后账号数据将不可恢复，确定要注销吗？',
    confirmText: '确定注销',
    confirmColor: '#FF4D4F',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '注销中...' })
          await deleteAccount()
          uni.hideLoading()
          clearAuth()
          uni.removeStorageSync('isLoggedIn')
          uni.showToast({ title: '账号已注销', icon: 'none' })
          setTimeout(() => {
            uni.switchTab({ url: '/pages/index/index' })
          }, 1000)
        } catch (err) {
          uni.hideLoading()
          console.error('[Settings] deleteAccount error:', err)
        }
      }
    },
  })
}

const showAgreement = (type) => {
  uni.showToast({
    title: type === 'user' ? '用户协议页面建设中' : '隐私政策页面建设中',
    icon: 'none',
  })
}

onShow(() => {
  loadProfile()
})
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 60rpx;
}

/* Profile section */
.profile-section {
  background: #FFFFFF;
  padding: 40rpx 32rpx;
  margin-bottom: 20rpx;
}

.avatar-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 36rpx;
}

.avatar-circle {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF6B35, #FF8C5A);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}

.avatar-text {
  font-size: 52rpx;
  color: #FFFFFF;
  font-weight: bold;
}

.avatar-hint {
  font-size: 24rpx;
  color: #999;
}

.form-group {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
  margin-bottom: 24rpx;
}

.form-label {
  width: 80rpx;
  font-size: 28rpx;
  color: #333;
  flex-shrink: 0;
}

.form-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  padding: 8rpx 0;
}

.save-profile-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background: #FF6B35;
  color: #FFFFFF;
  font-size: 30rpx;
  font-weight: bold;
  border-radius: 40rpx;
  border: none;
}

.save-profile-btn::after {
  border: none;
}

.save-profile-btn[disabled] {
  opacity: 0.6;
}

/* Settings groups */
.settings-group {
  background: #FFFFFF;
  margin-bottom: 20rpx;
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #F5F5F5;
}

.settings-item:last-child {
  border-bottom: none;
}

.settings-item:active {
  background: #FAFAFA;
}

.si-label {
  font-size: 30rpx;
  color: #333;
}

.si-label-danger {
  font-size: 30rpx;
  color: #FF4D4F;
}

.si-value {
  font-size: 26rpx;
  color: #999;
}

.si-arrow {
  font-size: 36rpx;
  color: #CCC;
}
</style>
