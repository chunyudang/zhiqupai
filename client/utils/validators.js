// 表单校验工具

/**
 * 校验手机号（中国大陆）
 * @returns 错误信息，校验通过返回 null
 */
const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return '请输入手机号'
  }
  if (!/^1[3-9]\d{9}$/.test(phone.trim())) {
    return '手机号格式不正确'
  }
  return null
}

/**
 * 校验密码
 * 规则：6-20位，至少包含字母和数字
 */
const validatePassword = (password) => {
  if (!password) {
    return '请输入密码'
  }
  if (password.length < 6) {
    return '密码至少6位'
  }
  if (password.length > 20) {
    return '密码最多20位'
  }
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    return '密码需包含字母和数字'
  }
  return null
}

/**
 * 校验昵称
 * 规则：1-16个字符
 */
const validateNickname = (nickname) => {
  if (!nickname || !nickname.trim()) {
    return '请输入昵称'
  }
  if (nickname.trim().length > 16) {
    return '昵称不能超过16个字符'
  }
  return null
}

export {
  validatePhone,
  validatePassword,
  validateNickname,
}
