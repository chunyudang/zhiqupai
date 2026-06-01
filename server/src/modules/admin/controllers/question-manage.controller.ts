import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AdminService } from '../admin.service'
import { CreateQuestionDto } from '../dto/create-question.dto'
import { UpdateQuestionDto } from '../dto/update-question.dto'
import { QueryQuestionsDto } from '../dto/query-questions.dto'
import { Public } from '@/common/decorators/public.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'

@ApiTags('后台管理 - 题目')
@UseGuards(AdminAuthGuard)
@Public()
@ApiBearerAuth()
@Controller('admin/v1/questions')
export class QuestionManageController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: '题目列表(分页)' })
  async list(@Query() dto: QueryQuestionsDto) {
    return this.adminService.listQuestions(dto)
  }

  @Post()
  @ApiOperation({ summary: '新增题目' })
  async create(@Body() dto: CreateQuestionDto) {
    return this.adminService.createQuestion(dto)
  }

  @Put(':id')
  @ApiOperation({ summary: '编辑题目' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.adminService.updateQuestion(id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除题目' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteQuestion(id)
  }
}
