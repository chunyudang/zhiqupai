import { IsInt, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class ExchangeDto {
  @ApiProperty({ description: '商品 ID', example: 1 })
  @IsInt()
  @IsNotEmpty()
  goodsId: number
}
