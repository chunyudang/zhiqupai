<template>
  <view class="login-page">
    <!-- Header -->
    <view class="login-header">
      <text class="login-logo">识趣派</text>
      <text class="login-slogan">轻学习+强激励的答题闯关</text>
    </view>

    <!-- Tab switcher -->
    <view class="tab-bar">
      <view
        class="tab-item"
        :class="{ active: mode === 'login' }"
        @click="switchTab('login')"
      >
        <text>登录</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: mode === 'register' }"
        @click="switchTab('register')"
      >
        <text>注册</text>
      </view>
    </view>

    <!-- Form -->
    <view class="form-card">
      <!-- Phone -->
      <view class="form-item">
        <view class="input-wrapper">
          <text class="input-icon">📱</text>
          <input
            v-model="phone"
            class="input-field"
            type="number"
            maxlength="11"
            placeholder="请输入手机号"
            placeholder-style="color: #C0C0C0;"
            @input="clearFieldError('phone')"
          />
        </view>
        <text v-if="errors.phone" class="error-text">{{ errors.phone }}</text>
      </view>

      <!-- Password -->
      <view class="form-item">
        <view class="input-wrapper">
          <text class="input-icon">🔒</text>
          <input
            v-model="password"
            class="input-field"
            :type="showPassword ? 'text' : 'password'"
            maxlength="20"
            placeholder="请输入密码"
            placeholder-style="color: #C0C0C0;"
            @input="clearFieldError('password')"
          />
          <text class="eye-icon" @click="showPassword = !showPassword">
            {{ showPassword ? '👁' : '👁‍🗨' }}
          </text>
        </view>
        <text v-if="errors.password" class="error-text">{{ errors.password }}</text>
      </view>

      <!-- Confirm Password (register only) -->
      <view v-if="mode === 'register'" class="form-item">
        <view class="input-wrapper">
          <text class="input-icon">🔒</text>
          <input
            v-model="confirmPassword"
            class="input-field"
            :type="showConfirmPassword ? 'text' : 'password'"
            maxlength="20"
            placeholder="请确认密码"
            placeholder-style="color: #C0C0C0;"
            @input="clearFieldError('confirmPassword')"
          />
          <text class="eye-icon" @click="showConfirmPassword = !showConfirmPassword">
            {{ showConfirmPassword ? '👁' : '👁‍🗨' }}
          </text>
        </view>
        <text v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</text>
      </view>

      <!-- Nickname (register only, optional) -->
      <view v-if="mode === 'register'" class="form-item">
        <view class="input-wrapper">
          <text class="input-icon">😊</text>
          <input
            v-model="nickname"
            class="input-field"
            type="text"
            maxlength="16"
            placeholder="请输入昵称（选填）"
            placeholder-style="color: #C0C0C0;"
            @input="clearFieldError('nickname')"
          />
        </view>
        <text v-if="errors.nickname" class="error-text">{{ errors.nickname }}</text>
      </view>

      <!-- Submit button -->
      <button
        class="submit-btn"
        :loading="loading"
        :disabled="loading"
        @click="handleSubmit"
      >
        {{ mode === 'login' ? '登 录' : '注 册' }}
      </button>

      <!-- Agreement text for register -->
      <view v-if="mode === 'register'" class="agreement">
        <text class="agree-text">注册即表示同意</text>
        <text class="agree-link">《用户协议》</text>
        <text class="agree-text">和</text>
        <text class="agree-link">《隐私政策》</text>
      </view>
    </view>

    <Toast ref="toastRef" />
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { login, register } from '../../api/auth.js'
import { setAccessToken } from '../../api/request.js'
import { validatePhone, validatePassword, validateNickname } from '../../utils/validators.js'
import Toast from '../../components/Toast.vue'

const mode = ref('login')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const nickname = ref('')
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const toastRef = ref(null)

const errors = reactive({
  phone: '',
  password: '',
  confirmPassword: '',
  nickname: '',
})

const switchTab = (tab) => {
  mode.value = tab
  // Clear all errors when switching tabs
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
}

const clearFieldError = (field) => {
  errors[field] = ''
}

const validate = () => {
  let valid = true

  // Phone
  const phoneError = validatePhone(phone.value)
  if (phoneError) {
    errors.phone = phoneError
    valid = false
  }

  // Password
  const passwordError = validatePassword(password.value)
  if (passwordError) {
    errors.password = passwordError
    valid = false
  }

  // Confirm password (register only)
  if (mode.value === 'register') {
    if (!confirmPassword.value) {
      errors.confirmPassword = '请确认密码'
      valid = false
    } else if (confirmPassword.value !== password.value) {
      errors.confirmPassword = '两次密码不一致'
      valid = false
    }
  }

  return valid
}

const handleSubmit = async () => {
  // Validate
  if (!validate()) return

  loading.value = true

  try {
    if (mode.value === 'login') {
      // Login
      await login(phone.value.trim(), password.value)
      uni.setStorageSync('isLoggedIn', true)
      toastRef.value?.show('登录成功', 'success', 1500)
      setTimeout(() => {
        uni.switchTab({ url: '/pages/index/index' })
      }, 800)
    } else {
      // Register
      const data = await register(
        phone.value.trim(),
        password.value,
        nickname.value.trim() || undefined
      )
      // Store tokens after successful registration
      setAccessToken(data.accessToken)
      uni.setStorageSync('refreshToken', data.refreshToken)
      uni.setStorageSync('isLoggedIn', true)
      toastRef.value?.show('注册成功', 'success', 1500)
      setTimeout(() => {
        uni.switchTab({ url: '/pages/index/index' })
      }, 800)
    }
  } catch (err) {
    const msg = err.message || '操作失败'
    // Show field-level errors based on message
    if (msg.includes('手机号') || msg.includes('注册')) {
      errors.phone = msg
    } else if (msg.includes('密码')) {
      errors.password = msg
    } else if (msg.includes('账号') || msg.includes('封禁')) {
      errors.phone = msg
    } else {
      toastRef.value?.show(msg, 'error')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF5F0 0%, #F5F5F5 40%);
  padding: 0 40rpx;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 100rpx;
  padding-bottom: 60rpx;
}

.login-logo {
  font-size: 52rpx;
  font-weight: bold;
  color: #FF6B35;
  letter-spacing: 8rpx;
}

.login-slogan {
  font-size: 26rpx;
  color: #999;
  margin-top: 16rpx;
}

/* Tab switcher */
.tab-bar {
  display: flex;
  margin-bottom: 40rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 32rpx;
  color: #999;
  position: relative;
  transition: color 0.3s;
}

.tab-item.active {
  color: #FF6B35;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 48rpx;
  height: 4rpx;
  background: #FF6B35;
  border-radius: 2rpx;
}

/* Form */
.form-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.form-item {
  margin-bottom: 32rpx;
}

.input-wrapper {
  display: flex;
  align-items: center;
  height: 88rpx;
  border: 1rpx solid #E5E5E5;
  border-radius: 12rpx;
  padding: 0 24rpx;
  background: #FAFAFA;
  transition: border-color 0.3s;
}

.input-wrapper:focus-within {
  border-color: #FF6B35;
  background: #FFFFFF;
}

.input-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.input-field {
  flex: 1;
  height: 100%;
  font-size: 30rpx;
  color: #333;
}

.eye-icon {
  font-size: 32rpx;
  padding: 8rpx;
  flex-shrink: 0;
  color: #999;
}

.error-text {
  font-size: 24rpx;
  color: #FF4D4F;
  margin-top: 8rpx;
  padding-left: 8rpx;
}

/* Submit button */
.submit-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: #FF6B35;
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 44rpx;
  border: none;
  margin-top: 20rpx;
}

.submit-btn::after {
  border: none;
}

.submit-btn[disabled] {
  opacity: 0.7;
}

/* Agreement */
.agreement {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 24rpx;
  flex-wrap: wrap;
}

.agree-text {
  font-size: 22rpx;
  color: #999;
}

.agree-link {
  font-size: 22rpx;
  color: #FF6B35;
}
</style>
