import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common'
import { validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: unknown, metadata: ArgumentMetadata) {
    const { metatype } = metadata
    if (!metatype || !this.toValidate(metatype)) {
      return value
    }

    const object = plainToInstance(metatype, value)
    const errors = await validate(object)

    if (errors.length > 0) {
      const messages = errors.map((err) => {
        const constraints = err.constraints || {}
        return Object.values(constraints).join('; ')
      })
      throw new BadRequestException({
        code: 10004,
        message: messages.join('; ') || '参数验证失败',
        data: null,
      })
    }

    return object
  }

  private toValidate(metatype: unknown): boolean {
    const types: Array<new (...args: never[]) => unknown> = [String, Boolean, Number, Array, Object]
    return !types.includes(metatype as new (...args: never[]) => unknown)
  }
}
