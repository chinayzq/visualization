<template>
  <div class="dynamic-address-component app-container">
    <div class="filter-line">
      <span>
        <el-button type="primary" @click="createAddress">添加地址</el-button>
      </span>
    </div>

    <div>
      <finalTable ref="finalTableRef" :datas="dataset" @tableEventHandler="tableEventHandler" />
    </div>

    <el-dialog
      :close-on-click-modal="false"
      :destroy-on-close="true"
      :title="dialogTitle"
      append-to-body
      :visible.sync="dialogShow"
      width="828px"
    >
      <AddressDialog
        v-if="dialogShow"
        :editRow="editRow"
        @close="dialogShow = false"
        @freshList="getListData"
      ></AddressDialog>
    </el-dialog>
  </div>
</template>


<script>
import finalTable from "@/components/FinalTable"
import AddressDialog from "./components/addressDialog.vue"
import { getUrlList, deleteUrl } from "@/api"
import { deepClone } from "@/utils/utils.js"
export default {
  name: "dynamicAddressComponent",
  components: {
    finalTable,
    AddressDialog,
  },
  data() {
    return {
      dialogTitle: "新增地址",
      dialogShow: false,
      editRow: {},
      listQuery: {
        page: 1,
        size: 10,
      },
      tableLoading: false,
      dataset: {
        paginationConfig: {
          need: true,
        },
        filterLine: {
          show: false,
        },
        selection: {
          need: false,
        },
        header: [
          {
            prop: "name",
            label: "名称(resource)",
            width: "",
          },
          {
            prop: "url",
            label: "地址",
            width: "",
          },
          // {
          //   prop: "description",
          //   label: "描述",
          //   width: "",
          // },
          {
            prop: "operation",
            label: "操作",
            width: "115",
          },
        ],
        tableData: [],
        // 搜索行配置
        searchLineConfig: {},
        // 表格内容配置
        detailConfig: {
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
        advanceFilterConfig: {},
        pageVO: {
          current: 1,
          rowCount: 10,
          total: 0,
        },
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
    getListData() {
      this.tableLoading = true
      const requestParams = { ...this.listQuery }
      getUrlList(requestParams)
        .then((res) => {
          if (res && res.code === 200) {
            this.dataset.pageVO.total = res.data.total
            this.dataset.tableData = res.data.records || []
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
    createAddress() {
      this.dialogTitle = "新增地址"
      this.dialogShow = true
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
    deleteHandler(row) {
      this.$confirm("确定要删除吗？", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          deleteUrl(row.id).then((res) => {
            this.$message.success("删除记录成功！")
            this.getListData()
          })
        })
        .catch((error) => {
          console.log(`删除失败，原因 => ${error}`)
        })
    },
    updateHandler(row) {
      this.editRow = deepClone(row)
      this.dialogTitle = "编辑地址"
      this.dialogShow = true
    },
  },
}
</script>

<style lang="less" scoped>
.dynamic-address-component {
}
</style>