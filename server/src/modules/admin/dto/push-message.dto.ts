import { IsString, Length, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class PushMessageDto {
  @ApiProperty({ description: '消息标题', example: '系统维护通知' })
  @IsString()
  @Length(1, 100)
  title: string

  @ApiProperty({ description: '消息内容', example: '系统将于今晚22:00进行维护升级' })
  @IsString()
  @Length(1, 500)
  content: string

  @ApiPropertyOptional({
    description: '关联类型 (预留)',
    example: '',
  })
  @IsOptional()
  @IsString()
  referenceType?: string

  @ApiPropertyOptional({
    description: '关联ID (预留)',
    example: '',
  })
  @IsOptional()
  @IsString()
  referenceId?: string
}
