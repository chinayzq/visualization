<template>
  <div class="top-bar-component">
    <div class="log-out">
      <el-button type="text" @click="logoutHandler">退出登录</el-button>
    </div>
  </div>
</template>

<script>
import request from "@/utils/request"
export default {
  name: "topBarComponent",
  methods: {
    logoutHandler() {
      localStorage.removeItem("visualization-token")
      delete request.defaults.headers["Authorization"]
      this.$router.push("/login")
    },
  },
}
</script>

<style lang="less" scoped>
.top-bar-component {
  padding: 0 24px;
  height: 65px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  box-shadow: 0px 2px 7px 0px rgba(143, 154, 165, 0.4);
  .log-out {
    cursor: pointer;
  }
}
</style>