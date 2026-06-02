// 识趣派 — 表单校验工具

/**
 * 校验手机号
 * @param {string} phone 手机号
 * @returns {{ valid: boolean, message: string }}
 */
export function validatePhone(phone) {
  if (!phone) {
    return { valid: false, message: '请输入手机号' }
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return { valid: false, message: '请输入正确的手机号' }
  }
  return { valid: true, message: '' }
}

/**
 * 校验密码
 * @param {string} password 密码
 * @returns {{ valid: boolean, message: string }}
 */
export function validatePassword(password) {
  if (!password) {
    return { valid: false, message: '请输入密码' }
  }
  if (password.length < 6 || password.length > 20) {
    return { valid: false, message: '密码长度需为 6-20 位' }
  }
  if (!/^[a-zA-Z0-9]+$/.test(password)) {
    return { valid: false, message: '密码只能包含字母和数字' }
  }
  return { valid: true, message: '' }
}

/**
 * 校验昵称
 * @param {string} nickname 昵称
 * @returns {{ valid: boolean, message: string }}
 */
export function validateNickname(nickname) {
  if (!nickname) {
    return { valid: false, message: '请输入昵称' }
  }
  if (nickname.length < 1 || nickname.length > 16) {
    return { valid: false, message: '昵称长度需为 1-16 位' }
  }
  return { valid: true, message: '' }
}

/**
 * 校验确认密码
 * @param {string} password 密码
 * @param {string} confirmPassword 确认密码
 * @returns {{ valid: boolean, message: string }}
 */
export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) {
    return { valid: false, message: '请再次输入密码' }
  }
  if (password !== confirmPassword) {
    return { valid: false, message: '两次输入的密码不一致' }
  }
  return { valid: true, message: '' }
}
