import { IsString, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RefreshDto {
  @ApiProperty({ description: '刷新Token', example: 'dGhpcyBp...' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string
}
