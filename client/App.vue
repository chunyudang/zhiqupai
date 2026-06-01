<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { autoLogin } from './utils/token.js'

onLaunch(async () => {
  console.log('[App] Launch')
  try {
    const loggedIn = await autoLogin()
    uni.setStorageSync('isLoggedIn', loggedIn)
    console.log('[App] autoLogin result:', loggedIn)
  } catch (err) {
    console.error('[App] autoLogin error:', err)
    uni.setStorageSync('isLoggedIn', false)
  }
})

onShow(() => {
  console.log('[App] Show')
})

onHide(() => {
  console.log('[App] Hide')
})
</script>

<style>
/* 每个页面公共css */
page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Segoe UI, Arial, Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  font-size: 28rpx;
  color: #333;
}
</style>
