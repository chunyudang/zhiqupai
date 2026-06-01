import { IsOptional, IsInt, IsString, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class QueryQuestionsDto {
  @ApiPropertyOptional({ description: '页码', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number

  @ApiPropertyOptional({ description: '每页数量', example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number

  @ApiPropertyOptional({ description: '关卡ID筛选', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  levelId?: number

  @ApiPropertyOptional({ description: '关键词搜索(题目内容)', example: '四大发明' })
  @IsOptional()
  @IsString()
  keyword?: string
}
