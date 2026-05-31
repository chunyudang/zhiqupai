# 识趣派 — API 接口设计文档

> 版本：v1.0 | 基于系统架构设计文档 v1.0
> 状态：已定稿

---

## 第一章：通用规范

### 1.1 基础信息

| 项目 | 值 |
|------|-----|
| 基础 URL（C端） | `http://[内网IP]:3000/api/v1` |
| 基础 URL（后台） | `http://[内网IP]:3000/api/admin/v1` |
| 数据格式 | JSON |
| 字符编码 | UTF-8 |
| 字段命名 | camelCase |
| 时间格式 | ISO 8601（如 `2026-06-01T10:30:00Z`） |
| 日期格式 | `YYYY-MM-DD` |

### 1.2 通用请求头

| 头部 | 说明 | 必填 |
|------|------|------|
| `Content-Type` | `application/json` | 是（文件上传除外） |
| `Authorization` | `Bearer {accessToken}` | 鉴权接口除外 |

### 1.3 通用响应格式

**成功响应：**
```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

**错误响应：**
```json
{
  "code": 10001,
  "message": "手机号已注册",
  "data": null
}
```

### 1.4 分页规范

**请求参数：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | number | 1 | 页码，从 1 开始 |
| `pageSize` | number | 20 | 每页条数，最大 100 |

**响应格式：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [...],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 156,
      "totalPages": 8
    }
  }
}
```

### 1.5 错误码体系

| 区间 | 模块 | 示例 |
|------|------|------|
| 10001-10999 | 认证通用 | 10001: 手机号已注册, 10002: 密码错误, 10003: Token过期 |
| 11001-11999 | 用户管理 | 11001: 用户不存在, 11002: 昵称已存在 |
| 20001-20999 | 答题模块 | 20001: 关卡未解锁, 20002: 题目不存在 |
| 30001-30999 | 积分模块 | 30001: 积分不足 |
| 40001-40999 | 签到模块 | 40001: 已签到, 40002: 补签次数超限 |
| 50001-50999 | 消息模块 | 50001: 消息不存在 |
| 90001-90999 | 后台管理 | 90001: 管理员不存在, 90002: 无权限 |
| 99999 | 系统级 | 99999: 服务器内部错误 |

---

## 第二章：用户体系（AuthModule）

### 接口清单

| # | Method | URL | 说明 | 需鉴权 |
|---|--------|-----|------|--------|
| 1 | POST | `/auth/register` | 用户注册 | 否 |
| 2 | POST | `/auth/login` | 用户登录 | 否 |
| 3 | POST | `/auth/refresh` | 刷新 accessToken | 否（用 refreshToken）|
| 4 | POST | `/auth/logout` | 退出登录 | 是 |

### 2.1 注册 `/auth/register`

**Request：**
```json
{
  "phone": "13812345678",
  "password": "abc123",
  "nickname": "小明"
}
```

| 字段 | 规则 |
|------|------|
| phone | 11 位数字，唯一 |
| password | 6-20 位字母/数字组合 |
| nickname | 1-16 位字符，可选，默认为手机号后 4 位 |

**Response：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "dGhpcyBp...",
    "expiresIn": 900,
    "user": {
      "id": 1,
      "phone": "138****5678",
      "nickname": "小明",
      "avatar": "",
      "pointsBalance": 0
    }
  }
}
```

**异常：** 10001(已注册) / 10004(格式错误) / 10005(密码格式)

### 2.2 登录 `/auth/login`

**Request：**
```json
{
  "phone": "13812345678",
  "password": "abc123"
}
```

**Response：** 同注册返回格式

**异常：** 10002(密码错误) / 10006(账号不存在) / 10007(账号被封禁)

### 2.3 刷新 Token `/auth/refresh`

**Request：**
```json
{
  "refreshToken": "dGhpcyBp..."
}
```

**Response：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "accessToken": "eyJhbG...",
    "expiresIn": 900
  }
}
```

**异常：** 10003(Token过期) / 10008(Token无效)

### 2.4 退出登录 `/auth/logout`

**Header：** `Authorization: Bearer {accessToken}`

**Response：**
```json
{ "code": 0, "message": "success", "data": null }
```

**说明：** 服务端清除该用户的 refreshToken 记录

---

## 第三章：用户管理（UserModule）

### 接口清单

| # | Method | URL | 说明 | 需鉴权 |
|---|--------|-----|------|--------|
| 1 | GET | `/users/profile` | 获取个人信息 | 是 |
| 2 | PUT | `/users/profile` | 修改个人信息 | 是 |
| 3 | POST | `/upload/avatar` | 上传头像 | 是 |
| 4 | DELETE | `/users/account` | 注销账号 | 是 |

### 3.1 获取个人信息 `/users/profile`

**Response：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "phone": "138****5678",
    "nickname": "小明",
    "avatar": "/uploads/avatars/abc.jpg",
    "pointsBalance": 1280,
    "createdAt": "2026-06-01T10:30:00Z"
  }
}
```

### 3.2 修改个人信息 `/users/profile`

**Request：**
```json
{
  "nickname": "新昵称"
}
```

**说明：** `nickname` 可选，1-16 位字符；头像通过独立上传接口处理后赋值。

### 3.3 上传头像 `/upload/avatar`

**方式：** `multipart/form-data`

| 字段 | 类型 | 说明 |
|------|------|------|
| file | File | 头像图片，仅支持 jpg/png，≤ 2MB |

**Response：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "url": "/uploads/avatars/1700000000_abc123.jpg"
  }
}
```

**头像上传流程：**
```
① uni.chooseImage → 选图
② uni.uploadFile → POST /upload/avatar (multipart)
③ 返回相对路径 URL（如 /uploads/avatars/xxx.jpg）
④ PUT /users/profile { "avatar": "返回的相对路径URL" }
```

> 头像 URL 统一使用相对路径格式，客户端通过 `baseURL + avatar` 拼接完整访问地址，部署时无需修改存储逻辑。

### 3.4 注销账号 `/users/account`

**Request：**
```json
{
  "confirmPassword": "abc123"
}
```

**异常：** 10002(密码验证失败)

---

## 第四章：答题模块（QuizModule）

### 接口清单

| # | Method | URL | 说明 | 需鉴权 |
|---|--------|-----|------|--------|
| 1 | GET | `/categories` | 学科列表（含进度） | 是 |
| 2 | GET | `/categories/:id/levels` | 关卡列表（含状态） | 是 |
| 3 | POST | `/quiz/start` | 开始答题（随机抽题） | 是 |
| 4 | POST | `/quiz/submit` | 提交答案 | 是 |
| 5 | GET | `/quiz/review/:levelId` | 关卡回顾 | 是 |
| 6 | GET | `/quiz/progress` | 用户总进度 | 是 |

### 4.1 学科列表 `/categories`

**Response：**
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "科学",
      "nameEn": "Science",
      "icon": "🔬",
      "description": "自然科学、物理、化学、生物等",
      "sortOrder": 1,
      "progress": "3/5",
      "passedCount": 3
    }
  ]
}
```

### 4.2 关卡列表 `/categories/:id/levels`

**Response：**
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "levelNo": 1,
      "name": "科学入门",
      "difficulty": "easy",
      "status": "passed",
      "bestScore": 5,
      "bestTime": 45,
      "completedAt": "2026-06-01T10:30:00Z"
    },
    {
      "id": 2,
      "levelNo": 2,
      "name": "科学探索",
      "difficulty": "easy",
      "status": "available",
      "bestScore": null,
      "bestTime": null,
      "completedAt": null
    },
    {
      "id": 3,
      "levelNo": 3,
      "name": "科学进阶",
      "difficulty": "medium",
      "status": "locked",
      "bestScore": null,
      "bestTime": null,
      "completedAt": null
    },
    {
      "id": 4,
      "levelNo": 4,
      "name": "科学挑战",
      "difficulty": "hard",
      "status": "in_progress",
      "bestScore": 3,
      "bestTime": 55,
      "completedAt": null
    },
    {
      "id": 5,
      "levelNo": 5,
      "name": "科学大师",
      "difficulty": "hard",
      "status": "failed",
      "bestScore": 3,
      "bestTime": 52,
      "completedAt": null
    }
  ]
}
```

**关卡状态：** `locked`（锁定） / `available`（可挑战） / `in_progress`（进行中） / `passed`（已通关） / `failed`（未通过）

### 4.3 开始答题 `/quiz/start`

**Request：**
```json
{
  "levelId": 1
}
```

**Response：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "attemptId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "levelId": 1,
    "questions": [
      {
        "id": 101,
        "content": "光在真空中的传播速度约为？",
        "options": ["3×10⁶ m/s", "3×10⁸ m/s", "3×10¹⁰ m/s", "3×10¹² m/s"],
        "sortOrder": 1
      }
    ],
    "expireAt": "2026-06-01T10:30:20Z",
    "questionCount": 6
  }
}
```

**说明：**
- 每次随机抽取 6 题（优先选用户未见过的新题）
- 返回的 `expireAt` 作为客户端倒计时基准（每题独立 20 秒）
- 不返回正确答案和解析（防作弊）

### 4.4 提交答案 `/quiz/submit`

**Request：**
```json
{
  "attemptId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "answers": [
    {
      "questionId": 101,
      "selectedAnswer": "B",
      "timeTaken": 8
    }
  ]
}
```

**服务端校验：** 每题 timeTaken 3-20 秒，总用时 18-120 秒，attemptId 防重复

**Response：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "isPassed": true,
    "correctCount": 4,
    "totalCount": 6,
    "earnedPoints": 110,
    "details": [
      {
        "questionId": 101,
        "content": "光在真空中的传播速度约为？",
        "options": ["3×10⁶ m/s", "3×10⁸ m/s", "3×10¹⁰ m/s", "3×10¹² m/s"],
        "selectedAnswer": "B",
        "correctAnswer": "B",
        "isCorrect": true,
        "explanation": "光速为 3×10⁸ m/s"
      }
    ],
    "totalTime": 68
  }
}
```

### 4.5 关卡回顾 `/quiz/review/:levelId`

**Response：** 同提交答案返回的 `details` 数组格式

### 4.6 用户总进度 `/quiz/progress`

**Response：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "totalPassed": 8,
    "totalLevels": 25,
    "categories": [
      {
        "categoryId": 1,
        "name": "科学",
        "passedCount": 3,
        "totalCount": 5,
        "levels": [
          { "levelId": 1, "levelNo": 1, "status": "passed" }
        ]
      }
    ]
  }
}
```

---

## 第五章：积分模块（PointsModule）

### 接口清单

| # | Method | URL | 说明 | 需鉴权 |
|---|--------|-----|------|--------|
| 1 | GET | `/points/balance` | 查询积分余额 | 是 |
| 2 | GET | `/points/transactions` | 积分流水列表 | 是 |

### 5.1 积分余额 `/points/balance`

**Response：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "balance": 1280,
    "todayEarned": 45
  }
}
```

### 5.2 积分流水 `/points/transactions`

**Query：** `page` / `pageSize` / `source`(quiz/checkin/makeup/all) / `month`(2026-06)

**Response：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1001,
        "amount": 110,
        "balanceAfter": 1280,
        "source": "quiz",
        "description": "科学·科学入门 通关奖励",
        "createdAt": "2026-06-01T10:30:00Z"
      }
    ],
    "pagination": { "page": 1, "pageSize": 20, "total": 45, "totalPages": 3 }
  }
}
```

**来源类型：** `quiz`(答题) / `checkin`(签到) / `makeup`(补签消耗) / `admin`(后台调整)

---

## 第六章：签到模块（CheckInModule）

### 接口清单

| # | Method | URL | 说明 | 需鉴权 |
|---|--------|-----|------|--------|
| 1 | POST | `/checkin` | 每日签到 | 是 |
| 2 | POST | `/checkin/makeup` | 补签 | 是 |
| 3 | GET | `/checkin/calendar` | 签到日历 | 是 |

### 6.1 每日签到 `/checkin`

**Response：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "earnedPoints": 5,
    "consecutiveDays": 5,
    "todayDate": "2026-06-01",
    "isMakeup": false
  }
}
```

**异常：** 40001(今日已签到)

### 6.2 补签 `/checkin/makeup`

**Request：**
```json
{ "date": "2026-05-30" }
```

**异常：** 40002(月限超) / 30001(积分不足) / 40003(无需补签)

### 6.3 签到日历 `/checkin/calendar`

**Query：** `month=2026-06`

**日期状态：**
| status | 说明 |
|--------|------|
| `signed` | 已签到（显示积分值） |
| `makeup` | 补签（显示积分值） |
| `missed` | 未签到（可补签） |
| `today` | 今天（可签到） |
| `future` | 未来日期（不可操作） |

**Response：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "yearMonth": "2026-06",
    "consecutiveDays": 5,
    "maxMakeupRemaining": 3,
    "maxMakeupPerMonth": 5,
    "days": [
      { "date": "2026-06-01", "status": "signed", "pointsEarned": 5 },
      { "date": "2026-06-03", "status": "missed", "pointsEarned": 0 },
      { "date": "2026-06-04", "status": "today", "pointsEarned": 0 },
      { "date": "2026-06-05", "status": "future", "pointsEarned": 0 }
    ]
  }
}
```

---

## 第七章：消息模块（MessageModule）

### 接口清单

| # | Method | URL | 说明 | 需鉴权 |
|---|--------|-----|------|--------|
| 1 | GET | `/messages` | 消息列表（支持类型筛选） | 是 |
| 2 | PUT | `/messages/:id/read` | 单条标记已读 | 是 |
| 3 | PUT | `/messages/read-all` | 全部标记已读 | 是 |
| 4 | GET | `/messages/unread-count` | 未读消息数 | 是 |

### 7.1 消息列表 `/messages`

**Query：** `page` / `pageSize` / `type`(system/my_comment/my_like/all)

**Response：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "type": "system",
        "title": "新关卡上线",
        "summary": "科学学科新增「科学大师」关卡",
        "isRead": false,
        "createdAt": "2026-06-01T10:00:00Z"
      }
    ],
    "pagination": { "page": 1, "pageSize": 20, "total": 3, "totalPages": 1 }
  }
}
```

**消息类型：** `system`(系统消息) / `my_comment`(我的评论) / `my_like`(我赞过的)

### 7.2 未读消息数 `/messages/unread-count`

**Response：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 3,
    "system": 1,
    "myComment": 1,
    "myLike": 1
  }
}
```

---

## 第八章：后台管理（AdminModule）

### 接口清单

| # | Method | URL | 说明 | 需鉴权 |
|---|--------|-----|------|--------|
| 1 | POST | `/admin/auth/login` | 管理员登录 | 否 |
| 2 | GET | `/admin/auth/profile` | 管理员信息 | 是 |
| **学科管理** |||||
| 3 | GET | `/admin/categories` | 学科列表 | 是 |
| 4 | POST | `/admin/categories` | 新增学科 | 是 |
| 5 | PUT | `/admin/categories/:id` | 编辑学科 | 是 |
| 6 | DELETE | `/admin/categories/:id` | 删除学科 | 是 |
| **关卡管理** |||||
| 7 | GET | `/admin/levels` | 关卡列表 | 是 |
| 8 | POST | `/admin/levels` | 新增关卡 | 是 |
| 9 | PUT | `/admin/levels/:id` | 编辑关卡 | 是 |
| 10 | DELETE | `/admin/levels/:id` | 删除关卡 | 是 |
| **题目管理** |||||
| 11 | GET | `/admin/questions` | 题目列表（分页） | 是 |
| 12 | POST | `/admin/questions` | 新增题目 | 是 |
| 13 | PUT | `/admin/questions/:id` | 编辑题目 | 是 |
| 14 | DELETE | `/admin/questions/:id` | 删除题目 | 是 |
| **用户管理** |||||
| 15 | GET | `/admin/users` | 用户列表（分页） | 是 |
| 16 | PUT | `/admin/users/:id/status` | 用户封禁/解封 | 是 |
| **消息推送** |||||
| 17 | POST | `/admin/messages` | 推送系统消息 | 是 |
| **系统配置** |||||
| 18 | GET | `/admin/configs` | 配置列表 | 是 |
| 19 | PUT | `/admin/configs/:key` | 更新配置 | 是 |
| **数据看板** |||||
| 20 | GET | `/admin/dashboard` | 运营数据看板 | 是 |

### 8.1 管理员登录

**POST `/admin/auth/login`：**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "accessToken": "eyJhbG...",
    "admin": { "id": 1, "username": "admin", "role": "admin" }
  }
}
```

### 8.2 学科 CRUD

**POST `/admin/categories`（新增）：**
```json
{
  "name": "科学",
  "nameEn": "Science",
  "icon": "🔬",
  "description": "自然科学、物理、化学、生物等",
  "sortOrder": 1
}
```

### 8.3 题目管理

**POST `/admin/questions`（手动新增）：**
```json
{
  "levelId": 1,
  "content": "光在真空中的传播速度约为？",
  "options": ["3×10⁶ m/s", "3×10⁸ m/s", "3×10¹⁰ m/s", "3×10¹² m/s"],
  "correctAnswer": "B",
  "explanation": "光速为 3×10⁸ m/s",
  "sortOrder": 1
}
```

**GET `/admin/questions`（列表查询）：**
| 参数 | 类型 | 说明 |
|------|------|------|
| page | number | 默认 1 |
| pageSize | number | 默认 20 |
| levelId | number | 按关卡筛选 |
| keyword | string | 按题目内容搜索 |

### 8.4 用户管理

**PUT `/admin/users/:id/status`：**
```json
{
  "status": "banned"
}
```
`status` 值：`active`(正常) / `banned`(封禁)

### 8.5 消息推送

**POST `/admin/messages`：**
```json
{
  "type": "system",
  "title": "新关卡上线",
  "content": "科学学科新增「科学大师」关卡，快来挑战吧！"
}
```

### 8.6 系统配置

**PUT `/admin/configs/:key`：**
```json
{
  "configValue": {
    "maxMakeupPerMonth": 5,
    "makeupCost": 50
  }
}
```

### 8.7 数据看板

**GET `/admin/dashboard`：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "totalUsers": 128,
    "newUsersToday": 5,
    "totalQuizSessions": 456,
    "averagePassRate": 0.68,
    "totalCheckIns": 320,
    "dateRange": { "start": "2026-06-01", "end": "2026-06-30" }
  }
}
```

---

## 第九章：评论/点赞（预留，MVP 暂不实现）

| # | Method | URL | 说明 | MVP状态 |
|---|--------|-----|------|---------|
| 1 | GET | `/questions/:id/comments` | 获取题目评论列表 | 预留 |
| 2 | POST | `/questions/:id/comments` | 发表评论 | 预留 |
| 3 | POST | `/questions/:id/like` | 点赞题目 | 预留 |
| 4 | DELETE | `/questions/:id/like` | 取消点赞 | 预留 |

相关数据表（`comments`、`likes`）已在数据库 Schema 中预留，P1 阶段按此接口规范开发。

---

## 附录：接口汇总

### C 端接口（共 23 个）

| 模块 | 接口数 | 状态 |
|------|--------|------|
| 用户体系 | 4 | MVP 实现 |
| 用户管理 | 4 | MVP 实现 |
| 答题模块 | 6 | MVP 实现 |
| 积分模块 | 2 | MVP 实现 |
| 签到模块 | 3 | MVP 实现 |
| 消息模块 | 4 | MVP 实现 |
| 评论/点赞 | 4 | 预留 |
| **合计** | **27** | **MVP 实现 23 个** |

### 后台管理接口（共 20 个）

所有 20 个接口在 MVP 阶段实现。

**总计：43 个接口（MVP 实现 43 个）**
