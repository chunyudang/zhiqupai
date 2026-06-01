import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { paginate } from '@/common/utils/pagination'
import { QueryMessagesDto } from './dto/query-messages.dto'

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 消息列表（分页 + 筛选 + 过滤过期消息）
   */
  async getMessages(userId: number, query: QueryMessagesDto) {
    const { page = 1, pageSize = 20, type } = query
    const now = new Date()

    const where: Record<string, unknown> = {
      userId,
      expiresAt: { gt: now },
    }

    if (type) {
      where.type = type
    }

    const [total, list] = await Promise.all([
      this.prisma.message.count({ where: where as any }),
      this.prisma.message.findMany({
        where: where as any,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          type: true,
          title: true,
          content: true,
          isRead: true,
          referenceType: true,
          referenceId: true,
          createdAt: true,
          expiresAt: true,
        },
      }),
    ])

    return {
      list,
      pagination: paginate({ page, pageSize }, total),
    }
  }

  /**
   * 标记单条消息已读
   */
  async markRead(userId: number, messageId: number) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    })

    if (!message) {
      throw new HttpException(
        { code: 50001, message: '消息不存在', data: null },
        HttpStatus.NOT_FOUND,
      )
    }

    // 校验所有权
    if (message.userId !== userId) {
      throw new HttpException(
        { code: 50001, message: '无权操作此消息', data: null },
        HttpStatus.FORBIDDEN,
      )
    }

    await this.prisma.message.update({
      where: { id: messageId },
      data: { isRead: 1 },
    })

    return null
  }

  /**
   * 全部标记已读
   */
  async markAllRead(userId: number) {
    await this.prisma.message.updateMany({
      where: {
        userId,
        isRead: 0,
      },
      data: { isRead: 1 },
    })

    return null
  }

  /**
   * 未读消息数（总计 + 按类型分组）
   */
  async getUnreadCount(userId: number) {
    const now = new Date()

    const baseWhere = {
      userId,
      isRead: 0,
      expiresAt: { gt: now },
    }

    const [total, systemCount, myCommentCount, myLikeCount] = await Promise.all([
      this.prisma.message.count({ where: baseWhere }),
      this.prisma.message.count({
        where: { ...baseWhere, type: 'system' },
      }),
      this.prisma.message.count({
        where: { ...baseWhere, type: 'my_comment' },
      }),
      this.prisma.message.count({
        where: { ...baseWhere, type: 'my_like' },
      }),
    ])

    return {
      total,
      breakdown: {
        system: systemCount,
        my_comment: myCommentCount,
        my_like: myLikeCount,
      },
    }
  }
}
