// 识趣派 — 时间格式化工具

/**
 * 补零
 * @param {number} n 数字
 * @returns {string}
 */
function pad(n) {
  return n < 10 ? '0' + n : '' + n
}

/**
 * 格式化日期 YYYY-MM-DD
 * @param {Date|string|number} date 日期
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/**
 * 格式化日期时间 YYYY-MM-DD HH:mm
 * @param {Date|string|number} date 日期
 * @returns {string}
 */
export function formatDateTime(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/**
 * 相对时间描述
 * @param {Date|string|number} date 日期
 * @returns {string}
 */
export function formatRelative(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const now = new Date()
  const diff = now - d
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  return formatDate(date)
}

/**
 * 格式化时长（秒 → mm:ss）
 * @param {number} totalSeconds 总秒数
 * @returns {string}
 */
export function formatDuration(totalSeconds) {
  if (!totalSeconds && totalSeconds !== 0) return '--'
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${pad(mins)}:${pad(secs)}`
}

/**
 * 获取当前月份 YYYY-MM
 * @returns {string}
 */
export function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`
}

/**
 * 获取指定月份的第一天 YYYY-MM-DD
 * @param {string} yearMonth YYYY-MM
 * @returns {string}
 */
export function getMonthFirstDay(yearMonth) {
  return `${yearMonth}-01`
}

/**
 * 获取指定月份的最后一天 YYYY-MM-DD
 * @param {string} yearMonth YYYY-MM
 * @returns {string}
 */
export function getMonthLastDay(yearMonth) {
  const [year, month] = yearMonth.split('-').map(Number)
  const lastDay = new Date(year, month, 0).getDate()
  return `${yearMonth}-${pad(lastDay)}`
}

/**
 * 获取月份的天数
 * @param {string} yearMonth YYYY-MM
 * @returns {number}
 */
export function getMonthDays(yearMonth) {
  const [year, month] = yearMonth.split('-').map(Number)
  return new Date(year, month, 0).getDate()
}

/**
 * 获取月份第一天是周几 (0=周日, 1=周一, ..., 6=周六)
 * @param {string} yearMonth YYYY-MM
 * @returns {number}
 */
export function getMonthFirstDayOfWeek(yearMonth) {
  const [year, month] = yearMonth.split('-').map(Number)
  return new Date(year, month - 1, 1).getDay()
}
