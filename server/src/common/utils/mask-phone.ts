/**
 * 手机号脱敏：将完整手机号处理为 138****5678 格式
 * 如果提供的是后4位（phoneLastFour），拼接为 **** + 后4位
 */
export function maskPhone(phoneLastFour: string): string {
  if (!phoneLastFour || phoneLastFour.length < 4) {
    return '****'
  }
  return `****${phoneLastFour.slice(-4)}`
}
