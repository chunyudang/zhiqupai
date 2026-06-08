import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { QuizService } from './quiz.service'
import { StartQuizDto } from './dto/start-quiz.dto'
import { SubmitQuizDto } from './dto/submit-quiz.dto'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { JwtUserPayload } from '@/common/guards/auth.guard'

@ApiTags('答题 (Quiz)')
@Controller({ version: '1' })
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('categories')
  @ApiOperation({ summary: '学科列表（含进度）' })
  async getCategories(@CurrentUser() user: JwtUserPayload) {
    return this.quizService.getCategories(user.sub)
  }

  @Get('categories/:id/levels')
  @ApiOperation({ summary: '关卡列表（含状态）' })
  async getLevels(
    @Param('id', ParseIntPipe) categoryId: number,
    @CurrentUser() user: JwtUserPayload,
  ) {
    return this.quizService.getLevels(categoryId, user.sub)
  }

  @Post('quiz/start')
  @ApiOperation({ summary: '开始答题' })
  async startQuiz(@CurrentUser() user: JwtUserPayload, @Body() dto: StartQuizDto) {
    return this.quizService.startQuiz(user.sub, dto)
  }

  @Post('quiz/submit')
  @ApiOperation({ summary: '提交答案' })
  async submitQuiz(@CurrentUser() user: JwtUserPayload, @Body() dto: SubmitQuizDto) {
    return this.quizService.submitQuiz(user.sub, dto)
  }

  @Get('quiz/review/:levelId')
  @ApiOperation({ summary: '关卡回顾' })
  async getReview(
    @Param('levelId', ParseIntPipe) levelId: number,
    @CurrentUser() user: JwtUserPayload,
  ) {
    return this.quizService.getReview(user.sub, levelId)
  }

  @Get('quiz/progress')
  @ApiOperation({ summary: '用户总进度' })
  async getProgress(@CurrentUser() user: JwtUserPayload) {
    return this.quizService.getProgress(user.sub)
  }
}
