import router from "../router"
import store from "../store"
router.beforeEach((to, from, next) => {
  console.log("from", from)
  // 如果是登录页面，不走下面初始化逻辑
  if (["/login", "/forget"].includes(to.path)) {
    next()
    return
  }
  // if (!store.state.message.socketInit) {
  //   console.log("初始化websock", store.state)
  //   store.dispatch("message/InitConnect", store.state.app.authToken)
  // }
  next()
})
