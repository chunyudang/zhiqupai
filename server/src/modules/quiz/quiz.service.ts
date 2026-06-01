import { Injectable, HttpException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { v4 as uuidv4 } from 'uuid'
import { StartQuizDto } from './dto/start-quiz.dto'
import { SubmitQuizDto } from './dto/submit-quiz.dto'

// 每题得分
const SCORE_PER_CORRECT = 15
// 通关额外奖励
const PASS_BONUS = 50
// 通关阈值（默认答对4题）
const DEFAULT_PASS_SCORE = 4
// 每关题目数
const QUESTIONS_PER_LEVEL = 6

/**
 * Fisher-Yates 洗牌算法
 */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * 题目简要信息（不含 correctAnswer 和 explanation）
 */
interface QuestionBrief {
  id: number
  content: string
  options: string
  sortOrder: number
}

@Injectable()
export class QuizService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== 分类 ====================

  /**
   * 获取所有活跃学科列表（含用户通关数）
   */
  async getCategories(userId: number) {
    const categories = await this.prisma.category.findMany({
      where: { status: 'active' },
      orderBy: { sortOrder: 'asc' },
    })

    // 批量获取用户进度
    const progress = await this.prisma.userProgress.findMany({
      where: {
        userId,
        status: 'passed',
        categoryId: { in: categories.map((c) => c.id) },
      },
      select: { categoryId: true },
    })

    // 统计每个学科的通关数
    const passedMap: Record<number, number> = {}
    for (const p of progress) {
      passedMap[p.categoryId] = (passedMap[p.categoryId] || 0) + 1
    }

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      nameEn: category.nameEn,
      icon: category.icon,
      description: category.description,
      sortOrder: category.sortOrder,
      passedCount: passedMap[category.id] || 0,
      totalLevels: 5,
    }))
  }

  /**
   * 获取某个学科下的关卡列表（含用户闯关状态）
   */
  async getLevels(categoryId: number, userId: number) {
    // 验证学科是否存在且活跃
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, status: 'active' },
    })
    if (!category) {
      throw new HttpException(
        { code: 20003, message: '学科不存在', data: null },
        404,
      )
    }

    const levels = await this.prisma.level.findMany({
      where: { categoryId, status: 'active' },
      orderBy: { levelNo: 'asc' },
    })

    // 获取用户在该学科下的所有进度
    const userProgress = await this.prisma.userProgress.findMany({
      where: { userId, categoryId },
    })
    const progressMap = new Map(userProgress.map((p) => [p.levelId, p]))

    // 构建关卡列表及状态
    let prevPassed = true // 第1关的前置视为已通关
    return levels.map((level) => {
      const progress = progressMap.get(level.id)
      let status: string

      if (progress) {
        // 已有进度记录
        status = progress.status
      } else if (prevPassed) {
        // 前一关已通关 → 当前关卡可进入
        status = 'available'
      } else {
        // 前一关未通关 → 锁定
        status = 'locked'
      }

      // 更新 prevPassed：当前关通过则下一关可解锁
      prevPassed = progress?.status === 'passed'

      return {
        id: level.id,
        levelNo: level.levelNo,
        name: level.name,
        difficulty: level.difficulty,
        passScore: level.passScore,
        status,
        bestScore: progress?.bestScore ?? 0,
        bestTime: progress?.bestTime ?? 0,
        attempts: progress?.attempts ?? 0,
      }
    })
  }

  // ==================== 开始答题 ====================

  /**
   * 开始答题：验证关卡、选题、生成 attemptId
   */
  async startQuiz(userId: number, dto: StartQuizDto) {
    // 1. 获取关卡信息
    const level = await this.prisma.level.findFirst({
      where: { id: dto.levelId, status: 'active' },
      include: { category: true },
    })
    if (!level) {
      throw new HttpException(
        { code: 20002, message: '关卡不存在', data: null },
        404,
      )
    }

    // 2. 检查关卡是否锁定
    await this.checkLevelUnlocked(userId, level.categoryId, level.levelNo, level.id)

    // 3. 获取该关卡所有活跃题目
    const allQuestions = await this.prisma.question.findMany({
      where: { levelId: level.id, status: 'active' },
      select: {
        id: true,
        content: true,
        options: true,
        sortOrder: true,
      },
    })

    if (allQuestions.length < QUESTIONS_PER_LEVEL) {
      throw new HttpException(
        { code: 20002, message: '关卡题目不足，无法答题', data: null },
        400,
      )
    }

    // 4. 选题：优先选用户没做过的题目，不够则补充随机
    const selectedQuestions = await this.selectQuestions(
      userId,
      level.id,
      allQuestions,
      QUESTIONS_PER_LEVEL,
    )

    // 5. 生成 attemptId（UUID）
    const attemptId = uuidv4()

    // 6. 标记进度为 in_progress（如果不在 passed 状态）
    const existingProgress = await this.prisma.userProgress.findUnique({
      where: { userId_levelId: { userId, levelId: level.id } },
    })

    if (existingProgress) {
      if (existingProgress.status !== 'passed') {
        await this.prisma.userProgress.update({
          where: { id: existingProgress.id },
          data: { status: 'in_progress' },
        })
      }
      // passed 状态保持，允许重玩但不改状态
    } else {
      await this.prisma.userProgress.create({
        data: {
          userId,
          categoryId: level.categoryId,
          levelId: level.id,
          status: 'in_progress',
        },
      })
    }

    // 7. 返回题目（不含 correctAnswer 和 explanation）
    return {
      attemptId,
      levelId: level.id,
      levelName: level.name,
      categoryName: level.category.name,
      questions: selectedQuestions.map((q) => ({
        id: q.id,
        content: q.content,
        options: q.options,
      })),
    }
  }

  /**
   * 选题逻辑：优先选择用户未做过的题目，打乱顺序
   */
  private async selectQuestions(
    userId: number,
    levelId: number,
    allQuestions: QuestionBrief[],
    count: number,
  ): Promise<QuestionBrief[]> {
    // 查询用户在该关卡已做过的题目ID
    const answeredRecords = await this.prisma.userAnswer.findMany({
      where: { userId, levelId },
      select: { questionId: true },
      distinct: ['questionId'],
    })
    const answeredIds = new Set(answeredRecords.map((r) => r.questionId))

    // 分离未做过和已做过的题目
    const unseen = allQuestions.filter((q) => !answeredIds.has(q.id))
    const seen = allQuestions.filter((q) => answeredIds.has(q.id))

    // 优先未见过，不够则从见过的补充
    const shuffled = [...shuffle(unseen), ...shuffle(seen)]
    return shuffled.slice(0, count)
  }

  /**
   * 检查关卡是否已解锁
   */
  private async checkLevelUnlocked(
    userId: number,
    categoryId: number,
    levelNo: number,
    levelId: number,
  ): Promise<void> {
    // 第1关默认解锁
    if (levelNo === 1) return

    // 获取当前关卡的进度
    const currentProgress = await this.prisma.userProgress.findUnique({
      where: { userId_levelId: { userId, levelId } },
    })

    // 如果已经通关或已有进度记录，允许答题
    if (currentProgress) {
      if (currentProgress.status === 'passed') return
      if (currentProgress.status === 'available' || currentProgress.status === 'in_progress') return
    }

    // 检查前一关是否已通关
    const prevLevelNo = levelNo - 1
    const prevLevel = await this.prisma.level.findFirst({
      where: { categoryId, levelNo: prevLevelNo },
    })
    if (!prevLevel) {
      throw new HttpException(
        { code: 20002, message: '前置关卡不存在', data: null },
        404,
      )
    }

    const prevProgress = await this.prisma.userProgress.findUnique({
      where: { userId_levelId: { userId, levelId: prevLevel.id } },
    })

    if (!prevProgress || prevProgress.status !== 'passed') {
      throw new HttpException(
        { code: 20001, message: '请先通关前置关卡', data: null },
        403,
      )
    }
  }

  // ==================== 提交答案 ====================

  /**
   * 提交答案并结算分数
   */
  async submitQuiz(userId: number, dto: SubmitQuizDto) {
    const { attemptId, answers } = dto

    if (answers.length !== QUESTIONS_PER_LEVEL) {
      throw new HttpException(
        { code: 20004, message: `必须提交${QUESTIONS_PER_LEVEL}道题的答案`, data: null },
        400,
      )
    }

    // 1. 检查 attemptId 是否已使用（防重复提交）
    const existingAnswer = await this.prisma.userAnswer.findFirst({
      where: { attemptId },
    })
    if (existingAnswer) {
      throw new HttpException(
        { code: 20005, message: '请勿重复提交', data: null },
        400,
      )
    }

    // 2. 校验时间：每道题3-20秒，总时间18-120秒
    for (const a of answers) {
      if (a.timeTaken < 3 || a.timeTaken > 20) {
        throw new HttpException(
          {
            code: 20006,
            message: `题目${a.questionId}答题时间异常（${a.timeTaken}秒）`,
            data: null,
          },
          400,
        )
      }
    }
    const totalTime = answers.reduce((sum, a) => sum + a.timeTaken, 0)
    if (totalTime < 18 || totalTime > 120) {
      throw new HttpException(
        { code: 20006, message: `总答题时间异常（${totalTime}秒）`, data: null },
        400,
      )
    }

    // 3. 获取题目正确答案
    const questionIds = answers.map((a) => a.questionId)
    const questions = await this.prisma.question.findMany({
      where: { id: { in: questionIds }, status: 'active' },
      select: { id: true, correctAnswer: true, levelId: true },
    })

    if (questions.length !== QUESTIONS_PER_LEVEL) {
      throw new HttpException(
        { code: 20002, message: '部分题目不存在', data: null },
        400,
      )
    }

    const questionMap = new Map(questions.map((q) => [q.id, q]))
    const levelId = questions[0].levelId

    // 验证所有题目属于同一关卡
    if (questions.some((q) => q.levelId !== levelId)) {
      throw new HttpException(
        { code: 20004, message: '提交的题目不属于同一关卡', data: null },
        400,
      )
    }

    // 4. 获取关卡信息（passScore）
    const level = await this.prisma.level.findUnique({
      where: { id: levelId },
      select: { id: true, passScore: true, categoryId: true },
    })
    if (!level) {
      throw new HttpException(
        { code: 20002, message: '关卡不存在', data: null },
        404,
      )
    }
    const passScore = level.passScore || DEFAULT_PASS_SCORE

    // 5. 判分
    let correctCount = 0
    const answerRecords: Array<{
      userId: number
      questionId: number
      levelId: number
      attemptId: string
      selectedAnswer: string
      isCorrect: number
      timeTaken: number
    }> = []

    for (const a of answers) {
      const question = questionMap.get(a.questionId)
      const isCorrect = question ? (question.correctAnswer === a.selectedAnswer ? 1 : 0) : 0
      if (isCorrect) correctCount++
      answerRecords.push({
        userId,
        questionId: a.questionId,
        levelId,
        attemptId,
        selectedAnswer: a.selectedAnswer,
        isCorrect,
        timeTaken: a.timeTaken,
      })
    }

    const isPassed = correctCount >= passScore

    // 6. 判断是否重复答题（已通关关卡再次答题不得分）
    const existingProgress = await this.prisma.userProgress.findUnique({
      where: { userId_levelId: { userId, levelId } },
    })
    const isReplay = existingProgress?.status === 'passed'

    const baseScore = correctCount * SCORE_PER_CORRECT
    const bonusScore = isPassed && !isReplay ? PASS_BONUS : 0
    const totalPoints = isReplay ? 0 : baseScore + bonusScore

    // 7. 原子事务写入
    await this.prisma.$transaction(async (tx) => {
      // 7a. 批量创建答题记录
      await tx.userAnswer.createMany({
        data: answerRecords,
      })

      // 7b. 更新用户进度
      const progressData = {
        status: isPassed ? 'passed' : 'failed',
        bestScore: existingProgress
          ? Math.max(existingProgress.bestScore, correctCount)
          : correctCount,
        bestTime: existingProgress
          ? (existingProgress.bestTime > 0
              ? Math.min(existingProgress.bestTime, totalTime)
              : totalTime)
          : totalTime,
        attempts: (existingProgress?.attempts ?? 0) + 1,
        completedAt: isPassed ? new Date() : existingProgress?.completedAt ?? null,
      }

      await tx.userProgress.upsert({
        where: { userId_levelId: { userId, levelId } },
        create: {
          userId,
          categoryId: level.categoryId,
          levelId,
          ...progressData,
        },
        update: progressData,
      })

      // 7c. 积分记录 & 更新余额（只有非重复答题才给分）
      if (totalPoints > 0) {
        const user = await tx.user.update({
          where: { id: userId },
          data: { pointsBalance: { increment: totalPoints } },
          select: { pointsBalance: true },
        })

        await tx.point.create({
          data: {
            userId,
            amount: totalPoints,
            balanceAfter: user.pointsBalance,
            source: 'quiz',
            referenceId: attemptId,
            description: `${correctCount}/${QUESTIONS_PER_LEVEL}题正确${isPassed ? '，通关' : ''}`,
          },
        })
      }
    })

    // 8. 返回结果
    return {
      attemptId,
      levelId,
      correctCount,
      totalQuestions: QUESTIONS_PER_LEVEL,
      score: totalPoints,
      isPassed,
      isReplay,
      details: answerRecords.map((r) => ({
        questionId: r.questionId,
        selectedAnswer: r.selectedAnswer,
        isCorrect: r.isCorrect === 1,
        timeTaken: r.timeTaken,
      })),
    }
  }

  // ==================== 关卡回顾 ====================

  /**
   * 关卡回顾：最近一次答题的详细记录
   */
  async getReview(userId: number, levelId: number) {
    // 获取用户在该关卡的最新 attemptId
    const latestAnswer = await this.prisma.userAnswer.findFirst({
      where: { userId, levelId },
      orderBy: { answeredAt: 'desc' },
      select: { attemptId: true },
    })

    if (!latestAnswer) {
      throw new HttpException(
        { code: 20007, message: '暂无答题记录', data: null },
        404,
      )
    }

    // 获取该 attempt 的所有答案
    const answers = await this.prisma.userAnswer.findMany({
      where: { attemptId: latestAnswer.attemptId },
      orderBy: { questionId: 'asc' },
    })

    // 获取题目详情（含正确答案和解析）
    const questionIds = answers.map((a) => a.questionId)
    const questions = await this.prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: {
        id: true,
        content: true,
        options: true,
        correctAnswer: true,
        explanation: true,
      },
    })
    const questionMap = new Map(questions.map((q) => [q.id, q]))

    // 获取关卡信息
    const level = await this.prisma.level.findUnique({
      where: { id: levelId },
      select: { name: true, passScore: true },
    })

    const details = answers.map((a) => {
      const question = questionMap.get(a.questionId)
      return {
        questionId: a.questionId,
        content: question?.content ?? '',
        options: question?.options ?? '',
        correctAnswer: question?.correctAnswer ?? '',
        explanation: question?.explanation ?? '',
        selectedAnswer: a.selectedAnswer,
        isCorrect: a.isCorrect === 1,
        timeTaken: a.timeTaken,
      }
    })

    const correctCount = answers.filter((a) => a.isCorrect === 1).length
    const passScore = level?.passScore ?? DEFAULT_PASS_SCORE

    return {
      attemptId: latestAnswer.attemptId,
      levelId,
      levelName: level?.name ?? '',
      correctCount,
      totalQuestions: answers.length,
      isPassed: correctCount >= passScore,
      passScore,
      details,
    }
  }

  // ==================== 用户总进度 ====================

  /**
   * 用户总进度概览
   */
  async getProgress(userId: number) {
    // 活跃学科
    const categories = await this.prisma.category.findMany({
      where: { status: 'active' },
      orderBy: { sortOrder: 'asc' },
    })

    // 用户所有已通关进度
    const allPassed = await this.prisma.userProgress.findMany({
      where: { userId, status: 'passed' },
      select: { categoryId: true, levelId: true },
    })

    // 按学科统计
    const passedByCategory: Record<number, number> = {}
    for (const p of allPassed) {
      passedByCategory[p.categoryId] = (passedByCategory[p.categoryId] || 0) + 1
    }

    const totalPassed = allPassed.length
    const totalLevels = categories.length * 5 // 5学科 × 5关 = 25

    const categoryProgress = categories.map((cat) => ({
      categoryId: cat.id,
      categoryName: cat.name,
      passedCount: passedByCategory[cat.id] || 0,
      totalLevels: 5,
    }))

    return {
      totalPassed,
      totalLevels,
      categories: categoryProgress,
    }
  }
}
