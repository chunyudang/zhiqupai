# 识趣派（ShiQuPai）

**识趣派**是一个"轻学习+强激励"的答题闯关娱乐微信小程序。用户在 5 分钟内完成一轮答题闯关，通过通识知识题目提升认知能力，获得积分奖励和成就感。

## MVP 功能范围

| 模块 | 说明 |
|------|------|
| ① 用户体系 | 手机号+密码注册/登录、自动登录、退出登录、账号注销 |
| ② 有奖问答 | 5 大学科 × 5 关卡 = 25 关，每关 6 题，4/6 通关 |
| ③ 个人中心 | 主页、签到日历、数据统计、答题记录、积分明细、设置 |
| ④ 动态消息 | 3 类 Tab（系统消息/我的评论/我赞过）、已读管理、30 天有效期 |

底部 Tab：首页 | 竞猜(预留) | 商城(预留) | 消息 | 我的

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | NestJS + Prisma ORM + SQLite |
| 客户端 | uni-app (Vue3) → 微信小程序 |
| 后台管理 | React 18 + TypeScript + Ant Design 5 |
| API 文档 | OpenAPI 3.0 / Swagger UI |
| 认证 | JWT（accessToken + refreshToken） |

## 项目目录结构

```
shiqupai/
├── client/          # 客户端 uni-app (Vue3)
│   ├── pages/       # 页面（首页、登录、答题、个人中心、消息等）
│   ├── components/  # 公共组件
│   ├── api/         # API 封装
│   └── utils/       # 工具函数
├── server/          # 后端 NestJS 服务（规划中）
├── admin/           # 后台管理 React SPA（规划中）
├── docs/            # 项目文档
│   ├── 识趣派-产品整体功能规划图v2.0.md
│   ├── 识趣派-MVP版本详细PRD.md
│   ├── 识趣派-系统架构设计文档.md
│   └── 识趣派-API接口设计文档.md
├── AGENTS.md        # AI 开发助手指南
└── README.md        # 本文件
```

## 构建与运行

### 客户端（client/）

```bash
# 安装依赖
cd client && npm install

# 开发（H5 模式）
npm run dev:h5

# 构建微信小程序
npm run build:mp-weixin
```

## 代码管理

- **分支策略**：`main` 保护分支，`feature/*` 功能开发，`fix/*` Bug 修复
- **Commit 规范**：`feat:` / `fix:` / `chore:` / `docs:` 前缀

---

🤖 Generated with [Qoder](https://qoder.com)
