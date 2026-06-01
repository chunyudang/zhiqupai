import { IsString, IsOptional, IsInt, Length, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateCategoryDto {
  @ApiProperty({ description: '学科名称', example: '历史' })
  @IsString()
  @Length(1, 50)
  name: string

  @ApiPropertyOptional({ description: '英文名称', example: 'history' })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  nameEn?: string

  @ApiPropertyOptional({ description: '图标', example: '/icons/history.png' })
  @IsOptional()
  @IsString()
  icon?: string

  @ApiPropertyOptional({ description: '描述', example: '探索历史长河中的精彩瞬间' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: '排序序号', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number
}
