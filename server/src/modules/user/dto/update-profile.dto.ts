import { IsString, IsOptional, Length } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: '昵称，1-16位', example: '小明' })
  @IsOptional()
  @IsString()
  @Length(1, 16)
  nickname?: string
}

export class DeleteAccountDto {
  @ApiPropertyOptional({ description: '确认密码', example: 'abc123' })
  @IsString()
  confirmPassword: string
}
