<template>
  <div class="dynamic-address-component app-container">
    <div class="filter-line">
      <span>
        <el-button type="primary" @click="createAddress">添加地址</el-button>
      </span>
      <!-- <div
        class="header-filter-button"
        @click="dataset.filterLine.show = !dataset.filterLine.show"
        :class="dataset.filterLine.show ? 'filter-button-open' : 'filter-button-close'"
      >
        <i class="iconfont icon-loudoutu"></i>
        筛选
      </div> -->
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
            prop: "address",
            label: "地址",
            width: "",
          },
          {
            prop: "description",
            label: "描述",
            width: "",
          },
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
  methods: {
    getListData() {},
    createAddress() {
      this.dialogTitle = "新增地址"
      this.dialogShow = true
    },
    tableEventHandler() {},
  },
}
</script>

<style lang="less" scoped>
.dynamic-address-component {
}
</style>