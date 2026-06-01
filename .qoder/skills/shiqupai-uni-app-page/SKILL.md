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

<script setup>
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
    {"path": "pages/messages/index", "style": {"navigationBarTitleText": "消息中心"}},
    {"path": "pages/placeholder/quiz", "style": {"navigationBarTitleText": "竞猜"}},
    {"path": "pages/placeholder/shop", "style": {"navigationBarTitleText": "商城"}}
  ],
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "识趣派",
    "navigationBarBackgroundColor": "#FFFFFF",
    "backgroundColor": "#F5F5F5"
  },
  "tabBar": {
    "custom": true,
    "list": [
      {"pagePath": "pages/index/index", "text": "首页"},
      {"pagePath": "pages/placeholder/quiz", "text": "竞猜"},
      {"pagePath": "pages/placeholder/shop", "text": "商城"},
      {"pagePath": "pages/messages/index", "text": "消息"},
      {"pagePath": "pages/profile/index", "text": "我的"}
    ]
  }
}
```

> 注意：使用 `"custom": true` 自定义 tabBar，tabBar 组件在 `components/custom-tab-bar/index.vue` 中实现。竞猜和商城 Tab 各自指向独立的占位页面。

## API 调用模式

### 基础请求封装（api/request.js）

```javascript
// 微信小程序端 BASE_URL 为空，由 manifest.json 配置域名
const BASE_URL = ''
let accessToken = null

const getAccessToken = () => accessToken
const setAccessToken = (token) => { accessToken = token }

// refreshToken 请求队列（防止并发刷新）
let isRefreshing = false
let refreshQueue = []

const request = (options) => {
  const { url, method = 'GET', data, header = {}, needAuth = true } = options

  if (needAuth && accessToken) {
    header['Authorization'] = `Bearer ${accessToken}`
  }
  if (!header['Content-Type']) header['Content-Type'] = 'application/json'

  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + '/api/v1' + url,
      method, data, header,
      success: (res) => {
        if (res.statusCode === 401 && needAuth) {
          // Token 过期，刷新后重试
          handleRefreshToken().then(() => {
            request(options).then(resolve).catch(reject)
          })
          return
        }
        if (res.data.code === 0) resolve(res.data.data)
        else reject(new Error(res.data.message || '请求失败'))
      },
      fail: reject,
    })
  })
}

// GET / POST / PUT / DELETE 快捷方法
const get = (url, data, needAuth = true) => request({ url, method: 'GET', data, needAuth })
const post = (url, data, needAuth = true) => request({ url, method: 'POST', data, needAuth })
const put = (url, data, needAuth = true) => request({ url, method: 'PUT', data, needAuth })
const del = (url, needAuth = true) => request({ url, method: 'DELETE', needAuth })

export { request, get, post, put, del, getAccessToken, setAccessToken }
```

### 模块 API 文件示例（api/auth.js）

```javascript
import { post, setAccessToken } from './request.js'

export const register = (phone, password, nickname) => {
  return post('/auth/register', { phone, password, nickname }, false)
}

export const login = async (phone, password) => {
  const data = await post('/auth/login', { phone, password }, false)
  setAccessToken(data.accessToken)
  uni.setStorageSync('refreshToken', data.refreshToken)
  return data
}

export const refreshToken = (refreshToken) => {
  return post('/auth/refresh', { refreshToken }, false)
}

export const logout = () => {
  return post('/auth/logout')
}
```

## Token 管理（utils/token.js）

```javascript
// 注意：accessToken 仅存内存（通过 api/request.js 管理）
// refreshToken 通过 uni.setStorageSync 存储
const REFRESH_TOKEN_KEY = 'refreshToken'

export function getRefreshToken() {
  try {
    return uni.getStorageSync(REFRESH_TOKEN_KEY) || null
  } catch {
    return null
  }
}

export function setRefreshToken(token) {
  uni.setStorageSync(REFRESH_TOKEN_KEY, token)
}

export function clearRefreshToken() {
  try {
    uni.removeStorageSync(REFRESH_TOKEN_KEY)
  } catch {}
}

export async function autoLogin() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false
  try {
    // 动态引入避免循环依赖
    const { request, setAccessToken } = await import('../api/request.js')
    const data = await request({
      url: '/auth/refresh',
      method: 'POST',
      data: { refreshToken },
      skipAuth: true,
      skipRefresh: true
    })
    setAccessToken(data.accessToken)
    setRefreshToken(data.refreshToken)
    return true
  } catch {
    clearRefreshToken()
    return false
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

### 预留页面（placeholder/quiz.vue & placeholder/shop.vue）
- 简短的居中提示文案「功能完善中……」
- 竞猜和商城各自独立占位页面

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
