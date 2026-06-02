// 识趣派 — 常量定义

// 错误码
export const ERROR_CODE = {
  // 认证通用
  PHONE_REGISTERED: 10001,
  PASSWORD_WRONG: 10002,
  TOKEN_EXPIRED: 10003,
  VALIDATION_ERROR: 10004,
  PASSWORD_FORMAT: 10005,
  ACCOUNT_NOT_FOUND: 10006,
  ACCOUNT_BANNED: 10007,
  TOKEN_INVALID: 10008,

  // 用户管理
  USER_NOT_FOUND: 11001,
  NICKNAME_EXISTS: 11002,

  // 答题模块
  LEVEL_LOCKED: 20001,
  QUESTION_NOT_FOUND: 20002,
  ATTEMPT_INVALID: 20003,

  // 积分模块
  POINTS_INSUFFICIENT: 30001,

  // 签到模块
  ALREADY_CHECKED_IN: 40001,
  MAKEUP_EXCEEDED: 40002,
  NO_NEED_MAKEUP: 40003,

  // 系统级
  SERVER_ERROR: 99999
}

// 认证相关错误码区间
export const AUTH_ERROR_CODES = [10001, 10002, 10003, 10005, 10006, 10007, 10008]

// 积分来源
export const POINTS_SOURCE = {
  QUIZ: 'quiz',
  CHECKIN: 'checkin',
  MAKEUP: 'makeup'
}

export const POINTS_SOURCE_LABELS = {
  quiz: '答题',
  checkin: '签到',
  makeup: '补签'
}

// 难易度
export const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
}

export const DIFFICULTY_LABELS = {
  easy: '简单',
  medium: '中等',
  hard: '困难'
}

// 关卡状态
export const LEVEL_STATUS = {
  LOCKED: 'locked',
  AVAILABLE: 'available',
  IN_PROGRESS: 'in_progress',
  PASSED: 'passed',
  FAILED: 'failed'
}

export const LEVEL_STATUS_LABELS = {
  locked: '未解锁',
  available: '可挑战',
  in_progress: '进行中',
  passed: '已通关',
  failed: '未通过'
}

// 学科图标映射
export const CATEGORY_ICONS = {
  1: '🔬',
  2: '📐',
  3: '📚',
  4: '🗺️',
  5: '🌍'
}

// 消息类型
export const MESSAGE_TYPE = {
  SYSTEM: 'system',
  MY_COMMENT: 'my_comment',
  MY_LIKE: 'my_like'
}

export const MESSAGE_TYPE_LABELS = {
  system: '系统消息',
  my_comment: '我的评论',
  my_like: '我赞过的'
}

// 答题配置
export const QUIZ_CONFIG = {
  QUESTIONS_PER_LEVEL: 6,
  TIME_PER_QUESTION: 20,     // 秒
  PASS_SCORE: 4,             // 最低答对数
  CORRECT_POINTS: 15,        // 每题答对得分
  PASS_BONUS: 50,            // 通关奖励分
  MAX_SCORE: 140,            // 单关满分 = 6*15 + 50
  REPLAY_POINTS: 0,          // 重复答题得分
  COUNTDOWN_START: 3,        // 倒计时秒数
  MIN_TIME_PER_QUESTION: 3,  // 服务器校验最短答题时间
  MAX_TIME_PER_QUESTION: 20  // 服务器校验最长答题时间
}

// 选项标签
export const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F']

// 分页默认值
export const PAGE_SIZE = 20

// 签到
export const CHECKIN_CONFIG = {
  MAX_MAKEUP_COST: 50,       // 补签消耗积分
  DEFAULT_MAX_MAKEUP: 5      // 每月最大补签次数
}
