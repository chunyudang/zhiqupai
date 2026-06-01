import { Injectable, HttpException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '@/prisma/prisma.service'
import * as bcryptjs from 'bcryptjs'
import * as crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { maskPhone } from '@/common/utils/mask-phone'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 对手机号进行 SHA-256 哈希
   */
  private hashPhone(phone: string): string {
    return crypto.createHash('sha256').update(phone).digest('hex')
  }

  /**
   * 生成 JWT accessToken
   */
  private generateAccessToken(userId: number, hashedPhone: string): string {
    return this.jwtService.sign({ sub: userId, phone: hashedPhone })
  }

  /**
   * 生成 refreshToken (UUID) 并存储到数据库
   */
  private async generateRefreshToken(userId: number): Promise<string> {
    const refreshToken = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30天有效期

    await this.prisma.userToken.create({
      data: {
        userId,
        refreshToken,
        expiresAt,
      },
    })

    return refreshToken
  }

  /**
   * 注册
   */
  async register(dto: RegisterDto) {
    const hashedPhone = this.hashPhone(dto.phone)

    // 检查手机号是否已注册
    const existingUser = await this.prisma.user.findUnique({
      where: { phone: hashedPhone },
    })

    if (existingUser) {
      throw new HttpException(
        { code: 10001, message: '手机号已注册', data: null },
        400,
      )
    }

    // 创建用户
    const passwordHash = await bcryptjs.hash(dto.password, 10)
    const nickname = dto.nickname || dto.phone.slice(-4)

    const user = await this.prisma.user.create({
      data: {
        phone: hashedPhone,
        phoneLastFour: dto.phone.slice(-4),
        passwordHash,
        nickname,
        status: 'active',
      },
    })

    // 生成 Token
    const accessToken = this.generateAccessToken(user.id, hashedPhone)
    const refreshToken = await this.generateRefreshToken(user.id)

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15分钟
      user: {
        id: user.id,
        phone: maskPhone(dto.phone.slice(-4)),
        nickname: user.nickname,
        avatar: user.avatar,
        pointsBalance: user.pointsBalance,
      },
    }
  }

  /**
   * 登录
   */
  async login(dto: LoginDto) {
    const hashedPhone = this.hashPhone(dto.phone)

    const user = await this.prisma.user.findUnique({
      where: { phone: hashedPhone },
    })

    if (!user) {
      throw new HttpException(
        { code: 10006, message: '账号不存在', data: null },
        400,
      )
    }

    if (user.status === 'banned') {
      throw new HttpException(
        { code: 10007, message: '账号已被封禁', data: null },
        403,
      )
    }

    if (user.status === 'deleted') {
      throw new HttpException(
        { code: 10006, message: '账号已注销', data: null },
        400,
      )
    }

    const isPasswordValid = await bcryptjs.compare(dto.password, user.passwordHash)
    if (!isPasswordValid) {
      throw new HttpException(
        { code: 10002, message: '密码错误', data: null },
        400,
      )
    }

    const accessToken = this.generateAccessToken(user.id, hashedPhone)
    const refreshToken = await this.generateRefreshToken(user.id)

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
      user: {
        id: user.id,
        phone: maskPhone(user.phoneLastFour),
        nickname: user.nickname,
        avatar: user.avatar,
        pointsBalance: user.pointsBalance,
      },
    }
  }

  /**
   * 刷新 Token
   */
  async refresh(dto: { refreshToken: string }) {
    // 查找 refreshToken
    const tokenRecord = await this.prisma.userToken.findUnique({
      where: { refreshToken: dto.refreshToken },
      include: { user: true },
    })

    if (!tokenRecord) {
      throw new HttpException(
        { code: 10008, message: 'Token无效', data: null },
        401,
      )
    }

    if (new Date() > tokenRecord.expiresAt) {
      // 删除过期 token
      await this.prisma.userToken.delete({ where: { id: tokenRecord.id } })
      throw new HttpException(
        { code: 10003, message: 'Token已过期，请重新登录', data: null },
        401,
      )
    }

    const accessToken = this.generateAccessToken(
      tokenRecord.user.id,
      tokenRecord.user.phone,
    )

    return {
      accessToken,
      expiresIn: 900,
    }
  }

  /**
   * 退出登录
   */
  async logout(userId: number) {
    await this.prisma.userToken.deleteMany({
      where: { userId },
    })

    return null
  }
}
