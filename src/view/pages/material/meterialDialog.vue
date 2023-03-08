<template>
  <div class="meterial-dialog-component">
    <div class="form_container">
      <el-form ref="form" label-position="top" :rules="rules" :model="form" label-width="80px">
        <el-row :gutter="48">
          <el-col :span="12">
            <el-form-item label="素材名称" prop="name">
              <el-input v-model="form.name"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="素材类型" prop="catelog">
              <el-select v-model="form.catelog" placeholder="请选择类型" style="width: 100%">
                <el-option
                  v-for="item in catelogs"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="48">
          <el-col :span="12">
            <el-form-item label="状态列表" prop="statusList">
              <div class="status-line" v-for="(item, index) in statusList" :key="index">
                <div class="img-line">
                  <img :src="item.imageUrl" alt="" />
                  <span class="icon-container" v-show="!item.edit">
                    <span>{{ item.name }}</span>
                    <i class="el-icon el-icon-edit" @click="goEditHandler(index)"></i>
                    <i class="el-icon el-icon-delete" @click="deleteHandler(index)"></i>
                  </span>
                </div>
                <div v-show="item.edit" class="edit-line">
                  <el-input
                    :ref="'nameInput_' + index"
                    class="name-input"
                    placeholder="状态名称"
                    v-model="item.nameBak"
                    @keyup.enter.native="lineSubmit(index)"
                  ></el-input>
                  <el-tooltip
                    :disabled="item.nameBak !== ''"
                    class="item"
                    effect="dark"
                    content="请输入状态名称"
                    placement="top-start"
                  >
                    <el-button size="mini" icon="el-icon-check" @click="lineSubmit(index)"></el-button>
                  </el-tooltip>
                  <el-tooltip
                    :disabled="item.name !== ''"
                    class="item"
                    effect="dark"
                    content="请保存状态名称"
                    placement="top-start"
                  >
                    <el-button size="mini" icon="el-icon-close" @click="lineCancel(index)"></el-button>
                  </el-tooltip>
                </div>
              </div>
              <el-upload action="#" class="avatar-uploader" :show-file-list="false" :http-request="imageUploadHandler">
                <i class="el-icon-plus avatar-uploader-icon"></i>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="默认状态" prop="defaultStatus">
              <el-select
                v-model="defaultStatus"
                placeholder="请选择默认状态"
                style="width: 100%"
                @change="defaultSelectHandler"
              >
                <el-option
                  v-for="item in defaultStatusList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
              <img
                v-show="defaultStatus"
                style="height: 100px; width: 100px; margin-top: 10px"
                :src="defaultStatusImage"
                alt=""
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="48">
          <el-col :span="12">
            <el-form-item label="描述" prop="description">
              <el-input v-model="form.description"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="启用状态" prop="status">
              <el-switch active-color="#13ce66" inactive-color="#ccc" v-model="form.status"></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div class="footer_container">
      <el-button @click="closeHandler">取 消</el-button>
      <el-button type="primary" @click="submitHandler">确 定</el-button>
    </div>
  </div>
</template>

<script>
import { deepClone } from "@/utils/utils.js"
import { addMeterial, modifyMeterial } from "@/api"
export default {
  name: "meterialDialogComponent",
  props: {
    catelogs: {
      type: Array,
      default: () => {
        return {}
      },
    },
    editRow: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  watch: {
    statusList: {
      handler(list) {
        this.defaultStatusList = []
        if (!list.length) {
          return
        }
        list.forEach((item) => {
          if (item.name) {
            this.defaultStatusList.push({
              label: item.name,
              value: item.name,
            })
          }
        })
      },
      deep: true,
      immediate: true,
    },
  },
  data() {
    var validateImageData = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请上传图片"))
      } else {
        callback()
      }
    }
    return {
      statusList: [],
      defaultStatusList: [],
      defaultStatus: "",
      defaultStatusImage: "",
      form: {
        name: "",
        catelog: "custom",
        detail: "",
        status: true,
        description: "",
      },
      rules: {
        name: [{ required: true, message: "请素材名称", trigger: "blur" }],
        catelog: [{ required: true, message: "请选择素材分类", trigger: "blur" }],
        // imageUrl: [
        //   { required: true, validator: validateImageData, trigger: "blur" },
        // ],
        desc: [{ required: true, message: "请填写活动形式", trigger: "blur" }],
      },
    }
  },
  created() {
    if (this.editRow.id) {
      this.displayDatas()
    } else {
      this.formReset()
    }
  },
  methods: {
    displayDatas() {
      this.form = deepClone(this.editRow)
      const curRow = JSON.parse(this.editRow.detail)
      const statusKeys = Object.keys(curRow.statusList)
      this.statusList = statusKeys.map((item) => {
        return {
          name: item,
          imageUrl: curRow.statusList[item],
        }
      })
      this.defaultStatusList = statusKeys.map((item) => {
        return {
          label: item,
          value: item,
        }
      })
      this.defaultStatus = curRow.default
      this.defaultStatusImage = curRow.statusList[curRow.default]
      this.form.status = this.editRow.status === "ENABLE"
    },
    defaultSelectHandler(val) {
      this.statusList.filter((item) => {
        if (item.name === val) {
          this.defaultStatusImage = item.imageUrl
        }
      })
    },
    goEditHandler(index) {
      this.statusList[index].nameBak = this.statusList[index].name
      this.statusList[index].edit = true
      // 上传图片后，input聚焦
      this.$nextTick(() => {
        this.$refs["nameInput_" + index][0].focus()
      })
    },
    lineSubmit(index) {
      if (this.statusList[index].nameBak) {
        this.statusList[index].name = this.statusList[index].nameBak
        this.statusList[index].edit = false
      }
    },
    lineCancel(index) {
      if (this.statusList[index].name) {
        this.statusList[index].edit = false
      }
    },
    deleteHandler(index) {
      this.statusList.splice(index, 1)
    },
    formReset() {
      this.form = {
        name: "",
        catelog: "custom",
        status: true,
        description: "",
      }
    },
    closeHandler() {
      this.$emit("close")
    },
    submitHandler() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          const curForm = this.buildReqParams(deepClone(this.form))
          if (this.editRow.id) {
            //   编辑
            curForm.lastModifiedBy = ""
            curForm.lastModifiedDate = ""
            curForm.updateByName = ""
            modifyMeterial(curForm).then((res) => {
              this.$message.success("修改成功！")
              this.$emit("close")
              this.$emit("freshList")
            })
          } else {
            //   新增
            addMeterial(curForm).then((res) => {
              if (res.code === 200) {
                this.$message.success("新增成功!")
                this.$emit("close")
                this.$emit("freshList")
              }
            })
          }
        } else {
          return false
        }
      })
    },
    buildReqParams(params) {
      let tempObj = {
        default: this.defaultStatus,
        statusList: {},
      }
      this.statusList.forEach((item) => {
        tempObj.statusList[item.name] = item.imageUrl
      })
      params.detail = JSON.stringify(tempObj)
      return params
    },
    imageUploadHandler(data) {
      this.getBase64(data.file).then((resBase64) => {
        this.statusList.push({
          name: "",
          nameBak: "",
          imageUrl: resBase64,
          edit: true,
        })
        // 上传图片后，input聚焦
        this.$nextTick(() => {
          this.$refs["nameInput_" + (this.statusList.length - 1)][0].focus()
        })
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
  },
}
</script>

<style lang="less" scoped>
.meterial-dialog-component {
  .footer_container {
    text-align: right;
  }
  .status-line {
    .img-line {
      height: 100px;
      margin-bottom: 10px;
      img {
        height: 100px;
        width: 100px;
      }
      .icon-container {
        margin-left: 10px;
        .el-icon {
          cursor: pointer;
          font-size: 20px;
          margin-left: 10px;
        }
        .el-icon-delete {
          color: #ff0000;
        }
        .el-icon-edit {
          margin-left: 32px;
        }
      }
    }
    .edit-line {
      margin-bottom: 10px;
      display: flex;
      .name-input {
        margin-right: 10px;
        width: 100px;
      }
    }
  }
}
</style>
<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}
.avatar {
  width: 100px;
  height: 100px;
  display: block;
}
</style>