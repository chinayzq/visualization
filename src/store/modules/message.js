import { connect, send } from "@/utils/socket"
import store from "../index"
const message = {
  namespaced: true,
  state: {
    socketInit: false,
    status: "", //连接状态
    subscribe: null, //订阅点
    wsMessage: {
      //不同的消息类型在此拓展
      orientationMessage: null, //定向消息
      propertyMessage: null, //属性消息
      statusMessage: null, //状态消息
      alarmMessage: null, //告警消息
      // alarmSceneMessage: null //场景告警消息
    },
  },
  mutations: {
    SET_SOCKET_INIT: (state, flag) => {
      state.isInit = flag
    },
    SET_CONNECT: (state, status) => {
      state.status = status
    },
    SET_WSMESSAGE: (state, message) => {
      let _jsonMsg = JSON.parse(message)
      if (typeof _jsonMsg.content_ == "string") {
        state.wsMessage[_jsonMsg.type_] = JSON.parse(_jsonMsg.content_)
      } else {
        state.wsMessage[_jsonMsg.type_] = _jsonMsg.content_
      }
    },
    SET_SUBSCRIBE: (state, subscribe) => {
      state.subscribe = subscribe
      send(subscribe)
    },
  },
  actions: {
    //初始化连接
    InitConnect({ commit }) {
      connect(store.getters.authToken)
      commit("SET_SOCKET_INIT", true)
    },
  },
}
export default message
