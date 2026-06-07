import { IsString, IsOptional, IsInt, Length, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateGoodsDto {
  @ApiProperty({ description: '商品名称', example: '视频会员月卡' })
  @IsString()
  @Length(1, 100)
  name: string

  @ApiPropertyOptional({ description: '封面图 URL', example: '/uploads/shop/video-vip.png' })
  @IsOptional()
  @IsString()
  coverImage?: string

  @ApiPropertyOptional({ description: '商品描述' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ description: '商品分类', enum: ['code', 'coupon', 'virtual'], example: 'code' })
  @IsString()
  category: string

  @ApiProperty({ description: '积分价格', example: 500 })
  @IsInt()
  @Min(1)
  pointsPrice: number

  @ApiProperty({ description: '总库存', example: 50 })
  @IsInt()
  @Min(0)
  totalStock: number

  @ApiPropertyOptional({ description: '单人限兑次数', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  exchangeLimit?: number

  @ApiPropertyOptional({ description: '排序序号', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number
}
