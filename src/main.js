import Vue from "vue"
import App from "./App.vue"
import router from "./router"
import store from "./store"
import * as filters from "./filters" // 全局过滤器
import "./utils/permission"
import ElementUI, { Message, MessageBox } from "element-ui"
import "element-ui/lib/theme-chalk/index.css"
import "./directive" // 自定义指令

import "@/styles/index.less" // reset css
import "@/styles/elementUI.less" // reset css
import VueCookies from "vue-cookies"
import VueLazyload from "vue-lazyload"
const loadimage = require("./assets/images/img_loading.svg")
const errorimage = require("./assets/images/img_error.png")

Vue.use(VueLazyload, {
  error: errorimage,
  loading: loadimage,
  // "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAXNSR0IArs4c6QAAAdlJREFUSEvtlTFLLDEQx2dSLJaPw8JyO4uDYy/BjyDaCD4RVEQstFcLa7UXtLdVUJ5iqQ8UsbC7nXCFncV9gq0Fj4wEbuFcNpvNPXgKmjaZ+WX+M/8E4ZMWfhIXfsD/TfmvKXWr1ZqMomi80+k81ZUijuOxRqOxAQAvRPTXFeesWEo5g4i3g8DDNE13ffAB9BoRZwGAmXmKiNKyOCdYKbUFAMd5EDMfE9FOFVwp9QcAFgdn3vr9frvb7T4HgZMk+SWE0IgYDwVepmm6AgD9YjIp5REibudQY8yK1voqWGobkCRJLIR48MGllHuIuF8Xas95p7oMzsy3WZb97vV6r6NAa4FdlVs4It4BwGFIpbn03orzgw7Z8+03X0+Lva4Nrui5tc0aEZ357Da8HwS2ge12+0QIsTmchJlvsixbsD2vCw8CFyzzgWF7TkRzZVYL8rHHp/ZZso/L/LDVjDGXWutSn4/U42KlzLxPRAcOq50TkYVXLq/ULmjVtNd5XivBPui/wKt+pyVEPM+T5/K69HPIvkxEF0HDJaVcRcTTwfd2YHvq61sBzsaYaa31fRDYHlZKrTPzq+vWZQmbzeZEFEWrANDRWj+6LusdLl+Vo+7/gEdVLjju+0n9Dl6C/B8MxQGUAAAAAElFTkSuQmCC",
})
Vue.use(ElementUI)
Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm
Vue.config.productionTip = false
// 注册全局过滤器
Object.keys(filters).forEach((key) => {
  Vue.filter(key, filters[key])
})
Vue.use(VueCookies)
function initLocalCookies() {
  const d = new Date()
  d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000)
  const expires = "expires=" + d.toGMTString()
  document.cookie = "virtual-token=" + process.env.VUE_APP_TOKEN + "; " + expires + ";path=/"
}
initLocalCookies()
window.top.APP = new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app")
