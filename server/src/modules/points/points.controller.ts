import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { PointsService } from './points.service'
import { QueryTransactionsDto } from './dto/query-transactions.dto'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { JwtUserPayload } from '@/common/guards/auth.guard'

@ApiTags('积分 (Points)')
@Controller({ path: 'points', version: '1' })
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get('balance')
  @ApiOperation({ summary: '查询积分余额' })
  async getBalance(@CurrentUser() user: JwtUserPayload) {
    return this.pointsService.getBalance(user.sub)
  }

  @Get('transactions')
  @ApiOperation({ summary: '积分流水' })
  async getTransactions(
    @CurrentUser() user: JwtUserPayload,
    @Query() query: QueryTransactionsDto,
  ) {
    return this.pointsService.getTransactions(user.sub, query)
  }
}
