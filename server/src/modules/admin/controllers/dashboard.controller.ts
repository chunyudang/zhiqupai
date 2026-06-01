import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AdminService } from '../admin.service'
import { Public } from '@/common/decorators/public.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'

@ApiTags('后台管理 - 运营看板')
@UseGuards(AdminAuthGuard)
@Public()
@ApiBearerAuth()
@Controller('admin/v1/dashboard')
export class DashboardController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: '获取运营数据看板' })
  async getDashboard() {
    return this.adminService.getDashboard()
  }
}
