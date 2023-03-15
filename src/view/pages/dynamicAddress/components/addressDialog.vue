<template>
  <div class="address-dialog-component">
    <div class="form_container">
      <el-form ref="form" label-position="top" :rules="rules" :model="form" label-width="80px">
        <el-row :gutter="48">
          <el-col :span="12">
            <el-form-item label="名称(resource)" prop="name">
              <el-input :disabled="editRow.id" v-model="form.name"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="地址" prop="name">
              <el-input v-model="form.url"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- <el-row :gutter="48">
          <el-col :span="24">
            <el-form-item label="描述" prop="description">
              <el-input v-model="form.description"></el-input>
            </el-form-item>
          </el-col>
        </el-row> -->
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
import { addUrl, updateUrl } from "@/api"
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
        url: "",
        // description: "",
      },
      rules: {
        name: [{ required: true, message: "请填写名称", trigger: "blur" }],
        url: [{ required: true, message: "请填写地址", trigger: "blur" }],
      },
    }
  },
  created() {
    if (this.editRow.id) {
      this.form = deepClone(this.editRow)
    } else {
      this.formReset()
    }
  },
  methods: {
    formReset() {
      this.form = {
        name: "",
        url: "",
      }
    },
    submitHandler() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          const curForm = deepClone(this.form)
          if (this.editRow.id) {
            //   编辑
            updateUrl({
              id: this.editRow.id,
              url: this.form.url,
            }).then((res) => {
              this.$message.success("修改成功！")
              this.$emit("close")
              this.$emit("freshList")
            })
          } else {
            //   新增
            addUrl(curForm).then((res) => {
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