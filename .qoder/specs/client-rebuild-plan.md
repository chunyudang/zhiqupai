# 识趣派 Client 端重建计划

## 背景

现有 client 目录是用旧版本 uni-app 脚手架创建的，需要删除后使用最新官方 CLI（Vue3/Vite）重新创建，并集成 `docs/tabBar.vue` 的自定义 TabBar 组件和图标。

---

## 任务一：备份关键源码 & 删除旧 client

将现有 `client/` 下所有源码（非 node_modules/dist）备份到临时目录，然后删除整个 `client/`。

**要备份的文件列表（共 43 个源码文件）：**
- `client/src/App.vue`, `client/src/main.js`, `client/src/manifest.json`, `client/src/pages.json`, `client/src/uni.scss`
- `client/src/api/*.js`（7 个: `auth.js`, `checkin.js`, `messages.js`, `points.js`, `quiz.js`, `request.js`, `user.js`）
- `client/src/stores/*.js`（2 个: `user.js`, `messages.js`）
- `client/src/utils/*.js`（5 个: `constants.js`, `platform.js`, `time.js`, `token.js`, `validators.js`）
- `client/src/components/*.vue`（6 个: `ConfirmModal.vue`, `EmptyState.vue`, `NavBar.vue`, `PageLayout.vue`, `Skeleton.vue`, `TabBar.vue`）
- `client/src/pages/**/*.vue`（17 个页面文件）
- `client/vite.config.js`, `client/package.json`

## 任务二：CLI 创建新 uni-app 项目

执行命令：
```bash
cd /Users/dcy/Workspace/shiqupai
npx degit dcloudio/uni-preset-vue#vite client
```

说明：
- 使用 `#vite` 分支（Vue3 + Vite + JavaScript），符合项目规范（JS 非 TS）
- 安装依赖 `npm install`（在 client/ 目录下）
- 额外安装 `pinia`、`sass`：

```bash
npm install pinia
npm install -D sass
```

## 任务三：项目基础配置

### 3.1 vite.config.js
配置开发服务器代理 `/api` 和 `/uploads` 到 `localhost:3000`

### 3.2 manifest.json
项目信息：appid = `__UNI__DD49C19`, name = `识趣派`, vueVersion = `3`，配置 mp-weixin 和 h5 平台

### 3.3 uni.scss
从备份恢复完整的样式变量定义（品牌色、功能色、文字色、间距、圆角、字体、安全区适配等）

### 3.4 pages.json
配置全部页面路径和样式，配置自定义 tabBar（custom: true），tabBar 列表：
1. pages/index/index - 首页
2. pages/placeholder/quiz - 竞猜
3. pages/placeholder/shop - 商城
4. pages/messages/index - 消息
5. pages/profile/index - 我的

## 任务四：静态资源

将 `/docs/tab/` 下的 19 个图标文件复制到 `client/src/static/tab/`
- 首页: `index.png`, `index-curr.png`
- 竞猜: `activity.png`, `activity-curr.png`
- 商城: `growthBook.png`, `growthBook-curr.png`
- 消息: `msg.png`, `msg-curr.png`
- 我的: `user.png`, `user-curr.png`
- 其他未用但保留: `AI.png`, `AI-curr.png`, `add.png`, `data-view.png`, `data-view-curr.png`, `edu.png`, `edu-curr.png`, `school-zh.png`, `school-zh-a.png`

## 任务五：核心基础设施

### 5.1 main.js
- 创建 Pinia 实例
- 使用 Pinia 插件

### 5.2 App.vue
- onLaunch: 调用 userStore.autoLogin() 自动登录
- onShow: 登录后刷新未读消息数

### 5.3 api/request.js
从备份恢复（HTTP 请求封装、拦截器、Token 刷新、上传文件、GET/POST/PUT/DELETE 便捷方法）

### 5.4 utils/*.js
从备份恢复全部 5 个工具模块

## 任务六：Stores

### 6.1 stores/user.js
从备份恢复（Pinia defineStore）：
- State: accessToken, refreshToken, userInfo, autoLoginDone
- Getters: isLoggedIn
- Actions: autoLogin, login, register, logout, fetchProfile, updateProfile, updateAvatar, refreshAccessToken, clearAuth, setAccessToken

### 6.2 stores/messages.js
从备份恢复（Pinia defineStore）：
- State: unreadCount
- Actions: fetchUnreadCount, decrement, resetAll

## 任务七：API 层

从备份恢复全部 7 个 API 模块

## 任务八：Components

### 8.1 TabBar.vue（核心！）
基于 `/docs/tabBar.vue` 重构为识趣派版本：
- 5 个 Tab：首页、竞猜(预留)、商城(预留)、消息、我的
- 使用 `docs/tab/` 下的图片作为图标（通过 CSS background-image）
- 当前 tab 高亮（-curr 图片）
- 竞猜和商城点击弹出"功能完善中……"提示
- 消息 Tab 展示未读消息角标
- 底部安全区适配

### 8.2 其他组件
从备份恢复：NavBar.vue, Skeleton.vue, EmptyState.vue, Toast.vue, ConfirmModal.vue, PageLayout.vue

## 任务九：Pages（17 个页面）

从备份恢复全部页面文件：
- pages/index/index.vue - 首页（学科列表/欢迎页）
- pages/login/login.vue - 登录注册
- pages/quiz/categories.vue - 学科选择
- pages/quiz/levels.vue - 关卡选择
- pages/quiz/playing.vue - 答题进行（20秒倒计时）
- pages/quiz/result.vue - 答题结果
- pages/quiz/review.vue - 关卡回顾
- pages/profile/index.vue - 我的主页
- pages/profile/checkin.vue - 签到日历
- pages/profile/stats.vue - 数据统计
- pages/profile/records.vue - 答题记录
- pages/profile/points.vue - 积分明细
- pages/profile/settings.vue - 设置
- pages/messages/index.vue - 消息列表
- pages/placeholder/index.vue - 预留
- pages/placeholder/quiz.vue - 竞猜占位
- pages/placeholder/shop.vue - 商城占位

## 任务十：数据库种子 & 测试

### 10.1 添加测试用户
在 `server/prisma/seeds/seed-user.ts` 中添加用户 `18659168150 / dcy1234`

### 10.2 启动后端
```bash
cd /Users/dcy/Workspace/shiqupai/server
npm run start:dev
```

### 10.3 重新种子数据
```bash
cd /Users/dcy/Workspace/shiqupai/server
npm run seed
```

### 10.4 启动前端并测试
```bash
cd /Users/dcy/Workspace/shiqupai/client
npm run dev:h5
```

测试流程：
1. 打开首页 → 未登录状态展示欢迎页
2. 点击登录 → 输入 18659168150 / dcy1234 → 登录成功
3. 回到首页 → 看到学科列表（含进度）
4. 选择一个学科 → 进入关卡列表
5. 选择一个可用关卡 → 开始答题 → 回答6题
6. 答题结束 → 查看结果页
7. 查看关卡回顾

## 验证方式

1. H5 开发模式：`npm run dev:h5` 访问页面，交互测试登录和答题流程
2. 无编译错误：`npm run build:mp-weixin` 构建微信小程序无报错
