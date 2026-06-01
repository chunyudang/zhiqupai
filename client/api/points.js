// 积分模块 API
import { get } from './request.js'

/**
 * 查询积分余额
 */
export const getBalance = () => {
  return get('/points/balance')
}

/**
 * 积分流水
 */
export const getTransactions = (params?: {
  page?: number
  pageSize?: number
  source?: string
  month?: string
}) => {
  return get('/points/transactions', params)
}
