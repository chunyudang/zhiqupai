import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { paginate } from '@/common/utils/pagination'
import { QueryGoodsDto } from './dto/query-goods.dto'
import { ExchangeDto } from './dto/exchange.dto'
import { QueryOrdersDto } from './dto/query-orders.dto'

@Injectable()
export class ShopService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 商品列表（分页 + 筛选 + 排序）
   */
  async listGoods(query: QueryGoodsDto) {
    const { page = 1, pageSize = 20, category, sort } = query

    const where: Record<string, unknown> = { status: 'active' }

    if (category && category !== 'all') {
      where.category = category
    }

    // 排序逻辑
    let orderBy: Record<string, string> = { sortOrder: 'asc' }
    if (sort === 'price_asc') {
      orderBy = { pointsPrice: 'asc' }
    } else if (sort === 'price_desc') {
      orderBy = { pointsPrice: 'desc' }
    }

    const [total, list] = await Promise.all([
      this.prisma.shopGood.count({ where: where as any }),
      this.prisma.shopGood.findMany({
        where: where as any,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          coverImage: true,
          category: true,
          pointsPrice: true,
          remainingStock: true,
          exchangeCount: true,
        },
      }),
    ])

    return {
      list: list.map((item) => ({
        ...item,
        stockStatus: this.calcStockStatus(item.remainingStock),
      })),
      pagination: paginate({ page, pageSize }, total),
    }
  }

  /**
   * 商品详情（含 canExchange 判断）
   */
  async getGoodsDetail(id: number, userId: number) {
    const goods = await this.prisma.shopGood.findUnique({
      where: { id },
    })

    if (!goods || goods.status !== 'active') {
      throw new HttpException(
        { code: 60001, message: '商品不存在', data: null },
        HttpStatus.BAD_REQUEST,
      )
    }

    const stockStatus = this.calcStockStatus(goods.remainingStock)

    // 判断是否可兑换
    let canExchange = true
    let exchangeHint = ''

    // 1. 库存检查
    if (goods.remainingStock <= 0) {
      canExchange = false
      exchangeHint = '已售罄'
    }

    // 2. 积分检查
    if (canExchange) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { pointsBalance: true },
      })

      if ((user?.pointsBalance ?? 0) < goods.pointsPrice) {
        canExchange = false
        const diff = goods.pointsPrice - (user?.pointsBalance ?? 0)
        exchangeHint = `积分不足，还差 ${diff} 积分`
      }
    }

    // 3. 限兑检查
    if (canExchange) {
      const userOrderCount = await this.prisma.shopOrder.count({
        where: { userId, goodsId: id },
      })

      if (userOrderCount >= goods.exchangeLimit) {
        canExchange = false
        exchangeHint = '已达兑换上限'
      }
    }

    return {
      id: goods.id,
      name: goods.name,
      coverImage: goods.coverImage,
      description: goods.description,
      category: goods.category,
      pointsPrice: goods.pointsPrice,
      totalStock: goods.totalStock,
      remainingStock: goods.remainingStock,
      stockStatus,
      exchangeLimit: goods.exchangeLimit,
      exchangeCount: goods.exchangeCount,
      canExchange,
      exchangeHint,
    }
  }

  /**
   * 兑换商品（核心 — 交互式事务）
   */
  async exchange(userId: number, dto: ExchangeDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. 查商品
      const goods = await tx.shopGood.findUnique({
        where: { id: dto.goodsId },
      })

      if (!goods || goods.status !== 'active') {
        throw new HttpException(
          { code: 60001, message: '商品不存在或已下架', data: null },
          HttpStatus.BAD_REQUEST,
        )
      }

      // 2. 查用户余额
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { pointsBalance: true },
      })

      if ((user?.pointsBalance ?? 0) < goods.pointsPrice) {
        throw new HttpException(
          { code: 60002, message: '积分不足', data: null },
          HttpStatus.BAD_REQUEST,
        )
      }

      // 3. 校验库存
      if (goods.remainingStock <= 0) {
        throw new HttpException(
          { code: 60003, message: '库存不足', data: null },
          HttpStatus.BAD_REQUEST,
        )
      }

      // 4. 校验单人限兑
      const userOrderCount = await tx.shopOrder.count({
        where: { userId, goodsId: goods.id },
      })

      if (userOrderCount >= goods.exchangeLimit) {
        throw new HttpException(
          { code: 60004, message: '已达兑换上限', data: null },
          HttpStatus.BAD_REQUEST,
        )
      }

      // 5. 校验每日兑换上限
      const config = await this.getShopConfig(tx)
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const todayOrderCount = await tx.shopOrder.count({
        where: {
          userId,
          createdAt: { gte: todayStart },
        },
      })

      if (todayOrderCount >= config.dailyExchangeLimit) {
        throw new HttpException(
          { code: 60005, message: '今日兑换次数已达上限', data: null },
          HttpStatus.BAD_REQUEST,
        )
      }

      // 6. 计算兑换后余额
      const balanceAfter = (user!.pointsBalance ?? 0) - goods.pointsPrice

      // 7. 分配兑换码（FIFO，仅兑换码类商品）
      let assignedCode = ''
      if (goods.category === 'code') {
        const availableCode = await tx.shopGoodCode.findFirst({
          where: { goodsId: goods.id, status: 'available' },
          orderBy: { id: 'asc' },
        })

        if (availableCode) {
          await tx.shopGoodCode.update({
            where: { id: availableCode.id },
            data: {
              status: 'assigned',
              assignedTo: userId,
              assignedAt: new Date(),
            },
          })
          assignedCode = availableCode.code
        }
      }

      // 8. 创建兑换订单
      const order = await tx.shopOrder.create({
        data: {
          userId,
          goodsId: goods.id,
          pointsCost: goods.pointsPrice,
          balanceAfter,
          code: assignedCode,
          status: 'success',
        },
      })

      // 9. 写入积分流水
      await tx.point.create({
        data: {
          userId,
          amount: -goods.pointsPrice,
          balanceAfter,
          source: 'shop',
          referenceId: String(order.id),
          description: `兑换「${goods.name}」`,
        },
      })

      // 10. 更新用户余额
      await tx.user.update({
        where: { id: userId },
        data: { pointsBalance: balanceAfter },
      })

      // 11. 更新商品库存和兑换数
      await tx.shopGood.update({
        where: { id: goods.id },
        data: {
          remainingStock: { decrement: 1 },
          exchangeCount: { increment: 1 },
        },
      })

      return {
        orderId: order.id,
        goodsName: goods.name,
        pointsCost: goods.pointsPrice,
        balanceAfter,
        code: assignedCode,
        exchangedAt: order.createdAt,
      }
    })
  }

  /**
   * 兑换记录列表（分页）
   */
  async listOrders(userId: number, query: QueryOrdersDto) {
    const { page = 1, pageSize = 20 } = query

    const [total, list] = await Promise.all([
      this.prisma.shopOrder.count({ where: { userId } }),
      this.prisma.shopOrder.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          goods: {
            select: { name: true, coverImage: true },
          },
        },
      }),
    ])

    return {
      list: list.map((order) => ({
        id: order.id,
        goodsId: order.goodsId,
        goodsName: order.goods.name,
        coverImage: order.goods.coverImage,
        pointsCost: order.pointsCost,
        code: order.code,
        status: order.status,
        exchangedAt: order.createdAt,
      })),
      pagination: paginate({ page, pageSize }, total),
    }
  }

  // ==================== 私有方法 ====================

  /**
   * 计算库存状态
   */
  private calcStockStatus(remaining: number): string {
    if (remaining <= 0) return 'out'
    if (remaining < 5) return 'low'
    if (remaining <= 20) return 'tense'
    return 'sufficient'
  }

  /**
   * 获取商城配置（支持事务内调用）
   */
  private async getShopConfig(tx?: any): Promise<{ dailyExchangeLimit: number }> {
    const client = tx ?? this.prisma

    const config = await client.systemConfig.findUnique({
      where: { configKey: 'shop_config' },
    })

    if (config) {
      try {
        const parsed = JSON.parse(config.configValue)
        return {
          dailyExchangeLimit: parsed.dailyExchangeLimit ?? 5,
        }
      } catch {
        // fallthrough to defaults
      }
    }

    return { dailyExchangeLimit: 5 }
  }
}
