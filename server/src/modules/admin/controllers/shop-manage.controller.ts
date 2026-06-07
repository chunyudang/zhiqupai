import {
  Controller, Get, Post, Put, Delete, Query, Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AdminService } from '../admin.service'
import { CreateGoodsDto } from '../dto/create-goods.dto'
import { UpdateGoodsDto } from '../dto/update-goods.dto'
import { ImportCodesDto } from '../dto/import-codes.dto'
import { QueryShopOrdersDto } from '../dto/query-shop-orders.dto'
import { Public } from '@/common/decorators/public.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'

@ApiTags('后台管理 - 商城')
@UseGuards(AdminAuthGuard)
@Public()
@ApiBearerAuth()
@Controller('admin/v1/shop')
export class ShopManageController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: '商城统计看板' })
  async getShopDashboard() {
    return this.adminService.getShopDashboard()
  }

  @Get('goods')
  @ApiOperation({ summary: '商品列表' })
  async listGoods(@Query() query: any) {
    return this.adminService.listShopGoods(query)
  }

  @Post('goods')
  @ApiOperation({ summary: '新增商品' })
  async createGoods(@Body() dto: CreateGoodsDto) {
    return this.adminService.createShopGoods(dto)
  }

  @Put('goods/:id')
  @ApiOperation({ summary: '编辑商品' })
  async updateGoods(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGoodsDto,
  ) {
    return this.adminService.updateShopGoods(id, dto)
  }

  @Delete('goods/:id')
  @ApiOperation({ summary: '删除商品' })
  async deleteGoods(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteShopGoods(id)
  }

  @Post('goods/:id/codes')
  @ApiOperation({ summary: '导入兑换码' })
  async importCodes(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ImportCodesDto,
  ) {
    return this.adminService.importGoodsCodes(id, dto)
  }

  @Get('orders')
  @ApiOperation({ summary: '兑换记录' })
  async listOrders(@Query() query: QueryShopOrdersDto) {
    return this.adminService.listShopOrders(query)
  }
}
