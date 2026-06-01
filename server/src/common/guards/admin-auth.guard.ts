import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'

export interface AdminJwtPayload {
  sub: number
  role: string
}

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const token = this.extractTokenFromHeader(request)

    if (!token) {
      throw new UnauthorizedException({ code: 90002, message: '未提供管理员认证Token' })
    }

    try {
      const payload = await this.jwtService.verifyAsync<AdminJwtPayload>(token)
      request['admin'] = payload
    } catch {
      throw new UnauthorizedException({ code: 90002, message: '管理员Token已过期或无效' })
    }

    return true
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
