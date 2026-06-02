// 识趣派 — 用户 Store（Pinia）
// accessToken 仅存内存，refreshToken 持久化本地

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getRefreshToken, setRefreshToken, removeRefreshToken } from '@/utils/token'

export const useUserStore = defineStore('user', () => {
  // ---- State ----
  const accessToken = ref(null)       // 仅内存
  const refreshToken = ref(null)       // 暂存在此，真正持久化在 token.js
  const userInfo = ref(null)           // { id, phone, nickname, avatar, pointsBalance }
  const autoLoginDone = ref(false)     // 自动登录是否执行过

  // ---- Getters ----
  const isLoggedIn = computed(() => !!accessToken.value)

  // ---- Actions ----

  /** 自动登录：读取本地 refreshToken → 刷新 accessToken → 获取用户信息 */
  async function autoLogin() {
    const storedToken = getRefreshToken()
    if (!storedToken) {
      autoLoginDone.value = true
      return false
    }
    refreshToken.value = storedToken

    try {
      const { authApi } = await import('@/api/auth')
      const res = await authApi.refreshToken(storedToken)
      accessToken.value = res.accessToken
      // 刷新成功后获取用户信息
      await fetchProfile()
      autoLoginDone.value = true
      return true
    } catch {
      // refresh 失败，清除本地 token
      clearAuth()
      autoLoginDone.value = true
      return false
    }
  }

  /** 登录 */
  async function login(phone, password) {
    const { authApi } = await import('@/api/auth')
    const res = await authApi.login(phone, password)
    accessToken.value = res.accessToken
    refreshToken.value = res.refreshToken
    setRefreshToken(res.refreshToken)
    userInfo.value = res.user
    return res
  }

  /** 注册 */
  async function register(phone, password, nickname) {
    const { authApi } = await import('@/api/auth')
    const res = await authApi.register(phone, password, nickname)
    accessToken.value = res.accessToken
    refreshToken.value = res.refreshToken
    setRefreshToken(res.refreshToken)
    userInfo.value = res.user
    return res
  }

  /** 退出登录 */
  async function logout() {
    try {
      const { authApi } = await import('@/api/auth')
      await authApi.logout()
    } catch {
      // 即使服务端失败也清除本地状态
    }
    clearAuth()
  }

  /** 获取用户信息 */
  async function fetchProfile() {
    const { userApi } = await import('@/api/user')
    const res = await userApi.getProfile()
    userInfo.value = res
    return res
  }

  /** 更新用户信息 */
  async function updateProfile(data) {
    const { userApi } = await import('@/api/user')
    const res = await userApi.updateProfile(data)
    userInfo.value = { ...userInfo.value, ...res }
    return res
  }

  /** 更新头像 */
  function updateAvatar(url) {
    if (userInfo.value) {
      userInfo.value.avatar = url
    }
  }

  /** 刷新 accessToken（带队列防并发） */
  let refreshPromise = null
  async function refreshAccessToken() {
    if (refreshPromise) return refreshPromise
    refreshPromise = (async () => {
      try {
        const { authApi } = await import('@/api/auth')
        const res = await authApi.refreshToken(refreshToken.value)
        accessToken.value = res.accessToken
        return res.accessToken
      } catch {
        clearAuth()
        throw new Error('Token 刷新失败')
      } finally {
        refreshPromise = null
      }
    })()
    return refreshPromise
  }

  /** 清除认证状态 */
  function clearAuth() {
    accessToken.value = null
    refreshToken.value = null
    userInfo.value = null
    removeRefreshToken()
  }

  /** 设置 accessToken（供 request.js interceptor 使用） */
  function setAccessToken(token) {
    accessToken.value = token
  }

  return {
    accessToken,
    refreshToken,
    userInfo,
    autoLoginDone,
    isLoggedIn,
    autoLogin,
    login,
    register,
    logout,
    fetchProfile,
    updateProfile,
    updateAvatar,
    refreshAccessToken,
    clearAuth,
    setAccessToken
  }
})
