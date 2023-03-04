import axios from "axios"
import router from "@/router"
// 创建axios实例
const service = axios.create({
  baseURL: process.env.BASE_API, // api 的 base_url
  timeout: 120000, // 请求超时时间
  // 跨域携带cookie
  withCredentials: true,
})
service.defaults.headers["virtual-token"] = process.env.VUE_APP_TOKEN
// response 拦截器
service.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const response = error.response
    if (!response) {
      //调不通，返回null
      return
    }
    // const res = response.data;
    // 401:未登录;
    if (response.status === 401) {
      // const { path, fullPath } = router.currentRoute
      // 如果当前不在登录页面，则跳转登录页面
      // if (path !== "/login") {
      //   // 跳转登录页面
      //   router.replace({
      //     path: "/login",
      //     query: { redirect: fullPath }, //登录成功后跳入浏览的当前页面
      //   })
      // }
    } else if (response.status === 403) {
      // 403:无权限访问
      //router.replace({path: '/403'})
      // res.errorMsg || response.status
      // Message({
      //   message: '操作被禁止，如有需要，请联系管理员',
      //   type: 'warning',
      //   duration: 2 * 1000,
      // });
    } else if (response.status === 405) {
      // 405:密码到期，需要强制修改密码;
      router.replace({ path: "/" })
      // Message({
      //   message: res.errorMsg || response.status,
      //   type: 'warning',
      //   duration: 2 * 1000,
      // });
    } else if (response.status === 404 || response.status === 503) {
      // router.replace({path: '/404'})
      // Message({
      //     message: "对不起，系统部分服务维护中，请稍后重试" || response.status,
      //     type: 'warning',
      //     duration: 5 * 1000
      // })
    } else if (response.status === 500 || response.status === 518) {
      // 服务端异常
      //router.replace({path: '/error'})
      // Message({
      //   message: res.errorMsg || response.status,
      //   type: 'error',
      //   duration: 5 * 1000,
      // });
    } else if (response.status === 417) {
      //登录发生异常
      // Message({
      //   message: '登录异常',
      //   type: 'error',
      //   duration: 5 * 1000,
      // });
    }
    return Promise.reject(error)
  }
)

export default service
