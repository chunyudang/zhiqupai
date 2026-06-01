import { Controller, Get, Post, Body, Query } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { CheckinService } from './checkin.service'
import { CalendarQueryDto } from './dto/calendar-query.dto'
import { MakeupDto } from './dto/makeup.dto'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { JwtUserPayload } from '@/common/guards/auth.guard'

@ApiTags('签到 (Checkin)')
@Controller({ path: 'checkin', version: '1' })
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Post()
  @ApiOperation({ summary: '每日签到' })
  async checkin(@CurrentUser() user: JwtUserPayload) {
    return this.checkinService.checkin(user.sub)
  }

  @Post('makeup')
  @ApiOperation({ summary: '补签' })
  async makeup(
    @CurrentUser() user: JwtUserPayload,
    @Body() dto: MakeupDto,
  ) {
    return this.checkinService.makeup(user.sub, dto)
  }

  @Get('calendar')
  @ApiOperation({ summary: '签到日历' })
  async getCalendar(
    @CurrentUser() user: JwtUserPayload,
    @Query() query: CalendarQueryDto,
  ) {
    return this.checkinService.getCalendar(user.sub, query)
  }
}
