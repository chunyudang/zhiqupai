<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onLaunch(() => {
  console.log('App Launch')
  // 自动登录：尝试用本地 refreshToken 刷新 accessToken
  userStore.autoLogin()
})

onShow(() => {
  console.log('App Show')
  // App 回到前台时刷新未读消息数
  if (userStore.isLoggedIn) {
    import('@/stores/messages').then(({ useMessagesStore }) => {
      useMessagesStore().fetchUnreadCount()
    })
  }
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
@import '@/uni.scss';
</style>
