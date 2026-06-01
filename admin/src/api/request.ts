import axios from 'axios'
import type { ApiResponse } from '@/types'

const request = axios.create({
  baseURL: '/api/admin/v1',
  timeout: 15000,
})

// 请求拦截器：附加 Token
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：统一错误处理
request.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse<unknown>
    if (body.code !== 0) {
      // 业务错误，用 Ant Design message 提示
      import('antd').then(({ message }) => {
        message.error(body.message || '请求失败')
      })
      return Promise.reject(new Error(body.message))
    }
    return response.data
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        localStorage.removeItem('admin_token')
        // 动态导入避免循环依赖
        import('antd').then(({ message }) => {
          message.error('登录已过期，请重新登录')
        })
        window.location.href = '/login'
      } else {
        const msg = data?.message || '服务器错误'
        import('antd').then(({ message }) => {
          message.error(msg)
        })
      }
    } else {
      import('antd').then(({ message }) => {
        message.error('网络错误，请检查网络连接')
      })
    }
    return Promise.reject(error)
  },
)

export default request
