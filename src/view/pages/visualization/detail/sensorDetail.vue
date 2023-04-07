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
        <el-col :span="12" v-for="(item, index) in detailDatas.list" :key="index">
          <!-- 如果value为空，则不显示这个属性 -->
          <!-- indexType： 1：直接展示值 2：input框 3：开关两个选项 4：自动、开、关三个选项 -->
          <div class="single-prop" v-if="typeof item.value !== 'undefined'">
            <span class="label-line">{{ item.name }}：</span>
            <span class="value-line" v-if="item.indexType === 1">
              {{ item.value }}
              <span class="unit-span" v-show="item.unit && item.unit !== '-'">
                {{ item.unit }}
              </span>
            </span>
            <span class="value-line" v-else-if="item.indexType === 2">
              <el-input
                size="mini"
                style="width: 120px; display: inline-block"
                v-model="item.value"
                @blur="changeStatus(item, item.value)"
              ></el-input>
              <span class="unit-span" v-show="item.unit && item.unit !== '-'">
                {{ item.unit }}
              </span>
            </span>
            <span class="value-line" v-else-if="item.indexType === 3">
              <el-button size="mini" :type="item.value === 1 ? 'primary' : ''" @click="changeStatus(item, 1)">
                开
              </el-button>
              <el-button size="mini" :type="item.value === 0 ? 'primary' : ''" @click="changeStatus(item, 0)">
                关
              </el-button>
            </span>
            <span class="value-line" v-else-if="item.indexType === 4">
              <el-button size="mini" :type="item.value === 2 ? 'primary' : ''" @click="changeStatus(item, 2)">
                自动
              </el-button>
              <el-button size="mini" :type="item.value === 1 ? 'primary' : ''" @click="changeStatus(item, 1)">
                开
              </el-button>
              <el-button size="mini" :type="item.value === 0 ? 'primary' : ''" @click="changeStatus(item, 0)">
                关
              </el-button>
            </span>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { getSensorDetail, updateValue } from "@/api"
import { encrypt2RSA } from "@/utils/encrypt"
import { deepClone } from "@/utils/utils.js"
export default {
  name: "sensorDetailDialog",
  props: {
    sensorId: {
      type: String,
      default() {
        return ""
      },
    },
    dynamicUrl: {
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
        sensorName: "传感器名称",
        list: [],
      },
      detailDatasResource: {
        sensorName: "传感器名称",
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
    valueNotChange(item, value) {
      const { list } = this.detailDatasResource
      for (let i = 0; i < list.length; i++) {
        if (list[i].index === item.index && value === list[i].value) {
          return true
        }
      }
      return false
    },
    updateResourceValue(index, value) {
      const { list } = this.detailDatasResource
      for (let i = 0; i < list.length; i++) {
        if (list[i].index === index && value === list[i].value) {
          this.detailDatasResource.list[i].value = value
        }
      }
    },
    changeStatus(item, value) {
      if (this.valueNotChange(item, value)) return
      const currentSecretKey = process.env.VUE_APP_SECRET
      // 当前时间YYYY!MM!dd HH&mm + 公钥
      const secretPublucKey = this.publicKeyGenertion()
      const secretKey = encrypt2RSA(secretPublucKey, currentSecretKey)
      const params = {
        index: item.index,
        value,
        sensorId: this.sensorId,
      }
      updateValue(secretKey, params, this.dynamicUrl).then((res) => {
        if (res.code === 0) {
          this.$message.success("点位更新成功！")
          item.value = value
          this.updateResourceValue(item.index, value)
        } else {
          this.$message.warning("点位更新失败：" + res.msg)
        }
      })
    },
    // 通过ID获取传感器详情
    initSensorDetail(sensorId) {
      this.loadingFlag = true
      console.log("获取到传感器ID为：", sensorId)
      const currentSecretKey = process.env.VUE_APP_SECRET
      // 当前时间YYYY!MM!dd HH&mm + 公钥
      const secretPublucKey = this.publicKeyGenertion()
      const secretKey = encrypt2RSA(secretPublucKey, currentSecretKey)
      console.log("secretKey2", secretKey)
      getSensorDetail(
        {
          secretKey,
          sensorId,
        },
        this.dynamicUrl
      )
        .then((res) => {
          this.detailDatas = res.data
          this.detailDatasResource = deepClone(res.data)
        })
        .finally(() => {
          this.loadingFlag = false
        })
    },
    publicKeyGenertion() {
      const current = new Date()
      const currentMonth = current.getMonth() + 1 < 10 ? `0${current.getMonth() + 1}` : current.getMonth() + 1
      const currentDate = current.getDate() < 10 ? `0${current.getDate()}` : current.getDate()
      const currentHours = current.getHours() < 10 ? `0${current.getHours()}` : current.getHours()
      const currentMinutes = current.getMinutes() < 10 ? `0${current.getMinutes()}` : current.getMinutes()
      return `${current.getFullYear()}!${currentMonth}!${currentDate} ${currentHours}&${currentMinutes}`
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
    .single-prop {
      height: 30px;
      line-height: 30px;
      margin-bottom: 10px;
      .label-line {
        display: inline-block;
        width: 100px;
        text-align: right;
      }
    }
  }
}
</style>