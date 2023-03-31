<template>
  <div class="visualization_detail_comp">
    <topBar v-show="previewFlag === 'edit'" :recallList="recallList" :scale="scale" @graphEvent="graphEvent" />
    <div v-show="previewFlag === 'view'" class="preview_bar">
      <div>预览</div>
      <div @click="previewFlag = 'edit'" class="close_icon">
        <el-tooltip class="item" effect="dark" content="Esc键退出全屏预览" placement="bottom">
          <i class="el-icon-close"></i>
        </el-tooltip>
      </div>
    </div>
    <div
      class="main_container"
      :style="{
        height: previewFlag === 'edit' ? `calc(100% - 50px)` : '100%',
      }"
    >
      <div class="menu_container" v-show="previewFlag === 'edit'">
        <asideMenu @setCurrentDragItem="setCurrentDragItem" />
      </div>
      <div
        class="stage_container"
        id="stage_container"
        v-loading="graphLoading"
        element-loading-text="场景加载中..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.3)"
      ></div>
      <div class="props_container" v-show="previewFlag === 'edit'">
        <detailProps
          :currentActiveShape="currentActiveShape"
          :currentActiveProps="currentActiveProps"
          @changeSingleNode="changeSingleNode"
          @setBackground="setBackground"
          @upOrDown="upOrDownHandler"
        />
      </div>
    </div>
    <div id="context_container" v-show="contextMenuShow">
      <div>
        <button id="up-button">上移一层</button>
        <button id="down-button">下移一层</button>
        <button id="copy-button">复制</button>
        <button id="delete-button">删除</button>
      </div>
    </div>
    <!-- 保存弹窗 -->
    <el-dialog
      :visible="saveDialog.saveDialogShow"
      append-to-body
      :title="saveDialog.title"
      :before-close="
        () => {
          saveDialog.saveDialogShow = false
        }
      "
    >
      <el-form :model="saveDialog" ref="chartForm" :rules="scenceRules" label-width="100px">
        <el-form-item label="场景名称" prop="name">
          <el-input v-model="saveDialog.name" auto-complete="off" placeholder="请输入场景名称"></el-input>
        </el-form-item>
        <el-form-item label="场景描述">
          <el-input
            type="textarea"
            rows="3"
            v-model="saveDialog.description"
            auto-complete="off"
            placeholder="请输入场景描述"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelSave">取 消</el-button>
        <el-button type="primary" @click="submitSave">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :visible="sensor.dialogShow"
      :before-close="
        () => {
          sensor.dialogShow = false
          sensor.sensorId = ''
        }
      "
      append-to-body
      :title="sensor.title"
    >
      <SensorDetail :sensorId="sensor.sensorId" :dynamicUrl="saveDialog.dynamicUrl" :icon="sensor.icon" />
    </el-dialog>
  </div>
</template>

<script>
import topBar from "./topBar.vue"
import asideMenu from "./asideMenu.vue"
import detailProps from "./detailProps.vue"
import SensorDetail from "./sensorDetail.vue"
import { konvaMixins } from "@/mixins/konvaMixins.js"
import { encrypt2RSA } from "@/utils/encrypt"
import { deepClone } from "@/utils/utils.js"
// import Konva from "konva"
import {
  getVisualizationDetail,
  addVisualization,
  modifyVisualization,
  querySensorIndexList,
  queryDeviceStateList,
} from "@/api"
export default {
  components: {
    topBar,
    asideMenu,
    detailProps,
    SensorDetail,
  },
  mixins: [konvaMixins],
  data() {
    return {
      recallStep: 10,
      recallList: [],
      freshInterval: null,
      intervalInstance: null,
      freshStep: 5 * 1000,
      sensor: {
        dialogShow: false,
        title: "设备详情",
        sensorId: "",
        icon: "",
      },
      allNodeDatas: [],
      graphLoading: false,
      currentNode: null,
      textarea: null,
      previewFlag: "edit",
      saveDialog: {
        saveDialogShow: false,
        title: "场景保存",
        name: "",
        description: "",
        datas: null,
      },
      currentActiveProps: {},
      currentActiveShape: null,
      contextMenuShow: false,
      scale: 1,
      scaleStep: 0.05,
      backgroundTop: 0,
      backgroundLeft: 0,
      stage: null,
      layer: null,
      tr: null,
      // 当前拖放的item
      currentDragItem: {},
      backgroundObj: {
        backgroundImage: null,
        width: 0,
        height: 0,
      },
      scenceRules: {
        name: [
          {
            required: true,
            message: "请输入场景名称！",
            trigger: "blur",
          },
        ],
      },
    }
  },
  watch: {
    // 监听预览状态，动态修改stage_container的宽度
    previewFlag: {
      handler(val) {
        if (!$("#stage_container")[0]) return
        $("#stage_container")[0].style.width = val === "edit" ? "calc(100vw - 370px)" : "100%"
      },
      immediate: true,
    },
  },
  beforeDestroy() {
    this.intervalInstance && window.clearInterval(this.intervalInstance)
    this.freshInterval && window.clearInterval(this.freshInterval)
  },
  mounted() {
    /**
     * viewMode
     * edit: 编辑状态
     * view: 临时预览状态
     * detail: 详情模式
     */
    const { viewMode } = this.$route.query
    this.previewFlag = viewMode || "edit"
    this.initData()
  },
  methods: {
    upOrDownHandler(type, currentShape) {
      const { nodetype, id } = currentShape.attrs
      if (type === "up") {
        if (["valueLabel", "linkButton"].includes(nodetype)) {
          const backgroundNode = this.findNodeById(`${id}_background`)
          backgroundNode && backgroundNode.moveToTop()
        }
        currentShape.moveToTop()
      } else {
        currentShape.moveToBottom()
        if (["valueLabel", "linkButton"].includes(nodetype)) {
          const backgroundNode = this.findNodeById(`${id}_background`)
          backgroundNode && backgroundNode.moveToBottom()
        }
      }
      // let curObjIndex = currentShape.attrs.index
      // const { nodetype, id } = currentShape.attrs
      // if (type === "up") {
      //   curObjIndex += 2
      // } else {
      //   curObjIndex -= 2
      // }
      // if (["valueLabel", "linkButton"].includes(nodetype)) {
      //   const backgroundNode = this.findNodeById(`${id}_background`)
      //   backgroundNode && backgroundNode.zIndex(curObjIndex - 1)
      // }
      // currentShape.zIndex(curObjIndex)
      // this.tr.zIndex(curObjIndex)
      // this.layer.draw()
    },
    findNodeByKey(sensorId) {
      const node = this.stage.findOne((node) => {
        return node.getAttr("sensorId") === sensorId
      })
      return node || ""
    },
    findNodeByPointer(sensorId, sensorPoint, nodetype) {
      const node = this.stage.findOne((node) => {
        return (
          node.getAttr("sensorId") == sensorId &&
          node.getAttr("sensorPoint") == sensorPoint &&
          node.getAttr("nodetype") == nodetype
        )
      })
      return node || ""
    },
    findNodeBySensorId(sensorId, nodetype) {
      const node = this.stage.findOne((node) => {
        return node.getAttr("sensorId") == sensorId && node.getAttr("nodetype") == nodetype
      })
      return node || ""
    },
    findNodeById(id) {
      const node = this.stage.findOne((node) => {
        return node.getAttr("id") == id
      })
      return node || ""
    },
    initData() {
      const { id } = this.$route.query
      if (!id) {
        // 新增 - 直接初始化
        this.initKonvaAndEvent()
        return
      }
      // 编辑则获取数据以后，再初始化
      this.getGraphicalDatas(id)
    },
    // 初始化事件
    initKonvaAndEvent(width, height) {
      this.initKonva(width, height)
      this.bindEvent()
      this.initBackground()
    },
    // 回显场景数据
    displayHandler(basicData, displayDatas) {
      // 处理背景图，尺寸
      const { backgroundImage, backgroundHeight, backgroundWidth } = JSON.parse(basicData) || {}
      // 编辑时需要获取到画布宽、高以后再初始化，不然画布可能显示不完全
      this.initKonvaAndEvent(backgroundWidth, backgroundHeight)
      this.setBackground({ type: "image", datas: backgroundImage })
      this.setBackground({ type: "width", datas: backgroundWidth })
      this.setBackground({ type: "height", datas: backgroundHeight })
      // 回显自定义节点
      // 只有一个图层，所以取children[0]
      const TheLayer = displayDatas.children[0]
      this.allNodeDatas = TheLayer.children
      const ImageNodes = TheLayer.children.filter((item) => item.className === "Image" || item.className === "Text")
      let displayList = []
      ImageNodes.forEach((item) => displayList.push(this.displaySingleNode(item)))
      Promise.all(displayList)
        .then(() => {
          this.layer.draw()
          this.graphLoading = false
        })
        .catch(() => {
          this.$message.warning("场景渲染失败！")
          this.graphLoading = false
        })
    },
    textEditorRender(item, callback, newId) {
      const { height, width, x, y, text, index, id, fontSize, fill } = item || {}
      const currentIndex = Number(index) || 1
      const currentId = newId || id || this.GenNonDuplicateID()
      const textNode = new Konva.Text({
        nodetype: "textEditor",
        text,
        x,
        y,
        id: currentId,
        index: currentIndex,
        rotation: 0,
        draggable: true,
        fill: fill || "#ffffff",
        fontSize: fontSize || 12,
        height: Number(height),
        width: Number(width),
      })
      textNode.on("dragstart", () => {
        this.dragStartHandler(currentId, {
          x: textNode.x(),
          y: textNode.y(),
        })
      })
      this.layer.add(textNode)
      if (!x && !y) {
        textNode.position(this.stage.getPointerPosition())
      }
      this.layer.draw()
      if (callback) {
        callback()
      }
    },
    valueLabelRender(item, callback, newId) {
      const { height, width, nodetype, x, y, sensorId, sensorPoint, value, unit, icon, backgroundIcon, index } =
        item || {}
      const currentId = newId || item.id || this.GenNonDuplicateID()
      const currentIndex = Number(index) || 1
      const textNode = new Konva.Text({
        fontSize: 16,
        text: `${value || ""} ${unit || ""}`,
        unit: unit,
        value: value,
        index: currentIndex,
        sensorId: newId ? "" : sensorId,
        sensorPoint: newId ? "" : sensorPoint,
        x,
        y,
        rotation: 0,
        draggable: true,
        fill: "#ffffff",
        id: currentId,
        height: Number(height),
        width: Number(width),
        verticalAlign: "middle",
        align: "center",
        nodetype,
        backgroundIcon: icon || backgroundIcon,
      })
      const imageObj = new window.Image()
      imageObj.src = icon || backgroundIcon
      imageObj.onload = () => {
        const Image = new Konva.Image({
          height: Number(height),
          width: Number(width),
          radius: 50,
          image: imageObj,
          icon: icon || backgroundIcon,
          x,
          y,
          id: `${currentId}_background`,
          draggable: true,
          index: currentIndex,
          rotation: 0,
          backgroundImage: "",
          nodetype: "backgroundImage",
        })
        textNode.on("dragstart", () => {
          this.dragStartHandler(currentId, {
            x: textNode.x(),
            y: textNode.y(),
          })
        })
        textNode.on("dragmove transform", () => {
          Image.setAttrs({
            x: textNode.x(),
            y: textNode.y(),
            width: textNode.width(),
            height: textNode.height(),
            scaleX: textNode.scaleX(),
            scaleY: textNode.scaleY(),
          })
        })
        Image.on("dragmove transform", () => {
          textNode.setAttrs({
            x: Image.x(),
            y: Image.y(),
            width: Image.width(),
            height: Image.height(),
            scaleX: Image.scaleX(),
            scaleY: Image.scaleY(),
          })
        })
        this.layer.add(Image)
        this.layer.add(textNode)
        if (!x && !y) {
          Image.position(this.stage.getPointerPosition())
          textNode.position(this.stage.getPointerPosition())
        }
        this.layer.draw()
        if (callback) {
          callback()
        }
      }
    },
    linkButtonAndLabelDelete(node) {
      const { id } = node.attrs || {}
      const backgroundNode = this.findNodeById(`${id}_background`)
      backgroundNode.destroy()
      this.layer.draw()
    },
    linkButtonRender(item, callback, newId) {
      const { height, width, nodetype, x, y, text, icon, backgroundIcon, targetUrl, index } = item || {}
      const currentId = newId || item.id || this.GenNonDuplicateID()
      const currentIndex = Number(index) || 1
      const textNode = new Konva.Text({
        fontSize: 16,
        text,
        index: currentIndex + 1,
        x,
        y,
        rotation: 0,
        draggable: true,
        fill: "#ffffff",
        id: currentId,
        height: Number(height),
        width: Number(width),
        verticalAlign: "middle",
        align: "center",
        nodetype,
        backgroundIcon: icon || backgroundIcon,
        targetUrl: newId ? "" : targetUrl,
      })
      const imageObj = new window.Image()
      imageObj.src = icon || backgroundIcon
      imageObj.onload = () => {
        const Image = new Konva.Image({
          height: Number(height),
          width: Number(width),
          radius: 50,
          image: imageObj,
          icon: icon || backgroundIcon,
          x,
          y,
          id: `${currentId}_background`,
          draggable: true,
          index: currentIndex,
          rotation: 0,
          backgroundImage: "",
          nodetype: "backgroundImage",
        })
        textNode.on("dragstart", () => {
          this.dragStartHandler(currentId, {
            x: textNode.x(),
            y: textNode.y(),
          })
        })
        textNode.on("dragmove transform", () => {
          Image.setAttrs({
            x: textNode.x(),
            y: textNode.y(),
            width: textNode.width(),
            height: textNode.height(),
            scaleX: textNode.scaleX(),
            scaleY: textNode.scaleY(),
          })
        })
        Image.on("dragmove transform", () => {
          textNode.setAttrs({
            x: Image.x(),
            y: Image.y(),
            width: Image.width(),
            height: Image.height(),
            scaleX: Image.scaleX(),
            scaleY: Image.scaleY(),
          })
        })
        this.layer.add(Image)
        this.layer.add(textNode)
        // textNode.zIndex(2)
        // Image.zIndex(1)
        if (!x && !y) {
          Image.position(this.stage.getPointerPosition())
          textNode.position(this.stage.getPointerPosition())
        }
        this.layer.draw()
        if (callback) {
          callback()
        }
      }
    },
    base64ToUrl(base64, filename = "file") {
      const arr = base64.split(",")
      const mime = arr[0].match(/:(.*?);/)[1]
      const suffix = mime.split("/")[1]
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      const file = new File([u8arr], `${filename}.${suffix}`, {
        type: mime,
      })
      return URL.createObjectURL(file)
    },
    startGifFresh() {
      if (this.freshInterval) return
      this.freshInterval = window.setInterval(() => {
        this.layer.draw()
      }, 200)
    },
    gifRender(item, callback, newId) {
      const { height, width, icon, x, y, rotation, sensorId, index } = item || {}
      console.log("sensorId", sensorId)
      const currentId = newId || item.id || this.GenNonDuplicateID()
      const currentIndex = Number(index) || 1
      const canvas = document.createElement("canvas")
      const that = this
      canvas.width = width || 100
      canvas.height = height || 100
      // function onDrawFrame(ctx, frame) {
      //   console.log("ctx.canvas.offsetWidth", ctx.canvas.offsetWidth)
      //   ctx.canvas.width = ctx.canvas.offsetWidth
      //   ctx.canvas.height = ctx.canvas.offsetHeight
      //   ctx.drawImage(frame.buffer, 0, 0, 100, 100)
      //   that.layer.draw()
      // }
      // gifler(icon).frames(canvas, onDrawFrame)
      gifler(icon).animate(canvas)
      this.startGifFresh()
      const Image = new Konva.Image({
        nodetype: "businessNode",
        image: canvas,
        height: height || 100,
        width: width || 100,
        radius: 50,
        icon: icon,
        draggable: true,
        id: currentId,
        index: currentIndex,
        rotation,
        sensorId: newId ? "" : sensorId,
        backgroundImage: "",
        x,
        y,
      })
      Image.on("dragstart", () => {
        this.dragStartHandler(currentId, {
          x: Image.x(),
          y: Image.y(),
        })
      })
      this.layer.add(Image)
      if (!x && !y) {
        Image.position(this.stage.getPointerPosition())
      }
      this.layer.draw()
    },
    changeSingleNode(node) {
      const { icon, x, y, backgroundImage, height, width, rotation, text, value, unit, nodetype, targetUrl, sensorId } =
        node.attrs
      switch (nodetype) {
        case "valueLabel":
          node.text(`${value || ""} ${unit || ""}`)
          break
        case "linkButton":
          node.attrs["targetUrl"] = targetUrl
          break
        case "businessNode":
          if (icon && icon.includes("data:image/gif")) {
            node.attrs["sensorId"] = sensorId
            return
          }
          const imageObj = new window.Image()
          imageObj.src = icon
          imageObj.onload = () => {
            node.image(imageObj)
          }
          break
      }
    },
    // 渲染单个自定义节点
    displaySingleNode({ attrs }, newId) {
      const { icon, x, y, backgroundImage, height, width, rotation, text, nodetype, statusList, sensorId, index } =
        attrs
      return new Promise((resolve, reject) => {
        try {
          if (nodetype === "textEditor") {
            this.textEditorRender(attrs, resolve, newId)
          } else if (nodetype === "linkButton") {
            this.linkButtonRender(attrs, resolve, newId)
          } else if (nodetype === "valueLabel") {
            this.valueLabelRender(attrs, resolve, newId)
          } else if (attrs.icon && attrs.icon.includes("data:image/gif")) {
            this.gifRender(attrs, resolve, newId)
          } else {
            // 如果是按钮的背景图Image对象，不需要再次渲染
            if (["backgroundImage"].includes(nodetype)) {
              return
            }
            // 初始化image对象
            const currentId = newId || attrs.id || this.GenNonDuplicateID()
            const imageObj = new window.Image()
            imageObj.src = icon
            imageObj.onload = () => {
              const Image = new Konva.Image({
                nodetype: "businessNode",
                height,
                width,
                radius: 50,
                image: imageObj,
                icon: icon,
                id: currentId,
                top: x,
                left: y,
                draggable: true,
                index: Number(index) || 1,
                rotation: rotation || 0,
                backgroundImage,
                statusList,
                sensorId: newId ? "" : sensorId,
                icon,
              })
              Image.on("dragstart", () => {
                this.dragStartHandler(currentId, {
                  x: Image.x(),
                  y: Image.y(),
                })
              })
              // 设置背景图
              const backImageObj = new window.Image()
              backImageObj.src = backgroundImage
              backImageObj.onload = () => {
                Image.fillPatternImage(backImageObj)
              }
              this.layer.add(Image)
              Image.position({ x, y })
              resolve()
            }
          }
        } catch (err) {
          // 渲染异常处理
          console.log("图形渲染失败！", err)
          reject()
        }
      })
    },
    // 获取图形数据
    getGraphicalDatas(id) {
      this.graphLoading = true
      getVisualizationDetail(id)
        .then((res) => {
          if (res && res.data) {
            const { basicData, detail } = res.data
            const displayDatas = JSON.parse(JSON.parse(detail))
            console.log("displayDatas1", displayDatas)
            console.log("displayDatas2", basicData)
            this.displayHandler(basicData, displayDatas)
            this.saveDialog.name = res.data.name
            this.saveDialog.description = res.data.description
            const currentBaiscDatas = JSON.parse(res.data.basicData)
            this.saveDialog.dynamicUrl = currentBaiscDatas.dynamicUrl
          } else {
            this.$message.warning("获取场景失败！")
          }
        })
        .finally(() => {
          if (this.$route.query.viewMode === "detail") {
            this.dataFreshHandler()
            this.startFreshInterval()
          }
        })
    },
    startFreshInterval() {
      this.intervalInstance = window.setInterval(() => {
        this.dataFreshHandler()
      }, this.freshStep)
    },
    publicKeyGenertion() {
      const current = new Date()
      const currentMonth = current.getMonth() + 1 < 10 ? `0${current.getMonth() + 1}` : current.getMonth() + 1
      const currentDate = current.getDate() < 10 ? `0${current.getDate()}` : current.getDate()
      const currentHours = current.getHours() < 10 ? `0${current.getHours()}` : current.getHours()
      const currentMinutes = current.getMinutes() < 10 ? `0${current.getMinutes()}` : current.getMinutes()
      return `${current.getFullYear()}!${currentMonth}!${currentDate} ${currentHours}&${currentMinutes}`
    },
    dataFreshHandler() {
      // const secretKey = process.env.VUE_APP_SECRET
      // // 公钥：使用之前的
      // // 还有一个入参str 当前时间YYYY!MM!dd HH&mm
      // // const encryptStr = '';
      // // const secretPublucKey = this.publicKeyGenertion()
      // // const secretKey = encrypt2RSA(encryptStr, secretPublucKey)

      const dynamicUrl = this.saveDialog.dynamicUrl
      const currentSecretKey = process.env.VUE_APP_SECRET
      // 当前时间YYYY!MM!dd HH&mm + 公钥
      const secretPublucKey = this.publicKeyGenertion()
      const secretKey = encrypt2RSA(secretPublucKey, currentSecretKey)
      console.log("secretKey1", secretKey)
      // 获取所有valueLabel的节点
      const pointerList = this.allNodeDatas
        .filter((item) => {
          return item.attrs.nodetype === "valueLabel" && item.attrs.sensorId
        })
        .map((item) => {
          return {
            sensorId: item.attrs.sensorId,
            sensorPoint: item.attrs.sensorPoint,
          }
        })
      // 获取所有businessNode的节点
      const sensorList = this.allNodeDatas
        .filter((item) => {
          return item.attrs.nodetype === "businessNode" && item.attrs.sensorId
        })
        .map((item) => {
          return item.attrs.sensorId
        })
      // 获取所有点位信息
      querySensorIndexList(secretKey, pointerList, dynamicUrl).then((res) => {
        this.dealPointerDatas(res.data)
      })
      // 获取所有设备状态信息
      queryDeviceStateList(secretKey, sensorList, dynamicUrl).then((res) => {
        this.dealStatusDatas(res.data)
      })
    },
    // 处理传感器状态数据
    dealStatusDatas(datas) {
      datas.forEach((singleItem) => {
        const { sensorId, tsStateV0 } = singleItem || {}
        const currentNode = this.findNodeBySensorId(sensorId, "businessNode")
        if (!currentNode) return
        const { statusList } = currentNode.attrs
        currentNode.attrs.icon = statusList[tsStateV0.id]
        this.changeSingleNode(currentNode)
      })
    },
    // 处理点位数据推送
    dealPointerDatas(datas) {
      datas.forEach((singleItem) => {
        const { index, sensorId, value, unit } = singleItem || {}
        const currentNode = this.findNodeByPointer(sensorId, index, "valueLabel")
        if (!currentNode) return
        currentNode.attrs.value = String(value)
        currentNode.attrs.unit = unit
        console.log("xxx-currentNode", currentNode)
        this.changeSingleNode(currentNode)
      })
    },
    // 取消保存
    cancelSave() {
      this.saveDialog.saveDialogShow = false
      if (!this.$route.query.id) {
        this.saveDialog.name = ""
        this.saveDialog.description = ""
      }
    },
    // 保存
    submitSave() {
      this.$refs["chartForm"].validate((valid) => {
        if (valid) {
          // 如果id存在-编辑
          const params = this.dealRequestParams()
          if (this.$route.query.id) {
            modifyVisualization(params).then((res) => {
              this.closeAndFresh("update")
            })
          } else {
            addVisualization(params).then((res) => {
              this.closeAndFresh("add")
            })
          }
        }
      })
    },
    // 保存时刷新列表
    closeAndFresh(type) {
      this.saveDialog.saveDialogShow = false
      this.$message.success(type === "add" ? "新增成功！" : "保存成功！")
      // 存储listPageFresh，列表页监听触发列表刷新
      localStorage.setItem("listPageFresh", new Date().getTime())
    },
    // 处理保存请求数据
    dealRequestParams() {
      let params = {
        name: this.saveDialog.name,
        detail: JSON.stringify(this.stage.toJSON()),
        description: this.saveDialog.description,
        createTime: "",
        createBy: "",
        updateTime: "",
        updateBy: "",
      }
      if (this.$route.query.id) {
        params.id = this.$route.query.id
        params.lastModifiedBy = ""
        params.lastModifiedDate = ""
        params.updateByName = ""
        params.dynamicUrl = this.saveDialog.dynamicUrl
      }
      // 存储背景图片信息
      params.basicData = JSON.stringify({
        backgroundImage: this.backgroundObj.backgroundImage,
        backgroundHeight: this.backgroundObj.height,
        backgroundWidth: this.backgroundObj.width,
      })
      return params
    },
    // 获取画布初始化之后的宽高，给backgroundObj赋值
    initBackground() {
      const { width, height } = $(".konvajs-content")[0].style
      this.backgroundObj.width = Number(width.substr(0, width.length - 2))
      this.backgroundObj.height = Number(height.substr(0, height.length - 2))
      this.currentActiveProps = this.backgroundObj
      // 如果是详情模式，则居中画布
      if (this.$route.query.viewMode === "detail") {
        this.backgroundTop = `${(960 - height.substr(0, height.length - 2)) / 2}px`
        this.backgroundLeft = `${(1920 - width.substr(0, width.length - 2)) / 2}px`
        $(".konvajs-content").css("top", this.backgroundTop)
        $(".konvajs-content").css("left", this.backgroundLeft)
      }
    },
    // 设置画布背景图及宽、高
    setBackground({ type, datas }) {
      const targetDom = $(".konvajs-content")[0]
      if (!targetDom) return
      switch (type) {
        case "image":
          targetDom.style.backgroundImage = `url(${datas})`
          this.backgroundObj.backgroundImage = datas
          break
        case "width":
          targetDom.style.width = `${datas}px`
          this.backgroundObj.width = datas
          break
        case "height":
          targetDom.style.height = `${datas}px`
          this.backgroundObj.height = datas
          break
      }
    },
    // topbar操作事件
    graphEvent(type) {
      switch (type) {
        case "clear":
          // 清除画布上所有子节点
          this.layer.destroyChildren()
          this.tr = new Konva.Transformer({
            name: "tr",
          })
          this.layer.add(this.tr)
          this.backgroundTop = 0
          this.backgroundLeft = 0
          this.scale = 1
          $(".konvajs-content").css("top", 0)
          $(".konvajs-content").css("left", 0)
          $(".konvajs-content").css("transform", "scale(1)")
          break
        case "zoomout":
          this.zoomout()
          break
        case "zoomin":
          this.zoomin()
          break
        case "openSaveDialog":
          this.saveDialog.saveDialogShow = true
          break
        case "goPreview":
          this.previewFlag = "view"
          break
        case "recall":
          this.recallHandler()
          break
      }
    },
    // 比例放大
    zoomout() {
      const stepCount = this.scale + this.scaleStep
      // 最大放大到300%
      if (stepCount > 1.2) return
      $(".konvajs-content").css("transform", "scale(" + stepCount + ")")
      this.scale = stepCount
    },
    // 比例縮小
    zoomin() {
      const stepCount = this.scale - this.scaleStep
      if (stepCount < 0.8) return
      $(".konvajs-content").css("transform", "scale(" + stepCount + ")")
      this.scale = stepCount
    },
    // 设置当前正在编辑的节点
    setCurrentDragItem(item) {
      this.currentDragItem = item
    },
    bindEvent() {
      // 初始化click&拖拽事件
      this.initClickHandler(this.stage)

      const { viewMode } = this.$route.query
      // // 如果是详情页面，
      if (viewMode === "detail") {
        this.tr.nodes([])
        this.layer.draw()
        return
      }
      const Stage = this.stage.container()
      // 初始化drop事件
      this.initDropHandler(Stage)
      // 初始化dbclick双击事件
      // this.initDBClickHandler(this.stage)
      // 初始化右键菜单事件
      this.initContextMenu(this.stage)
      // 滚轮滚动事件
      this.initMouseWheel()
      // esc键退出全屏预览
      $(document)
        .off("keydown")
        .on("keydown", (e) => {
          if (e.keyCode == 27) {
            e.preventDefault()
            this.previewFlag = "edit"
          }
          if (e.keyCode == 46) {
            if (!this.currentActiveShape) {
              this.$message.warning("请选中节点后再删除")
              return
            }
            this.nodeDeleteHandler(this.currentActiveShape)
          }
          if (e.ctrlKey && e.keyCode == 67) {
            if (this.currentActiveShape) {
              this.$message.success("已复制节点！")
              this.copyDatas = this.currentActiveShape
            } else {
              console.log("没有激活节点")
            }
          }
          if (e.ctrlKey && e.keyCode == 86) {
            if (this.copyDatas) {
              // const { x, y } = this.stage.getPointerPosition()
              this.copyDatas.attrs.x += 20
              this.copyDatas.attrs.y += 20
              this.displaySingleNode(this.copyDatas, this.GenNonDuplicateID())
            } else {
              console.log("没有复制的节点")
            }
          }
          // 撤销
          if (e.ctrlKey && e.keyCode == 90) {
            this.recallHandler()
          }
        })
      // 改变窗口大小重新初始化画布和事件
      window.onresize = () => {
        // 初始化画布
        const Stage = this.initKonvaStage(
          "stage_container",
          this.backgroundObj.width || $("#stage_container").width(),
          this.backgroundObj.height || $("#stage_container").height()
        )
        this.stage = Stage
        this.layer.add(this.tr)
        this.addLayerToStage(Stage, this.layer)
        this.setBackground({
          type: "image",
          datas: this.backgroundObj.backgroundImage,
        })
        $(".konvajs-content").css("transform", "scale(" + this.scale + ")")
        $(".konvajs-content").css("top", this.backgroundTop)
        $(".konvajs-content").css("left", this.backgroundLeft)
        this.initClickHandler(this.stage)
        this.initContextMenu(this.stage)
        this.initMouseWheel()
        this.initDBClickHandler(this.stage)
      }
    },
    // mousewheel 事件处理
    initMouseWheel() {
      // 滚轮缩放
      $("#stage_container")
        .off("mousewheel DOMMouseScroll")
        .on("mousewheel DOMMouseScroll", (e) => {
          // 阻止滚动条滚动（阻止默认事件）
          e.preventDefault()
          const delta =
            (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) || // chrome & ie
            (e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1)) // firefox
          // delta大于0 -> 放大 ，小于0 -> 缩小
          delta > 0 ? this.zoomout() : this.zoomin()
        })
    },
    // detail模式下businessNode点击事件
    detailClickHandler(node) {
      const { nodetype, targetUrl, sensorId, icon } = node.attrs || {}
      switch (nodetype) {
        case "linkButton":
          window.open(targetUrl, "_blank")
          break
        case "businessNode":
          if (sensorId) {
            this.sensor.sensorId = sensorId
            this.sensor.icon = icon
            this.sensor.dialogShow = true
          }
          break
      }
    },
    // 点击&拖拽事件处理
    initClickHandler(Stage) {
      Stage.on("mousedown", (e) => {
        console.log("当前选择", e.target)
        // 如果点击的是transform的选择点，return，否则会死循环！
        if (e.target.attrs.name && e.target.attrs.name.includes("_anchor")) {
          return
        }
        // 设置当前激活节点
        this.currentActiveShape = e.target
        // 设置当前节点属性
        this.currentActiveProps = e.target.attrs
        // 如果是viewMode = detail,则判断节点并打开弹窗
        if (this.$route.query && this.$route.query.viewMode === "detail") {
          // 取消所有节点的移动事件
          Stage.stopDrag()
          // 处理点击事件
          this.detailClickHandler(this.currentActiveShape)
        } else {
          const ClickBlank = e.target === this.stage
          // 如果点击空白区域
          if (ClickBlank) {
            console.log("点击空白区域")
            this.currentActiveShape = null
            this.currentActiveProps = this.backgroundObj
            // 改变鼠标样式，绑定mousemove事件，拖拽画布
            $(".konvajs-content").css("cursor", "grabbing")
            let startPoint = {
              x: e.evt.pageX,
              y: e.evt.pageY,
            }
            const startPosition = {
              x: this.backgroundTop,
              y: this.backgroundLeft,
            }
            Stage.on("mousemove", (event) => {
              const xDiff = startPosition.x + event.evt.pageY - startPoint.y
              const yDiff = startPosition.y + event.evt.pageX - startPoint.x
              this.backgroundTop = xDiff
              this.backgroundLeft = yDiff
              console.log("xDiff", xDiff)
              $(".konvajs-content").css("top", xDiff)
              $(".konvajs-content").css("left", yDiff)
            })
            this.tr.nodes([])
            this.removeTextarea()
            this.layer.draw()
            return
          }
          // 点击到了具体图形，则激活该元素的transformer
          this.tr.nodes([e.target])
          this.initTransformHandler(e.target)
          // 获取当前节点的index，给tr设置index
          this.tr.zIndex(e.target.attrs.index)
          this.layer.draw()
        }
      })
      // mouseup的时候取消样式和mousemove事件
      Stage.on("mouseup", (e) => {
        $(".konvajs-content").css("cursor", "grab")
        Stage.off("mousemove")
      })
    },
    // 双击事件
    initDBClickHandler(Stage) {
      console.log("init dbclick")
      Stage.on("dblclick", (e) => {
        const currentNode = e.target
        this.currentNode = currentNode
        // 双击的不是文本编辑节点 return
        if (currentNode.attrs.nodetype !== "textEditor") return
        // 隐藏当前节点和transformer
        this.currentNode.hide()
        this.tr.hide()
        // 创建area节点，并设置样式
        const textPosition = currentNode.absolutePosition()
        const stageBox = this.stage.container().getBoundingClientRect()
        const areaPosition = {
          x: stageBox.left + textPosition.x,
          y: stageBox.top + textPosition.y,
        }
        let textarea = document.createElement("textarea")
        this.textarea = textarea
        document.body.appendChild(textarea)
        textarea.className = "editArea"
        textarea.value = currentNode.text()
        textarea.style.position = "absolute"
        textarea.style.top = areaPosition.y + "px"
        textarea.style.left = areaPosition.x + "px"
        textarea.style.width = currentNode.width() - currentNode.padding() * 2 + "px"
        textarea.style.height = currentNode.height() - currentNode.padding() * 2 + 5 + "px"
        textarea.style.fontSize = currentNode.fontSize() + "px"
        textarea.style.border = "none"
        textarea.style.padding = "0px"
        textarea.style.margin = "0px"
        textarea.style.overflow = "hidden"
        textarea.style.background = "none"
        textarea.style.outline = "none"
        textarea.style.resize = "none"
        textarea.style.lineHeight = currentNode.lineHeight()
        textarea.style.fontFamily = currentNode.fontFamily()
        textarea.style.transformOrigin = "left top"
        textarea.style.textAlign = currentNode.align()
        textarea.style.color = currentNode.fill()
        const rotation = currentNode.rotation()
        let transform = ""
        if (rotation) {
          transform += "rotateZ(" + rotation + "deg)"
        }
        var px = 0
        var isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1
        if (isFirefox) {
          px += 2 + Math.round(currentNode.fontSize() / 20)
        }
        transform += "translateY(-" + px + "px)"

        textarea.style.transform = transform
        textarea.style.height = "auto"
        textarea.style.height = textarea.scrollHeight + 3 + "px"
        textarea.focus()
        function setTextareaWidth(newWidth) {
          if (!newWidth) {
            // set width for placeholder
            newWidth = currentNode.placeholder.length * currentNode.fontSize()
          }
          // some extra fixes on different browsers
          var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
          var isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1
          if (isSafari || isFirefox) {
            newWidth = Math.ceil(newWidth)
          }

          var isEdge = document.documentMode || /Edge/.test(navigator.userAgent)
          if (isEdge) {
            newWidth += 1
          }
          textarea.style.width = newWidth + "px"
        }
        textarea.addEventListener("keydown", (e) => {
          let scale = currentNode.getAbsoluteScale().x
          setTextareaWidth(currentNode.width() * scale)
          textarea.style.height = "auto"
          textarea.style.height = textarea.scrollHeight + currentNode.fontSize() + "px"
          // enter保存，shift + enter编辑框内换行
          if (e.keyCode === 13 && !e.shiftKey) {
            currentNode.text(textarea.value)
            this.removeTextarea()
          }
        })
      })
    },
    // 清除编辑area
    removeTextarea() {
      if (!this.currentNode) return
      this.currentNode.text(this.textarea.value)
      console.log("this.currentNode", this.currentNode)
      $(".editArea").remove()
      this.currentNode.show()
      this.tr.show()
      this.layer.draw()
      this.currentNode = null
      this.textarea = null
    },
    // transform 事件 - 解决在变形时只改变scalex和scaley，而width和height不变的问题
    initTransformHandler(shape) {
      shape.on("transform", () => {
        shape.width(Math.max(5, shape.width() * shape.scaleX()))
        shape.height(Math.max(5, shape.height() * shape.scaleY()))
        shape.scaleX(1)
        shape.scaleY(1)
      })
    },
    dragStartHandler(nodeId, dragstart) {
      this.recallListHandler("drag", nodeId, null, dragstart)
    },
    // 撤销执行方法
    recallHandler() {
      const lastItem = this.recallList.pop()
      if (!lastItem) return
      const { type, nodeId, node, dragstart } = lastItem
      switch (type) {
        case "drop":
          const dropNode = this.findNodeById(nodeId)
          dropNode && dropNode.destroy()
          const dropBackgroundNode = this.findNodeById(`${nodeId}_background`)
          dropBackgroundNode && dropBackgroundNode.destroy()
          break
        case "delete":
          this.displaySingleNode(node)
          break
        case "drag":
          const Node = this.findNodeById(nodeId)
          const BackgroundNode = this.findNodeById(`${nodeId}_background`)
          const { x, y } = dragstart
          if (Node) {
            Node.x(x)
            Node.y(y)
          }
          if (BackgroundNode) {
            BackgroundNode.x(x)
            BackgroundNode.y(y)
          }
          break
      }
      this.tr.nodes([])
    },
    // 记录动作
    recallListHandler(type, nodeId, node, dragstart) {
      switch (type) {
        case "drop":
          this.recallList.push({
            type,
            nodeId,
          })
          break
        case "delete":
          this.recallList.push({
            type,
            node,
          })
          break
        case "drag":
          this.recallList.push({
            type,
            nodeId,
            dragstart,
          })
          break
      }
      if (this.recallList.length > this.recallStep) {
        this.recallList.shift()
      }
      console.log("this.recallList", this.recallList)
    },
    // drop 事件处理
    initDropHandler(Stage) {
      Stage.addEventListener("dragover", (e) => {
        // 如果dragover不组织默认事件，那drop事件不会触发！
        e.preventDefault()
      })
      Stage.addEventListener("drop", (e) => {
        e.preventDefault()
        //现在我们需要找到指针的位置
        //我们不能用舞台。getPointerPosition（）在这里，因为该事件未经Konva注册。
        //我们可以手动注册：
        this.stage.setPointersPositions(e)
        // 获取当前拖动图片的icon
        const currentDrogNode = deepClone(this.currentDragItem)
        const { icon, nodetype, text, height, width, item } = currentDrogNode
        currentDrogNode.id = this.GenNonDuplicateID()
        // 记录新增节点操作
        this.recallListHandler("drop", currentDrogNode.id)
        const currentItem = JSON.parse(item)
        if (nodetype === "textEditor") {
          // 纯展示文本框
          this.textEditorRender(currentDrogNode)
        } else if (nodetype === "valueLabel") {
          // 带有边框，能更新数值的文本框
          this.valueLabelRender(currentDrogNode)
        } else if (nodetype === "linkButton") {
          this.linkButtonRender(currentDrogNode)
        } else {
          if (currentItem.icon.includes("data:image/gif")) {
            this.gifRender(currentDrogNode)
          } else {
            // 初始化image对象
            const imageObj = new window.Image()
            imageObj.src = currentItem.icon
            imageObj.onload = () => {
              const Image = new Konva.Image({
                height: 100,
                width: 100,
                radius: 50,
                image: imageObj,
                icon: currentItem.icon,
                draggable: true,
                id: currentDrogNode.id,
                index: 1,
                rotation: 0,
                backgroundImage: "",
                statusList: currentItem.detail.statusList,
                nodetype: "businessNode",
              })
              Image.on("dragstart", () => {
                this.dragStartHandler(currentDrogNode.id, {
                  x: Image.x(),
                  y: Image.y(),
                })
              })
              this.layer.add(Image)
              Image.position(this.stage.getPointerPosition())
              this.layer.draw()
            }
          }
        }
      })
    },
    // contextmenu 事件处理
    initContextMenu(Stage) {
      const menuNode = document.getElementById("context_container")
      let currentShape
      Stage.on("contextmenu", (e) => {
        // 阻止默认事件，否则无法弹出自定义menu
        e.evt.preventDefault()
        // 如果是右击stage则隐藏menu
        if (e.target === Stage) {
          menuNode.style.display = "none"
          return
        }
        currentShape = e.target
        // show menu
        menuNode.style.display = "initial"
        // var containerRect = Stage.container().getBoundingClientRect()
        // menuNode.style.top = containerRect.top + Stage.getPointerPosition().y + this.backgroundTop + "px"
        // menuNode.style.left = containerRect.left + Stage.getPointerPosition().x + this.backgroundLeft + 4 + "px"
        menuNode.style.top = e.evt.clientY + "px"
        menuNode.style.left = e.evt.clientX + "px"
      })
      // 点击空白处隐藏menu
      window.addEventListener("click", () => {
        // hide menu
        menuNode.style.display = "none"
      })
      // 删除
      document.getElementById("delete-button").addEventListener("click", () => {
        // 销毁节点 清空tr节点
        this.nodeDeleteHandler(currentShape)
      })
      // 上移一层
      document.getElementById("up-button").addEventListener("click", () => {
        if (!currentShape) return
        this.upOrDownHandler("up", currentShape)
      })
      // 下移一层
      document.getElementById("down-button").addEventListener("click", () => {
        if (!currentShape) return
        // 获取当前节点的index，和tr一并设置index
        this.upOrDownHandler("down", currentShape)
      })
      // 复制节点
      document.getElementById("copy-button").addEventListener("click", () => {
        // 获取当前节点的index，和tr一并设置index
        const { x, y } = this.stage.getPointerPosition()
        currentShape.attrs.x = x + 20
        currentShape.attrs.y = y + 20
        this.displaySingleNode(currentShape, this.GenNonDuplicateID())
      })
    },
    nodeDeleteHandler(currentShape) {
      const { nodetype } = currentShape.attrs
      console.log("nodetype", nodetype)
      switch (nodetype) {
        case "linkButton":
        case "valueLabel":
          this.linkButtonAndLabelDelete(currentShape)
          break
      }
      // 记录删除操作
      this.recallListHandler("delete", null, currentShape)
      currentShape.destroy()
      this.tr.nodes([])
      this.layer.draw()
    },
    // 初始化Konva
    initKonva(width, height) {
      // 初始化画布
      const Stage = this.initKonvaStage(
        "stage_container",
        width || $("#stage_container").width(),
        height || $("#stage_container").height()
      )
      this.stage = Stage
      // 初始化图层并添加到画布
      const Layer = this.initLayer(1)
      this.layer = Layer
      this.tr = new Konva.Transformer({
        name: "tr",
      })
      Layer.add(this.tr)
      this.addLayerToStage(Stage, Layer)
      // const points = [432, 506, 418, 237];
      // var line = new Konva.Line({
      //   x: 0,
      //   y: 0,
      //   points,
      //   // fillRadialGradientColorStops: ["#ff000", "#ccc"],
      //   fill: "green",
      //   stroke: "#ff0000",
      //   strokeWidth: 4,
      //   tension: 1,
      // });
      // this.layer.add(line);
      // this.layer.draw();
    },
  },
}
</script>

<style lang="less" scoped>
.visualization_detail_comp {
  position: relative;
  height: 100vh;
  overflow: hidden;
  .preview_bar {
    height: 50px;
    line-height: 50px;
    width: 100%;
    background: #fff;
    display: flex;
    justify-content: space-between;
    padding: 0 30px;
    .close_icon {
      cursor: pointer;
    }
  }
  .main_container {
    display: flex;
    .menu_container {
      height: 100%;
      width: 70px;
    }
    .stage_container {
      overflow: auto;
      flex: 1;
      width: 0;
    }
    .props_container {
      background: #f8f8f8;
      border-left: 1px solid #ccc;
      width: 300px;
    }
  }
  #context_container {
    position: absolute;
    width: 100px;
    background-color: white;
    box-shadow: 0 0 5px grey;
    border-radius: 3px;
    button {
      width: 100%;
      background-color: white;
      border: none;
      margin: 0;
      padding: 10px;
    }
    button:hover {
      background-color: lightgray;
    }
  }
}
</style>