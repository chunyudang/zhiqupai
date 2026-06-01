import { Controller, Post, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AdminService } from '../admin.service'
import { PushMessageDto } from '../dto/push-message.dto'
import { Public } from '@/common/decorators/public.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'

@ApiTags('后台管理 - 消息')
@UseGuards(AdminAuthGuard)
@Public()
@ApiBearerAuth()
@Controller('admin/v1/messages')
export class MessagePushController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @ApiOperation({ summary: '推送系统消息(全体用户)' })
  async push(@Body() dto: PushMessageDto) {
    return this.adminService.pushSystemMessage(dto)
  }
}
