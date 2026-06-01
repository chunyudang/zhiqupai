# 识趣派后端初始化计划

## Context

项目进入编码阶段。`server/` 目录当前不存在，需从零搭建完整的 NestJS 后端。`docs/` 中有 5 份完整需求文档，`AGENTS.md` 包含完整的 API 清单（43 个接口）、Prisma Schema、业务规则。`docs/seed.js` 中有可参考的种子数据（5 学科 × 5 关卡 × 150 题）。

## 总体策略

按依赖关系分 10 个 Phase 顺序实施，每个 Phase 完成后即可独立验证。所有 API 统一使用 `@nestjs/swagger` 装饰器生成 OpenAPI 文档。

## Phase 1: 项目脚手架

### 目标
初始化 NestJS TypeScript 项目，安装全部依赖，配置 TS/ESLint/Prettier/环境变量。

### 创建文件

| 文件 | 说明 |
|------|------|
| `server/package.json` | 含 scripts: start:dev, build, seed, test, test:e2e, lint, format, db:push |
| `server/tsconfig.json` | paths 别名 `@/*` → `./src/*` |
| `server/tsconfig.build.json` | 排除 test/ 和 prisma/seeds/ |
| `server/nest-cli.json` | sourceRoot: src, entryFile: main |
| `server/.eslintrc.js` | NestJS 官方 ESLint 配置 |
| `server/.prettierrc` | singleQuote, semi: false, printWidth: 100 |
| `server/.env` | DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, ADMIN_JWT_SECRET, PORT |
| `server/.env.example` | 模板文件（无真实密钥） |

### 关键依赖
**生产**: @nestjs/core, @nestjs/common, @nestjs/platform-express, @nestjs/config, @nestjs/swagger, @nestjs/jwt, @nestjs/passport, @nestjs/serve-static, @nestjs/throttler, @prisma/client, prisma, bcryptjs, class-validator, class-transformer, multer, uuid
**开发**: @nestjs/cli, @nestjs/schematics, @nestjs/testing, typescript, ts-node, eslint, prettier, jest, ts-jest, supertest

## Phase 2: 数据库 (Prisma)

### 目标
编写完整 Prisma Schema（14 个模型），创建种子数据脚本（从 seed.js 移植）。

### 创建文件

| 文件 | 说明 |
|------|------|
| `server/prisma/schema.prisma` | 14 个 model：User, UserToken, Admin, Category, Level, Question, UserAnswer, UserProgress, Point, CheckIn, Message, Comment(预留), Like(预留), SystemConfig |
| `server/prisma/seeds/seed.ts` | 入口，顺序调用各种子脚本 |
| `server/prisma/seeds/seed-admin.ts` | 管理员 admin/admin123 |
| `server/prisma/seeds/seed-categories.ts` | 5 大学科 |
| `server/prisma/seeds/seed-levels.ts` | 25 关（每学科 5 关） |
| `server/prisma/seeds/seed-questions.ts` | 从 seed.js 移植题目 |

### Schema 关键设计
- SQLite 不支持 enum，枚举字段用 String + 注释
- options/config_value 字段用 String（Prisma 端），实际存 JSON
- phone 主字段存 SHA-256 哈希，额外 `phoneLastFour` 字段存后4位用于脱敏
- 连接字符串含 `foreign_keys=true`
- 复合唯一约束：levels(categoryId+levelNo), user_progress(userId+levelId), check_ins(userId+checkInDate)

## Phase 3: 通用基础设施

### 目标
构建全局共用的 Prisma 模块、响应拦截器、异常过滤器、JWT 守卫、装饰器、验证管道、限流守卫。

### 创建文件

| 文件 | 说明 |
|------|------|
| `server/src/prisma/prisma.service.ts` | extends PrismaClient, implements OnModuleInit |
| `server/src/prisma/prisma.module.ts` | @Global() 模块 |
| `server/src/common/interceptors/response.interceptor.ts` | 包装为 `{code, message, data}` 格式 |
| `server/src/common/filters/http-exception.filter.ts` | 统一错误码返回 |
| `server/src/common/guards/auth.guard.ts` | C 端 JWT 守卫，支持 `@Public()` 跳过 |
| `server/src/common/guards/admin-auth.guard.ts` | 后台 JWT 守卫（独立 ADMIN_JWT_SECRET） |
| `server/src/common/guards/rate-limit.guard.ts` | 内存 Map 限流守卫 |
| `server/src/common/decorators/current-user.decorator.ts` | `@CurrentUser()` 提取 req.user |
| `server/src/common/decorators/current-admin.decorator.ts` | `@CurrentAdmin()` 提取 req.admin |
| `server/src/common/decorators/public.decorator.ts` | `@Public()` 跳过鉴权 |
| `server/src/common/pipes/validation.pipe.ts` | 全局 ValidationPipe |
| `server/src/common/utils/mask-phone.ts` | 手机号脱敏工具函数 |
| `server/src/common/utils/pagination.ts` | 分页工具函数 |
| `server/src/app.module.ts` | 根模块，注册全局守卫/拦截器/过滤器/管道 |
| `server/src/main.ts` | Swagger + CORS + ServeStatic + ValidationPipe + 静态资源托管 |

### main.ts 关键配置
- Swagger：`/api/docs`，BearerAuth 方案
- CORS：内网放宽
- ServeStatic：`/uploads` 目录托管，`/admin` 预留（如不存在则降级）
- 全局管道：whitelist + forbidNonWhitelisted

## Phase 4: Auth 模块

### 目标
实现注册、登录、刷新 Token、退出登录 4 个接口。

### 创建文件
`server/src/modules/auth/auth.module.ts`, `auth.controller.ts`, `auth.service.ts`, `dto/register.dto.ts`, `dto/login.dto.ts`, `dto/refresh.dto.ts`

### 核心逻辑
- **register**: phone SHA-256 哈希存 phone 字段 + phoneLastFour 字段，password bcrypt，生成双 Token
- **login**: phone 哈希查找，bcrypt 校验，生成双 Token
- **refresh**: 查 user_tokens 表验证 refreshToken，生成新 accessToken
- **logout**: 删除该用户所有 refreshToken 记录
- accessToken: 15min, refreshToken: 30d UUID

## Phase 5: User 模块

### 目标
个人资料 CRUD、头像上传、账号注销 4 个接口。

### 创建文件
`server/src/modules/user/user.module.ts`, `user.controller.ts`, `user.service.ts`, `dto/update-profile.dto.ts`

### 核心逻辑
- **getProfile**: 返回用户信息 + phone 脱敏
- **updateProfile**: 仅允许 nickname
- **uploadAvatar**: multer FileInterceptor，限制 jpg/png ≤2MB，路径 `/uploads/avatars/{timestamp}_{uuid}.ext`
- **deleteAccount**: 校验密码，软删除（status='deleted'），清除 refreshToken

## Phase 6: Quiz 模块

### 目标
学科列表、关卡列表、开始答题、提交答案、关卡回顾、总进度 6 个接口。

### 创建文件
`server/src/modules/quiz/quiz.module.ts`, `quiz.controller.ts`, `quiz.service.ts`, `dto/start-quiz.dto.ts`, `dto/submit-quiz.dto.ts`

### 核心逻辑
- **getCategories**: 按 sortOrder 排，附加每科用户通关数
- **getLevels**: 按 levelNo 排，计算每关状态（locked/available/in_progress/passed）
- **startQuiz**: 校验关卡状态，随机抽 6 题（优先新题），Fisher-Yates 洗牌，生成 attemptId
- **submitQuiz**: 防重复（attemptId）、防作弊（timeTaken 3-20s/题）、积分计算（+15/题 +50通关）、Prisma 事务原子写入 3 模型
- **getReview**: 返回最新一次答题记录 + 正确答案 + 解析
- **getProgress**: 聚合总进度

## Phase 7: Points 模块

### 目标
积分余额查询、积分流水列表 2 个接口。

### 创建文件
`server/src/modules/points/points.module.ts`, `points.controller.ts`, `points.service.ts`, `dto/query-transactions.dto.ts`

## Phase 8: Checkin 模块

### 目标
每日签到、补签、签到日历 3 个接口。

### 创建文件
`server/src/modules/checkin/checkin.module.ts`, `checkin.controller.ts`, `checkin.service.ts`, `dto/makeup.dto.ts`, `dto/calendar-query.dto.ts`

### 核心逻辑
- **checkin**: 连续天数计算（自然月重置+断签重置），积分 min(day, 7)
- **makeup**: 校验日期合法性，消耗 50 积分，月限 5 次（从 system_configs 读取）
- **calendar**: 返回当月日历状态 + 剩余补签次数

## Phase 9: Message 模块

### 目标
消息列表、单条已读、全部已读、未读计数 4 个接口。

### 创建文件
`server/src/modules/message/message.module.ts`, `message.controller.ts`, `message.service.ts`, `dto/query-messages.dto.ts`

### 核心逻辑
- 查询时过滤 expireAt 过期的消息
- 支持按 type 筛选（system/my_comment/my_like）
- 未读数按 type 分组统计

## Phase 10: Admin 模块

### 目标
全部 20 个后台管理接口。

### 创建文件（按 Controller 分）
- `admin.module.ts`, `admin.service.ts`
- `controllers/admin-auth.controller.ts` — login + profile
- `controllers/category-manage.controller.ts` — CRUD
- `controllers/level-manage.controller.ts` — CRUD
- `controllers/question-manage.controller.ts` — CRUD + 分页
- `controllers/user-manage.controller.ts` — list + ban/unban
- `controllers/message-push.controller.ts` — 推送系统消息
- `controllers/system-config.controller.ts` — list + update
- `controllers/dashboard.controller.ts` — 运营看板统计
- `dto/` 下对应各 DTO 文件

---

## 实施顺序

```
Phase 1 (脚手架)
  → Phase 2 (Prisma Schema + Seed)
    → Phase 3 (Common: Guards/Interceptors/Filters/Pipes)
      → Phase 4 (Auth)
        → Phase 5 (User) + Phase 6 (Quiz) + Phase 7 (Points) + Phase 8 (Checkin) + Phase 9 (Message)
          → Phase 10 (Admin)
```

Phase 5-9 之间相对独立，可并行实施。Phase 10 独立于 Phase 4-9。

## 验证方式

每个 Phase 完成后通过以下方式验证：
1. **Phase 1**: `npm run start:dev` 启动成功，Swagger UI 可访问
2. **Phase 2**: `npx prisma db push && npm run seed` 数据库正确创建，种子数据入库
3. **Phase 3**: 任意请求返回 `{code, message, data}` 格式
4. **Phase 4**: Swagger UI 执行注册→登录→refresh→logout 完整流程
5. **Phase 5**: 鉴权后获取/修改个人信息，上传头像
6. **Phase 6**: 完整答题闭环：选科→选关→答题→提交→回顾
7. **Phase 7**: 查询积分余额和流水
8. **Phase 8**: 签到→补签→日历查询
9. **Phase 9**: 消息列表→标记已读→未读计数
10. **Phase 10**: 后台完整 CRUD + Dashboard
