# 识趣派（ShiQuPai）— 客户端

识趣派是一个"轻学习+强激励"的答题闯关娱乐小程序客户端。基于 uni-app (Vue3) 开发，一套代码同时支持 **H5、微信小程序、iOS、Android** 四端。

## 技术栈

| 项 | 说明 |
|----|------|
| 框架 | uni-app (Vue3) |
| 构建 | Vite 5 + @dcloudio/vite-plugin-uni |
| 状态管理 | Pinia（uni-app 4.14+ 内置） |
| 样式 | SCSS + rpx 响应式单位 |
| 代码风格 | `<script setup>` 组合式 API + ES6 JavaScript |
| 端适配 | `#ifdef` 条件编译 + 自定义导航栏/TabBar |

## 快速开始

```bash
# 安装依赖
npm install

# H5 开发（浏览器调试）
npm run dev:h5

# 微信小程序开发
npm run dev:mp-weixin

# App 端开发（需 HBuilderX 配合）
npm run dev:app
```

## 构建命令

```bash
# H5 生产构建
npm run build:h5

# 微信小程序生产构建
npm run build:mp-weixin

# App 端构建（iOS + Android）
npm run build:app

# 分别构建
npm run build:app-android
npm run build:app-ios
```

## 目录结构

```
client/
├── vite.config.js          # Vite 构建配置（含 H5 代理）
├── package.json            # 依赖与构建脚本
├── index.html              # H5 入口
└── src/
    ├── main.js             # 应用入口（createSSRApp + Pinia）
    ├── App.vue             # 根组件（onLaunch 自动登录）
    ├── manifest.json       # 四端配置（mp-weixin/h5/app-plus）
    ├── pages.json          # 页面路由 + 自定义 TabBar
    ├── uni.scss            # 全局 SCSS 变量 + 安全区适配
    ├── static/             # 静态资源
    ├── api/                # API 封装层
    │   ├── request.js      #   核心 HTTP 客户端（条件编译 BASE_URL + Token 刷新队列）
    │   ├── auth.js         #   认证 API
    │   ├── user.js         #   用户 API
    │   ├── quiz.js         #   答题 API
    │   ├── points.js       #   积分 API
    │   ├── checkin.js      #   签到 API
    │   └── messages.js     #   消息 API
    ├── stores/             # Pinia 状态管理
    │   ├── user.js         #   用户状态（accessToken 内存 + refreshToken 持久化）
    │   └── messages.js     #   未读消息状态
    ├── utils/              # 工具函数
    │   ├── constants.js    #   错误码、枚举、配置常量
    │   ├── validators.js   #   表单校验（手机号/密码/昵称）
    │   ├── time.js         #   时间格式化
    │   ├── token.js        #   Token 持久化读写
    │   └── platform.js     #   多端平台检测
    ├── components/         # 通用组件
    │   ├── NavBar.vue      #   自定义导航栏（多端安全区适配）
    │   ├── TabBar.vue      #   底部导航栏（安全区 + 未读 badge）
    │   ├── PageLayout.vue  #   页面容器（loading/error/empty 状态机）
    │   ├── Skeleton.vue    #   骨架屏
    │   ├── EmptyState.vue  #   空状态
    │   ├── Toast.vue       #   Toast 通知
    │   └── ConfirmModal.vue #  确认弹窗
    └── pages/              # 页面
        ├── index/          #   首页（学科选择入口）
        ├── login/          #   登录/注册
        ├── quiz/           #   答题流程（5 页）
        │   ├── categories.vue   # 学科选择
        │   ├── levels.vue       # 关卡选择
        │   ├── playing.vue      # 答题进行（20秒倒计时）
        │   ├── result.vue       # 答题结果
        │   └── review.vue       # 关卡回顾
        ├── profile/        #   个人中心（6 页）
        │   ├── index.vue        # 我的主页
        │   ├── checkin.vue      # 签到日历
        │   ├── stats.vue        # 数据统计
        │   ├── records.vue      # 答题记录
        │   ├── points.vue       # 积分明细
        │   └── settings.vue     # 设置
        ├── messages/       #   消息中心
        └── placeholder/    #   占位页面（竞猜/商城）
```

## 多端适配

- 全端统一使用 `uni.*` API，避免 `wx.*` 或 `plus.*` 原生调用
- 差异处用 `#ifdef H5` / `#ifdef MP-WEIXIN` / `#ifdef APP-PLUS` 条件编译隔离
- 自定义 `<NavBar>` 和 `<TabBar>` 替代原生导航栏，保证各端视觉一致
- 安全区通过 `uni.getSystemInfoSync().safeAreaInsets` 动态适配
- 底部 Tab 使用 `safe-area-inset-bottom` 兼容 iPhone X+ 刘海屏

## 开发规范

- 所有 Vue 组件使用 `<script setup>` 组合式 API
- 代码使用 ES6 JavaScript，不引入 TypeScript
- 页面统一遵循 **loading → error → empty → data** 状态机模式
- API 调用不检查 HTTP 状态码，统一检查 `response.code === 0`（服务端 always HTTP 200）
- accessToken 仅存内存（Pinia），refreshToken 持久化（uni.storage）
