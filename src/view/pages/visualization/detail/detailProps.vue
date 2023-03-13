<template>
  <div class="props_setting_container">
    <el-tabs v-model="activeName">
      <el-tab-pane label="外观" name="props">
        <el-form label-position="top" label-width="100%" :model="formLabelAlign">
          <div v-show="currentActiveShape">
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="X(px)">
                  <el-input-number
                    v-model="formLabelAlign.x"
                    @input="formItemChange('x', formLabelAlign.x)"
                    controls-position="right"
                    size="small"
                  ></el-input-number>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Y(px)">
                  <el-input-number
                    v-model="formLabelAlign.y"
                    @input="formItemChange('y', formLabelAlign.y)"
                    controls-position="right"
                    size="small"
                  ></el-input-number>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="宽(px)">
                  <el-input-number
                    v-model="formLabelAlign.width"
                    @input="formItemChange('width', formLabelAlign.width)"
                    controls-position="right"
                    size="small"
                  ></el-input-number>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="高(px)">
                  <el-input-number
                    v-model="formLabelAlign.height"
                    @input="formItemChange('height', formLabelAlign.height)"
                    controls-position="right"
                    size="small"
                  ></el-input-number>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="旋转(°)">
                  <el-input-number
                    v-model="formLabelAlign.rotation"
                    controls-position="right"
                    size="small"
                    @input="formItemChange('rotation', formLabelAlign.rotation)"
                  ></el-input-number>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-form-item label="文字内容">
                <el-input
                  type="textarea"
                  v-model="formLabelAlign.text"
                  controls-position="right"
                  size="small"
                  @input="formItemChange('text', formLabelAlign.text)"
                ></el-input>
              </el-form-item>
            </el-row>
          </div>
          <!-- 设置背景图片宽，高 -->
          <div v-show="!currentActiveShape">
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="宽">
                  <el-input-number
                    v-model="formLabelAlign.width"
                    @input="formItemChange('width', formLabelAlign.width)"
                    controls-position="right"
                    size="small"
                  ></el-input-number>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="高">
                  <el-input-number
                    v-model="formLabelAlign.height"
                    @input="formItemChange('height', formLabelAlign.height)"
                    controls-position="right"
                    size="small"
                  ></el-input-number>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="背景图片">
                <div class="background_img_container" v-show="formLabelAlign.backgroundImage">
                  <div class="hover_tips">
                    <i class="el-icon-delete" @click="deleteImage"></i>
                  </div>
                  <img :src="formLabelAlign.backgroundImage" alt="" />
                </div>
                <el-upload action="#" :show-file-list="false" :http-request="imageUploadHandler">
                  <el-button type="primary">上传背景图片</el-button>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="数据" name="second">
        <el-form label-position="top" label-width="100%" :model="dataForm">
          <el-row :gutter="24">
            <el-form-item label="Key(唯一ID)">
              <el-input v-model="dataForm.key" @input="dataItemChange('key', dataForm.key)" size="small"></el-input>
            </el-form-item>
            <el-form-item label="跳转地址">
              <el-input
                v-model="dataForm.targetUrl"
                @input="dataItemChange('targetUrl', dataForm.targetUrl)"
                size="small"
              ></el-input>
            </el-form-item>
          </el-row>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { deepClone } from "@/utils/utils.js"
export default {
  name: "visualizationPropsDetail",
  props: ["currentActiveShape", "currentActiveProps"],
  data() {
    return {
      activeName: "props",
      formLabelAlign: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        rotation: 0,
        backgroundImage: "",
        text: "",
      },
      dataForm: {
        key: "",
        targetUrl: "",
      },
    }
  },
  watch: {
    currentActiveProps: {
      handler(val) {
        this.formLabelAlign = { ...val }
        let { x, y, height, width, rotation } = this.formLabelAlign
        this.formItemChange("x", x)
        this.formItemChange("y", y)
        this.formItemChange("height", height)
        this.formItemChange("width", width)
        this.formItemChange("rotation", rotation)
      },
      deep: true,
    },
  },
  methods: {
    dataItemChange(key, value) {
      this.currentActiveShape.attrs[key] = value
    },
    formItemChange(type, value) {
      if (this.currentActiveShape) {
        // 给节点设置
        switch (type) {
          case "x":
            this.currentActiveShape.x(value)
            break
          case "y":
            this.currentActiveShape.y(value)
            break
          case "height":
            this.currentActiveShape.height(value)
            break
          case "width":
            this.currentActiveShape.width(value)
            break
          case "rotation":
            this.currentActiveShape.rotation(value)
            break
          case "text":
            this.currentActiveShape.text(value)
            break
        }
      } else {
        // 给背景设置
        this.$emit("setBackground", { type, datas: value })
      }
    },
    imageUploadHandler(data) {
      this.getBase64(data.file).then((resBase64) => {
        if (this.currentActiveShape) {
          const imageObj = new window.Image()
          imageObj.src = resBase64
          imageObj.onload = () => {
            console.log("this.currentActiveShape", this.currentActiveShape)
            this.currentActiveShape.fillPatternImage(imageObj)
          }
          this.formLabelAlign.backgroundImage = resBase64
          this.currentActiveShape.attrs.backgroundImage = resBase64
        } else {
          this.$emit("setBackground", {
            type: "image",
            datas: resBase64,
          })
        }
        // 设置图片并设置默认宽高的尺寸
        // _this.formLabelAlign.backgroundImage = resBase64;
        // _this.backgroundWidth = $(".el-main").offsetWidth;
        // _this.backgroundHeight = $(".el-main").offsetHeight;
        // if (_this.currentActiveShape) {
        //   let temp = JSON.parse(JSON.stringify(_this.resultList));
        //   temp.forEach((item) => {
        //     if (item.id === _this.currentActiveShape) {
        //       item.nodeStyle.backgroundImage = resBase64;
        //     }
        //   });
        //   _this.chartData.nodes = JSON.parse(JSON.stringify(temp));
        //   _this.resultList = JSON.parse(JSON.stringify(temp));
        // } else {
        //   _this.basicBackground = resBase64;
        // }
        // _this.$message.success("图片设置成功！");
      })
    },
    getBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        let fileResult = ""
        reader.readAsDataURL(file)
        // 开始转换
        reader.onload = () => {
          fileResult = reader.result
        }
        // 转失败
        reader.onerror = (error) => {
          reject(error)
        }
        // 转结束
        reader.onloadend = () => {
          resolve(fileResult)
        }
      })
    },
    deleteImage() {
      const _this = this
      console.log("this.currentActiveShape", this.currentActiveShape)
      if (this.currentActiveShape) {
        let temp = deepClone(this.resultList)
        temp.forEach((item) => {
          if (item.id === _this.currentActiveShape) {
            item.nodeStyle.backgroundImage = ""
          }
        })
        this.chartData.nodes = deepClone(temp)
        this.resultList = deepClone(temp)
      } else {
        this.basicBackground = ""
      }
      this.formLabelAlign.backgroundImage = ""
    },
  },
}
</script>

<style scoped lang="less">
.props_setting_container {
  padding: 10px;
  width: 300px;
  height: 100%;
  border-x: 1px solid #ccc;
  background: #f8f8f8;
  .background_img_container {
    display: block;
    width: 200px;
    height: 200px;
    margin-bottom: 10px;
    position: relative;
    img {
      width: 200px;
      height: 200px;
    }
    .hover_tips {
      position: absolute;
      left: 0;
      top: 0;
      background: #00000070;
      width: 100%;
      height: 100%;
      display: none;
      justify-content: center;
      align-items: center;
      font-size: 20px;
      i {
        color: #fff;
        cursor: pointer;
      }
    }
    &:hover {
      .hover_tips {
        display: flex;
      }
    }
  }
}
</style>