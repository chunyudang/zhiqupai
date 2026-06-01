import { Controller, Get, Put, Query, Param, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { MessageService } from './message.service'
import { QueryMessagesDto } from './dto/query-messages.dto'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { JwtUserPayload } from '@/common/guards/auth.guard'

@ApiTags('消息 (Messages)')
@Controller({ path: 'messages', version: '1' })
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  @ApiOperation({ summary: '消息列表' })
  async getMessages(
    @CurrentUser() user: JwtUserPayload,
    @Query() query: QueryMessagesDto,
  ) {
    return this.messageService.getMessages(user.sub, query)
  }

  @Put(':id/read')
  @ApiOperation({ summary: '标记单条消息已读' })
  async markRead(
    @CurrentUser() user: JwtUserPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.messageService.markRead(user.sub, id)
  }

  @Put('read-all')
  @ApiOperation({ summary: '全部标记已读' })
  async markAllRead(@CurrentUser() user: JwtUserPayload) {
    return this.messageService.markAllRead(user.sub)
  }

  @Get('unread-count')
  @ApiOperation({ summary: '未读消息数' })
  async getUnreadCount(@CurrentUser() user: JwtUserPayload) {
    return this.messageService.getUnreadCount(user.sub)
  }
}
