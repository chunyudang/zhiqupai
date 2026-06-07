import { IsString, IsOptional, IsInt, Length, Min } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateGoodsDto {
  @ApiPropertyOptional({ description: '商品名称' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string

  @ApiPropertyOptional({ description: '封面图 URL' })
  @IsOptional()
  @IsString()
  coverImage?: string

  @ApiPropertyOptional({ description: '商品描述' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: '商品分类', enum: ['code', 'coupon', 'virtual'] })
  @IsOptional()
  @IsString()
  category?: string

  @ApiPropertyOptional({ description: '积分价格' })
  @IsOptional()
  @IsInt()
  @Min(1)
  pointsPrice?: number

  @ApiPropertyOptional({ description: '总库存' })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalStock?: number

  @ApiPropertyOptional({ description: '单人限兑次数' })
  @IsOptional()
  @IsInt()
  @Min(1)
  exchangeLimit?: number

  @ApiPropertyOptional({ description: '商品状态', enum: ['active', 'inactive'] })
  @IsOptional()
  @IsString()
  status?: string

  @ApiPropertyOptional({ description: '排序序号' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number
}
