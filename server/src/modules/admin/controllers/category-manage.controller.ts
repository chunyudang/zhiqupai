import {
  Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AdminService } from '../admin.service'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { UpdateCategoryDto } from '../dto/update-category.dto'
import { Public } from '@/common/decorators/public.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'

@ApiTags('后台管理 - 学科')
@UseGuards(AdminAuthGuard)
@Public()
@ApiBearerAuth()
@Controller('admin/v1/categories')
export class CategoryManageController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: '学科列表' })
  async list() {
    return this.adminService.listCategories()
  }

  @Post()
  @ApiOperation({ summary: '新增学科' })
  async create(@Body() dto: CreateCategoryDto) {
    return this.adminService.createCategory(dto)
  }

  @Put(':id')
  @ApiOperation({ summary: '编辑学科' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.adminService.updateCategory(id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除学科' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteCategory(id)
  }
}
