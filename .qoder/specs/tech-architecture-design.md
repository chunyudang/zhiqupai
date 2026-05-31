# 识趣派 — 技术架构设计文档

> 版本：v0.1 | 基于 MVP版本详细PRD v1.1
> 状态：讨论中（逐步确认）

---

## 一、技术选型总览

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| **客户端（C端）** | uni-app (Vue3 + Pinia) | 微信小程序 MVP，后续扩展 iOS/Android/鸿蒙 |
| **服务端框架** | Node.js + TypeScript + NestJS | RESTful API 设计 |
| **ORM** | TypeORM | NestJS 官方推荐，SQLite MVP → 改配置无缝切换 PostgreSQL |
| **数据库** | SQLite（MVP）→ 预留扩展至 PostgreSQL | MVP 阶段简化运维 |
| **缓存** | Redis | Token 缓存、数据缓存 |
| **对象存储** | 阿里云 OSS / 腾讯云 COS | 头像等静态资源 |
| **部署** | 云服务托管（阿里云/腾讯云 ECS） | |
| **API 文档** | Swagger UI (OpenAPI 3.0) | 交互式调试 |
| **后台管理（前端）** | React 18 + TypeScript + Ant Design 5 + React Router 6 + Axios + Vite | 独立 Web 管理界面 |
| **管理员账号** | MVP 阶段固定管理员账号，预留 RBAC 扩展 | 通过种子脚本初始化 |

---

## 二、整体架构分层

```
┌─────────────────────────────────────────────────────────────┐
│                    客户端层 (微信小程序)                       │
│              uni-app (Vue3 + Pinia)                         │
├─────────────────────────────────────────────────────────────┤
│                    CDN / 静态资源加速                        │
├─────────────────────────────────────────────────────────────┤
│                  API 网关层 (Nginx / ALB)                    │
│            路由分发 / 限流 / 负载均衡 / 统一入口              │
├──────────────────┬──────────────────────────────────────────┤
│   C端服务         │    后台管理层 (Admin)                    │
│  (NestJS Modules) │    (独立 React SPA + NestJS Admin API)  │
│                   │                                         │
│  ┌─────────────┐  │  ┌─────────────────────────────────┐   │
│  │ AuthModule   │  │  │ 管理员登录 / 鉴权               │   │
│  │ 注册/登录/   │  │  │ (固定账号 MVP → RBAC 后期)      │   │
│  │ Token管理    │  │  └─────────────────────────────────┘   │
│  ├─────────────┤  │  ┌─────────────────────────────────┐   │
│  │ UserModule   │  │  │ 学科管理：增删改学科/配置       │   │
│  │ 用户信息/    │  │  │ 关卡管理：配置关卡/难度         │   │
│  │ 账号管理     │  │  │ 题目管理：手动逐题新增/编辑     │   │
│  ├─────────────┤  │  └─────────────────────────────────┘   │
│  │ QuizModule   │  │  ┌─────────────────────────────────┐   │
│  │ 学科/关卡/   │  │  │ 用户管理：用户列表/封禁/解封    │   │
│  │ 答题/结算    │  │  └─────────────────────────────────┘   │
│  ├─────────────┤  │  ┌─────────────────────────────────┐   │
│  │ PointsModule │  │  │ 消息管理：推送系统消息          │   │
│  │ 积分流水     │  │  └─────────────────────────────────┘   │
│  ├─────────────┤  │  ┌─────────────────────────────────┐   │
│  │ CheckInModule│  │  │ 配置管理：签到/补签参数配置     │   │
│  │ 签到/补签    │  │  └─────────────────────────────────┘   │
│  ├─────────────┤  │  ┌─────────────────────────────────┐   │
│  │ MessageModule│  │  │ 内容管理：用户协议/隐私政策     │   │
│  │ 消息管理     │  │  └─────────────────────────────────┘   │
│  ├─────────────┤  │  ┌─────────────────────────────────┐   │
│  │ StatsModule  │  │  │ 运营看板：用户/答题/活跃数据     │   │
│  │ 数据统计     │  │  └─────────────────────────────────┘   │
│  ├─────────────┤  │                                         │
│  │ CommentModule│  │                                         │
│  │ LikeModule   │  │                                         │
│  └─────────────┘  │                                         │
├──────────────────┴──────────────────────────────────────────┤
│              API 统一设计规范                                │
│  • OpenAPI 3.0 (Swagger) 自动生成文档                        │
│  • C端 API: /api/v1/*                                      │
│  • 后台 API: /api/admin/v1/*                               │
│  • 统一鉴权中间件 + 版本控制                                │
├─────────────────────────────────────────────────────────────┤
│                    数据层                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  SQLite (MVP主存储) → 预留 PostgreSQL                 │   │
│  │  Redis (Token缓存 + 数据缓存 + 计数器)               │   │
│  │  OSS (头像/静态资源)                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 三、API 设计规范

### 3.1 URL 路由设计

| 类型 | 路由前缀 | 说明 |
|------|---------|------|
| C端 API | `/api/v1/*` | 小程序端接口 |
| 后台 API | `/api/admin/v1/*` | 后台管理系统接口 |
| Swagger | `/api/docs` | Swagger UI 交互式文档 |

### 3.2 安全与鉴权

| 机制 | 说明 |
|------|------|
| **C端鉴权** | 手机号+密码 → accessToken (JWT, 内存驻留) + refreshToken (本地安全存储) |
| **后台鉴权** | 管理员账号+密码 → JWT Token (较长的过期时间) |
| **Token刷新** | refreshToken 独立接口刷新 accessToken，自动登录流程 |
| **统一中间件** | NestJS Guard 统一校验 Token，区分 C端/Admin 路由 |
| **限流** | 自动登录接口独立限流，防暴力破解 |

### 3.3 版本控制

- URL 路径版本控制 `/api/v1/` → `/api/v2/`
- MVP 阶段为 v1
- 大版本升级时保留旧版本一定周期的兼容

---

## 四、NestJS 模块化设计

### 4.1 模块划分

| 模块 | 职责 | 控制器路由 |
|------|------|-----------|
| **AuthModule** | 注册、登录、Token管理、自动登录 | POST /auth/register, POST /auth/login, POST /auth/refresh |
| **UserModule** | 用户信息CRUD、账号注销 | GET/PUT /users/profile, DELETE /users/account |
| **QuizModule** | 学科列表、关卡列表、答题提交、结果计算、关卡回顾 | GET /categories, GET /levels, POST /quiz/submit, GET /quiz/review |
| **PointsModule** | 积分流水查询、余额查询 | GET /points/balance, GET /points/transactions |
| **CheckInModule** | 签到/补签、连续天数、签到日历 | POST /checkin, POST /checkin/makeup, GET /checkin/calendar |
| **MessageModule** | 消息列表、标记已读、全部已读 | GET /messages, PUT /messages/read, PUT /messages/read-all |
| **StatsModule** | 聚合数据统计 | GET /stats/dashboard, GET /stats/progress |
| **CommentModule** | 评论CRUD（预留） | MVP暂不开放 |
| **LikeModule** | 点赞/取消（预留） | MVP暂不开放 |
| **AdminModule** | 后台管理所有接口 | 统一路由 `/api/admin/v1/*` |

### 4.2 AdminModule 子模块

| 子模块 | 功能 |
|--------|------|
| AdminAuthController | 管理员登录、Token验证 |
| CategoryManageController | 学科增删改、排序、状态管理 |
| LevelManageController | 关卡配置、难度设置、解锁条件配置 |
| QuestionManageController | 题目手动新增、编辑、删除、查询 |
| UserManageController | 用户列表、状态管理(封禁/解封) |
| MessagePushController | 系统消息创建与推送 |
| SystemConfigController | 签到规则、补签限制等参数配置 |
| DashboardController | 运营数据概览看板 |

---

## 五、数据库 Schema 详细设计

基于 MVP PRD §8 数据模型概览展开：

### 5.1 用户相关表

```sql
-- 用户表
CREATE TABLE users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    phone         TEXT NOT NULL UNIQUE,          -- 手机号（加密存储）
    nickname      TEXT NOT NULL DEFAULT '',       -- 昵称
    avatar        TEXT DEFAULT '',                -- 头像 URL
    password_hash TEXT NOT NULL,                  -- 密码哈希
    status        TEXT NOT NULL DEFAULT 'active', -- active / banned / deleted
    points_balance INTEGER NOT NULL DEFAULT 0,   -- 积分余额（冗余字段，以流水为准）
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 用户凭证表
CREATE TABLE user_tokens (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER NOT NULL REFERENCES users(id),
    refresh_token TEXT NOT NULL UNIQUE,           -- refreshToken
    expires_at    DATETIME NOT NULL,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 管理员表（MVP固定账号，预留扩展）
CREATE TABLE admins (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'admin',  -- MVP固定admin，预留super_admin等
    status        TEXT NOT NULL DEFAULT 'active',
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 5.2 答题相关表

```sql
-- 学科表
CREATE TABLE categories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,                    -- 学科名称
    name_en     TEXT NOT NULL,                    -- 英文名（Science/Society/Logic/Life/Humanity）
    icon        TEXT DEFAULT '',                  -- 图标
    description TEXT DEFAULT '',
    sort_order  INTEGER NOT NULL DEFAULT 0,       -- 排序
    status      TEXT NOT NULL DEFAULT 'active',   -- active / inactive
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 关卡表
CREATE TABLE levels (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id   INTEGER NOT NULL REFERENCES categories(id),
    level_no      INTEGER NOT NULL,               -- 关卡序号 1-5
    name          TEXT NOT NULL,                   -- 关卡名称
    difficulty    TEXT NOT NULL DEFAULT 'easy',    -- easy / medium / hard
    pass_score    INTEGER NOT NULL DEFAULT 4,     -- 通关条件：答对≥4题
    status        TEXT NOT NULL DEFAULT 'active',
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, level_no)
);

-- 题目表
CREATE TABLE questions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    level_id        INTEGER NOT NULL REFERENCES levels(id),
    question_type   TEXT NOT NULL DEFAULT 'choice', -- 当前仅单选
    content         TEXT NOT NULL,                  -- 题干
    options         TEXT NOT NULL,                  -- JSON: ["A选项","B选项","C选项","D选项"]
    correct_answer  TEXT NOT NULL,                  -- 正确答案标识: "A"/"B"/"C"/"D"
    explanation     TEXT DEFAULT '',                -- 解析
    sort_order      INTEGER NOT NULL DEFAULT 0,
    status          TEXT NOT NULL DEFAULT 'active',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 用户答题记录表
CREATE TABLE user_answers (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id),
    question_id     INTEGER NOT NULL REFERENCES questions(id),
    level_id        INTEGER NOT NULL REFERENCES levels(id),
    attempt_id      TEXT NOT NULL,                 -- 一次答题尝试的UUID分组
    selected_answer TEXT,                          -- 用户选择的答案
    is_correct      INTEGER NOT NULL DEFAULT 0,    -- 0: 错误, 1: 正确
    time_taken      INTEGER DEFAULT 0,             -- 用时(秒)
    answered_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 用户进度表
CREATE TABLE user_progress (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id),
    category_id     INTEGER NOT NULL REFERENCES categories(id),
    level_id        INTEGER NOT NULL REFERENCES levels(id),
    status          TEXT NOT NULL DEFAULT 'available',  -- available / passed / locked
    best_score      INTEGER NOT NULL DEFAULT 0,         -- 最佳成绩(X/6)
    best_time       INTEGER DEFAULT 0,                  -- 最佳用时(秒)
    attempts        INTEGER NOT NULL DEFAULT 0,         -- 尝试次数
    completed_at    DATETIME,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, level_id)
);
```

### 5.3 积分与签到表

```sql
-- 积分流水表
CREATE TABLE points (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id),
    amount          INTEGER NOT NULL,              -- 变动值 +/-
    balance_after   INTEGER NOT NULL,              -- 变动后余额
    source          TEXT NOT NULL,                 -- quiz / checkin / makeup / admin
    reference_id    TEXT,                          -- 关联ID（如答题attempt_id）
    description     TEXT DEFAULT '',               -- 备注
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_points_user_id ON points(user_id);
CREATE INDEX idx_points_created ON points(created_at);

-- 签到记录表
CREATE TABLE check_ins (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id),
    check_in_date   DATE NOT NULL,                 -- 签到日期
    points_earned   INTEGER NOT NULL DEFAULT 0,    -- 获得积分
    is_makeup       INTEGER NOT NULL DEFAULT 0,    -- 0:正常签到, 1:补签
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, check_in_date)
);
CREATE INDEX idx_checkins_user_date ON check_ins(user_id, check_in_date);
```

### 5.4 消息表

```sql
-- 消息表
CREATE TABLE messages (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id),
    type            TEXT NOT NULL,                 -- system / my_comment / my_like
    title           TEXT NOT NULL,
    content         TEXT DEFAULT '',
    reference_type  TEXT,                          -- question / comment
    reference_id    INTEGER,                       -- 关联ID
    is_read         INTEGER NOT NULL DEFAULT 0,    -- 0:未读, 1:已读
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at      DATETIME                       -- 30天后过期
);
CREATE INDEX idx_messages_user ON messages(user_id, type, is_read);
```

### 5.5 评论与点赞表（预留）

```sql
-- 评论表
CREATE TABLE comments (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id),
    question_id     INTEGER NOT NULL REFERENCES questions(id),
    content         TEXT NOT NULL,                 -- ≤200字
    parent_id       INTEGER REFERENCES comments(id), -- 回复评论ID
    status          TEXT NOT NULL DEFAULT 'active', -- active / deleted / hidden
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 点赞表
CREATE TABLE likes (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id),
    question_id     INTEGER NOT NULL REFERENCES questions(id),
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, question_id)
);
```

### 5.6 系统配置表（后台管理用）

```sql
-- 系统配置表
CREATE TABLE system_configs (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    config_key      TEXT NOT NULL UNIQUE,           -- 配置键
    config_value    TEXT NOT NULL,                  -- 配置值（JSON格式）
    description     TEXT DEFAULT '',
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 初始种子配置
-- INSERT INTO system_configs VALUES (1, 'checkin_rules', '{"max_makeup_per_month": 5, "makeup_cost": 50}', '签到规则配置', CURRENT_TIMESTAMP);
```

---

## 六、客户端（uni-app）架构

### 6.1 目录结构

```
shiqupai-client/
├── src/
│   ├── pages/                    # 页面
│   │   ├── login/                # 登录/注册
│   │   ├── home/                 # 首页（答题入口）
│   │   ├── quiz/                 # 答题相关
│   │   │   ├── categories.vue    # A-01 学科选择
│   │   │   ├── levels.vue       # A-02 关卡选择
│   │   │   ├── playing.vue      # A-03 答题进行
│   │   │   ├── result.vue       # A-04 答题结果
│   │   │   └── review.vue       # A-05 关卡回顾
│   │   ├── profile/              # 个人中心
│   │   │   ├── index.vue        # P-01 我的主页
│   │   │   ├── checkin.vue      # P-02 签到日历
│   │   │   ├── stats.vue        # P-03 数据统计
│   │   │   ├── records.vue      # P-04 答题记录
│   │   │   ├── points.vue       # P-05 积分明细
│   │   │   └── settings.vue     # P-06 设置
│   │   ├── messages/             # 消息页面
│   │   └── placeholder/          # 预留页面（竞猜/商城提示页）
│   ├── components/               # 通用组件
│   │   ├── TabBar.vue
│   │   ├── NavBar.vue
│   │   ├── Skeleton.vue
│   │   ├── EmptyState.vue
│   │   └── Toast.vue
│   ├── api/                      # API请求封装
│   │   ├── request.ts            # Axios 实例 + 拦截器
│   │   ├── auth.ts
│   │   ├── quiz.ts
│   │   ├── points.ts
│   │   ├── checkin.ts
│   │   └── messages.ts
│   ├── store/                    # Pinia 状态管理
│   │   ├── user.ts
│   │   └── app.ts
│   ├── utils/                    # 工具函数
│   │   ├── token.ts              # Token管理（refreshToken存储/读取）
│   │   ├── time.ts               # 时间格式化
│   │   └── validators.ts         # 表单校验
│   ├── static/
│   ├── App.vue
│   └── main.ts
├── manifest.json                 # uni-app 配置文件
├── pages.json                    # 页面路由配置
└── package.json
```

### 6.2 Token 与自动登录管理

| 场景 | 处理逻辑 |
|------|---------|
| App启动 | 检查本地refreshToken → 调用刷新接口 → 成功直入首页 / 失败跳登录页 |
| 网络不可用但有本地凭证 | 直接进入首页（使用缓存的用户信息） |
| API调用401 | 拦截器自动尝试refreshToken刷新 → 刷新成功后重试原请求 / 失败跳登录页 |
| 退出登录 | 清除本地refreshToken和内存中的accessToken |

### 6.3 安全约束实现

- refreshToken 存储：微信小程序使用 `wx.setStorageSync`（加密存储区域）
- accessToken：仅存 Vuex/Pinia 内存，不落盘
- 手机号：仅用于登录/注册请求，不本地存储明文

---

## 七、后台管理系统架构

### 7.1 技术栈

| 项 | 选型 |
|----|------|
| 框架 | React 18 + TypeScript |
| UI组件库 | Ant Design 5 |
| 路由 | React Router 6 |
| HTTP | Axios |
| 构建 | Vite |
| 部署 | 静态资源部署至 OSS / Nginx，通过云服务托管 |

### 7.2 页面结构

```
admin/
├── src/
│   ├── pages/
│   │   ├── Login/
│   │   ├── Dashboard/           # 运营看板
│   │   ├── Categories/          # 学科管理
│   │   ├── Levels/              # 关卡管理
│   │   ├── Questions/           # 题目管理
│   │   ├── Users/               # 用户管理
│   │   ├── Messages/            # 消息推送
│   │   └── System/              # 系统配置
│   ├── components/              # 通用组件
│   ├── api/                     # API请求
│   ├── hooks/                   # 自定义Hooks
│   ├── utils/                   # 工具函数
│   ├── App.tsx
│   └── main.tsx
├── vite.config.ts
└── package.json
```

### 7.3 API路由设计

```
/api/admin/v1/auth/login          POST   管理员登录
/api/admin/v1/auth/profile        GET    管理员信息

/api/admin/v1/categories          GET    学科列表
/api/admin/v1/categories          POST   新增学科
/api/admin/v1/categories/:id      PUT    编辑学科
/api/admin/v1/categories/:id      DELETE 删除学科

/api/admin/v1/levels              GET    关卡列表
/api/admin/v1/levels              POST   新增关卡
/api/admin/v1/levels/:id          PUT    编辑关卡
/api/admin/v1/levels/:id          DELETE 删除关卡

/api/admin/v1/questions           GET    题目列表（分页）
/api/admin/v1/questions           POST   新增题目
/api/admin/v1/questions/:id       PUT    编辑题目
/api/admin/v1/questions/:id       DELETE 删除题目

/api/admin/v1/users               GET    用户列表（分页）
/api/admin/v1/users/:id/status    PUT    用户状态（封禁/解封）

/api/admin/v1/messages            GET    消息列表
/api/admin/v1/messages            POST   推送系统消息

/api/admin/v1/configs             GET    配置列表
/api/admin/v1/configs/:key        PUT    更新配置

/api/admin/v1/dashboard           GET    运营数据看板
```

---

## 八、部署架构

```
                          ┌─────────────────────┐
                          │      DNS/CDN         │
                          └────────┬────────────┘
                                   │
                          ┌────────┴────────────┐
                          │   Nginx 反向代理      │
                          │   SSL 终止 + 限流     │
                          └────────┬────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
          ┌─────────┴────────┐  ┌─┴──────────┐  ┌─┴──────────┐
          │ NestJS C端 API    │  │ Admin API  │  │ Admin SPA  │
          │ /api/v1/*        │  │ /admin/v1/*│  │ (静态资源)  │
          └─────────┬────────┘  └─┬──────────┘  └────────────┘
                    │              │
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │   SQLite    │
                    │  + Redis    │
                    └─────────────┘
```

MVP阶段简化部署（单服务器方案）：
- 一台 ECS 云服务器
- Nginx 反向代理 + SSL
- NestJS 服务（PM2 进程管理）
- SQLite 数据库文件
- Admin SPA 通过 Nginx 静态服务
- Redis 可选（MVP可先用内存缓存简化）

---

## 九、项目目录结构（完整）

```
shiqupai/                       # 项目根目录
├── server/                     # 后端 NestJS 服务
│   ├── src/
│   │   ├── modules/            # 业务模块
│   │   │   ├── auth/
│   │   │   ├── user/
│   │   │   ├── quiz/
│   │   │   ├── points/
│   │   │   ├── checkin/
│   │   │   ├── message/
│   │   │   ├── stats/
│   │   │   ├── comment/
│   │   │   ├── like/
│   │   │   └── admin/
│   │   ├── common/             # 公共模块
│   │   │   ├── guards/         # 鉴权守卫
│   │   │   ├── interceptors/   # 拦截器
│   │   │   ├── filters/        # 异常过滤器
│   │   │   ├── decorators/     # 自定义装饰器
│   │   │   └── pipes/          # 管道验证
│   │   ├── database/           # 数据库配置
│   │   │   ├── migrations/
│   │   │   └── seeds/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
│
├── client/                     # 客户端 uni-app
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── api/
│   │   ├── store/
│   │   └── utils/
│   ├── manifest.json
│   ├── pages.json
│   └── package.json
│
├── admin/                      # 后台管理 React SPA
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── api/
│   │   └── hooks/
│   ├── vite.config.ts
│   └── package.json
│
└── docs/                       # 文档
    ├── 识趣派-MVP版本详细PRD.md
    ├── 识趣派-产品整体功能规划图v2.0.md
    └── API.md                  # OpenAPI 文档
```

---

## 附录：讨论确认记录

### 讨论 A：项目工程化与开发规范（✅ 已确认，2026-05-31）

| 议题 | 确认结论 |
|------|---------|
| **ORM 选择** | TypeORM — NestJS 官方推荐，SQLite→PG 改配置即可无缝切换 |
| **代码质量工具** | NestJS 官方推荐 ESLint + Prettier 配置；配合 Husky + lint-staged + commitlint |
| **Git 分支策略** | 简化版：`main`（保护分支）+ `feature/*` + `fix/*` 分支，PR 合并至 main；commit 前缀 `feat:` / `fix:` / `chore:` / `docs:` |
| **环境变量管理** | `.env.*` 文件 + `@nestjs/config` 模块管理；核心变量包含 DB/JWT/OSS/管理员凭据 |
| **管理员初始化** | 通过种子脚本（`npm run seed`）创建初始管理员账户 |

### 讨论 B：安全与鉴权方案（✅ 已确认，2026-05-31）

| 议题 | 确认结论 |
|------|---------|
| **Token 机制** | accessToken 15分钟过期（内存驻留）+ refreshToken 30天过期（uni-app 本地存储）；固定 refreshToken 不轮换 |
| **自动登录流程** | App 启动 → 检查本地 refreshToken → `/auth/refresh` 获取新 accessToken → 成功直入首页 / 失败跳登录页 |
| **答题防作弊** | 三层防护：① 客户端20秒倒计时强制 ② 服务端校验 time_taken 3-20秒/题，总用时 18-120秒，客户端时间戳偏差≤30秒 ③ 数据层答题频率检测 |
| **手机号存储** | MVP 阶段使用 SHA-256 哈希脱敏存储；API 返回脱敏展示（138****5678）；后期升级为 AES-256-GCM 加密 |
| **接口限流** | login 5次/分钟、register 3次/分钟、refresh 10次/分钟、quiz/submit 10次/分钟、checkin 1次/天、makeup 月限5次、全局 100次/分钟/IP |
| **refreshToken 存储** | 使用 uni-app 框架的本地存储 API |

### 讨论 C：答题核心流程技术实现（✅ 已确认，2026-05-31）

| 议题 | 确认结论 |
|------|---------|
| **倒计时策略** | 每题独立20秒倒计时。混合策略：服务端 `/quiz/start` 下发 expire_at → 客户端本地倒计时 → 提交时服务端校验 time_taken 3-20秒/题 |
| **题目随机抽取** | 优先选用户未见过的新题；库存不足时才允许复用同一关卡题目；Fisher-Yates 洗牌算法 |
| **关卡状态机** | LOCKED（前置关卡未通关）→ AVAILABLE（可挑战）→ IN_PROGRESS（答题中）→ PASSED（已通关，解锁下一关）/ FAILED（回退至 AVAILABLE） |
| **积分事务** | TypeORM 事务，3表原子写入（user_answers + user_progress + points）；已通关关卡再次答题积分为0 |
| **防重复提交** | attempt_id (UUID) 防重复，服务端校验 attempt_id 唯一性 |

### 讨论 D：数据迁移与种子数据（✅ 已确认，2026-05-31）

| 议题 | 确认结论 |
|------|---------|
| **TypeORM 策略** | 开发阶段 `synchronize: true` 快速迭代；上线前转为 migration 管理 |
| **种子数据** | 4个种子脚本（admin → categories → levels → questions）；初始题库框架提供，内容由用户自行填充；每关 ≥ 12题 |
| **SQLite → PostgreSQL 迁移** | TypeORM Entity 定义保证兼容，切换仅改 `data-source.ts` 配置；通过 JSON 导出导入完成数据迁移 |
