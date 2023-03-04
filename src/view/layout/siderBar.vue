<template>
  <div class="sider-bar-component">
    <el-menu
      default-active="/material"
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
        <span slot="title">组态详情</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script>
export default {
  name: "siderBarComponent",
  data() {
    return {}
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
}
</style>