import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { paginate } from '@/common/utils/pagination'
import { QueryTransactionsDto } from './dto/query-transactions.dto'

@Injectable()
export class PointsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 查询积分余额 + 今日已获积分
   */
  async getBalance(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pointsBalance: true },
    })

    // 计算今日已获积分（仅正向积分）
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const todayPoints = await this.prisma.point.aggregate({
      where: {
        userId,
        amount: { gt: 0 },
        createdAt: { gte: todayStart },
      },
      _sum: { amount: true },
    })

    return {
      balance: user?.pointsBalance ?? 0,
      todayEarned: todayPoints._sum.amount ?? 0,
    }
  }

  /**
   * 查询积分流水（分页 + 筛选）
   */
  async getTransactions(userId: number, query: QueryTransactionsDto) {
    const { page = 1, pageSize = 20, source, month } = query

    const where: Record<string, unknown> = { userId }

    if (source) {
      where.source = source
    }

    // 按月份筛选
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [year, monthNum] = month.split('-')
      const startDate = new Date(`${year}-${monthNum}-01T00:00:00`)
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 1)

      where.createdAt = {
        gte: startDate,
        lt: endDate,
      }
    }

    const [total, list] = await Promise.all([
      this.prisma.point.count({ where: where as any }),
      this.prisma.point.findMany({
        where: where as any,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          amount: true,
          balanceAfter: true,
          source: true,
          description: true,
          createdAt: true,
        },
      }),
    ])

    return {
      list,
      pagination: paginate({ page, pageSize }, total),
    }
  }
}
