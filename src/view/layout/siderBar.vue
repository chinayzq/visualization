<template>
  <div class="sider-bar-component">
    <div class="log-container">
      <img src="@/assets/images/jm-logo.png" alt="" />
    </div>
    <el-menu
      :default-active="defaultActive"
      class="el-menu-vertical-demo"
      :router="true"
      @open="handleOpen"
      @close="handleClose"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
    >
      <el-menu-item index="/material">
        <i class="el-icon-menu"></i>
        <span slot="title">素材库</span>
      </el-menu-item>
      <el-menu-item index="/visualization">
        <i class="el-icon-menu"></i>
        <span slot="title">组态列表</span>
      </el-menu-item>
      <el-menu-item index="/dynamicAddress">
        <i class="el-icon-menu"></i>
        <span slot="title">动态地址</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script>
export default {
  name: "siderBarComponent",
  data() {
    return {
      defaultActive: "/material",
    }
  },
  watch: {
    $route: {
      handler(route) {
        this.defaultActive = route.path
      },
      immediate: true,
    },
  },
  methods: {
    handleOpen() {},
    handleClose() {},
  },
}
</script>

<style lang="less" scoped>
.sider-bar-component {
  height: 100%;
  ::v-deep .el-menu {
    height: 100%;
  }
  .log-container {
    background: #545c64;
    height: 65px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 199px;
    img {
      width: 139px;
      height: 24px;
    }
  }
}
</style>