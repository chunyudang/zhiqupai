// 识趣派 — 平台检测工具
// 统一获取平台相关信息，避免散落条件编译逻辑

const systemInfo = uni.getSystemInfoSync()

/** 当前平台：'ios' | 'android' | 'devtools' | ... */
export const platform = systemInfo.platform

/** 是否为 H5 浏览器端 */
export const isH5 = (
  typeof process !== 'undefined' &&
  process.env &&
  (process.env.UNI_PLATFORM === 'h5' || !process.env.UNI_PLATFORM)
)

/** 是否为微信小程序 */
export const isMpWeixin = (
  typeof process !== 'undefined' &&
  process.env &&
  process.env.UNI_PLATFORM === 'mp-weixin'
)

/** 是否为 App 端（iOS/Android） */
export const isApp = (
  typeof process !== 'undefined' &&
  process.env &&
  (process.env.UNI_PLATFORM === 'app-plus' || process.env.UNI_PLATFORM === 'app')
)

/** 状态栏高度 */
export const statusBarHeight = systemInfo.statusBarHeight || 0

/** 安全区信息 */
export const safeAreaInsets = systemInfo.safeAreaInsets || { top: 0, bottom: 0, left: 0, right: 0 }

/** 底部安全区高度 */
export const safeAreaBottom = safeAreaInsets.bottom || 0
