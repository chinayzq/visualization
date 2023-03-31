<template>
  <div class="visualization_top_bar">
    <div class="top_menu_right">
      <div class="top_menu_item" @click="$emit('graphEvent', 'openSaveDialog')">
        <i class="el-icon-edit"></i>
        <span>保存</span>
      </div>
      <div class="top_menu_item" @click="zoomHandler('zoomout')">
        <i class="el-icon-plus"></i>
        <span>放大</span>
      </div>

      <div class="top_menu_item" @click="zoomHandler('zoomin')">
        <i class="el-icon-minus"></i>
        <span>缩小</span>
      </div>
      <div class="top_menu_item" @click="clearChart">
        <i class="el-icon-refresh"></i>
        <span>重做</span>
      </div>
      <div class="top_menu_item" @click="$emit('graphEvent', 'goPreview')">
        <i class="el-icon-view"></i>
        <span>预览</span>
      </div>
      <div
        class="top_menu_item"
        :style="{
          cursor: recallList.length ? 'pointer' : 'default',
          color: recallList.length ? '#ffffff' : '#cccccc',
        }"
        @click="$emit('graphEvent', 'recall')"
      >
        <i class="el-icon-back"></i>
        <span>撤销</span>
      </div>
      <div class="top_menu_item">
        <span>{{ Math.floor(scale * 100) + "%" }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    scale: {
      required: true,
      default() {
        return 1
      },
    },
    recallList: {
      type: Array,
      default() {
        return []
      },
    },
  },
  methods: {
    zoomHandler(type) {
      this.$emit("graphEvent", type)
    },
    clearChart() {
      this.$emit("graphEvent", "clear")
    },
    goPreview() {},
  },
}
</script>

<style lang="less" scoped>
.visualization_top_bar {
  height: 50px;
  line-height: 50px;
  width: 100%;
  background: #000;
  display: flex;
  justify-content: center;
  .top_menu_right {
    padding-right: 50px;
    height: 50px;
    display: flex;
    .top_menu_item {
      font-size: 14px;
      cursor: pointer;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      line-height: 25px;
      margin-right: 25px;
    }
  }
}
</style>