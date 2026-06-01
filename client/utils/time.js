// 时间格式化工具

/**
 * 格式化时间戳为 ISO 8601 字符串（YYYY-MM-DDTHH:mm:ss.sssZ）
 */
const toISOString = (timestamp: number | Date): string => {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
  return date.toISOString()
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 格式化时间为 YYYY-MM-DD HH:mm
 */
const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const dateStr = formatDate(d)
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${dateStr} ${hours}:${minutes}`
}

/**
 * 格式化时间为相对时间（刚刚/x分钟前/x小时前/x天前）
 */
const formatRelative = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = Date.now()
  const diff = now - d.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  return formatDate(d)
}

/**
 * 格式化秒数为 mm:ss
 */
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/**
 * 获取当前月份字符串 YYYY-MM
 */
const getCurrentMonth = (): string => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export {
  toISOString,
  formatDate,
  formatDateTime,
  formatRelative,
  formatDuration,
  getCurrentMonth,
}
