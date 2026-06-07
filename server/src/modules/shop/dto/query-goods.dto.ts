import { IsOptional, IsInt, IsString, Min, Max } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class QueryGoodsDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ description: '每页条数', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20

  @ApiPropertyOptional({ description: '商品分类', enum: ['code', 'coupon', 'virtual', 'all'] })
  @IsOptional()
  @IsString()
  category?: string

  @ApiPropertyOptional({ description: '排序方式', enum: ['price_asc', 'price_desc'] })
  @IsOptional()
  @IsString()
  sort?: string
}
