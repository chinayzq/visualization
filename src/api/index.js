import request from "@/utils/request"

/**
 * 登录
 * @param params
 */
export function loginRequest(params) {
  return request({
    url: `/api/sys-user/login?username=${params.username}&password=${params.password}`,
    method: "post",
    data: params,
  })
}

/**
 * 素材库 - 分页查询
 * @param params
 */
export function getMaterialList(params) {
  return request({
    url: `/api/material/queryPage/${params.size}/${params.page}`,
    method: "post",
    data: params,
  })
}

/**
 * 素材库 - 新增
 * @param params
 */
export function addMeterial(params) {
  return request({
    url: `/api/material/save`,
    method: "post",
    data: params,
  })
}

/**
 * 素材库 - 更新
 * @param params
 */
export function modifyMeterial(params) {
  return request({
    url: `/api/material/update`,
    method: "post",
    data: params,
  })
}

/**
 * 素材库 - 获取详情
 * @param params
 */
export function getMaterialDetail({ id }) {
  return request({
    url: `/api/material/getMaterial/${id}`,
    method: "get",
  })
}

/**
 * 素材库 - 删除
 * @param params
 */
export function deleteMaterial(id) {
  return request({
    url: `/api/material/delete/${id}`,
    method: "delete",
  })
}

/**
 * 组态列表 - 分页查询
 * @param params
 */
export function getVisualizationList(params) {
  return request({
    url: `/api/html/queryPage/${params.size}/${params.page}`,
    method: "get",
    params,
  })
}

/**
 * 组态列表 - 删除
 * @param params
 */
export function deleteVisualization(id) {
  return request({
    url: `/api/html/delete/${id}`,
    method: "delete",
  })
}

/**
 * 组态列表 - 新增
 * @param params
 */
export function addVisualization(params) {
  return request({
    url: `/api/html/save`,
    method: "post",
    data: params,
  })
}

/**
 * 组态列表 - 获取详情
 * @param params
 */
export function getVisualizationDetail(id) {
  return request({
    url: `/api/html/getHtml/${id}`,
    method: "get",
  })
}

/**
 * 素材库 - 更新
 * @param params
 */
export function modifyVisualization(params) {
  return request({
    url: `/api/html/update`,
    method: "put",
    data: params,
  })
}
