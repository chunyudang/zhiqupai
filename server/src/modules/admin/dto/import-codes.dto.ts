import { IsArray, IsString, ArrayNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class ImportCodesDto {
  @ApiProperty({
    description: '兑换码列表',
    example: ['VIP-XXXX-YYYY-0001', 'VIP-XXXX-YYYY-0002'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  codes: string[]
}
