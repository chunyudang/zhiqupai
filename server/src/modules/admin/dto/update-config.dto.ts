import { IsString, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateConfigDto {
  @ApiProperty({
    description: '配置值 (JSON字符串)',
    example: '{"maxMakeupPerMonth": 5, "makeupCost": 50}',
  })
  @IsString()
  configValue: string

  @ApiPropertyOptional({ description: '配置描述', example: '签到补签相关配置' })
  @IsOptional()
  @IsString()
  description?: string
}
