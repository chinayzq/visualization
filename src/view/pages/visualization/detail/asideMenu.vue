<template>
  <div
    class="visualization_aside_menu"
    v-loading="menuLoading"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.3)"
  >
    <el-aside width="70px">
      <div class="left_menu_container">
        <div
          v-for="(item, index) in leftMenuList"
          :key="index"
          :class="currentActiveType === item.type ? 'left_top_item active_item' : 'left_top_item'"
          @click="setCurrentActive(item.type)"
        >
          <span>{{ item.name }}</span>
          <span>({{ item.count }})</span>
        </div>
      </div>
      <div
        class="second_container"
        v-loading="menuLoading"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.3)"
        :style="{
          width: itemShow ? '270px' : '0',
          padding: itemShow ? '30px' : '0',
        }"
      >
        <div
          draggable="true"
          @dragstart="dragStartHandler"
          @dragend="dragEndHandler"
          class="menu_item"
          v-for="(item, idx) in MenuList[currentActiveType]"
          :style="{
            display: itemShow ? 'inline-block' : 'none',
          }"
          :key="idx"
          :data-icon="item.icon"
          :data-name="item.name"
          :data-busitype="item.busiType"
          :data-nodetype="item.nodetype"
          :data-height="item.height"
          :data-width="item.width"
          :data-rotate="item.rotate"
          :data-top="item.top"
          :data-left="item.left"
          :data-backgroundImage="item.backgroundImage"
          :data-index="item.index"
          :data-text="item.text"
          :data-catelog="item.catelog"
          :data-item="JSON.stringify(item)"
        >
          <el-tooltip :content="item.name" placement="bottom" effect="light">
            <i :style="{ backgroundImage: 'url(' + item.icon + ')' }"></i>
          </el-tooltip>
        </div>
      </div>
      <div class="ope_btn" @click="itemShow = !itemShow" :style="{ left: itemShow ? '340px' : '70px' }">
        <i class="el-icon-arrow-left" v-if="itemShow"></i>
        <i class="el-icon-arrow-right" v-else></i>
      </div>
    </el-aside>
  </div>
</template>

<script>
import { getMaterialList } from "@/api"
import officialMeterial from "./officialMeterial.js"
export default {
  name: "visualizationAsideMenu",
  data() {
    return {
      menuLoading: false,
      leftMenuList: [
        { name: "基础库", count: 0, type: "basic" },
        { name: "自定义", count: 0, type: "custom" },
        { name: "按钮素材", count: 0, type: "button" },
      ],
      MenuList: {},
      currentActiveType: "basic",
      itemShow: true,
    }
  },
  created() {
    this.initMenuList()
  },
  methods: {
    // 开始拖动，emit拖动项的数据
    dragStartHandler(e) {
      console.log("e", e)
      this.$emit("setCurrentDragItem", e.target.dataset)
    },
    dragEndHandler(e) {
      console.log("xxx-end", e)
    },
    initMenuList() {
      // if (location.href.includes("localhost")) {
      //   this.initOfficialMeterial()
      //   return
      // }
      this.menuLoading = true
      const requestParams = {
        name: "",
        catelog: "",
        page: 0,
        size: 1000,
      }
      // 获取素材库数据
      getMaterialList(requestParams)
        .then((res) => {
          this.MenuList = {}
          let tempObj = {}
          res.data.records.forEach((item) => {
            // 过滤无效状态的数据
            if (!item.status) return
            if (!tempObj[item.catelog]) {
              tempObj[item.catelog] = []
            }
            const detail = JSON.parse(item.detail)
            tempObj[item.catelog].push({
              detail,
              icon: detail.statusList[detail.default],
              name: item.name,
              catelog: item.catelog,
              busiType: "basicComponent",
              nodetype: "text",
              height: 100,
              width: 100,
              rotate: 0,
              top: 0,
              left: 0,
              index: 0,
              backgroundImage: "",
            })
          })
          this.MenuList = tempObj
          this.initOfficialMeterial()
          this.leftMenuList.forEach((item) => {
            item.count = tempObj[item.type] ? tempObj[item.type].length : 0
          })
        })
        .finally(() => {
          this.menuLoading = false
        })
    },
    initOfficialMeterial() {
      this.MenuList["basic"] = officialMeterial
    },
    setCurrentActive(type) {
      this.currentActiveType = type
      this.itemShow = true
    },
  },
}
</script>

<style lang="less" scoped>
.visualization_aside_menu {
  background: #1e1f22;
  height: 100%;
  .left_menu_container {
    position: relative;
    background: #1e1f22;
    width: 100%;
    height: 100%;
    .active_item {
      background: #2b2c2f;
    }
    .left_top_item {
      cursor: pointer;
      color: #ecebeb;
      height: 60px;
      line-height: 20px;
      padding: 10px;
      font-size: 12px;
      text-align: center;
      &:hover {
        color: #fff;
      }
    }
  }
  .second_container {
    z-index: 99;
    padding: 30px;
    height: calc(100% - 50px);
    width: 270px;
    transition: width 0.3s;
    background: #2b2c2f;
    position: fixed;
    left: 70px;
    top: 50px;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    flex-direction: row;
    align-content: flex-start;
    overflow: auto;
    .menu_item {
      height: 60px;
      width: 60px;
      margin-bottom: 20px;
      padding: 10px;
      background: #e9eef3;
      color: #fff;
      border-radius: 5px;
      i {
        width: 40px;
        height: 40px;
        line-height: 40px;
        background-size: 85%;
        display: inline-block;
        background-repeat: no-repeat;
        background-position: center;
        font-size: 20px;
        color: #409eff;
        cursor: pointer;
        margin-right: 0 !important;
        -ms-touch-action: none;
        touch-action: none;
        -moz-user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
    }
  }
  .ope_btn {
    cursor: pointer;
    position: fixed;
    transition: left 0.3s;
    top: calc(50vh - 65px);
    width: 14px;
    height: 80px;
    background: #1e1f22;
    color: #fff;
    border-radius: 0 20px 20px 0;
    align-items: center;
    display: flex;
    z-index: 99;
  }
}
</style>