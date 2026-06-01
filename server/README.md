# 识趣派（ShiQuPai）后端服务

基于 NestJS + Prisma + SQLite 构建的答题闯关小程序后端。

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量（已有 .env 则跳过）
cp .env.example .env

# 3. 初始化数据库表结构
npm run db:push

# 4. 导入种子数据（管理员 + 150道题）
npm run seed

# 5. 启动开发服务器
npm run start:dev
```

## 可用命令

| 命令 | 说明 |
|------|------|
| `npm run start:dev` | 开发模式启动（热重载） |
| `npm run start:debug` | 调试模式启动 |
| `npm run build` | 生产构建 |
| `npm run start:prod` | 生产模式运行 |
| `npm run db:push` | 同步 Prisma Schema 到数据库 |
| `npm run db:studio` | 打开 Prisma Studio 数据库管理界面 |
| `npm run seed` | 运行种子脚本 |
| `npm run lint` | ESLint 代码检查 |
| `npm run format` | Prettier 代码格式化 |
| `npm run test` | 运行单元测试 |
| `npm run test:e2e` | 运行端到端测试 |

## API 地址

| 类型 | 路径 |
|------|------|
| C端 API | `http://localhost:3000/api/v1/*` |
| Admin API | `http://localhost:3000/api/admin/v1/*` |
| Swagger 文档 | `http://localhost:3000/api/docs` |

## 测试账号

| 角色 | 账号 | 密码 |
|------|------|------|
| 管理员 | `admin` | `admin123` |
| C端用户 | 需自行注册（POST /api/v1/auth/register） |

## 技术栈

- **框架**: NestJS 10
- **ORM**: Prisma 5
- **数据库**: SQLite（MVP 阶段）
- **认证**: JWT 双 Token（accessToken 15min + refreshToken 30d）
- **API 文档**: Swagger / OpenAPI 3.0

## 目录结构

```
server/
├── prisma/
│   ├── schema.prisma          # 数据模型定义（14 张表）
│   └── seeds/                 # 种子数据脚本
├── src/
│   ├── common/                # 通用模块（守卫/拦截器/过滤器/装饰器）
│   ├── modules/
│   │   ├── auth/              # 认证模块
│   │   ├── user/              # 用户模块
│   │   ├── quiz/              # 答题模块
│   │   ├── points/            # 积分模块
│   │   ├── checkin/           # 签到模块
│   │   ├── message/           # 消息模块
│   │   └── admin/             # 后台管理模块
│   ├── prisma/                # Prisma 服务
│   ├── app.module.ts
│   └── main.ts
├── data/                      # SQLite 数据库文件
├── uploads/avatars/           # 头像文件存储
└── package.json
```
