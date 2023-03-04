import store from "@/store"
import { envInfo } from "@/config/envInfo"

let clk
var websocket
let sockHeartbeat = "---hEaRTbEat---"

function connect(token) {
  //初始化weosocket
  let url = envInfo.bgApp.sprayPath
  if (!url) {
    return
  }
  if (token) {
    url = encodeURI(url + "?u=" + token)
  }
  websocket = new WebSocket(url)
  if (!websocket) {
    console.info("socket地址不正确：" + url)
    return
  }
  websocket.onopen = function () {
    console.info("socket连接已打开：" + url)
    send("ALL_ALARM,ALL_EVENT")
    startHeartbeat()
    // if (store.getters.wstate.subscribe != null) {
    //   console.log("[WebSocket]: Reset Connect Send Subscribe")
    //   send(store.getters.wstate.subscribe)
    // }
  }
  websocket.onclose = function () {
    console.info("socket连接已关闭：" + url)
  }
  websocket.onerror = function () {
    console.info("socket连接发生异常：" + url)
  }
  websocket.onmessage = function (event) {
    console.log("xxxxxxxx=========", event)
    websockMessage(event.data)
  }
}

function send(data) {
  console.log("data_send", data)
  if (websocket.readyState === websocket.OPEN) {
    if (data === sockHeartbeat) {
      websocket.send(data)
    } else {
      websocket.send(data)
    }
  } else {
    console.info("连接已断开，发送失败")
  }
}

function close() {
  websocket.close()
  clearInterval(clk)
}

function websockMessage(data) {
  store.commit("message/SET_WSMESSAGE", data)
}

// 实际调用的方法
function heartbeat() {
  store.commit("message/SET_CONNECT", websocket.readyState)
  if (websocket.readyState === websocket.OPEN) {
    //若是ws开启状态
    //console.info('发送心跳');
    send(sockHeartbeat)
  } else if (websocket.readyState === websocket.CLOSED) {
    console.info("尝试重连中......")
    connect(store.getters.authToken)
  }
}

function startHeartbeat() {
  clearInterval(clk)
  clk = setInterval(heartbeat, 30 * 1000)
}
//connect();
export { send, connect, close }
