import {
  Controller, Get, Put, Body, Param, Query, ParseIntPipe, UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsOptional, IsInt, IsString, Min } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { AdminService } from '../admin.service'
import { UpdateUserStatusDto } from '../dto/update-user-status.dto'
import { Public } from '@/common/decorators/public.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'

class QueryUsersDto {
  @ApiPropertyOptional({ description: '页码', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number

  @ApiPropertyOptional({ description: '每页数量', example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number

  @ApiPropertyOptional({ description: '关键词搜索(手机号后4位/昵称)', example: '5678' })
  @IsOptional()
  @IsString()
  keyword?: string
}

@ApiTags('后台管理 - 用户')
@UseGuards(AdminAuthGuard)
@Public()
@ApiBearerAuth()
@Controller('admin/v1/users')
export class UserManageController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: '用户列表(分页)' })
  async list(@Query() dto: QueryUsersDto) {
    return this.adminService.listUsers(dto)
  }

  @Put(':id/status')
  @ApiOperation({ summary: '用户封禁/解封' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(id, dto)
  }
}
