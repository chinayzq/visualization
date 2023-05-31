<template>
  <div class="meterial-list-comp app-container">
    <div class="filter-line">
      <span>
        <el-button type="primary" @click="createMeterial">添加素材</el-button>
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
      <finalTable ref="finalTableRef" :datas="dataset" @tableEventHandler="tableEventHandler">
        <template v-slot:defaultImageSlot="row">
          <img v-if="row.datas.defaultImage" :src="row.datas.defaultImage" alt="" />
          <span v-else>暂无图片</span>
        </template>
      </finalTable>
    </div>

    <el-dialog
      :close-on-click-modal="false"
      :destroy-on-close="true"
      :title="dialogTitle"
      append-to-body
      :visible.sync="meterialDialogShow"
      width="828px"
    >
      <meterialDialogComponent
        v-if="meterialDialogShow"
        :catelogs="catelogs"
        :editRow="editRow"
        @close="meterialDialogShow = false"
        @freshList="getListData"
      ></meterialDialogComponent>
    </el-dialog>
  </div>
</template>

<script>
import finalTable from "@/components/FinalTable"
import meterialDialogComponent from "./meterialDialog.vue"
import { getMaterialList, deleteMaterial } from "@/api"
import { deepClone } from "@/utils/utils.js"
export default {
  name: "meterialList",
  components: {
    finalTable,
    meterialDialogComponent,
  },
  data() {
    return {
      meterialDialogShow: false,
      dialogTitle: "新增素材",
      catelogs: [
        {
          label: "自定义",
          value: "custom",
        },
        {
          label: "按钮素材",
          value: "button",
        },
        // {
        //   label: "基础类型",
        //   value: "basic",
        // },
        // {
        //   label: "物联网",
        //   value: "internetOfThings",
        // },
      ],
      editRow: {},
      tableLoading: false,
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
            label: "素材名称",
            width: "",
          },
          {
            prop: "defaultImage",
            label: "素材图片",
            width: "",
          },
          {
            prop: "catelog",
            label: "素材分类",
            width: "",
          },
          {
            prop: "description",
            label: "描述",
            width: "",
          },
          { prop: "status", label: "启用状态", width: "" },
          {
            prop: "operation",
            label: "操作",
            width: "115",
          },
        ],
        tableData: [],
        // 搜索行配置
        searchLineConfig: {
          name: {
            type: "input",
            label: "素材名称",
            value: "",
            actionType: "goSearch",
            placeholder: "请输入素材名称",
            prefixIcon: "el-icon-search",
          },
          catelog: {
            type: "selector",
            label: "素材分类",
            value: "",
            placeholder: "请选择素材分类",
            actionType: "goSearch",
            optionList: [
              {
                label: "基础类型",
                value: "basic",
              },
              {
                label: "自定义",
                value: "custom",
              },
            ],
          },
          // operation: {
          //   type: "button",
          //   filterCount: "",
          //   actionType: "clickEvent",
          //   eventName: "showMoreFilters",
          //   label: "更多筛选",
          // },
        },
        // 表格内容配置
        detailConfig: {
          defaultImage: {
            type: "slot",
            slotName: "defaultImageSlot",
          },
          catelog: {
            type: "enumerationColumn",
            emuList: {
              basic: "基础类型",
              custom: "自定义",
            },
          },
          status: {
            type: "enumerationColumn",
            emuList: {
              ENABLE: "启用",
              DIASABLE: "禁用",
            },
          },
          createdDate: {
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
          catelog: {
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
        page: 1,
        size: 10,
        catelog: null,
        name: null,
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
  },
  methods: {
    createMeterial() {
      this.editRow = {}
      this.dialogTitle = "新增素材"
      this.meterialDialogShow = true
    },
    updateHandler(row) {
      this.editRow = deepClone(row)
      this.dialogTitle = "编辑素材"
      this.meterialDialogShow = true
    },
    getListData() {
      this.tableLoading = true
      const requestParams = { ...this.listQuery }
      getMaterialList(requestParams)
        .then((res) => {
          if (res && res.code === 200) {
            let resultList = res.data.records || []
            resultList.forEach((item) => {
              item.status = item.status ? "ENABLE" : "DIASABLE"
            })
            this.dataset.pageVO.total = res.data.total
            try {
              resultList.forEach((item) => {
                const detail = JSON.parse(item.detail)
                item.defaultImage = detail.statusList[detail.default]
              })
            } catch (error) {}
            this.dataset.tableData = resultList
          } else {
            this.dataset.pageVO.total = 0
            this.dataset.tableData = []
          }
        })
        .finally(() => {
          this.tableLoading = false
        })
    },
    deleteHandler({ id }) {
      this.$confirm("确定要删除吗?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          deleteMaterial(id).then((res) => {
            if (res.code === 200) {
              this.$message.success("删除记录成功！")
              this.getListData()
            } else {
              this.$message.warning("删除失败！")
            }
          })
        })
        .catch((error) => {
          console.log(`删除失败，原因 => ${error}`)
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
          case "edit":
            this.updateHandler(datas.row)
            break
          case "delete":
            this.deleteHandler(datas.row)
            break
        }
      }
    },
  },
}
</script>

<style lang="less" scoped>
.meterial-list-comp {
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