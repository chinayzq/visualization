const path = require("path") //引入path模块
const webpack = require("webpack")
const CopyWebpackPlugin = require("copy-webpack-plugin")
function resolve(dir) {
  return path.join(__dirname, dir) //path.join(__dirname)设置绝对路径
}
console.log("VUE_APP_ENV", process.env.VUE_APP_ENV)
module.exports = {
  // source map config
  lintOnSave: false,
  productionSourceMap: process.env.VUE_APP_ENV === "sit",
  //是否使用完整版vuejs
  runtimeCompiler: true,
  // 基本路径,上下文根？
  publicPath: process.env.VUE_APP_PUBLIC_PATH,
  // 输出文件目录o
  outputDir: "dist",
  // 放置生成的静态资源 (js、css、img、fonts) 的 (相对于 outputDir 的) 目录。
  assetsDir: "assets",
  // 指定生成的 index.html 的输出路径 (相对于 outputDir)。也可以是一个绝对路径。
  indexPath: "index.html",
  chainWebpack: (config) => {
    config.resolve.alias
      //set第一个参数：设置的别名，第二个参数：设置的路径
      .set("@", resolve("./src"))
      .set("assets", resolve(".src/assets"))
      .set("@pages", resolve("./src/view/pages"))
      .set("views", resolve("src/views"))
    config.plugin("html").tap((args) => {
      args[0].title = "组态软件平台"
      return args
    })
  },
  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin([
        { from: "node_modules/@liveqing/liveplayer/dist/component/crossdomain.xml" },
        { from: "node_modules/@liveqing/liveplayer/dist/component/liveplayer.swf" },
        { from: "node_modules/@liveqing/liveplayer/dist/component/liveplayer-lib.min.js", to: "js/" },
      ]),
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
        jquery: "jquery",
        "windows.jQuery": "jquery",
      }),
    ],
  },
  devServer: {
    proxy: {
      "/requestUrl": {
        target: "https://config.yineng-iot.com/", //API服务器的地址
        changeOrigin: true, // 是否跨域，虚拟的站点需要更管origin
        pathRewrite: {
          // '^/api'是一个正则表达式，表示要匹配请求的url中，全部'http://localhost:8081/api' 转接为 http://localhost:8081/
          "^/requestUrl": "",
        },
      },
      "/newApi": {
        target: "https://e.yineng-iot.com/", //API服务器的地址
        changeOrigin: true, // 是否跨域，虚拟的站点需要更管origin
        pathRewrite: {
          // '^/api'是一个正则表达式，表示要匹配请求的url中，全部'http://localhost:8081/api' 转接为 http://localhost:8081/
          "^/newApi": "",
        },
      },
    },
  },
}
