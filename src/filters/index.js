import moment from "moment"

/**
 * 日期格式化过滤器
 * @param dateStr 所有可以被moment初始化的日期
 * @param pattern 转换格式
 * @returns {string}
 */
export function dateFormat(dateStr, pattern = "YYYY-MM-DD") {
  if (dateStr === undefined || dateStr === null || dateStr === "") {
    return "-"
  }
  return moment(dateStr).format(pattern)
}
