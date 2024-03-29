<template>
  <div class="visualization-list-component app-container">
    <div class="filter-line">
      <span>
        <el-button type="primary" @click="createVisualization">添加组态</el-button>
      </span>
      <div
        class="header-filter-button"
        @click="dataset.filterLine.show = !dataset.filterLine.show"
        :class="dataset.filterLine.show ? 'filter-button-open' : 'filter-button-close'"
      >
        <i class="iconfont icon-loudoutu"></i>
        筛选
      </div>
    </div>

    <div>
      <finalTable ref="finalTableRef" :datas="dataset" @tableEventHandler="tableEventHandler"></finalTable>
    </div>

    <el-dialog :visible="dynamic.dialogShow" width="600px" append-to-body :title="dynamic.title" :before-close="
        () => {
          dynamic.dialogShow = false
        }
      ">
      <el-form :model="dynamic.form" ref="dynamicForm" :rules="dynamicRules" label-width="100px">
        <el-form-item label="动态Url" prop="name">
          <el-select style="width: 100%" v-model="dynamic.form.dynamicUrl" placeholder="请选择动态Url" clearable>
            <el-option
              v-for="(item, index) in dynamicList"
              :value="item.name"
              :label="item.name"
              :key="index"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelSave">取 消</el-button>
        <el-button type="primary" @click="submitSave">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import finalTable from "@/components/FinalTable"
import { copy2Clip } from "@/utils/utils.js"
import { getVisualizationList, deleteVisualization, getUrlList, modifyVisualization } from "@/api"
import { deepClone } from "@/utils/utils.js"
export default {
  name: "visualizationList",
  components: {
    finalTable,
  },
  data() {
    return {
      dataset: {
        paginationConfig: {
          need: true,
        },
        filterLine: {
          show: true,
        },
        selection: {
          need: false,
        },
        header: [
          {
            prop: "name",
            label: "名称",
            width: "",
          },
          {
            prop: "description",
            label: "名称",
            width: "",
          },
          {
            prop: "createDate",
            label: "创建时间",
            width: "",
          },
          {
            prop: "dynamicUrl",
            label: "绑定URL",
            width: "",
          },
          { prop: "operation", label: "操作", width: "300" },
        ],
        tableData: [],
        // 搜索行配置
        searchLineConfig: {
          name: {
            type: "input",
            label: "名称",
            value: "",
            actionType: "goSearch",
            placeholder: "请输入名称",
            prefixIcon: "el-icon-search",
          },
        },
        // 表格内容配置
        detailConfig: {
          createDate: {
            type: "dateFormat",
          },
          lastModifiedDate: {
            type: "dateFormat",
          },
          operation: {
            type: "icon",
            iconList: [
              {
                actionType: "iconClick",
                eventName: "bindUrl",
                fontSize: "14px",
                color: "#1A4CEC",
                cursorPointer: "pointer",
                iconName: "el-icon-edit",
                tooltips: "绑定Url",
              },
              {
                actionType: "iconClick",
                eventName: "copy",
                fontSize: "14px",
                color: "#1A4CEC",
                cursorPointer: "pointer",
                iconName: "el-icon-edit",
                tooltips: "拷贝地址",
              },
              {
                actionType: "iconClick",
                eventName: "edit",
                fontSize: "14px",
                color: "#1A4CEC",
                cursorPointer: "pointer",
                iconName: "el-icon-edit",
                tooltips: "编辑",
              },
              {
                actionType: "iconClick",
                eventName: "delete",
                fontSize: "14px",
                color: "#E47470",
                cursorPointer: "pointer",
                iconName: "el-icon-delete",
                tooltips: "删除",
              },
            ],
          },
        },
        // 高级搜索配置
        advanceFilterConfig: {
          name: {
            inline: true,
            value: "",
          },
        },
        pageVO: {
          current: 1,
          rowCount: 10,
          total: 0,
        },
      },
      listQuery: {
        name: null,
        page: 1,
        size: 10,
      },
      tableLoading: false,
      dynamic: {
        dialogShow: false,
        title: "绑定Url",
        editRow: {},
        form: {
          dynamicUrl: "",
        },
      },
      dynamicList: [],
      dynamicRules: {
        dynamicUrl: [
          {
            required: true,
            message: "请选择要绑定的动态Url",
            trigger: "blur",
          },
        ],
      },
    }
  },
  watch: {
    tableLoading(val) {
      this.$refs.finalTableRef.loadingToggle(val)
    },
  },
  created() {
    this.getListData()
    this.getDynamicList()
  },
  mounted() {
    this.bindEvent()
  },
  methods: {
    getDynamicList() {
      getUrlList({
        page: 1,
        size: 100,
      }).then((res) => {
        if (res && res.code === 200) {
          this.dynamicList = res.data.records || []
        } else {
          this.dynamicList = []
        }
      })
    },
    tableEventHandler(datas) {
      if (datas.type === "goSearch") {
        this.listQuery = { ...this.listQuery, ...datas.params }
        this.listQuery.page = 1
        this.getListData()
      } else if (datas.type === "paginationChange") {
        this.listQuery.page = datas.params.current.page
        this.listQuery.size = datas.params.current.limit
        this.getListData()
      } else if (datas.type === "iconClick") {
        switch (datas.eventName) {
          case "bindUrl":
            this.bindUrlHandler(datas.row)
            break
          case "copy":
            this.copyHandler(datas.row)
            break
          case "edit":
            this.updateRule(datas.row)
            break
          case "delete":
            this.deleteRule(datas.row)
            break
        }
      }
    },
    cancelSave() {
      this.dynamic.dialogShow = false
      this.dynamic.form.dynamicUrl = ""
    },
    submitSave() {
      this.$refs["dynamicForm"].validate((valid) => {
        if (valid) {
          const currentBasicDats = JSON.parse(this.dynamic.editRow.basicData)
          currentBasicDats.dynamicUrl = this.dynamic.form.dynamicUrl
          const params = {
            id: this.dynamic.editRow.id,
            detail: this.dynamic.editRow.detail,
            name: this.dynamic.editRow.name,
            description: this.dynamic.editRow.description,
            basicData: JSON.stringify(currentBasicDats),
          }
          modifyVisualization(params).then((res) => {
            this.$message.success("绑定Url成功！")
            this.getListData()
            this.cancelSave()
          })
        }
      })
    },
    bindUrlHandler(datas) {
      console.log(datas)
      const currentBasicDats = JSON.parse(datas.basicData)
      this.dynamic.editRow = deepClone(datas)
      this.dynamic.form.dynamicUrl = currentBasicDats.dynamicUrl
      this.dynamic.dialogShow = true
    },
    copyHandler({ id }) {
      const { origin, pathname } = location
      const targetUrl = `${origin}${pathname}#/visualization/detail?id=${id}&viewMode=detail`
      copy2Clip(targetUrl)
    },
    // 组态保存后，自动刷新列表
    bindEvent() {
      window.addEventListener("storage", (event) => {
        console.log("event", event.key)
        if (!event.key.includes("listPageFresh")) return
        this.getListData()
      })
    },
    deleteRule(row) {
      this.$confirm("确定要删除吗？", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          deleteVisualization(row.id).then((res) => {
            this.$message.success("删除记录成功！")
            this.getListData()
          })
        })
        .catch((error) => {
          console.log(`删除失败，原因 => ${error}`)
        })
    },
    updateRule(row) {
      const { origin, pathname } = window.location
      const url = `${origin}${pathname}#/visualization/detail?id=${row.id}`
      window.open(url, "_blank")
    },
    getListData() {
      this.tableLoading = true
      const requestParams = { ...this.listQuery }
      getVisualizationList(requestParams)
        .then((res) => {
          if (res && res.code === 200) {
            const resultList = res.data.records || []
            this.dataset.pageVO.total = res.data.total
            this.dataset.tableData = resultList
          } else {
            this.dataset.pageVO.total = 0
            this.dataset.tableData = []
          }
          this.tableLoading = false
        })
        .catch(() => {
          this.tableLoading = false
        })
    },
    createVisualization() {
      const { origin, pathname } = window.location
      const url = `${origin}${pathname}#/visualization/detail`
      window.open(url, "_blank")
    },
  },
}
</script>

<style lang="less" scoped>
.visualization-list-component {
  padding: 32px 24px;
  .filter-line {
    margin-bottom: 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    button {
      height: 36px;
    }
    .icon-loudoutu {
      font-size: 12px;
    }
    .header-filter-button {
      cursor: pointer;
      width: 84px;
      height: 36px;
      line-height: 36px;
      text-align: center;
      border-radius: 3px;
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
    }
    .filter-button-open {
      color: #409eff;
      background: #ecf5ff;
      border: 1px solid #c6e2ff;
    }
    .filter-button-close {
      color: #2a4158;
      background: #ffffff;
      border: 1px solid #e7e8eb;
    }
    .not-allowed-button {
      cursor: not-allowed;
      background-color: #fef0f0;
      border-color: #fde2e2;
      color: #f9a7a7;
    }
  }
}
</style>