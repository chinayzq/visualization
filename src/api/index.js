import request from "@/utils/request"
import { envInfo } from "@/config/envInfo"
/**
 * 查询标签列表
 */
export function getTagList(params) {
  return request({
    url: envInfo.bgApp.tagPath + "/tag/page",
    method: "get",
    params,
  })
}

export function getOrderList(params) {
  return request({
    url: "/saascloud/saas/order/tenant/orderFill/conditionalQuery",
    method: "get",
    params,
  })
}

export function getOrderDetailById(params) {
  return request({
    url: "/saascloud/saas/order/tenant/orderFill/getDetails",
    method: "get",
    params,
  })
}

/**
 * 根据公司id加载项目
 * @param params
 */
export function getProjectList(params) {
  return request({
    url: envInfo.bgApp.basePath + `/tenant/project/list`,
    method: "get",
    params,
  })
}

/**
 * 根据项目查询模板
 * @param params
 */
export function getTemplateList(params) {
  return request({
    url: envInfo.bgApp.orderPath + `/tenant/orderConfig/getConfigList`,
    method: "get",
    params,
  })
}

/**
 * 获取所在位置
 *
 */
export function getPosition(pid = "") {
  let reqUrl = envInfo.bgApp.basePath + "/tenant/position/tree"
  if (pid) reqUrl = reqUrl + "?projectId=" + pid
  return request({
    url: reqUrl,
    method: "get",
  })
}

/**
 * 根据公司id加载责任部门
 * @param params
 */
export function getResDeptName(params) {
  return request({
    url: envInfo.bgApp.organizationPath + `/tenant/dept/list`,
    method: "get",
    params,
  })
}

/**
 * 根据公司id加载责任部门
 * @param params
 */
export function getDeviceList(params) {
  return request({
    url: envInfo.bgApp.organizationPath + `/tenant/device/page`,
    method: "get",
    params,
  })
}

/**
 * 根据模板id或者责任部门
 * @param params
 */
export function getDefDeptByProjectId(params) {
  return request({
    url: envInfo.bgApp.orderPath + `/tenant/orderFill/getDefDeptByProjectId`,
    method: "get",
    params,
  })
}

/**
 * 在线报单
 * @param params
 */
export function enterOrder(params) {
  return request({
    url: envInfo.bgApp.orderPath + `/tenant/orderFill/enterOrder`,
    method: "post",
    data: params,
  })
}

/**
 * 根据模板id查询类型列表
 * @param params
 */
export function getConfigDetails(params) {
  return request({
    url: envInfo.bgApp.orderPath + `/tenant/orderConfig/getConfigDetails`,
    method: "get",
    params,
  })
}

/**
 * 获取产品列表
 * @param params
 */
export function findProducts(params) {
  return request({
    url: envInfo.bgApp.monitorPath + `/info/findProducts`,
    method: "get",
    params,
  })
}

/**
 * 获取标签
 * @param params
 */
export function findTags(params) {
  return request({
    url: envInfo.bgApp.monitorPath + `/info/findTags`,
    method: "get",
    params,
  })
}

/**
 * 删除标签
 * @param params
 */
export function deleteTag(id) {
  return request({
    url: envInfo.bgApp.monitorPath + `/info/delete/tag/` + id,
    method: "delete",
  })
}

/**
 * 新增标签
 * @param params
 */
export function createTag(params) {
  return request({
    url: envInfo.bgApp.monitorPath + `/info/createTag`,
    method: "post",
    data: params,
  })
}

/**
 * 产品绑定标签
 * @param params
 */
export function productBindTag(params) {
  return request({
    url: envInfo.bgApp.monitorPath + `/info/productBindTag`,
    method: "post",
    data: params,
  })
}

/**
 * 产品绑定标签
 * @param params
 */
export function deleteProductBindTag(params) {
  return request({
    url: envInfo.bgApp.monitorPath + `/info/delete/productTag`,
    method: "delete",
    data: params,
  })
}

/**
 * 设备分页查询
 * @param params
 */
export function findDevicePage(params) {
  return request({
    url: envInfo.bgApp.thingsPath + "/device/page",
    method: "get",
    params,
  })
}

/**
 * 查询产品tsl
 * @param params
 */
export function findTsl(params) {
  return request({
    url: envInfo.bgApp.thingsPath + "/product/tsl",
    method: "get",
    params,
  })
}

/**
 * 查询设备影子
 * @param params
 */
export function findDeviceShadow(params) {
  return request({
    url: envInfo.bgApp.thingsPath + "/device/shadow",
    method: "get",
    params,
  })
}

/**
 * 查询属性历史数据(分页) - doris
 * @param params
 */
export function findPropertyHistoryPageDoris(params) {
  return request({
    url: envInfo.bgApp.dorisPath + "/rdata/property/page",
    method: "get",
    params,
  })
}

/**
 * 产品绑定标签
 * @param params
 */
export function findMonitors(params) {
  return request({
    url: envInfo.bgApp.monitorPath + `/info/findMonitors`,
    method: "get",
    params,
  })
}

/**
 * 监控绑定标签
 * @param params
 */
export function monitorBindTag(params) {
  return request({
    url: envInfo.bgApp.monitorPath + `/info/monitorBindTag`,
    method: "post",
    data: params,
  })
}

/**
 * 监控删除标签
 * @param params
 */
export function deleteMonitorBindTag(params) {
  return request({
    url: envInfo.bgApp.monitorPath + `/info/delete/monitorTag`,
    method: "delete",
    data: params,
  })
}

/**
 * 获取自定义列表
 * @param params
 */
export function customizationGroupList(params) {
  return request({
    url: envInfo.bgApp.monitorPath + `/info/find/customizationGroupList`,
    method: "get",
    params,
  })
}

/**
 * 创建自定义分组
 * @param params
 */
export function customizationGroup(params) {
  return request({
    url: envInfo.bgApp.monitorPath + `/info/create/customizationGroup`,
    method: "post",
    data: params,
  })
}

/**
 * 删除自定义分组
 * @param params
 */
export function deleteCustomizationGroup(groupId) {
  return request({
    url: envInfo.bgApp.monitorPath + `/info/delete/customizationGroup/${groupId}`,
    method: "delete",
  })
}

/**
 * 自定义分组排序
 * @param params
 */
export function orderCustomizationGroup(params) {
  return request({
    url: envInfo.bgApp.monitorPath + `/info/orderOn/customizationGroup`,
    method: "post",
    data: params,
  })
}

/**
 * 自定义分组排序
 * @param params
 */
export function singleDeleteCustomization(params) {
  return request({
    url: envInfo.bgApp.monitorPath + `/info/delete/bind/customizationGroup`,
    method: "delete",
    data: params,
  })
}

/**
 * 场景库排序
 * @param params
 */
export function orderScenario(params) {
  return request({
    url: envInfo.bgApp.monitorPath + `/info/orderOn/scenario`,
    method: "post",
    data: params,
  })
}

/**
 * 编辑自定义分组
 * @param params
 */
export function updateCustomizationGroup(params) {
  return request({
    url: envInfo.bgApp.monitorPath + `/info/edit/customizationGroup`,
    method: "post",
    data: params,
  })
}

/**
 * 获取场景列表
 * @param params
 */
export function getScenarioList(params) {
  return request({
    url: envInfo.bgApp.monitorPath + `/info/find/scenarioList`,
    method: "get",
    params,
  })
}

/**
 * 获取标签列表及详情
 * @param params
 */
export function getTagDevice(params) {
  return request({
    url: envInfo.bgApp.monitorPath + `/info/find/tagDevice`,
    method: "get",
    params,
  })
}

/**
 * 创建场景库
 * @param params
 */
export function createScenario(params) {
  return request({
    url: envInfo.bgApp.monitorPath + `/info/create/scenario`,
    method: "post",
    data: params,
  })
}

/**
 * 编辑场景库
 * @param params
 */
export function updateScenario(params) {
  return request({
    url: envInfo.bgApp.monitorPath + `/info/edit/scenario`,
    method: "post",
    data: params,
  })
}

/**
 * 删除场景库
 * @param params
 */
export function deleteScenario(id) {
  return request({
    url: envInfo.bgApp.monitorPath + `/info/delete/scenario/${id}`,
    method: "delete",
  })
}

/**
 * 删除场景库綁定關係
 * @param params
 */
export function deleteBindScenario(params) {
  return request({
    url: envInfo.bgApp.monitorPath + `/info/delete/bind/scenario`,
    method: "delete",
    data: params,
  })
}
