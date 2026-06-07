import { Injectable, HttpException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '@/prisma/prisma.service'
import * as bcryptjs from 'bcryptjs'
import { paginate } from '@/common/utils/pagination'
import { maskPhone } from '@/common/utils/mask-phone'
import { AdminLoginDto } from './dto/admin-login.dto'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { CreateLevelDto } from './dto/create-level.dto'
import { UpdateLevelDto } from './dto/update-level.dto'
import { CreateQuestionDto } from './dto/create-question.dto'
import { UpdateQuestionDto } from './dto/update-question.dto'
import { QueryQuestionsDto } from './dto/query-questions.dto'
import { UpdateUserStatusDto } from './dto/update-user-status.dto'
import { PushMessageDto } from './dto/push-message.dto'
import { UpdateConfigDto } from './dto/update-config.dto'
import { CreateGoodsDto } from './dto/create-goods.dto'
import { UpdateGoodsDto } from './dto/update-goods.dto'
import { ImportCodesDto } from './dto/import-codes.dto'
import { QueryShopOrdersDto } from './dto/query-shop-orders.dto'

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // ==================== Auth ====================

  async login(dto: AdminLoginDto) {
    const admin = await this.prisma.admin.findUnique({
      where: { username: dto.username },
    })

    if (!admin) {
      throw new HttpException(
        { code: 90001, message: '管理员账号不存在', data: null },
        400,
      )
    }

    if (admin.status !== 'active') {
      throw new HttpException(
        { code: 90002, message: '管理员账号已被禁用', data: null },
        403,
      )
    }

    const isPasswordValid = await bcryptjs.compare(dto.password, admin.passwordHash)
    if (!isPasswordValid) {
      throw new HttpException(
        { code: 90001, message: '密码错误', data: null },
        400,
      )
    }

    const token = this.jwtService.sign(
      { sub: admin.id, role: admin.role },
      { expiresIn: '7d' },
    )

    return {
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      },
    }
  }

  async getProfile(adminId: number) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        username: true,
        role: true,
        status: true,
        createdAt: true,
      },
    })

    if (!admin) {
      throw new HttpException(
        { code: 90001, message: '管理员账号不存在', data: null },
        404,
      )
    }

    return admin
  }

  // ==================== Categories ====================

  async listCategories() {
    return this.prisma.category.findMany({
      where: { status: 'active' },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        nameEn: true,
        icon: true,
        description: true,
        sortOrder: true,
        status: true,
        createdAt: true,
      },
    })
  }

  async createCategory(dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        name: dto.name,
        nameEn: dto.nameEn ?? '',
        icon: dto.icon ?? '',
        description: dto.description ?? '',
        sortOrder: dto.sortOrder ?? 0,
      },
    })
  }

  async updateCategory(id: number, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } })
    if (!category) {
      throw new HttpException(
        { code: 90001, message: '学科不存在', data: null },
        404,
      )
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.nameEn !== undefined && { nameEn: dto.nameEn }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    })
  }

  async deleteCategory(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } })
    if (!category) {
      throw new HttpException(
        { code: 90001, message: '学科不存在', data: null },
        404,
      )
    }

    // 检查是否有关联的关卡
    const levelCount = await this.prisma.level.count({
      where: { categoryId: id },
    })
    if (levelCount > 0) {
      throw new HttpException(
        { code: 90001, message: '该学科下存在关卡，无法删除', data: null },
        400,
      )
    }

    await this.prisma.category.delete({ where: { id } })
    return null
  }

  // ==================== Levels ====================

  async listLevels(categoryId?: number) {
    const where = categoryId ? { categoryId, status: 'active' } : { status: 'active' }

    return this.prisma.level.findMany({
      where,
      orderBy: [{ categoryId: 'asc' }, { levelNo: 'asc' }],
      select: {
        id: true,
        categoryId: true,
        levelNo: true,
        name: true,
        difficulty: true,
        passScore: true,
        status: true,
        createdAt: true,
      },
    })
  }

  async createLevel(dto: CreateLevelDto) {
    // 检查学科是否存在
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    })
    if (!category) {
      throw new HttpException(
        { code: 90001, message: '所属学科不存在', data: null },
        404,
      )
    }

    // 检查同一学科下关卡序号是否重复
    const existing = await this.prisma.level.findUnique({
      where: {
        categoryId_levelNo: {
          categoryId: dto.categoryId,
          levelNo: dto.levelNo,
        },
      },
    })
    if (existing) {
      throw new HttpException(
        { code: 90001, message: '该学科下关卡序号已存在', data: null },
        400,
      )
    }

    return this.prisma.level.create({
      data: {
        categoryId: dto.categoryId,
        levelNo: dto.levelNo,
        name: dto.name,
        difficulty: dto.difficulty ?? 'easy',
        passScore: dto.passScore ?? 4,
      },
    })
  }

  async updateLevel(id: number, dto: UpdateLevelDto) {
    const level = await this.prisma.level.findUnique({ where: { id } })
    if (!level) {
      throw new HttpException(
        { code: 90001, message: '关卡不存在', data: null },
        404,
      )
    }

    // 如果修改了 levelNo，检查是否重复
    if (dto.levelNo !== undefined) {
      const duplicate = await this.prisma.level.findFirst({
        where: {
          categoryId: level.categoryId,
          levelNo: dto.levelNo,
          id: { not: id },
        },
      })
      if (duplicate) {
        throw new HttpException(
          { code: 90001, message: '该学科下关卡序号已存在', data: null },
          400,
        )
      }
    }

    return this.prisma.level.update({
      where: { id },
      data: {
        ...(dto.levelNo !== undefined && { levelNo: dto.levelNo }),
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.difficulty !== undefined && { difficulty: dto.difficulty }),
        ...(dto.passScore !== undefined && { passScore: dto.passScore }),
      },
    })
  }

  async deleteLevel(id: number) {
    const level = await this.prisma.level.findUnique({ where: { id } })
    if (!level) {
      throw new HttpException(
        { code: 90001, message: '关卡不存在', data: null },
        404,
      )
    }

    // 检查是否有关联的题目
    const questionCount = await this.prisma.question.count({
      where: { levelId: id },
    })
    if (questionCount > 0) {
      throw new HttpException(
        { code: 90001, message: '该关卡下存在题目，无法删除', data: null },
        400,
      )
    }

    await this.prisma.level.delete({ where: { id } })
    return null
  }

  // ==================== Questions ====================

  async listQuestions(dto: QueryQuestionsDto) {
    const page = dto.page ?? 1
    const pageSize = dto.pageSize ?? 20

    const where: Record<string, unknown> = {}
    if (dto.levelId) {
      where.levelId = dto.levelId
    }
    if (dto.keyword) {
      where.content = { contains: dto.keyword }
    }

    const [list, total] = await Promise.all([
      this.prisma.question.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ levelId: 'asc' }, { sortOrder: 'asc' }],
        select: {
          id: true,
          levelId: true,
          questionType: true,
          content: true,
          options: true,
          correctAnswer: true,
          explanation: true,
          sortOrder: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.question.count({ where }),
    ])

    return {
      list,
      pagination: paginate({ page, pageSize }, total),
    }
  }

  async createQuestion(dto: CreateQuestionDto) {
    // 检查关卡是否存在
    const level = await this.prisma.level.findUnique({
      where: { id: dto.levelId },
    })
    if (!level) {
      throw new HttpException(
        { code: 90001, message: '所属关卡不存在', data: null },
        404,
      )
    }

    // 验证 options 是合法 JSON
    try {
      JSON.parse(dto.options)
    } catch {
      throw new HttpException(
        { code: 90001, message: '选项格式不正确，需为合法 JSON 数组', data: null },
        400,
      )
    }

    return this.prisma.question.create({
      data: {
        levelId: dto.levelId,
        content: dto.content,
        options: dto.options,
        correctAnswer: dto.correctAnswer,
        explanation: dto.explanation ?? '',
        sortOrder: dto.sortOrder ?? 0,
      },
    })
  }

  async updateQuestion(id: number, dto: UpdateQuestionDto) {
    const question = await this.prisma.question.findUnique({ where: { id } })
    if (!question) {
      throw new HttpException(
        { code: 90001, message: '题目不存在', data: null },
        404,
      )
    }

    // 验证 options 是合法 JSON
    if (dto.options !== undefined) {
      try {
        JSON.parse(dto.options)
      } catch {
        throw new HttpException(
          { code: 90001, message: '选项格式不正确，需为合法 JSON 数组', data: null },
          400,
        )
      }
    }

    return this.prisma.question.update({
      where: { id },
      data: {
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.options !== undefined && { options: dto.options }),
        ...(dto.correctAnswer !== undefined && { correctAnswer: dto.correctAnswer }),
        ...(dto.explanation !== undefined && { explanation: dto.explanation }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    })
  }

  async deleteQuestion(id: number) {
    const question = await this.prisma.question.findUnique({ where: { id } })
    if (!question) {
      throw new HttpException(
        { code: 90001, message: '题目不存在', data: null },
        404,
      )
    }

    await this.prisma.question.delete({ where: { id } })
    return null
  }

  // ==================== Users ====================

  async listUsers(query: { page?: number; pageSize?: number; keyword?: string }) {
    const page = query.page ?? 1
    const pageSize = query.pageSize ?? 20

    const where: Record<string, unknown> = {
      status: { not: 'deleted' },
    }
    if (query.keyword) {
      where.OR = [
        { phoneLastFour: { contains: query.keyword } },
        { nickname: { contains: query.keyword } },
      ]
    }

    const [list, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          phoneLastFour: true,
          nickname: true,
          avatar: true,
          status: true,
          pointsBalance: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ])

    const userList = list.map((user) => ({
      ...user,
      phone: maskPhone(user.phoneLastFour),
    }))

    return {
      list: userList,
      pagination: paginate({ page, pageSize }, total),
    }
  }

  async updateUserStatus(id: number, dto: UpdateUserStatusDto) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) {
      throw new HttpException(
        { code: 90001, message: '用户不存在', data: null },
        404,
      )
    }

    if (user.status === 'deleted') {
      throw new HttpException(
        { code: 90001, message: '该用户已注销，无法操作', data: null },
        400,
      )
    }

    return this.prisma.user.update({
      where: { id },
      data: { status: dto.status },
      select: {
        id: true,
        phoneLastFour: true,
        nickname: true,
        status: true,
        updatedAt: true,
      },
    })
  }

  // ==================== Messages ====================

  async pushSystemMessage(dto: PushMessageDto) {
    // 获取所有 active 状态的用户
    const users = await this.prisma.user.findMany({
      where: { status: 'active' },
      select: { id: true },
    })

    if (users.length === 0) {
      return { pushedCount: 0 }
    }

    // 过期时间：30天后
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    // 批量创建消息
    await this.prisma.message.createMany({
      data: users.map((user) => ({
        userId: user.id,
        type: 'system',
        title: dto.title,
        content: dto.content,
        referenceType: dto.referenceType ?? '',
        referenceId: dto.referenceId ?? '',
        isRead: 0,
        expiresAt,
      })),
    })

    return { pushedCount: users.length }
  }

  // ==================== System Config ====================

  async listConfigs() {
    return this.prisma.systemConfig.findMany({
      orderBy: { configKey: 'asc' },
      select: {
        id: true,
        configKey: true,
        configValue: true,
        description: true,
        updatedAt: true,
        createdAt: true,
      },
    })
  }

  async updateConfig(key: string, dto: UpdateConfigDto) {
    // 验证 configValue 是合法 JSON
    try {
      JSON.parse(dto.configValue)
    } catch {
      throw new HttpException(
        { code: 90001, message: '配置值不是合法的 JSON 格式', data: null },
        400,
      )
    }

    const config = await this.prisma.systemConfig.findUnique({
      where: { configKey: key },
    })

    if (!config) {
      throw new HttpException(
        { code: 90001, message: '配置项不存在', data: null },
        404,
      )
    }

    return this.prisma.systemConfig.update({
      where: { configKey: key },
      data: {
        configValue: dto.configValue,
        ...(dto.description !== undefined && { description: dto.description }),
      },
    })
  }

  // ==================== Dashboard ====================

  async getDashboard() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    const [
      totalUsers,
      newUsersToday,
      totalQuizSessions,
      totalProgressEntries,
      passedProgressEntries,
      totalCheckIns,
      newCheckInsToday,
    ] = await Promise.all([
      // 总用户数
      this.prisma.user.count({ where: { status: { not: 'deleted' } } }),
      // 今日新增用户
      this.prisma.user.count({
        where: {
          status: { not: 'deleted' },
          createdAt: { gte: today },
        },
      }),
      // 总答题次数 (distinct attemptId)
      this.prisma.userAnswer.groupBy({
        by: ['attemptId'],
      }).then((rows) => rows.length),
      // 总进度条目数
      this.prisma.userProgress.count(),
      // 通关次数
      this.prisma.userProgress.count({
        where: { status: 'passed' },
      }),
      // 总签到次数
      this.prisma.checkIn.count(),
      // 今日签到次数
      this.prisma.checkIn.count({
        where: { checkInDate: todayStr },
      }),
    ])

    return {
      totalUsers,
      newUsersToday,
      totalQuizSessions,
      averagePassRate:
        totalProgressEntries > 0
          ? Math.round((passedProgressEntries / totalProgressEntries) * 100)
          : 0,
      totalCheckIns,
      newCheckInsToday,
    }
  }

  // ==================== 商城管理 ====================

  /**
   * 商品列表（分页）
   */
  async listShopGoods(query: { page?: number; pageSize?: number; keyword?: string }) {
    const page = Number(query.page) || 1
    const pageSize = Number(query.pageSize) || 20
    const { keyword } = query

    const where: Record<string, unknown> = {}
    if (keyword) {
      where.name = { contains: keyword }
    }

    const [total, list] = await Promise.all([
      this.prisma.shopGood.count({ where: where as any }),
      this.prisma.shopGood.findMany({
        where: where as any,
        orderBy: { sortOrder: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])

    return {
      list: list.map((item) => ({
        ...item,
        stockStatus:
          item.remainingStock <= 0
            ? 'out'
            : item.remainingStock < 5
              ? 'low'
              : item.remainingStock <= 20
                ? 'tense'
                : 'sufficient',
      })),
      pagination: paginate({ page, pageSize }, total),
    }
  }

  /**
   * 新增商品
   */
  async createShopGoods(dto: CreateGoodsDto) {
    return this.prisma.shopGood.create({
      data: {
        name: dto.name,
        coverImage: dto.coverImage ?? '',
        description: dto.description ?? '',
        category: dto.category,
        pointsPrice: dto.pointsPrice,
        totalStock: dto.totalStock,
        remainingStock: dto.totalStock,
        exchangeLimit: dto.exchangeLimit ?? 1,
        sortOrder: dto.sortOrder ?? 0,
      },
    })
  }

  /**
   * 编辑商品
   */
  async updateShopGoods(id: number, dto: UpdateGoodsDto) {
    const goods = await this.prisma.shopGood.findUnique({ where: { id } })
    if (!goods) {
      throw new HttpException(
        { code: 60001, message: '商品不存在', data: null },
        400,
      )
    }

    const updateData: Record<string, unknown> = {}

    if (dto.name !== undefined) updateData.name = dto.name
    if (dto.coverImage !== undefined) updateData.coverImage = dto.coverImage
    if (dto.description !== undefined) updateData.description = dto.description
    if (dto.category !== undefined) updateData.category = dto.category
    if (dto.pointsPrice !== undefined) updateData.pointsPrice = dto.pointsPrice
    if (dto.exchangeLimit !== undefined) updateData.exchangeLimit = dto.exchangeLimit
    if (dto.status !== undefined) updateData.status = dto.status
    if (dto.sortOrder !== undefined) updateData.sortOrder = dto.sortOrder

    // totalStock 变化时同步调整 remainingStock
    if (dto.totalStock !== undefined && dto.totalStock !== goods.totalStock) {
      const stockDiff = dto.totalStock - goods.totalStock
      updateData.totalStock = dto.totalStock
      updateData.remainingStock = Math.max(0, goods.remainingStock + stockDiff)
    }

    return this.prisma.shopGood.update({
      where: { id },
      data: updateData,
    })
  }

  /**
   * 删除商品
   */
  async deleteShopGoods(id: number) {
    const goods = await this.prisma.shopGood.findUnique({ where: { id } })
    if (!goods) {
      throw new HttpException(
        { code: 60001, message: '商品不存在', data: null },
        400,
      )
    }

    const orderCount = await this.prisma.shopOrder.count({ where: { goodsId: id } })
    if (orderCount > 0) {
      throw new HttpException(
        { code: 90001, message: '该商品已有兑换记录，无法删除', data: null },
        400,
      )
    }

    await this.prisma.shopGood.delete({ where: { id } })
    return null
  }

  /**
   * 导入兑换码
   */
  async importGoodsCodes(id: number, dto: ImportCodesDto) {
    const goods = await this.prisma.shopGood.findUnique({ where: { id } })
    if (!goods) {
      throw new HttpException(
        { code: 60001, message: '商品不存在', data: null },
        400,
      )
    }

    if (goods.category !== 'code') {
      throw new HttpException(
        { code: 90001, message: '该商品类型不支持导入兑换码', data: null },
        400,
      )
    }

    // 批量插入兑换码（逐个插入跳过重复）
    let importedCount = 0
    for (const code of dto.codes) {
      try {
        await this.prisma.shopGoodCode.create({
          data: {
            goodsId: id,
            code,
            status: 'available',
          },
        })
        importedCount++
      } catch {
        // 兑换码已存在，跳过
      }
    }

    // 更新商品库存（增加导入数量）
    await this.prisma.shopGood.update({
      where: { id },
      data: {
        totalStock: { increment: importedCount },
        remainingStock: { increment: importedCount },
      },
    })

    return { importedCount }
  }

  /**
   * 兑换记录列表（分页 + 筛选）
   */
  async listShopOrders(query: QueryShopOrdersDto) {
    const page = Number(query.page) || 1
    const pageSize = Number(query.pageSize) || 20
    const userId = query.userId ? Number(query.userId) : undefined
    const goodsId = query.goodsId ? Number(query.goodsId) : undefined

    const where: Record<string, unknown> = {}
    if (userId) where.userId = userId
    if (goodsId) where.goodsId = goodsId

    const [total, list] = await Promise.all([
      this.prisma.shopOrder.count({ where: where as any }),
      this.prisma.shopOrder.findMany({
        where: where as any,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: {
            select: { id: true, nickname: true, phoneLastFour: true },
          },
          goods: {
            select: { id: true, name: true },
          },
        },
      }),
    ])

    return {
      list,
      pagination: paginate({ page, pageSize }, total),
    }
  }

  /**
   * 商城统计看板
   */
  async getShopDashboard() {
    const [
      totalGoods,
      activeGoods,
      totalOrders,
      pointsAgg,
      lowStockGoods,
      topGoods,
      recentOrders,
    ] = await Promise.all([
      // 商品总数
      this.prisma.shopGood.count(),
      // 上架商品数
      this.prisma.shopGood.count({ where: { status: 'active' } }),
      // 总兑换次数
      this.prisma.shopOrder.count(),
      // 积分消耗总额
      this.prisma.shopOrder.aggregate({ _sum: { pointsCost: true } }),
      // 库存预警商品（剩余库存 <= 5 且上架中）
      this.prisma.shopGood.findMany({
        where: { remainingStock: { lte: 5 }, status: 'active' },
        select: { id: true, name: true, remainingStock: true },
        orderBy: { remainingStock: 'asc' },
      }),
      // 热门商品 TOP5
      this.prisma.shopGood.findMany({
        orderBy: { exchangeCount: 'desc' },
        take: 5,
        select: { id: true, name: true, exchangeCount: true, pointsPrice: true },
      }),
      // 最近 5 笔兑换
      this.prisma.shopOrder.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          pointsCost: true,
          createdAt: true,
          user: { select: { nickname: true } },
          goods: { select: { name: true } },
        },
      }),
    ])

    return {
      totalGoods,
      activeGoods,
      totalOrders,
      totalPointsConsumed: pointsAgg._sum.pointsCost ?? 0,
      lowStockGoods: lowStockGoods.map((g) => ({
        ...g,
        stockStatus:
          g.remainingStock <= 0
            ? 'out'
            : g.remainingStock < 5
              ? 'low'
              : 'tense',
      })),
      topGoods,
      recentOrders,
    }
  }
}
