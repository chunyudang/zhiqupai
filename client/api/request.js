// 请求封装 + 拦截器

// 开发环境：localhost，生产环境：修改为实际域名或通过 manifest.json 配置
const BASE_URL = 'http://localhost:3000'

// accessToken 仅存内存
let accessToken = null

const getAccessToken = () => accessToken

const setAccessToken = (token) => {
  accessToken = token
}

// refreshToken 请求队列（防止并发刷新）
let isRefreshing = false
let refreshQueue = []

const request = (options) => {
  const {
    url,
    method = 'GET',
    data,
    header = {},
    needAuth = true,
    showLoading = false,
  } = options

  if (showLoading) {
    uni.showLoading({ title: '加载中...', mask: true })
  }

  // 添加 Authorization
  if (needAuth && accessToken) {
    header['Authorization'] = `Bearer ${accessToken}`
  }

  // 自动添加 Content-Type
  if (!header['Content-Type'] && !header['content-type']) {
    header['Content-Type'] = 'application/json'
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + '/api/v1' + url,
      method,
      data,
      header,
      success: (res) => {
        if (showLoading) uni.hideLoading()

        const responseData = res.data

        if (res.statusCode === 401 && needAuth) {
          // Token 过期，尝试刷新
          handleRefreshToken().then(() => {
            // 刷新成功，重试原请求
            request(options).then(resolve).catch(reject)
          }).catch(() => {
            // 刷新失败，跳转登录
            clearAuth()
            uni.reLaunch({ url: '/pages/login/login' })
            reject(new Error('登录已过期'))
          })
          return
        }

        if (responseData.code === 0) {
          resolve(responseData.data)
        } else {
          uni.showToast({
            title: responseData.message || '请求失败',
            icon: 'none',
            duration: 2000,
          })
          reject(new Error(responseData.message))
        }
      },
      fail: (err) => {
        if (showLoading) uni.hideLoading()
        uni.showToast({
          title: '网络异常，请稍后重试',
          icon: 'none',
          duration: 2000,
        })
        reject(err)
      },
    })
  })
}

// 刷新 Token
const handleRefreshToken = () => {
  if (isRefreshing) {
    return new Promise((resolve) => {
      refreshQueue.push(resolve)
    })
  }

  isRefreshing = true
  const refreshToken = uni.getStorageSync('refreshToken')

  return new Promise((resolve, reject) => {
    if (!refreshToken) {
      isRefreshing = false
      reject(new Error('无 refreshToken'))
      return
    }

    uni.request({
      url: BASE_URL + '/api/v1/auth/refresh',
      method: 'POST',
      data: { refreshToken },
      success: (res) => {
        const data = res.data
        if (data.code === 0) {
          accessToken = data.data.accessToken
          // 重放队列中的请求
          refreshQueue.forEach((cb) => cb(data.data.accessToken))
          refreshQueue = []
          resolve(data.data.accessToken)
        } else {
          reject(new Error('刷新失败'))
        }
      },
      fail: reject,
      complete: () => {
        isRefreshing = false
      },
    })
  })
}

// 清除认证信息
const clearAuth = () => {
  accessToken = null
  uni.removeStorageSync('refreshToken')
}

// GET 请求快捷方法
const get = (url, data, needAuth = true) => {
  return request({ url, method: 'GET', data, needAuth })
}

// POST 请求快捷方法
const post = (url, data, needAuth = true, showLoading) => {
  return request({ url, method: 'POST', data, needAuth, showLoading })
}

// PUT 请求快捷方法
const put = (url, data, needAuth = true) => {
  return request({ url, method: 'PUT', data, needAuth })
}

// DELETE 请求快捷方法
const del = (url, needAuth = true) => {
  return request({ url, method: 'DELETE', needAuth })
}

export {
  request,
  get,
  post,
  put,
  del,
  getAccessToken,
  setAccessToken,
  clearAuth,
  handleRefreshToken,
}
