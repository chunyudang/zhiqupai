import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class QueryTransactionsDto {
  @ApiPropertyOptional({ description: '页码', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ description: '每页数量', example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20

  @ApiPropertyOptional({
    description: '积分来源',
    enum: ['quiz', 'checkin', 'makeup'],
    example: 'checkin',
  })
  @IsOptional()
  @IsString()
  source?: string

  @ApiPropertyOptional({
    description: '筛选月份 (YYYY-MM)',
    example: '2026-06',
  })
  @IsOptional()
  @IsString()
  month?: string
}
