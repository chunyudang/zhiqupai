<!--
 * @Author: dangchy 14676620+dangchy@user.noreply.gitee.com
 * @Date: 2026-04-13 19:16:40
 * @LastEditors: dangchy 14676620+dangchy@user.noreply.gitee.com
 * @LastEditTime: 2026-06-03 13:26:14
 * @FilePath: /shiqupai/client/src/App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onLaunch(() => {
  console.log('App Launch')
  // 自动登录：尝试用本地 refreshToken 刷新 accessToken
  //userStore.autoLogin()
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
