import { Injectable, HttpException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import * as bcryptjs from 'bcryptjs'
import { maskPhone } from '@/common/utils/mask-phone'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取用户个人信息
   */
  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new HttpException(
        { code: 11001, message: '用户不存在', data: null },
        404,
      )
    }

    if (user.status === 'deleted') {
      throw new HttpException(
        { code: 11001, message: '用户不存在', data: null },
        404,
      )
    }

    return {
      id: user.id,
      phone: maskPhone(user.phoneLastFour),
      nickname: user.nickname,
      avatar: user.avatar,
      pointsBalance: user.pointsBalance,
      status: user.status,
      createdAt: user.createdAt,
    }
  }

  /**
   * 修改用户个人信息（仅支持修改昵称）
   */
  async updateProfile(userId: number, dto: { nickname?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new HttpException(
        { code: 11001, message: '用户不存在', data: null },
        404,
      )
    }

    if (user.status !== 'active') {
      throw new HttpException(
        { code: 11002, message: '账号状态异常，无法修改', data: null },
        403,
      )
    }

    const updateData: Record<string, string> = {}
    if (dto.nickname !== undefined) {
      updateData.nickname = dto.nickname
    }

    if (Object.keys(updateData).length === 0) {
      return this.getProfile(userId)
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    return this.getProfile(userId)
  }

  /**
   * 上传头像 - 仅保存路径到用户记录
   * 文件本身已由 multer 保存到 uploads/avatars/
   */
  async uploadAvatar(userId: number, avatarPath: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new HttpException(
        { code: 11001, message: '用户不存在', data: null },
        404,
      )
    }

    if (user.status !== 'active') {
      throw new HttpException(
        { code: 11002, message: '账号状态异常，无法修改', data: null },
        403,
      )
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarPath },
    })

    return { avatar: avatarPath }
  }

  /**
   * 注销账号（软删除）
   * 需要确认密码
   */
  async deleteAccount(userId: number, confirmPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new HttpException(
        { code: 11001, message: '用户不存在', data: null },
        404,
      )
    }

    if (user.status === 'deleted') {
      throw new HttpException(
        { code: 11001, message: '账号已注销', data: null },
        400,
      )
    }

    // 校验密码
    const isPasswordValid = await bcryptjs.compare(
      confirmPassword,
      user.passwordHash,
    )
    if (!isPasswordValid) {
      throw new HttpException(
        { code: 10002, message: '密码错误', data: null },
        400,
      )
    }

    // 软删除：标记为 deleted，清除 refreshTokens
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { status: 'deleted' },
      }),
      this.prisma.userToken.deleteMany({
        where: { userId },
      }),
    ])

    return null
  }
}
