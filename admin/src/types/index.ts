// ===== 统一响应格式 =====
export interface ApiResponse<T> {
  code: number
  message: string
  data: T | null
}

// ===== 分页 =====
export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface PaginatedData<T> {
  list: T[]
  pagination: Pagination
}

// ===== 管理员 =====
export interface Admin {
  id: number
  username: string
  role: string
  status?: string
  createdAt?: string
}

export interface LoginResult {
  token: string
  admin: {
    id: number
    username: string
    role: string
  }
}

// ===== 学科 =====
export interface Category {
  id: number
  name: string
  nameEn: string
  icon: string
  description: string
  sortOrder: number
  status: string
  createdAt: string
}

export interface CreateCategoryParams {
  name: string
  nameEn?: string
  icon?: string
  description?: string
  sortOrder?: number
}

export interface UpdateCategoryParams {
  name?: string
  nameEn?: string
  icon?: string
  description?: string
  sortOrder?: number
}

// ===== 关卡 =====
export interface Level {
  id: number
  categoryId: number
  levelNo: number
  name: string
  difficulty: string
  passScore: number
  status: string
  createdAt: string
}

export interface CreateLevelParams {
  categoryId: number
  levelNo: number
  name: string
  difficulty?: string
  passScore?: number
}

export interface UpdateLevelParams {
  levelNo?: number
  name?: string
  difficulty?: string
  passScore?: number
}

// ===== 题目 =====
export interface Question {
  id: number
  levelId: number
  questionType: string
  content: string
  options: string // JSON 字符串
  correctAnswer: string
  explanation: string
  sortOrder: number
  status: string
  createdAt: string
}

export interface CreateQuestionParams {
  levelId: number
  content: string
  options: string // JSON 字符串
  correctAnswer: string
  explanation?: string
  sortOrder?: number
}

export interface UpdateQuestionParams {
  content?: string
  options?: string
  correctAnswer?: string
  explanation?: string
  sortOrder?: number
}

export interface QueryQuestionsParams {
  page?: number
  pageSize?: number
  levelId?: number
  keyword?: string
}

// ===== 用户 =====
export interface User {
  id: number
  phoneLastFour: string
  phone: string
  nickname: string
  avatar: string
  status: string
  pointsBalance: number
  createdAt: string
}

export interface UpdateUserStatusParams {
  status: 'active' | 'banned'
}

// ===== 消息推送 =====
export interface PushMessageParams {
  title: string
  content: string
  referenceType?: string
  referenceId?: string
}

export interface PushMessageResult {
  pushedCount: number
}

// ===== 系统配置 =====
export interface SystemConfig {
  id: number
  configKey: string
  configValue: string // JSON 字符串
  description: string
  updatedAt: string
  createdAt: string
}

export interface UpdateConfigParams {
  configValue: string
  description?: string
}

// ===== 运营看板 =====
export interface DashboardStats {
  totalUsers: number
  newUsersToday: number
  totalQuizSessions: number
  averagePassRate: number
  totalCheckIns: number
  newCheckInsToday: number
}
