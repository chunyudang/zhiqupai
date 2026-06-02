// 识趣派 — 答题 API

import { get, post } from './request'

export const quizApi = {
  /**
   * 获取学科列表（含进度）
   */
  getCategories() {
    return get('/categories')
  },

  /**
   * 获取关卡列表（含状态）
   * @param {number} categoryId 学科 ID
   */
  getLevels(categoryId) {
    return get(`/categories/${categoryId}/levels`)
  },

  /**
   * 开始答题
   * @param {number} levelId 关卡 ID
   */
  startQuiz(levelId) {
    return post('/quiz/start', { levelId })
  },

  /**
   * 提交答案
   * @param {string} attemptId 答题 ID
   * @param {Array} answers [{ questionId, selectedAnswer, timeTaken }]
   */
  submitQuiz(attemptId, answers) {
    return post('/quiz/submit', { attemptId, answers })
  },

  /**
   * 关卡回顾
   * @param {number} levelId 关卡 ID
   */
  getReview(levelId) {
    return get(`/quiz/review/${levelId}`)
  },

  /**
   * 用户总进度
   */
  getProgress() {
    return get('/quiz/progress')
  }
}
