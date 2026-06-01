import { IsString, IsIn } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateUserStatusDto {
  @ApiProperty({ description: '用户状态', example: 'banned', enum: ['active', 'banned'] })
  @IsString()
  @IsIn(['active', 'banned'])
  status: 'active' | 'banned'
}
