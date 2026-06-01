import { IsString, IsOptional, Length, Matches } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class RegisterDto {
  @ApiProperty({ description: '手机号', example: '13812345678' })
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string

  @ApiProperty({ description: '密码，6-20位字母数字组合', example: 'abc123' })
  @IsString()
  @Length(6, 20)
  @Matches(/^[a-zA-Z0-9]+$/, { message: '密码只能包含字母和数字' })
  password: string

  @ApiPropertyOptional({ description: '昵称，1-16位', example: '小明' })
  @IsOptional()
  @IsString()
  @Length(1, 16)
  nickname?: string
}
