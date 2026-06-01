# 识趣派后台管理系统

识趣派（ShiQuPai）后台管理系统，基于 React 18 + TypeScript + Ant Design 5 构建的独立 SPA 应用，提供运营数据看板、内容管理（学科/关卡/题目）、用户管理、消息推送、系统配置等后台功能。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 |
| 语言 | TypeScript |
| UI 组件 | Ant Design 5 |
| 路由 | React Router 6 |
| HTTP 客户端 | Axios |
| 构建工具 | Vite |

## 目录结构

```
admin/
├── index.html                # HTML 入口
├── package.json              # 依赖与脚本
├── vite.config.ts            # Vite 配置（代理、别名、构建）
├── tsconfig.json             # TypeScript 配置入口
├── tsconfig.app.json         # 应用级 TS 配置
├── tsconfig.node.json        # Node 级 TS 配置
└── src/
    ├── main.tsx              # React 入口
    ├── App.tsx               # 根组件（路由配置）
    ├── vite-env.d.ts         # Vite 类型声明
    ├── types/
    │   └── index.ts          # 全局 TypeScript 类型定义
    ├── api/                  # API 请求封装
    │   ├── request.ts        # Axios 实例（拦截器、错误处理）
    │   ├── auth.ts           # 管理员认证
    │   ├── categories.ts     # 学科管理
    │   ├── levels.ts         # 关卡管理
    │   ├── questions.ts      # 题目管理
    │   ├── users.ts          # 用户管理
    │   ├── messages.ts       # 消息推送
    │   ├── configs.ts        # 系统配置
    │   └── dashboard.ts      # 运营看板
    ├── hooks/
    │   └── useAuth.tsx       # 认证状态管理（Context + Hook）
    ├── components/
    │   ├── AppLayout.tsx     # 主布局（侧边栏 + 顶栏 + 内容区）
    │   └── ProtectedRoute.tsx # 鉴权路由守卫
    └── pages/                # 页面组件
        ├── Login/index.tsx
        ├── Dashboard/index.tsx
        ├── Categories/index.tsx
        ├── Levels/index.tsx
        ├── Questions/index.tsx
        ├── Users/index.tsx
        ├── Messages/index.tsx
        └── System/index.tsx
```

## 快速开始

### 前置条件

- Node.js >= 18
- 后端服务（`server/`）已在 3000 端口运行

### 安装依赖

```bash
cd admin
npm install
```

### 开发模式启动

```bash
npm run dev
```

访问 `http://localhost:5173`，Vite dev server 会自动代理 `/api` 请求到后端 `http://localhost:3000`。

**默认管理员账号**：`admin` / `admin123`

### 生产构建

```bash
npm run build
```

构建产物输出到 `dist/` 目录。后端 NestJS 通过 `@nestjs/serve-static` 将该目录托管到 `/admin` 路径，生产环境访问 `http://<服务器>:3000/admin` 即可。

## 页面功能

### 1. 登录页 (`/login`)

管理员登录入口，使用用户名+密码认证，登录后获取 JWT Token 存储在 `localStorage`（有效期 7 天）。

### 2. 运营看板 (`/dashboard`)

展示 6 个核心运营指标：

| 指标 | 说明 |
|------|------|
| 总用户数 | 所有未注销用户 |
| 今日新增 | 当天新注册用户 |
| 总答题次数 | 去重答题场次 |
| 平均通关率 | 百分比（0-100） |
| 总签到次数 | 历史总签到 |
| 今日签到 | 当天签到次数 |

### 3. 学科管理 (`/categories`)

支持学科的增删改查：
- 列表展示所有学科（名称、英文名、图标、描述、排序、状态）
- 新增/编辑 Modal 表单
- 删除需二次确认

### 4. 关卡管理 (`/levels`)

支持关卡的增删改查，按学科筛选：
- 顶部下拉框按学科过滤
- 难度标签（简单/中等/困难）彩色展示
- 关卡号范围 1-5，通关分范围 1-6

### 5. 题目管理 (`/questions`)

最复杂的页面，支持分页、搜索、筛选：
- **筛选**：按关卡下拉筛选 + 按题目内容关键词搜索
- **分页**：服务端分页，支持切换每页条数
- **新增/编辑**：宽 Modal（720px），包含题目内容、4 个选项输入框、正确答案单选、解析
- 选项以 JSON 数组形式存储，编辑时自动解析/序列化

### 6. 用户管理 (`/users`)

用户列表与状态管理：
- 分页展示，支持按手机号后4位或昵称搜索
- 状态标签：正常(绿) / 封禁(红) / 已注销(灰)
- 操作：封禁 / 解封（需 Popconfirm 二次确认）
- 已注销用户不显示操作按钮

### 7. 消息推送 (`/messages`)

向所有活跃用户推送系统消息：
- 标题（≤100字符）+ 内容（≤500字符）
- 页面顶部 Alert 提示"30天自动过期"
- 提交后弹窗显示推送成功人数

### 8. 系统配置 (`/system`)

管理系统配置项：
- 列表展示配置键、值（JSON 格式化预览）、描述、更新时间
- 编辑 Modal 中 configValue 用 monospace 字体展示，提交前前端校验 JSON 合法性

## API 对接

前端通过 Axios 实例（`src/api/request.ts`）对接后端 20 个 Admin API，基础路径 `/api/admin/v1`。

### 统一响应格式

```json
// 成功
{ "code": 0, "message": "success", "data": { ... } }
// 错误
{ "code": 90001, "message": "错误信息", "data": null }
```

### 请求拦截器

- 自动从 `localStorage` 读取 `admin_token` 并附加 `Authorization: Bearer` 头

### 响应拦截器

- `code !== 0` → 自动 `message.error()` 弹窗提示
- HTTP 401 → 清除 Token + 跳转登录页

## 认证机制

- 使用 React Context（`useAuth` Hook）管理全局认证状态
- Token 存储在 `localStorage`，有效期 7 天
- 应用启动时自动从 `localStorage` 恢复 Token 并验证有效性
- `ProtectedRoute` 组件检查认证状态，未登录自动跳转 `/login`
- `AppLayout` 右上角显示当前管理员用户名，支持退出登录

## 布局说明

采用 Ant Design `Layout` 组件手写布局：

```
┌──────────────────────────────────────┐
│ Sider           │ Header             │
│ ┌──────────────┐│ ┌─ 用户名 ─ 退出 ─┐ │
│ │ Logo/标题    ││ └─────────────────┘ │
│ ├──────────────┤├────────────────────┤ │
│ │ ● 运营看板   ││                    │ │
│ │ ● 内容管理   ││    Content Area    │ │
│ │   ├ 学科管理 ││    <Outlet />      │ │
│ │   ├ 关卡管理 ││                    │ │
│ │   └ 题目管理 ││                    │ │
│ │ ● 用户管理   ││                    │ │
│ │ ● 消息推送   ││                    │ │
│ │ ● 系统配置   ││                    │ │
│ └──────────────┘│                    │ │
└──────────────────────────────────────┘
```

- 侧边栏可折叠
- 菜单高亮跟随当前路由
- 内容区圆角卡片风格

## 环境变量

无需额外配置 `.env` 文件。Vite 会根据 `NODE_ENV` 自动切换：

| 环境 | base path | API 代理 |
|------|-----------|----------|
| 开发 (`dev`) | `/` | Vite proxy → `localhost:3000` |
| 生产 (`build`) | `/admin/` | 由 NestJS ServeStaticModule 托管 |

## 后端集成

生产部署时，NestJS 通过以下配置托管 admin SPA：

```typescript
// server/src/app.module.ts
ServeStaticModule.forRoot({
  rootPath: join(__dirname, '..', '..', 'admin', 'dist'),
  serveRoot: '/admin',
  exclude: ['/api/*'],
})
```

构建产物路径：`admin/dist/` → 访问路径：`http://<host>:3000/admin`
