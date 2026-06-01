import { IsString, Matches } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CalendarQueryDto {
  @ApiProperty({
    description: '查询月份 (YYYY-MM)',
    example: '2026-06',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: '月份格式必须为 YYYY-MM' })
  month: string
}
