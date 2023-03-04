// import { login, setCurrentTenant } from "@/api/login"
// import { encrypt2RSA } from "@/utils/encrypt"
// import { Base64 } from "js-base64"
const app = {
  namespaced: true,
  state: {
    authToken: localStorage.getItem("application:au") || null,
    isInit: false,
    curBackground: "",
  },
  mutations: {
    SET_INIT: (state, init) => {
      state.isInit = init
    },
    SET_AUTH_TOKEN: (state, token) => {
      localStorage.setItem("application:au", token)
      state.authToken = token
    },
    SET_BACKGROUND: (state, background) => {
      state.curBackground = background
    },
  },
  actions: {
    // 登录
    // Login({ commit }, userInfo) {
    //   return new Promise((resolve, reject) => {
    //     login(userInfo.username.trim(), encrypt2RSA(userInfo.password.trim()), userInfo.authType)
    //       .then((r) => {
    //         let bastAuthToken = Base64.encode(r.authToken)
    //         setCurrentTenant(1, "x7hcAjRpvrU").then(() => {
    //           commit("SET_INIT", true)
    //           commit("SET_AUTH_TOKEN", bastAuthToken)
    //           resolve(r)
    //         })
    //       })
    //       .catch((error) => {
    //         reject(error)
    //       })
    //   })
    // },
  },
  getters: {},
}
export default app
