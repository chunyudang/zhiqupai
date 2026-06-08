<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import Toast from '@/components/Toast.vue'
import { validatePhone, validatePassword, validateNickname, validateConfirmPassword } from '@/utils/validators'

const userStore = useUserStore()
const toastRef = ref(null)

// 表单状态
const mode = ref('login') // 'login' | 'register'
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const nickname = ref('')
const submitting = ref(false)

function switchMode(m) {
  mode.value = m
}

async function handleSubmit() {
  // 校验手机号
  const phoneResult = validatePhone(phone.value)
  if (!phoneResult.valid) {
    toastRef.value?.show(phoneResult.message, { type: 'warning' })
    return
  }

  // 校验密码
  const pwdResult = validatePassword(password.value)
  if (!pwdResult.valid) {
    toastRef.value?.show(pwdResult.message, { type: 'warning' })
    return
  }

  // 注册模式额外校验
  if (mode.value === 'register') {
    const confirmResult = validateConfirmPassword(password.value, confirmPassword.value)
    if (!confirmResult.valid) {
      toastRef.value?.show(confirmResult.message, { type: 'warning' })
      return
    }
    if (nickname.value) {
      const nickResult = validateNickname(nickname.value)
      if (!nickResult.valid) {
        toastRef.value?.show(nickResult.message, { type: 'warning' })
        return
      }
    }
  }

  submitting.value = true
  try {
    if (mode.value === 'login') {
      console.log('login=== start');
      const res = await userStore.login(phone.value, password.value);
      console.log('login===', res);
      toastRef.value?.show('登录成功', { type: 'success' })
    } else {
      await userStore.register(phone.value, password.value, nickname.value)
      toastRef.value?.show('注册成功', { type: 'success' })
    }
    // 返回上一页（login 由 navigateTo 打开，navigateBack 回到首页）
    setTimeout(() => {
      //uni.navigateBack()
      uni.reLaunch({ url: '/pages/index/index' })
      //uni.navigateTo({ url: '/pages/index/index' })
    }, 800)
  } catch (err) {
    toastRef.value?.show(err.message || '操作失败', { type: 'error' })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <view class="login-page">
    <!-- 顶部品牌区 -->
    <view class="brand-area">
      <text class="brand-icon">🦉</text>
      <text class="brand-name">识趣派</text>
      <text class="brand-slogan">轻学习 · 强激励</text>
    </view>

    <!-- 表单卡片 -->
    <view class="form-card">
      <!-- 模式切换 -->
      <view class="mode-tabs">
        <view class="mode-tab" :class="{ active: mode === 'login' }" @click="switchMode('login')">
          登录
        </view>
        <view class="mode-tab" :class="{ active: mode === 'register' }" @click="switchMode('register')">
          注册
        </view>
      </view>

      <!-- 输入区域 -->
      <view class="input-group">
        <input v-model="phone" type="number" placeholder="请输入手机号" maxlength="11" class="form-input" />
        <input v-model="password" type="password" placeholder="请输入密码（6-20位字母/数字）" maxlength="20" class="form-input" />
        <template v-if="mode === 'register'">
          <input v-model="confirmPassword" type="password" placeholder="请再次输入密码" maxlength="20" class="form-input" />
          <input v-model="nickname" type="text" placeholder="请输入昵称（选填，1-16位）" maxlength="16" class="form-input" />
        </template>
      </view>

      <!-- 提交按钮 -->
      <button class="submit-btn" :disabled="submitting" @click="handleSubmit">
        {{ submitting ? '处理中...' : (mode === 'login' ? '登录' : '注册') }}
      </button>
    </view>

    <Toast ref="toastRef" />
  </view>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8C60 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx 40rpx;
}

.brand-area {
  text-align: center;
  margin-bottom: 80rpx;
}

.brand-icon {
  font-size: 100rpx;
  display: block;
}

.brand-name {
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
  display: block;
  margin-top: 16rpx;
}

.brand-slogan {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  display: block;
  margin-top: 8rpx;
}

.form-card {
  width: 100%;
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
}

.mode-tabs {
  display: flex;
  margin-bottom: 40rpx;
}

.mode-tab {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  font-size: 32rpx;
  color: #999;
  border-bottom: 4rpx solid transparent;
  transition: all 0.3s;
}

.mode-tab.active {
  color: #FF6B35;
  font-weight: 600;
  border-bottom-color: #FF6B35;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.form-input {
  height: 88rpx;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  background: #fafafa;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  background: #FF6B35;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
  border-radius: 44rpx;
  margin-top: 40rpx;
}

.submit-btn[disabled] {
  opacity: 0.6;
}
</style>
