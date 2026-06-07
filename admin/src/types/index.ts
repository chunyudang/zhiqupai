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

// ===== 积分商城 =====
export type GoodsCategory = 'code' | 'coupon' | 'virtual'
export type GoodsStatus = 'active' | 'inactive'
export type StockStatus = 'sufficient' | 'tense' | 'low' | 'out'

export interface ShopGood {
  id: number
  name: string
  coverImage: string
  description: string
  category: GoodsCategory
  pointsPrice: number
  totalStock: number
  remainingStock: number
  exchangeLimit: number
  exchangeCount: number
  sortOrder: number
  status: GoodsStatus
  stockStatus: StockStatus
  createdAt: string
}

export interface CreateGoodsParams {
  name: string
  coverImage?: string
  description?: string
  category: GoodsCategory
  pointsPrice: number
  totalStock: number
  exchangeLimit?: number
  sortOrder?: number
}

export interface UpdateGoodsParams {
  name?: string
  coverImage?: string
  description?: string
  category?: GoodsCategory
  pointsPrice?: number
  totalStock?: number
  exchangeLimit?: number
  status?: GoodsStatus
  sortOrder?: number
}

export interface QueryGoodsParams {
  page?: number
  pageSize?: number
  keyword?: string
}

export interface ShopOrder {
  id: number
  userId: number
  goodsId: number
  pointsCost: number
  balanceAfter: number
  code: string
  status: string
  createdAt: string
  user: { id: number; nickname: string; phoneLastFour: string }
  goods: { id: number; name: string }
}

export interface QueryOrdersParams {
  page?: number
  pageSize?: number
  userId?: number
  goodsId?: number
}

export interface ImportCodesParams {
  codes: string[]
}

export interface ShopDashboardStats {
  totalGoods: number
  activeGoods: number
  totalOrders: number
  totalPointsConsumed: number
  lowStockGoods: Array<{ id: number; name: string; remainingStock: number; stockStatus: string }>
  topGoods: Array<{ id: number; name: string; exchangeCount: number; pointsPrice: number }>
  recentOrders: Array<{
    id: number; pointsCost: number; createdAt: string;
    user: { nickname: string }
    goods: { name: string }
  }>
}
