<template>
  <div class="root-container">
    <div class="main-container">
      <div class="sider-bar-container">
        <SiderBar />
      </div>
      <div class="router-view-container">
        <TopBar />
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import SiderBar from "./siderBar.vue"
import TopBar from "./topBar.vue"
export default {
  name: "viewIndex",
  components: {
    SiderBar,
    TopBar,
  },
  watch: {
    $route: {
      //路由监切换页面背景图
      handler(curRoute) {
        this.curBackground = curRoute.meta.background ? require(`../../assets/images/${curRoute.meta.background}`) : ""
      },
      deep: true,
      immediate: true,
    },
    "$store.state.app.curBackground"(background) {
      this.curBackground = background ? require(`../../assets/images/${background}`) : ""
    },
  },
  data() {
    return {
      curBackground: "",
    }
  },
}
</script>

<style lang="less" scoped>
.root-container {
  height: 100vh;
  .main-container {
    display: flex;
    height: 100%;
    overflow: hidden;
    .sider-bar-container {
      width: 200px;
    }
    .router-view-container {
      flex: 1;
      width: 0;
      height: 100%;
    }
  }
}
</style>