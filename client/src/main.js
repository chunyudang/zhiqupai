import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { useUserStore } from '@/stores/user'
import { setRequestStore } from '@/api/request'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  app.use(pinia)

  // 初始化 request 模块的 store 引用（打破循环依赖，避免运行时 require）
  setRequestStore(useUserStore(pinia))

  return { app, pinia }
}
