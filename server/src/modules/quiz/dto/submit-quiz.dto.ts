import {
  IsString,
  IsInt,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class AnswerItemDto {
  @ApiProperty({ description: '题目ID', example: 1 })
  @IsInt()
  @Min(1)
  questionId: number

  @ApiProperty({ description: '用户选择的答案', example: 'A' })
  @IsString()
  @IsNotEmpty()
  selectedAnswer: string

  @ApiProperty({ description: '答题用时（秒）', example: 12 })
  @IsInt()
  @Min(3)
  @Max(20)
  timeTaken: number
}

export class SubmitQuizDto {
  @ApiProperty({ description: '答题尝试ID（UUID）', example: 'a1b2c3d4-...' })
  @IsString()
  @IsNotEmpty()
  attemptId: string

  @ApiProperty({
    description: '答案列表（6题）',
    type: [AnswerItemDto],
  })
  @IsArray()
  @ArrayMinSize(6)
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => AnswerItemDto)
  answers: AnswerItemDto[]
}
