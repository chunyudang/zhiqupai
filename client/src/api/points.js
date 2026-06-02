// 识趣派 — 积分 API

import { get } from './request'

export const pointsApi = {
  /**
   * 查询积分余额
   */
  getBalance() {
    return get('/points/balance')
  },

  /**
   * 积分流水列表
   * @param {object} params { page?, pageSize?, source?, month? }
   */
  getTransactions(params = {}) {
    return get('/points/transactions', params)
  }
}
