<template>
  <div class="address-dialog-component">
    <div class="form_container">
      <el-form ref="form" label-position="top" :rules="rules" :model="form" label-width="80px">
        <el-row :gutter="48">
          <el-col :span="12">
            <el-form-item label="名称(resource)" prop="name">
              <el-input v-model="form.name"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="地址" prop="name">
              <el-input v-model="form.address"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="48">
          <el-col :span="24">
            <el-form-item label="描述" prop="description">
              <el-input v-model="form.description"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div class="footer_container" style="text-align: right">
      <el-button @click="$emit('close')">取 消</el-button>
      <el-button type="primary" @click="submitHandler">确 定</el-button>
    </div>
  </div>
</template>

<script>
import { deepClone } from "@/utils/utils.js"
export default {
  name: "addressDialogComponent",
  props: {
    editRow: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  data() {
    return {
      form: {
        name: "",
        address: "",
        description: "",
      },
      rules: {
        name: [{ required: true, message: "请填写名称", trigger: "blur" }],
        address: [{ required: true, message: "请填写地址", trigger: "blur" }],
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
    formReset() {
      this.form = {
        name: "",
        address: "",
        description: "",
      }
    },
    submitHandler() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          const curForm = this.buildReqParams(deepClone(this.form))
          if (this.editRow.id) {
            //   编辑
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
  },
}
</script>

<style lang="less" scoped>
.address-dialog-component {
}
</style>