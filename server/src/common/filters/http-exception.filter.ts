import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { Response } from 'express'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    let code: number
    let message: string

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>
        code = (resp.code as number) || (resp.statusCode as number) || status
        message = (resp.message as string) || exception.message
      } else {
        code = status
        message = exception.message
      }
    } else {
      code = 99999
      message = '服务器内部错误'
    }

    response.status(HttpStatus.OK).json({
      code,
      message,
      data: null,
    })
  }
}
