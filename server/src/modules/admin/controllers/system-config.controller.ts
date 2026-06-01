import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger'
import { AdminService } from '../admin.service'
import { UpdateConfigDto } from '../dto/update-config.dto'
import { Public } from '@/common/decorators/public.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'

@ApiTags('后台管理 - 系统配置')
@UseGuards(AdminAuthGuard)
@Public()
@ApiBearerAuth()
@Controller('admin/v1/configs')
export class SystemConfigController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: '配置列表' })
  async list() {
    return this.adminService.listConfigs()
  }

  @Put(':key')
  @ApiOperation({ summary: '更新配置' })
  @ApiParam({ name: 'key', description: '配置键名', example: 'checkin_settings' })
  async update(
    @Param('key') key: string,
    @Body() dto: UpdateConfigDto,
  ) {
    return this.adminService.updateConfig(key, dto)
  }
}
