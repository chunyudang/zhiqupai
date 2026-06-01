import { get, post, put, del, getAccessToken } from './request.js'

// 获取用户个人信息
const getProfile = () => get('/users/profile')

// 修改用户个人信息
const updateProfile = (data) => put('/users/profile', data)

// 上传头像
const uploadAvatar = (filePath) => {
  return new Promise((resolve, reject) => {
    const token = getAccessToken()
    uni.uploadFile({
      url: 'http://localhost:3000/api/v1/upload/avatar',
      filePath: filePath,
      name: 'file',
      header: {
        Authorization: `Bearer ${token}`
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          if (data.code === 0) {
            resolve(data.data)
          } else {
            uni.showToast({ title: data.message || '上传失败', icon: 'none' })
            reject(new Error(data.message))
          }
        } catch {
          reject(new Error('上传失败'))
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络异常', icon: 'none' })
        reject(err)
      }
    })
  })
}

// 注销账号
const deleteAccount = () => del('/users/account')

export { getProfile, updateProfile, uploadAvatar, deleteAccount }
