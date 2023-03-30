<template>
  <!-- <ScreenAdapter id="app">
  </ScreenAdapter> -->
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import ScreenAdapter from "@/view/layout/screenAdapter.vue"
export default {
  name: "App",
  components: { ScreenAdapter },
  mounted() {
    console.log("当前环境：", process.env.VUE_APP_ENV)
  },
}
</script>

<style>
#app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
</style>
