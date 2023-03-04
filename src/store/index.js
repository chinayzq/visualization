import Vue from "vue"
import Vuex from "vuex"
import app from "./modules/app"
import message from "./modules/message"
import getters from "./getters"
Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    message,
  },
  getters,
})

export default store
