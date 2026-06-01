import { IsString, IsOptional, IsInt, Min, Max, Length, IsIn } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateLevelDto {
  @ApiProperty({ description: '所属学科ID', example: 1 })
  @IsInt()
  @Min(1)
  categoryId: number

  @ApiProperty({ description: '关卡序号 (1-5)', example: 1 })
  @IsInt()
  @Min(1)
  @Max(5)
  levelNo: number

  @ApiProperty({ description: '关卡名称', example: '历史入门' })
  @IsString()
  @Length(1, 100)
  name: string

  @ApiPropertyOptional({ description: '难度', example: 'easy', enum: ['easy', 'medium', 'hard'] })
  @IsOptional()
  @IsString()
  @IsIn(['easy', 'medium', 'hard'])
  difficulty?: string

  @ApiPropertyOptional({ description: '通关所需答对数', example: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6)
  passScore?: number
}
