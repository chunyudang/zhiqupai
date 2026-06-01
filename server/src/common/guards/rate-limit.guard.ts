import { Injectable, CanActivate, ExecutionContext, HttpException } from '@nestjs/common'
import { Request } from 'express'

interface RateLimitConfig {
  limit: number
  windowMs: number
  keyFn?: (req: Request) => string
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly store = new Map<string, RateLimitEntry>()
  private readonly configs = new Map<string, RateLimitConfig>()

  // 清理定时器（每 60 秒）
  private cleanupTimer: NodeJS.Timeout

  constructor() {
    // 定期清理过期条目
    this.cleanupTimer = setInterval(() => this.cleanup(), 60000)
  }

  setLimit(route: string, config: RateLimitConfig) {
    this.configs.set(route, config)
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()
    const handler = context.getHandler()
    const controller = context.getClass()

    // 查找匹配的路由配置
    const routePath = `${controller.name}/${handler.name}`
    const config = this.configs.get(routePath) || this.configs.get(controller.name)

    if (!config) {
      return true // 无限制
    }

    const key = config.keyFn ? config.keyFn(request) : (request.ip || 'unknown')
    const now = Date.now()
    const entry = this.store.get(key)

    if (!entry || now > entry.resetTime) {
      this.store.set(key, { count: 1, resetTime: now + config.windowMs })
      return true
    }

    if (entry.count >= config.limit) {
      throw new HttpException(
        {
          code: 10004,
          message: '请求过于频繁，请稍后再试',
          data: null,
        },
        429,
      )
    }

    entry.count++
    return true
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key)
      }
    }
  }

  onModuleDestroy() {
    clearInterval(this.cleanupTimer)
  }
}
