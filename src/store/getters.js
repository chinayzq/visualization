const getters = {
  authToken: (state) => state.app.authToken,
  propertyMessage: (state) => state.message.wsMessage.propertyMessage,
  alarmMessage: (state) => state.message.wsMessage.alarmMessage,
}
export default getters
