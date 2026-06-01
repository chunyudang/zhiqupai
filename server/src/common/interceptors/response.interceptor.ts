import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface ApiResponse<T> {
  code: number
  message: string
  data: T | null
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // 如果已经是统一格式则直接返回
        if (data && typeof data === 'object' && 'code' in data && 'message' in data) {
          return data as ApiResponse<T>
        }
        return {
          code: 0,
          message: 'success',
          data: data ?? null,
        }
      }),
    )
  }
}
