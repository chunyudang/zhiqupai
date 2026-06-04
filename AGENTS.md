# 识趣派（ShiQuPai）— AI 开发助手指南

## 项目概述

识趣派是一个"轻学习+强激励"的答题闯关娱乐微信小程序。用户在 **5分钟内** 完成一轮答题闯关，通过通识知识题目提升认知能力，获得积分奖励和成就感。

- **产品定位**：轻学习+强激励的答题闯关娱乐APP
- **目标用户**：大众泛用户
- **MVP 端限制**：仅支持微信小程序端（uni-app Vue3）
- **开发语言**：TypeScript（全栈类型安全）

## MVP 范围（P0）

| 模块 | 说明 |
|------|------|
| ① 用户体系 | 手机号+密码注册/登录、自动登录、退出登录、账号注销 |
| ② 有奖问答 | 5大学科×5关卡=25关，每关6题，4/6通关 |
| ③ 个人中心 | 主页、签到日历、数据统计、答题记录、积分明细、设置 |
| ④ 动态消息 | 3类Tab（系统消息/我的评论/我赞过）、已读管理、30天有效期 |

底部Tab共5个：首页 | 竞猜(预留) | 商城(预留) | 消息 | 我的

## 技术栈

### 后端（server/）
- **框架**：NestJS（依赖注入、模块化、装饰器）
- **ORM**：Prisma（类型安全，SQLite provider 开发，后续可切换 PostgreSQL）
- **数据库**：SQLite（MVP阶段）
- **API文档**：@nestjs/swagger → OpenAPI 3.0 → Swagger UI `/api/docs`
- **认证**：JWT（accessToken 15分钟内存 + refreshToken 30天本地存储）
- **密码**：bcrypt 哈希存储
- **手机号**：SHA-256 哈希脱敏存储

### 客户端（client/）
- **框架**：uni-app (Vue3)
- **端限制**：MVP 阶段仅微信小程序

### 后台管理（admin/）
- **框架**：React 18 + TypeScript
- **UI**：Ant Design 5
- **路由**：React Router 6
- **HTTP**：Axios
- **构建**：Vite

## 项目目录结构

```
shiqupai/
├── server/                     # 后端 NestJS 服务
│   ├── prisma/                 # Prisma Schema + 迁移 + 种子
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seeds/
│   │       ├── seed.ts
│   │       ├── seed-admin.ts
│   │       ├── seed-categories.ts
│   │       ├── seed-levels.ts
│   │       └── seed-questions.ts
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/           # 注册、登录、Token管理
│   │   │   ├── user/           # 用户信息CRUD、账号注销
│   │   │   ├── quiz/           # 学科/关卡/答题/结算/回顾
│   │   │   ├── points/         # 积分流水、余额查询
│   │   │   ├── checkin/        # 签到、补签、签到日历
│   │   │   ├── message/        # 消息列表、已读管理
│   │   │   ├── stats/          # 数据统计（预留）
│   │   │   ├── comment/        # 评论（预留）
│   │   │   ├── like/           # 点赞（预留）
│   │   │   └── admin/
│   │   │       ├── controllers/
│   │   │       │   ├── admin-auth.controller.ts
│   │   │       │   ├── category-manage.controller.ts
│   │   │       │   ├── level-manage.controller.ts
│   │   │       │   ├── question-manage.controller.ts
│   │   │       │   ├── user-manage.controller.ts
│   │   │       │   ├── message-push.controller.ts
│   │   │       │   ├── system-config.controller.ts
│   │   │       │   └── dashboard.controller.ts
│   │   │       └── admin.module.ts
│   │   ├── common/
│   │   │   ├── guards/         # 鉴权守卫
│   │   │   ├── interceptors/   # 拦截器
│   │   │   ├── filters/        # 异常过滤器
│   │   │   ├── decorators/     # 自定义装饰器
│   │   │   └── pipes/          # 管道验证
│   │   ├── prisma/
│   │   │   └── prisma.service.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/
│   │   └── app.e2e-spec.ts
│   ├── uploads/avatars/        # 头像文件存储
│   ├── data/                   # SQLite数据库文件
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
│
├── client/                     # 客户端 uni-app
│   ├── App.vue
│   ├── main.js
│   ├── index.html
│   ├── manifest.json
│   ├── pages.json
│   ├── uni.scss
│   ├── static/
│   │   └── logo.png
│   ├── pages/
│   │   ├── index/index.vue     # 首页（答题入口 / 默认启动页）
│   │   ├── login/              # 登录/注册
│   │   ├── quiz/
│   │   │   ├── categories.vue  # A-01 学科选择
│   │   │   ├── levels.vue      # A-02 关卡选择
│   │   │   ├── playing.vue     # A-03 答题进行
│   │   │   ├── result.vue      # A-04 答题结果
│   │   │   └── review.vue      # A-05 关卡回顾
│   │   ├── profile/
│   │   │   ├── index.vue       # P-01 我的主页
│   │   │   ├── checkin.vue     # P-02 签到日历
│   │   │   ├── stats.vue       # P-03 数据统计
│   │   │   ├── records.vue     # P-04 答题记录
│   │   │   ├── points.vue      # P-05 积分明细
│   │   │   └── settings.vue    # P-06 设置
│   │   ├── messages/           # 消息页面
│   │   └── placeholder/        # 预留页面（竞猜/商城提示页）
│   ├── components/
│   │   ├── ConfirmModal.vue
│   │   ├── EmptyState.vue
│   │   ├── NavBar.vue
│   │   ├── PageLayout.vue
│   │   ├── Skeleton.vue
│   │   └── Toast.vue
│   ├── api/
│   │   ├── request.js
│   │   ├── auth.js
│   │   ├── quiz.js
│   │   ├── points.js
│   │   ├── checkin.js
│   │   └── messages.js
│   └── utils/
│       ├── token.js
│       ├── time.js
│       └── validators.js
│
├── admin/                      # 后台管理 React SPA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login/
│   │   │   ├── Dashboard/      # 运营看板
│   │   │   ├── Categories/     # 学科管理
│   │   │   ├── Levels/         # 关卡管理
│   │   │   ├── Questions/      # 题目管理
│   │   │   ├── Users/          # 用户管理
│   │   │   ├── Messages/       # 消息推送
│   │   │   └── System/         # 系统配置
│   │   ├── components/
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── vite.config.ts
│   └── package.json
│
└── docs/                       # 文档
```

## API 规范

### 路由设计
- C端 API：`/api/v1/*`
- 后台 API：`/api/admin/v1/*`
- Swagger UI：`/api/docs`
- 字段命名：camelCase
- 时间格式：ISO 8601

### 统一响应格式
```json
// 成功
{ "code": 0, "message": "success", "data": { ... } }
// 错误
{ "code": 10001, "message": "手机号已注册", "data": null }
```

### 分页规范
- 请求：`page`(默认1) + `pageSize`(默认20，最大100)
- 响应：`{ list: [...], pagination: { page, pageSize, total, totalPages } }`

### 错误码体系
| 区间 | 模块 |
|------|------|
| 10001-10999 | 认证通用 |
| 11001-11999 | 用户管理 |
| 20001-20999 | 答题模块 |
| 30001-30999 | 积分模块 |
| 40001-40999 | 签到模块 |
| 50001-50999 | 消息模块 |
| 90001-90999 | 后台管理 |
| 99999 | 系统级 |

## 核心业务规则

### 答题计分规则
- 每题答对：+15分
- 通关条件：答对 ≥ 4/6（正确率 ≥ 67%）
- 通关奖励：额外 +50分
- 满分一关：6×15 + 50 = **140分**
- 失败情况：仅获得已答对题目的分数
- 重复答题：**0分**（已通关关卡再次答题不得分）

### 签到规则
- 每日积分：第1天+1、第2天+2…第7天+7，第8天起固定+7
- 周期：自然月重置 + 断签重置
- 补签：消耗50积分/次，月限5次（后台可配置）

### 关卡解锁规则
- 第1关默认解锁
- 后续关卡需前一关通关后解锁
- 各学科关卡独立计算

### 关卡状态机
`locked` → `available` → `in_progress` → `passed`（解锁下一关）/ `failed`（回退至 `available`）

### 积分事务
Prisma 事务（`prisma.$transaction`），3模型原子写入：`user_answers` + `user_progress` + `points`

### 答题防作弊
- 每题独立20秒倒计时（客户端强制）
- 服务端校验 `time_taken` 3-20秒/题，总用时 18-120秒
- `attempt_id` (UUID) 防重复提交
- 答题频率检测

### 接口限流
| 接口 | 限制 |
|------|------|
| login | 5次/分钟 |
| register | 3次/分钟 |
| refresh | 10次/分钟 |
| quiz/submit | 10次/分钟 |
| checkin | 1次/天 |
| makeup | 月限5次 |
| 全局 | 100次/分钟/IP |

### 手机号安全
- 存储：SHA-256 哈希脱敏存储
- API 返回：脱敏展示（如 `138****5678`）

## C端 API 接口清单（MVP 23个）

| Method | URL | 说明 |
|--------|-----|------|
| POST | `/auth/register` | 用户注册 |
| POST | `/auth/login` | 用户登录 |
| POST | `/auth/refresh` | 刷新 Token |
| POST | `/auth/logout` | 退出登录 |
| GET | `/users/profile` | 获取个人信息 |
| PUT | `/users/profile` | 修改个人信息 |
| POST | `/upload/avatar` | 上传头像 |
| DELETE | `/users/account` | 注销账号 |
| GET | `/categories` | 学科列表（含进度） |
| GET | `/categories/:id/levels` | 关卡列表（含状态） |
| POST | `/quiz/start` | 开始答题 |
| POST | `/quiz/submit` | 提交答案 |
| GET | `/quiz/review/:levelId` | 关卡回顾 |
| GET | `/quiz/progress` | 用户总进度 |
| GET | `/points/balance` | 查询积分余额 |
| GET | `/points/transactions` | 积分流水 |
| POST | `/checkin` | 每日签到 |
| POST | `/checkin/makeup` | 补签 |
| GET | `/checkin/calendar` | 签到日历 |
| GET | `/messages` | 消息列表 |
| PUT | `/messages/:id/read` | 标记已读 |
| PUT | `/messages/read-all` | 全部已读 |
| GET | `/messages/unread-count` | 未读消息数 |

## 后台 API 接口清单（MVP 20个）

| Method | URL | 说明 |
|--------|-----|------|
| POST | `/admin/auth/login` | 管理员登录 |
| GET | `/admin/auth/profile` | 管理员信息 |
| GET | `/admin/categories` | 学科列表 |
| POST | `/admin/categories` | 新增学科 |
| PUT | `/admin/categories/:id` | 编辑学科 |
| DELETE | `/admin/categories/:id` | 删除学科 |
| GET | `/admin/levels` | 关卡列表 |
| POST | `/admin/levels` | 新增关卡 |
| PUT | `/admin/levels/:id` | 编辑关卡 |
| DELETE | `/admin/levels/:id` | 删除关卡 |
| GET | `/admin/questions` | 题目列表 |
| POST | `/admin/questions` | 新增题目 |
| PUT | `/admin/questions/:id` | 编辑题目 |
| DELETE | `/admin/questions/:id` | 删除题目 |
| GET | `/admin/users` | 用户列表 |
| PUT | `/admin/users/:id/status` | 用户封禁/解封 |
| POST | `/admin/messages` | 推送系统消息 |
| GET | `/admin/configs` | 配置列表 |
| PUT | `/admin/configs/:key` | 更新配置 |
| GET | `/admin/dashboard` | 运营数据看板 |

## 数据库 Schema（Prisma）

查看 `server/prisma/schema.prisma` 获取完整定义。核心数据表：

### 用户相关
- `users`：用户表（phone哈希, nickname, avatar, password_hash, status, points_balance）
- `user_tokens`：用户凭证表（refresh_token, expires_at）
- `admins`：管理员表（username, password_hash, role）

### 答题相关
- `categories`：学科表（name, name_en, icon, description, sort_order）
- `levels`：关卡表（category_id, level_no, name, difficulty, pass_score）
- `questions`：题目表（level_id, content, options[JSON], correct_answer, explanation）
- `user_answers`：答题记录表（user_id, question_id, level_id, attempt_id, selected_answer, is_correct, time_taken）
- `user_progress`：用户进度表（user_id, category_id, level_id, status, best_score, best_time, attempts）

### 积分与签到
- `points`：积分流水表（user_id, amount, balance_after, source: quiz/checkin/makeup/admin）
- `check_ins`：签到记录表（user_id, check_in_date, points_earned, is_makeup）

### 消息
- `messages`：消息表（user_id, type: system/my_comment/my_like, title, content, is_read, expires_at）

### 预留
- `comments`：评论表（user_id, question_id, content, parent_id）
- `likes`：点赞表（user_id, question_id）
- `system_configs`：系统配置表（config_key, config_value[JSON]）

## 代码规范

### NestJS 模块结构
每个业务模块必须包含：`.module.ts` + `.controller.ts` + `.service.ts` + DTO + Prisma 调用
```
modules/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── dto/
│   ├── register.dto.ts
│   └── login.dto.ts
└── auth.controller.spec.ts
```

### 通用模块结构
```
common/
├── guards/
│   ├── auth.guard.ts          # C端 Token 校验守卫
│   └── admin-auth.guard.ts    # 后台 Token 校验守卫
├── interceptors/
│   └── response.interceptor.ts # 统一响应格式 {code, message, data}
├── filters/
│   └── http-exception.filter.ts
├── decorators/
│   ├── current-user.decorator.ts
│   └── roles.decorator.ts
└── pipes/
    └── validation.pipe.ts
```

### JavaScript/TypeScript 编码规范（补充）

### 通用规范
- **ECMAScript 标准**：全栈采用 **ES6 (ECMAScript 2015)** 标准开发，优先使用 `const`/`let`、箭头函数、模板字符串、解构赋值、Promise/async-await、类(class)、模块(import/export) 等 ES6 特性
- **类型系统**：全栈 TypeScript，禁止使用 `any` 类型

### 客户端（client/）uni-app 规范
- Vue 组件统一使用 **`<script setup>`** 组合式 API 写法（ES6 JavaScript，不使用 TypeScript）
- 生命周期使用 `@dcloudio/uni-app` 提供的 `onLoad`、`onShow` 等 Hooks
- API 层请求封装使用 `.js` 文件

### 后端（server/）NestJS 规范
每个业务模块必须包含：`.module.ts` + `.controller.ts` + `.service.ts` + DTO + Prisma 调用

### 后台管理（admin/）React 规范
- 优先使用 **Function Component + Hooks** 方式编写组件，不使用 Class Component
- 状态管理使用 React 内置 Hooks（`useState`、`useEffect`、`useCallback`、`useMemo` 等）
- 自定义逻辑抽取为自定义 Hooks，放置在 `hooks/` 目录
- 页面组件按目录组织，每个页面一个目录（如 `pages/Users/`），默认导出

### Git 分支策略
- `main`：保护分支
- `feature/*`：功能开发分支
- `fix/*`：Bug修复分支
- Commit 前缀：`feat:` / `fix:` / `chore:` / `docs:`

### 代码质量
- ESLint + Prettier（NestJS 官方配置）
- Husky + lint-staged（提交前自动格式化）
- commitlint（Commit 信息规范化）

## 构建与运行命令

### 后端（server/）
```bash
# 开发
npm run start:dev
# 构建
npm run build
# 生产运行
node dist/main.js
# 数据库同步（开发阶段）
npx prisma db push
# 种子数据
npm run seed
# 测试
npm run test
npm run test:e2e
# 迁移（上线前）
npx prisma migrate dev
```

### 客户端（client/）
```bash
# 开发（H5 模式）
npm run dev:h5
# 构建微信小程序
npm run build:mp-weixin
```

### 后台管理（admin/）
```bash
# 开发
npm run dev
# 构建
npm run build
```

## 部署架构（MVP 内网简化）

```
单服务器：
NestJS(端口3000) → SQLite + 本地文件系统(uploads/)

访问地址：
- Swagger UI: http://[内网IP]:3000/api/docs
- C端 API: http://[内网IP]:3000/api/v1/*
- 后台管理: http://[内网IP]:3000/admin

账号管理：PM2 或 node dist/main.js 直接启动
数据库：自动生成在 ./data/ 目录
文件上传：./uploads/avatars/ 目录
```

## 重要约束

1. **C端鉴权**：全部业务接口需携带 `Authorization: Bearer {accessToken}`（登录/注册/刷新除外）
2. **后台鉴权**：管理员账号+密码 → JWT Token（较长过期时间）
3. **Token刷新**：refreshToken 独立接口刷新 accessToken
4. **统一中间件**：NestJS Guard 统一校验 Token，区分 C端/Admin 路由
5. **MVP管理员**：固定管理员账号，通过种子脚本初始化
6. **accessToken** 仅存内存，不落盘
7. **refreshToken** 通过 uni-app 本地存储 API 管理
