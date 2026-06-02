<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { userApi } from '@/api/user'
import Toast from '@/components/Toast.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

const userStore = useUserStore()
const toastRef = ref(null)

// 修改昵称
const showNicknameEdit = ref(false)
const newNickname = ref('')
const editingNickname = ref(false)

// 头像上传
const uploadingAvatar = ref(false)

// 注销账号
const showDeleteModal = ref(false)
const deletePassword = ref('')

onShow(() => {
  newNickname.value = userStore.userInfo?.nickname || ''
})

function openNicknameEdit() {
  newNickname.value = userStore.userInfo?.nickname || ''
  showNicknameEdit.value = true
}

async function saveNickname() {
  if (!newNickname.value.trim()) {
    toastRef.value?.show('昵称不能为空', { type: 'warning' })
    return
  }
  editingNickname.value = true
  try {
    await userStore.updateProfile({ nickname: newNickname.value.trim() })
    showNicknameEdit.value = false
    toastRef.value?.show('昵称修改成功', { type: 'success' })
  } catch (err) {
    toastRef.value?.show(err.message || '修改失败', { type: 'error' })
  } finally {
    editingNickname.value = false
  }
}

function chooseAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      uploadingAvatar.value = true
      try {
        const data = await userApi.uploadAvatar(res.tempFilePaths[0])
        await userStore.updateProfile({ avatar: data.url })
        userStore.updateAvatar(data.url)
        toastRef.value?.show('头像更新成功', { type: 'success' })
      } catch (err) {
        toastRef.value?.show(err.message || '上传失败', { type: 'error' })
      } finally {
        uploadingAvatar.value = false
      }
    }
  })
}

async function handleDeleteAccount() {
  if (!deletePassword.value) {
    toastRef.value?.show('请输入密码', { type: 'warning' })
    return
  }
  try {
    await userApi.deleteAccount(deletePassword.value)
    await userStore.logout()
    toastRef.value?.show('账号已注销', { type: 'success' })
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/index/index' })
    }, 1000)
  } catch (err) {
    toastRef.value?.show(err.message || '注销失败', { type: 'error' })
  } finally {
    showDeleteModal.value = false
    deletePassword.value = ''
  }
}
</script>

<template>
  <view class="page">
    <view v-if="userStore.isLoggedIn" class="settings-content">
      <!-- 头像 -->
      <view class="setting-item" @click="chooseAvatar">
        <text class="setting-label">头像</text>
        <view class="setting-right">
          <image
            v-if="userStore.userInfo?.avatar"
            :src="userStore.userInfo?.avatar"
            class="avatar-preview"
            mode="aspectFill"
          />
          <text v-else class="avatar-text">👤</text>
          <text class="setting-arrow">›</text>
        </view>
      </view>

      <!-- 昵称 -->
      <view class="setting-item" @click="openNicknameEdit">
        <text class="setting-label">昵称</text>
        <view class="setting-right">
          <text class="setting-value">{{ userStore.userInfo?.nickname || '未设置' }}</text>
          <text class="setting-arrow">›</text>
        </view>
      </view>

      <!-- 手机号 -->
      <view class="setting-item">
        <text class="setting-label">手机号</text>
        <view class="setting-right">
          <text class="setting-value">{{ userStore.userInfo?.phone || '' }}</text>
        </view>
      </view>

      <!-- 数据分区 -->
      <view class="section-gap" />

      <!-- 关于 -->
      <view class="setting-item">
        <text class="setting-label">版本号</text>
        <view class="setting-right">
          <text class="setting-value">v1.0.0</text>
        </view>
      </view>

      <!-- 注销账号 -->
      <view class="section-gap" />
      <view class="setting-item danger-item" @click="showDeleteModal = true">
        <text class="setting-label danger-text">注销账号</text>
        <text class="setting-arrow">›</text>
      </view>
    </view>

    <!-- 修改昵称弹窗 -->
    <view v-if="showNicknameEdit" class="modal-overlay" @click="showNicknameEdit = false">
      <view class="modal-box" @click.stop>
        <text class="modal-title">修改昵称</text>
        <input
          v-model="newNickname"
          type="text"
          placeholder="请输入新昵称"
          maxlength="16"
          class="modal-input"
        />
        <view class="modal-actions">
          <button class="modal-btn cancel-btn" @click="showNicknameEdit = false">取消</button>
          <button class="modal-btn confirm-btn" :disabled="editingNickname" @click="saveNickname">
            {{ editingNickname ? '保存中...' : '确定' }}
          </button>
        </view>
      </view>
    </view>

    <!-- 注销确认弹窗 -->
    <ConfirmModal
      :show="showDeleteModal"
      title="注销账号"
      message="此操作不可恢复，请输入密码确认"
      confirmText="确认注销"
      :danger="true"
      @confirm="handleDeleteAccount"
      @cancel="showDeleteModal = false; deletePassword = ''"
    >
      <template v-if="showDeleteModal">
        <input
          v-model="deletePassword"
          type="password"
          placeholder="请输入密码"
          style="display: block; width: 100%; height: 80rpx; border: 2rpx solid #eee; border-radius: 8rpx; padding: 0 20rpx; margin-top: 16rpx; font-size: 28rpx;"
        />
      </template>
    </ConfirmModal>

    <Toast ref="toastRef" />
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #F5F5F5;
}

.settings-content {
  padding-top: 0;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 24rpx;
  background: #fff;
  border-bottom: 1px solid #f5f5f5;
}

.section-gap {
  height: 16rpx;
  background: #F5F5F5;
}

.setting-label {
  font-size: 30rpx;
  color: #333;
}

.setting-right {
  display: flex;
  align-items: center;
}

.setting-value {
  font-size: 28rpx;
  color: #999;
  margin-right: 8rpx;
}

.avatar-preview {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 8rpx;
}

.avatar-text {
  font-size: 40rpx;
  margin-right: 8rpx;
}

.setting-arrow {
  font-size: 28rpx;
  color: #ccc;
}

.danger-item {
  border-bottom: none;
}

.danger-text {
  color: #F44336 !important;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal-box {
  width: 560rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx 32rpx 32rpx;
}

.modal-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
  display: block;
  text-align: center;
  margin-bottom: 24rpx;
}

.modal-input {
  height: 80rpx;
  border: 2rpx solid #eee;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  background: #fafafa;
}

.modal-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 24rpx;
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

.confirm-btn {
  background: #FF6B35;
  color: #fff;
}

.confirm-btn[disabled] {
  opacity: 0.6;
}
</style>
