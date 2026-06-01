import { IsString, Length } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class AdminLoginDto {
  @ApiProperty({ description: '管理员用户名', example: 'admin' })
  @IsString()
  @Length(2, 50)
  username: string

  @ApiProperty({ description: '管理员密码', example: 'admin123' })
  @IsString()
  @Length(6, 20)
  password: string
}
