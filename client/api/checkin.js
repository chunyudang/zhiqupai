// 签到模块 API
import { get, post } from './request.js'

/**
 * 每日签到
 */
export const checkin = () => {
  return post('/checkin', {}, true, true)
}

/**
 * 补签
 */
export const makeupCheckin = (date: string) => {
  return post('/checkin/makeup', { date }, true, true)
}

/**
 * 签到日历
 */
export const getCalendar = (params?: { month?: string }) => {
  return get('/checkin/calendar', params)
}
