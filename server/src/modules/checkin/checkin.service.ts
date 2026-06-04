import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { CalendarQueryDto } from './dto/calendar-query.dto'
import { MakeupDto } from './dto/makeup.dto'

@Injectable()
export class CheckinService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 每日签到
   */
  async checkin(userId: number) {
    const today = this.formatDate(new Date())

    // 检查今日是否已签到
    const existing = await this.prisma.checkIn.findUnique({
      where: { userId_checkInDate: { userId, checkInDate: today } },
    })

    if (existing) {
      throw new HttpException(
        { code: 40001, message: '今日已签到', data: null },
        HttpStatus.BAD_REQUEST,
      )
    }

    // 计算连续签到天数
    const points = await this.calculateCheckinPoints(userId, today)

    // 获取初始余额
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pointsBalance: true },
    })

    const balanceAfter = (user?.pointsBalance ?? 0) + points

    // 原子写入：签到记录 + 积分记录 + 更新余额
    await this.prisma.$transaction([
      this.prisma.checkIn.create({
        data: {
          userId,
          checkInDate: today,
          pointsEarned: points,
          isMakeup: 0,
        },
      }),
      this.prisma.point.create({
        data: {
          userId,
          amount: points,
          balanceAfter,
          source: 'checkin',
          description: `每日签到 +${points}积分`,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { pointsBalance: balanceAfter },
      }),
    ])

    return {
      points,
      balanceAfter,
      consecutiveDays: Math.min(points, 7),
    }
  }

  /**
   * 补签
   */
  async makeup(userId: number, dto: MakeupDto) {
    const today = this.formatDate(new Date())
    const targetDate = dto.date

    // 校验日期合法性：不能是今天或未来日期
    if (targetDate >= today) {
      throw new HttpException(
        { code: 40002, message: '只能补签过去日期', data: null },
        HttpStatus.BAD_REQUEST,
      )
    }

    // 校验日期属于本月
    const targetMonth = targetDate.substring(0, 7)
    const currentMonth = today.substring(0, 7)
    if (targetMonth !== currentMonth) {
      throw new HttpException(
        { code: 40002, message: '只能补签本月的日期', data: null },
        HttpStatus.BAD_REQUEST,
      )
    }

    // 检查该日期是否已签到/补签
    const existing = await this.prisma.checkIn.findUnique({
      where: { userId_checkInDate: { userId, checkInDate: targetDate } },
    })

    if (existing) {
      throw new HttpException(
        { code: 40002, message: '该日期已签到，无需补签', data: null },
        HttpStatus.BAD_REQUEST,
      )
    }

    // 获取签到规则配置
    const config = await this.getCheckinConfig()
    const makeupCost = config.makeupCost
    const maxMakeups = config.maxMakeups

    // 检查本月补签次数
    const [year, month] = targetMonth.split('-')
    const currentMakeups = await this.prisma.checkIn.count({
      where: {
        userId,
        isMakeup: 1,
        checkInDate: {
          gte: `${year}-${month}-01`,
          lte: `${year}-${month}-31`,
        },
      },
    })

    if (currentMakeups >= maxMakeups) {
      throw new HttpException(
        { code: 40002, message: `本月补签次数已达上限（${maxMakeups}次）`, data: null },
        HttpStatus.BAD_REQUEST,
      )
    }

    // 检查积分余额
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pointsBalance: true },
    })

    if ((user?.pointsBalance ?? 0) < makeupCost) {
      throw new HttpException(
        { code: 30001, message: '积分不足，无法补签', data: null },
        HttpStatus.BAD_REQUEST,
      )
    }

    const balanceAfter = (user?.pointsBalance ?? 0) - makeupCost

    // 获取目标日期对应的签到积分
    const targetPoints = await this.getDatePoints(userId, targetDate)

    // 原子写入：补签记录 + 扣分记录 + 更新余额
    await this.prisma.$transaction([
      this.prisma.checkIn.create({
        data: {
          userId,
          checkInDate: targetDate,
          pointsEarned: targetPoints,
          isMakeup: 1,
        },
      }),
      this.prisma.point.create({
        data: {
          userId,
          amount: -makeupCost,
          balanceAfter,
          source: 'makeup',
          description: `补签 ${targetDate} 消耗积分`,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { pointsBalance: balanceAfter },
      }),
    ])

    return {
      date: targetDate,
      cost: makeupCost,
      pointsEarned: targetPoints,
      balanceAfter,
      remainingMakeups: maxMakeups - currentMakeups - 1,
    }
  }

  /**
   * 签到日历
   */
  async getCalendar(userId: number, query: CalendarQueryDto) {
    const today = this.formatDate(new Date())
    const [year, month] = query.month.split('-')
    const daysInMonth = new Date(Number(year), Number(month), 0).getDate()

    // 查询该月所有签到记录
    const checkins = await this.prisma.checkIn.findMany({
      where: {
        userId,
        checkInDate: {
          gte: `${year}-${month}-01`,
          lte: `${year}-${month}-${String(daysInMonth).padStart(2, '0')}`,
        },
      },
    })

    const checkinMap = new Map(
      checkins.map((c) => [c.checkInDate, { isMakeup: c.isMakeup, pointsEarned: c.pointsEarned }]),
    )

    // 计算本月已使用的补签次数
    const currentMakeups = checkins.filter((c) => c.isMakeup === 1).length

    // 获取补签上限
    const config = await this.getCheckinConfig()
    const maxMakeups = config.maxMakeups

    // 构建日历数据
    const calendar: Array<{
      date: string
      status: 'signed' | 'makeup' | 'missed' | 'today' | 'future'
      pointsEarned: number
    }> = []

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${month}-${String(day).padStart(2, '0')}`
      const record = checkinMap.get(date)

      let status: 'signed' | 'makeup' | 'missed' | 'today' | 'future'
      let pointsEarned = 0

      if (date > today) {
        status = 'future'
      } else if (date === today) {
        if (record) {
          status = record.isMakeup === 1 ? 'makeup' : 'signed'
          pointsEarned = record.pointsEarned
        } else {
          status = 'today'
        }
      } else {
        // 过去日期
        if (record) {
          status = record.isMakeup === 1 ? 'makeup' : 'signed'
          pointsEarned = record.pointsEarned
        } else {
          status = 'missed'
        }
      }

      calendar.push({ date, status, pointsEarned })
    }

    // 计算连续签到天数：从今天往前回溯
    let consecutiveDays = 0
    const todayRecord = checkinMap.get(today)
    if (todayRecord) {
      // 今日已签到，从今日往前回溯
      consecutiveDays = await this.countConsecutiveDays(userId, today)
    } else {
      // 今日未签到，尝试从昨天往前回溯
      const yesterday = this.formatDate(
        new Date(new Date(today).getTime() - 86400000),
      )
      const yesterdayRecord = checkinMap.get(yesterday)
      if (yesterdayRecord && yesterdayRecord.isMakeup === 0) {
        consecutiveDays = await this.countConsecutiveDays(userId, yesterday)
      }
    }

    return {
      month: query.month,
      calendar,
      consecutiveDays,
      maxMakeupRemaining: maxMakeups - currentMakeups,
    }
  }

  // ==================== 私有方法 ====================

  /**
   * 格式化为 YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  /**
   * 计算今日签到应得积分（基于连续签到天数）
   */
  private async calculateCheckinPoints(userId: number, today: string): Promise<number> {
    const yesterday = this.formatDate(
      new Date(new Date(today).getTime() - 86400000),
    )

    // 查询昨天是否签到（仅正常签到，不含补签）
    const yesterdayCheckin = await this.prisma.checkIn.findUnique({
      where: {
        userId_checkInDate: {
          userId,
          checkInDate: yesterday,
        },
      },
    })

    let consecutiveDays: number

    if (yesterdayCheckin) {
      // 昨天签到了，计算连续天数
      consecutiveDays = await this.countConsecutiveDays(userId, yesterday)
    } else {
      // 昨天未签到，断签重置
      // 但需要检查是否是自然月第一天（月初重置）
      const todayDate = new Date(today)
      if (todayDate.getDate() === 1) {
        consecutiveDays = 1
      } else {
        // 检查是否本月有签到记录
        const todayMonth = today.substring(0, 7)
        const anyCheckinThisMonth = await this.prisma.checkIn.findFirst({
          where: {
            userId,
            checkInDate: {
              gte: `${todayMonth}-01`,
              lt: today,
            },
          },
        })
        consecutiveDays = anyCheckinThisMonth ? 1 : 1
      }
    }

    // 积分规则：第N天=N分，最多7分
    return Math.min(consecutiveDays, 7)
  }

  /**
   * 向后计算连续签到天数
   */
  private async countConsecutiveDays(userId: number, endDate: string): Promise<number> {
    let count = 0
    let currentDate = new Date(endDate)
    const monthStart = endDate.substring(0, 7) + '-01'

    while (true) {
      const dateStr = this.formatDate(currentDate)
      if (dateStr < monthStart) break

      const record = await this.prisma.checkIn.findUnique({
        where: {
          userId_checkInDate: {
            userId,
            checkInDate: dateStr,
          },
        },
      })

      if (record && record.isMakeup === 0) {
        count++
        currentDate = new Date(currentDate.getTime() - 86400000)
      } else {
        break
      }
    }

    // 加上今天
    return count + 1
  }

  /**
   * 计算某日期若签到的应得积分
   */
  private async getDatePoints(userId: number, date: string): Promise<number> {
    const prevDate = this.formatDate(
      new Date(new Date(date).getTime() - 86400000),
    )

    const prevCheckin = await this.prisma.checkIn.findUnique({
      where: {
        userId_checkInDate: {
          userId,
          checkInDate: prevDate,
        },
      },
    })

    if (prevCheckin && prevCheckin.isMakeup === 0) {
      const consecutive = await this.countConsecutiveDays(userId, prevDate)
      return Math.min(consecutive, 7)
    }

    return 1
  }

  /**
   * 获取签到规则配置
   */
  private async getCheckinConfig(): Promise<{ makeupCost: number; maxMakeups: number }> {
    const config = await this.prisma.systemConfig.findUnique({
      where: { configKey: 'checkin_rules' },
    })

    if (config) {
      try {
        const parsed = JSON.parse(config.configValue)
        return {
          makeupCost: parsed.makeupCost ?? 50,
          maxMakeups: parsed.maxMakeups ?? 5,
        }
      } catch {
        // fallthrough to defaults
      }
    }

    return { makeupCost: 50, maxMakeups: 5 }
  }
}
