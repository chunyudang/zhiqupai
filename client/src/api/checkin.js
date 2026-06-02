// 识趣派 — 签到 API

import { get, post } from './request'

export const checkinApi = {
  /**
   * 每日签到
   */
  checkin() {
    return post('/checkin')
  },

  /**
   * 补签
   * @param {string} date YYYY-MM-DD
   */
  makeupCheckin(date) {
    return post('/checkin/makeup', { date })
  },

  /**
   * 签到日历
   * @param {string} month YYYY-MM（必填）
   */
  getCalendar(month) {
    return get('/checkin/calendar', { month })
  }
}
