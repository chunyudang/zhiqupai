import { Controller, Get, Post, Query, Param, Body, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { ShopService } from './shop.service'
import { QueryGoodsDto } from './dto/query-goods.dto'
import { ExchangeDto } from './dto/exchange.dto'
import { QueryOrdersDto } from './dto/query-orders.dto'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { JwtUserPayload } from '@/common/guards/auth.guard'

@ApiTags('积分商城 (Shop)')
@Controller({ path: 'shop', version: '1' })
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get('goods')
  @ApiOperation({ summary: '商品列表' })
  async listGoods(@Query() query: QueryGoodsDto) {
    return this.shopService.listGoods(query)
  }

  @Get('goods/:id')
  @ApiOperation({ summary: '商品详情' })
  async getGoodsDetail(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtUserPayload,
  ) {
    return this.shopService.getGoodsDetail(id, user.sub)
  }

  @Post('exchange')
  @ApiOperation({ summary: '兑换商品' })
  async exchange(
    @Body() dto: ExchangeDto,
    @CurrentUser() user: JwtUserPayload,
  ) {
    return this.shopService.exchange(user.sub, dto)
  }

  @Get('orders')
  @ApiOperation({ summary: '兑换记录' })
  async listOrders(
    @Query() query: QueryOrdersDto,
    @CurrentUser() user: JwtUserPayload,
  ) {
    return this.shopService.listOrders(user.sub, query)
  }
}
