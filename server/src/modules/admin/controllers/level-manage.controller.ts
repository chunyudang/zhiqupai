import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { AdminService } from '../admin.service'
import { CreateLevelDto } from '../dto/create-level.dto'
import { UpdateLevelDto } from '../dto/update-level.dto'
import { Public } from '@/common/decorators/public.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'

@ApiTags('后台管理 - 关卡')
@UseGuards(AdminAuthGuard)
@Public()
@ApiBearerAuth()
@Controller('admin/v1/levels')
export class LevelManageController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: '关卡列表' })
  @ApiQuery({ name: 'categoryId', required: false, type: Number, description: '按学科ID筛选' })
  async list(@Query('categoryId') categoryId?: string) {
    const catId = categoryId ? parseInt(categoryId, 10) : undefined
    return this.adminService.listLevels(catId && !isNaN(catId) ? catId : undefined)
  }

  @Post()
  @ApiOperation({ summary: '新增关卡' })
  async create(@Body() dto: CreateLevelDto) {
    return this.adminService.createLevel(dto)
  }

  @Put(':id')
  @ApiOperation({ summary: '编辑关卡' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLevelDto,
  ) {
    return this.adminService.updateLevel(id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除关卡' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteLevel(id)
  }
}
