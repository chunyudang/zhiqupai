import { IsString, IsOptional, IsInt, Min, Length, IsIn, IsArray, ArrayMinSize } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateQuestionDto {
  @ApiProperty({ description: '所属关卡ID', example: 1 })
  @IsInt()
  @Min(1)
  levelId: number

  @ApiProperty({ description: '题目内容', example: '中国古代四大发明不包括以下哪项？' })
  @IsString()
  @Length(1, 500)
  content: string

  @ApiProperty({
    description: '选项列表 (JSON字符串)',
    example: '["A.造纸术","B.印刷术","C.火药","D.地动仪"]',
  })
  @IsString()
  options: string

  @ApiProperty({ description: '正确答案', example: 'D' })
  @IsString()
  @IsIn(['A', 'B', 'C', 'D'])
  correctAnswer: string

  @ApiPropertyOptional({ description: '答案解析', example: '地动仪属于古代科技发明，不属于四大发明' })
  @IsOptional()
  @IsString()
  explanation?: string

  @ApiPropertyOptional({ description: '排序序号', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number
}
