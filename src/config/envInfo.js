export const serverHost = "/saascloud"
export const socketHost = "wss://sit.rlinkiot.com"

/**
 * 环境信息
 */
export const envInfo = {
  // 后台服务地址列
  bgApp: {
    ssoPath: `${serverHost}/saas/sso`,
    rviewPath: `${serverHost}/saas/rview`,
    sprayPath: `${socketHost}/saas/spray`,
    rviewDataPath: `${serverHost}/saas/rviewData`,
    archivePath: `${serverHost}/saas/archive`,
    basePath: `${serverHost}/saas/base`,
    orderPath: `${serverHost}/saas/order`,
    organizationPath: `${serverHost}/saas/organization`,
    monitorPath: `${serverHost}/saas/cockpitMonitor`,
    tagPath: `${serverHost}/saas/tag`,
    thingsPath: `${serverHost}/saas/things`,
    dorisPath: `${serverHost}/saas/doris`,
  },
}
