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
export const getLevels = (categoryId) => {
  return get(`/categories/${categoryId}/levels`)
}

/**
 * 开始答题
 */
export const startQuiz = (levelId) => {
  return post('/quiz/start', { levelId }, true, true)
}

/**
 * 提交答案
 */
export const submitQuiz = (attemptId, answers) => {
  return post('/quiz/submit', { attemptId, answers }, true, true)
}

/**
 * 关卡回顾
 */
export const getReview = (levelId) => {
  return get(`/quiz/review/${levelId}`)
}

/**
 * 用户总进度
 */
export const getProgress = () => {
  return get('/quiz/progress')
}
