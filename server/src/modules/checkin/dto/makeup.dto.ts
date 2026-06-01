import { IsString, Matches } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class MakeupDto {
  @ApiProperty({
    description: '补签日期 (YYYY-MM-DD)',
    example: '2026-05-20',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '日期格式必须为 YYYY-MM-DD' })
  date: string
}
