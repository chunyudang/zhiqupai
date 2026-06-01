// 答题模块 API
import { get, post } from './request.js'

/**
 * 获取学科列表（含进度）
 */
export const getCategories = () => {
  return get('/categories')
}

/**
 * 获取关卡列表（含状态）
 */
export const getLevels = (categoryId: number) => {
  return get(`/categories/${categoryId}/levels`)
}

/**
 * 开始答题
 */
export const startQuiz = (levelId: number) => {
  return post('/quiz/start', { levelId }, true, true)
}

/**
 * 提交答案
 */
export const submitQuiz = (attemptId: string, answers: Array<{
  questionId: number
  selectedAnswer: string
  timeTaken: number
}>) => {
  return post('/quiz/submit', { attemptId, answers }, true, true)
}

/**
 * 关卡回顾
 */
export const getReview = (levelId: number) => {
  return get(`/quiz/review/${levelId}`)
}

/**
 * 用户总进度
 */
export const getProgress = () => {
  return get('/quiz/progress')
}
