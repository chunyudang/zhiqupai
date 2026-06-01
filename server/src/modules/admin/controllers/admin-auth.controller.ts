import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AdminService } from '../admin.service'
import { AdminLoginDto } from '../dto/admin-login.dto'
import { Public } from '@/common/decorators/public.decorator'
import { CurrentAdmin } from '@/common/decorators/current-admin.decorator'
import { AdminAuthGuard, AdminJwtPayload } from '@/common/guards/admin-auth.guard'

@ApiTags('后台管理 - 认证')
@Public()
@Controller('admin/v1/auth')
export class AdminAuthController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @ApiOperation({ summary: '管理员登录' })
  async login(@Body() dto: AdminLoginDto) {
    return this.adminService.login(dto)
  }

  @UseGuards(AdminAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取管理员信息' })
  async getProfile(@CurrentAdmin() admin: AdminJwtPayload) {
    return this.adminService.getProfile(admin.sub)
  }
}
