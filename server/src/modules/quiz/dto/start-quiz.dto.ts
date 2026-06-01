import { IsInt, Min } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class StartQuizDto {
  @ApiProperty({ description: '关卡ID', example: 1 })
  @IsInt()
  @Min(1)
  levelId: number
}
