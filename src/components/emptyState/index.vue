<template>
  <div class="empty_state_component">
    <div
      class="image_container"
      :style="{
        backgroundImage: 'url(' + require(`../../assets/images/empty_state_${this.type}.png`) + ')',
        height: size.height + 'px',
        width: size.width + 'px',
      }"
    ></div>
    <div
      class="tips_container"
      :style="{
        marginTop: size.marginTop + 'px',
      }"
    >
      {{ customerTips || ALLTIPS[type] }}
    </div>
  </div>
</template>

<script>
const ALLTIPS = {
  noData: "暂无数据",
  error: "啊哦，网络出错了，刷新看看吧~",
  noMessage: "同学你还没收到任何消息哦~",
  404: "啊哦，您访问的页面走丢了！",
  500: "啊哦，服务器出错了~",
}
export default {
  props: {
    customerTips: {
      type: String,
      default() {
        return ""
      },
    },
    type: {
      type: String,
      default() {
        return ""
      },
    },
    size: {
      type: Object,
      default() {
        return {
          width: 200,
          height: 150,
          marginTop: 0,
        }
      },
    },
  },
  data() {
    return {
      ALLTIPS,
    }
  },
}
</script>

<style lang="less" scoped>
.empty_state_component {
  display: flex;
  flex-direction: column;
  align-items: center;
  .image_container {
    background-size: contain;
    background-repeat: no-repeat;
  }
  .tips_container {
    margin-top: 35px;
    height: 16px;
    font-size: 16px;
    font-family: Source Han Sans CN;
    font-weight: 400;
    color: #4d7399;
  }
}
</style>