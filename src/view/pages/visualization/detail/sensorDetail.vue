<template>
  <div class="sensor-detail-dialog" v-loading="loadingFlag">
    <div class="title-line card-container">
      <div class="common-header">基础信息</div>
      <el-row :gutter="48" style="height: 130px">
        <el-col :span="12">
          <div class="label-line">传感器名称：</div>
          <div class="value-line">
            {{ detailDatas.sensorName }}
          </div>
        </el-col>
        <el-col :span="12">
          <div class="label-line">传感器图标：</div>
          <div class="value-line">
            <img class="sensor-img" v-if="icon" :src="icon" alt="" />
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="props-container card-container">
      <div class="common-header">点位详情</div>
      <el-row :gutter="48">
        <el-col class="single-prop" :span="12" v-for="(item, index) in detailDatas.list" :key="index">
          <div class="label-line">{{ item.name }}：</div>
          <div class="value-line">
            {{ item.value }}
            <span class="unit-span" v-show="item.unit && item.unit !== '-'">
              {{ item.unit }}
            </span>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { getSensorDetail } from "@/api"
export default {
  name: "sensorDetailDialog",
  props: {
    sensorId: {
      type: String,
      default() {
        return ""
      },
    },
    icon: {
      type: String,
      default() {
        return ""
      },
    },
  },
  data() {
    return {
      loadingFlag: false,
      detailDatas: {
        sensorName: "XXX传感器",
        list: [],
      },
    }
  },
  watch: {
    sensorId: {
      handler(sensorId) {
        sensorId && this.initSensorDetail(sensorId)
      },
      immediate: true,
    },
  },
  methods: {
    // 通过ID获取传感器详情
    initSensorDetail(sensorId) {
      this.loadingFlag = true
      console.log("获取到传感器ID为：", sensorId)
      getSensorDetail({
        secretKey: process.env.VUE_APP_SECRET,
        sensorId,
      })
        .then((res) => {
          console.log(res)
          this.detailDatas = res.data
        })
        .finally(() => {
          this.loadingFlag = false
        })
    },
  },
}
</script>

<style lang="less" scoped>
.sensor-detail-dialog {
  .card-container {
    background-color: #f8f8f8;
    padding: 15px;
    margin-bottom: 24px;
    border-radius: 2px;
    .common-header {
      font-size: 16px;
      font-family: PingFangSC-Semibold, PingFang SC;
      font-weight: 600;
      color: #000000;
      margin-bottom: 20px;
    }
  }
  .title-line {
    .sensor-img {
      height: 100px;
      width: 100px;
    }
  }
  .label-line {
    font-family: PingFangSC-Medium, PingFang SC;
    font-size: 12px;
    font-weight: 300;
    color: #4a4a4a;
    height: 18px;
    line-height: 18px;
    margin-bottom: 4px;
  }
  .value-line {
    font-size: 14px;
    font-weight: normal;
    color: #000000;
    height: 20px;
    line-height: 20px;
    margin-bottom: 10px;
    .unit-span {
      font-size: 0.6em;
    }
  }
  .props-container {
  }
}
</style>