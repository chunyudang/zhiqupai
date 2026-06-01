---
name: shiqupai-uni-app-page
description: 识趣派 uni-app (Vue3) 微信小程序页面与组件的开发规范。当需要创建新页面、修改页面逻辑、开发组件或编写 API 调用代码时触发。包含页面模板、路由配置、API 封装模式和业务组件规范。
---

# 识趣派 uni-app 页面开发规范

## 页面模板

### 基础页面结构

```vue
<template>
  <view class="page-container">
    <!-- 页面内容 -->
  </view>
</template>

<script setup lang="ts">
import { ref, onLoad, onShow } from '@dcloudio/uni-app'

// 页面数据
const loading = ref(false)

// 生命周期
onLoad((options) => {
  // 页面加载，options 为路由参数
  initData()
})

onShow(() => {
  // 页面显示（每次返回都会触发）
})

async function initData() {
  loading.value = true
  try {
    // 数据加载
  } catch (err) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss">
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
```

### 带顶部导航栏的页面

导航栏使用微信小程序原生导航，通过 `pages.json` 配置 `navigationBarTitleText`。

```json
{
  "path": "pages/quiz/categories",
  "style": {
    "navigationBarTitleText": "选择学科",
    "navigationBarBackgroundColor": "#FFFFFF",
    "navigationBarTextStyle": "black"
  }
}
```

## 路由配置（pages.json）

```json
{
  "pages": [
    {"path": "pages/index/index", "style": {"navigationBarTitleText": "识趣派"}},
    {"path": "pages/login/login", "style": {"navigationBarTitleText": "登录"}},
    {"path": "pages/quiz/categories", "style": {"navigationBarTitleText": "选择学科"}},
    {"path": "pages/quiz/levels", "style": {"navigationBarTitleText": "关卡选择"}},
    {"path": "pages/quiz/playing", "style": {"navigationBarTitleText": "答题中"}},
    {"path": "pages/quiz/result", "style": {"navigationBarTitleText": "答题结果"}},
    {"path": "pages/quiz/review", "style": {"navigationBarTitleText": "关卡回顾"}},
    {"path": "pages/profile/index", "style": {"navigationBarTitleText": "我的"}},
    {"path": "pages/profile/checkin", "style": {"navigationBarTitleText": "签到日历"}},
    {"path": "pages/profile/stats", "style": {"navigationBarTitleText": "数据统计"}},
    {"path": "pages/profile/records", "style": {"navigationBarTitleText": "答题记录"}},
    {"path": "pages/profile/points", "style": {"navigationBarTitleText": "积分明细"}},
    {"path": "pages/profile/settings", "style": {"navigationBarTitleText": "设置"}},
    {"path": "pages/messages/list", "style": {"navigationBarTitleText": "消息"}},
    {"path": "pages/placeholder/coming-soon", "style": {"navigationBarTitleText": "功能完善中"}}
  ],
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "识趣派",
    "navigationBarBackgroundColor": "#FFFFFF",
    "backgroundColor": "#F5F5F5"
  },
  "tabBar": {
    "color": "#999",
    "selectedColor": "#333",
    "backgroundColor": "#FFFFFF",
    "borderStyle": "black",
    "list": [
      {"pagePath": "pages/index/index", "text": "首页", "iconPath": "static/tab/home.png", "selectedIconPath": "static/tab/home-active.png"},
      {"pagePath": "pages/placeholder/coming-soon", "text": "竞猜", "iconPath": "static/tab/guess.png", "selectedIconPath": "static/tab/guess-active.png"},
      {"pagePath": "pages/placeholder/coming-soon", "text": "商城", "iconPath": "static/tab/mall.png", "selectedIconPath": "static/tab/mall-active.png"},
      {"pagePath": "pages/messages/list", "text": "消息", "iconPath": "static/tab/message.png", "selectedIconPath": "static/tab/message-active.png"},
      {"pagePath": "pages/profile/index", "text": "我的", "iconPath": "static/tab/profile.png", "selectedIconPath": "static/tab/profile-active.png"}
    ]
  }
}
```

> 注意：竞猜和商城 Tab 都指向 `placeholder/coming-soon` 页面，该页面显示「功能完善中……」提示。

## API 调用模式

### 基础请求封装（api/request.ts）

```typescript
import { getToken, clearToken, setToken } from '@/utils/token'

const BASE_URL = 'http://[内网IP]:3000/api/v1'

// 是否正在刷新 Token
let isRefreshing = false
let refreshSubscribers = []

function onRefreshed(token) {
  refreshSubscribers.forEach(cb => cb(token))
  refreshSubscribers = []
}

function addRefreshSubscriber(cb) {
  refreshSubscribers.push(cb)
}

export function request(options) {
  return new Promise((resolve, reject) => {
    const token = getToken().accessToken
    const header = { 'Content-Type': 'application/json' }
    if (token) header['Authorization'] = `Bearer ${token}`

    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header,
      success(res) {
        if (res.data.code === 0) {
          resolve(res.data.data)
        } else if (res.data.code === 10003) {
          // Token 过期，尝试刷新
          if (!isRefreshing) {
            isRefreshing = true
            refreshToken().then(newToken => {
              isRefreshing = false
              onRefreshed(newToken)
              // 重试原请求
              options.header = { ...header, 'Authorization': `Bearer ${newToken}` }
              request(options).then(resolve).catch(reject)
            }).catch(() => {
              isRefreshing = false
              clearToken()
              uni.reLaunch({ url: '/pages/login/login' })
            })
          } else {
            addRefreshSubscriber(token => {
              options.header = { ...header, 'Authorization': `Bearer ${token}` }
              request(options).then(resolve).catch(reject)
            })
          }
        } else {
          reject(res.data)
        }
      },
      fail(err) {
        reject(err)
      }
    })
  })
}

async function refreshToken() {
  const { refreshToken: rt } = getToken()
  const res = await uni.request({
    url: BASE_URL + '/auth/refresh',
    method: 'POST',
    data: { refreshToken: rt }
  })
  const newToken = res.data.data.accessToken
  setToken(newToken, rt)
  return newToken
}
```

### 模块 API 文件示例（api/auth.js）

```javascript
import { request } from './request'

export const authApi = {
  register(data) {
    return request({ url: '/auth/register', method: 'POST', data })
  },
  login(data) {
    return request({ url: '/auth/login', method: 'POST', data })
  },
  refresh(refreshToken) {
    return request({ url: '/auth/refresh', method: 'POST', data: { refreshToken } })
  },
  logout() {
    return request({ url: '/auth/logout', method: 'POST' })
  }
}
```

## Token 管理（utils/token.ts）

```typescript
const TOKEN_KEY = 'shiqupai_tokens'
const USER_KEY = 'shiqupai_user'

interface Tokens {
  accessToken?: string
  refreshToken?: string
}

export function getToken(): Tokens {
  try {
    return uni.getStorageSync(TOKEN_KEY) || {}
  } catch {
    return {}
  }
}

export function setToken(accessToken: string, refreshToken: string): void {
  const tokens: Tokens = { accessToken, refreshToken }
  uni.setStorageSync(TOKEN_KEY, tokens)
}

export function clearToken(): void {
  try {
    uni.removeStorageSync(TOKEN_KEY)
    uni.removeStorageSync(USER_KEY)
  } catch {}
}

export function saveUser(user: Record<string, unknown>): void {
  uni.setStorageSync(USER_KEY, user)
}

export function getUser(): Record<string, unknown> | null {
  try {
    return uni.getStorageSync(USER_KEY) || null
  } catch {
    return null
  }
}
```

## 关键业务页面开发要点

### 答题进行页（playing.vue）
- 每题独立20秒倒计时（setInterval 实现）
- 选中答案立即显示正误反馈 → 短暂停留 → 自动进入下一题
- 超时自动跳过记为答错
- 答完6题或时间用完 → 自动跳转结果页
- 需要使用 `uni.navigateTo` 带参数跳转结果页（`attemptId`, `levelId`）

### 签到日历页（checkin.vue）
- 月历视图（可使用自定义日历组件或 `uni-calendar`）
- "已签到"显示绿色标记 + 积分值
- "可签到"显示签到按钮，点击触发签到动画
- "可补签"显示补签按钮，消耗50积分
- 连续天数在顶部突出展示

### 答题结果页（result.vue）
- 通关/失败状态展示（不同配色和文案）
- 积分结算明细表
- 逐题解析列表
- 底部三个按钮：继续闯关 / 再来一次 / 返回（根据结果动态展示）

### 个人中心主页（profile/index.vue）
- 顶部：头像 + 昵称 + 简介
- 积分余额大字展示 + 积分明细入口
- 数据卡片（累计答题/已通关/最高正确率）
- 功能入口列表

### 预留页面（placeholder/coming-soon.vue）
- 简短的居中提示文案「功能完善中……」
- 自动返回或提供返回按钮

## 全局组件规范

| 组件 | 职责 |
|------|------|
| `NavBar.vue` | 自定义导航栏（如需） |
| `Skeleton.vue` | 列表/卡片加载骨架屏 |
| `EmptyState.vue` | 无数据占位（插画+文案） |
| `Toast.vue` | 操作反馈提示 |

> 组件均放置在 `client/components/` 目录，全局注册或按需导入均可。

## 微信小程序兼容注意

1. 使用 `uni.xxx` 替代 `wx.xxx`（uni-app 自动转换）
2. 不支持 DOM API（`document.getElementById` 等）
3. 不支持 `window` 和 `document` 全局对象
4. 分包加载：页面超过 2M 时考虑分包
5. 图片资源使用网络 URL 或 `static/` 目录，不超过 4M 包体限制
6. 使用 `uni.setStorageSync` 替代 localStorage
