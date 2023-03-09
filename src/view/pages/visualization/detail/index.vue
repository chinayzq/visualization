<template>
  <div class="visualization_detail_comp" v-loading="graphLoading">
    <topBar v-show="!previewFlag" :scale="scale" @graphEvent="graphEvent" />
    <div v-show="previewFlag" class="preview_bar">
      <div>预览</div>
      <div @click="previewFlag = false" class="close_icon">
        <el-tooltip class="item" effect="dark" content="Esc键退出全屏预览" placement="bottom">
          <i class="el-icon-close"></i>
        </el-tooltip>
      </div>
    </div>
    <div class="main_container">
      <div class="menu_container" v-show="!previewFlag">
        <asideMenu @setCurrentDragItem="setCurrentDragItem" />
      </div>
      <div class="stage_container" id="stage_container"></div>
      <div class="props_container" v-show="!previewFlag">
        <detailProps
          :currentActiveShape="currentActiveShape"
          :currentActiveProps="currentActiveProps"
          @setBackground="setBackground"
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
    <el-dialog :visible="saveDialog.saveDialogShow" append-to-body :title="saveDialog.title">
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
  </div>
</template>

<script>
import topBar from "./topBar.vue"
import asideMenu from "./asideMenu.vue"
import detailProps from "./detailProps.vue"
import { konvaMixins } from "@/mixins/konvaMixins.js"
import lodash from "lodash"
// import Konva from "konva"
import { getVisualizationDetail, addVisualization, modifyVisualization } from "@/api"
export default {
  components: {
    topBar,
    asideMenu,
    detailProps,
  },
  mixins: [konvaMixins],
  data() {
    return {
      graphLoading: false,
      currentNode: null,
      textarea: null,
      previewFlag: false,
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
        $("#stage_container")[0].style.width = val ? "100%" : "calc(100vw - 370px)"
      },
      immediate: true,
    },
  },
  mounted() {
    this.initData()
  },
  methods: {
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
    // 渲染单个自定义节点
    displaySingleNode({ attrs, className }) {
      const { icon, x, y, backgroundImage, height, width, rotation, text, nodeType } = attrs
      console.log("rotation", rotation)
      return new Promise((resolve, reject) => {
        try {
          if (className === "Image") {
            // 初始化image对象
            const imageObj = new window.Image()
            imageObj.src = icon
            imageObj.onload = () => {
              const Image = new Konva.Image({
                height,
                width,
                radius: 50,
                image: imageObj,
                icon: icon,
                top: x,
                left: y,
                draggable: true,
                index: 1,
                rotation: rotation || 0,
                backgroundImage,
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
          } else if (nodeType === "textEditor") {
            const TextNode = new Konva.Text({
              text,
              nodeType: "textEditor",
              x,
              y,
              fontSize: 14,
              draggable: true,
              width,
              height,
            })
            this.layer.add(TextNode)
            resolve()
          }
        } catch (err) {
          // 渲染异常处理
          console.log("图形渲染失败！")
          reject()
        }
      })
    },
    // 获取图形数据
    getGraphicalDatas(id) {
      this.graphLoading = true
      getVisualizationDetail(id).then((res) => {
        if (res && res.data) {
          const { basicData, detail } = res.data
          const displayDatas = JSON.parse(JSON.parse(detail))
          this.displayHandler(basicData, displayDatas)
          this.saveDialog.name = res.data.name
          this.saveDialog.description = res.data.description
        } else {
          this.$message.warning("获取场景失败！")
        }
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
    },
    // 设置画布背景图及宽、高
    setBackground({ type, datas }) {
      const targetDom = $(".konvajs-content")[0]
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
          this.previewFlag = true
          break
      }
    },
    // 比例放大
    zoomout() {
      const stepCount = this.scale + this.scaleStep
      // 最大放大到300%
      if (stepCount > 3) return
      $(".konvajs-content").css("transform", "scale(" + stepCount + ")")
      this.scale = stepCount
    },
    // 比例縮小
    zoomin() {
      const stepCount = this.scale - this.scaleStep
      if (stepCount < 0.1) return
      $(".konvajs-content").css("transform", "scale(" + stepCount + ")")
      this.scale = stepCount
    },
    // 设置当前正在编辑的节点
    setCurrentDragItem(item) {
      this.currentDragItem = item
    },
    bindEvent() {
      const Stage = this.stage.container()
      // 初始化drop事件
      this.initDropHandler(Stage)
      // 初始化click&拖拽事件
      this.initClickHandler(this.stage)
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
            this.previewFlag = false
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
        this.tr.setZIndex(e.target.attrs.index)
        this.layer.draw()
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
        if (currentNode.attrs.nodeType !== "textEditor") return
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
        const { icon, nodetype, text, height, width, item } = this.currentDragItem
        const currentItem = JSON.parse(item)
        console.log("this.currentDragItem", currentItem.icon)
        if (nodetype === "textEditor") {
          const textNode = new Konva.Text({
            nodeType: "textEditor",
            fontSize: 14,
            text,
            index: 2,
            rotation: 0,
            draggable: true,
            fill: "#000000",
            shadowColor: "red",
            height: Number(height),
            width: Number(width),
          })
          const box = new Konva.Rect({
            x: textNode.x(),
            y: textNode.y(),
            stroke: "#ff00000",
            index: 1,
            width: textNode.width(),
            height: textNode.height(),
            draggable: true,
          })
          textNode.setZIndex(2)
          box.setZIndex(1)
          textNode.on("dragmove transform", () => {
            box.setAttrs({
              x: textNode.x(),
              y: textNode.y(),
              scaleX: textNode.scaleX(),
              scaleY: textNode.scaleY(),
            })
          })
          this.layer.add(box)
          this.layer.add(textNode)
          box.on("dragmove transform", () => {
            textNode.setAttrs({
              x: box.x(),
              y: box.y(),
              scaleX: box.scaleX(),
              scaleY: box.scaleY(),
            })
          })
          textNode.position(this.stage.getPointerPosition())
          box.position(this.stage.getPointerPosition())
          // this.tr.nodes([textNode])
          this.layer.draw()
        } else if (nodetype === "borderTextEditor") {
          var rect = new Konva.Rect({
            width: 100,
            height: 50,
            fill: "red",
            stroke: "black",
            strokeWidth: 5,
          })
        } else {
          if (currentItem.icon.includes("data:image/gif")) {
            const canvas = document.createElement("canvas")
            const that = this
            canvas.width = 100
            canvas.height = 100
            function onDrawFrame(ctx, frame) {
              // lodash.debounce((e) => {
              ctx.drawImage(frame.buffer, 0, 0, 100, 100)
              that.layer.draw()
              // }, 100)
            }
            // gifler("@/assets/images/gufengji.gif").frames(canvas, onDrawFrame)
            gifler(currentItem.icon).frames(canvas, onDrawFrame)
            const Image = new Konva.Image({
              image: canvas,
              height: 100,
              width: 100,
              radius: 50,
              icon: currentItem.icon,
              draggable: true,
              id: that.GenNonDuplicateID(),
              index: 1,
              rotation: 0,
              backgroundImage: "",
            })
            console.log("xxxxxxxx2")
            that.layer.add(Image)
            Image.position(that.stage.getPointerPosition())
            that.layer.draw()
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
                icon,
                draggable: true,
                id: this.GenNonDuplicateID(),
                index: 1,
                rotation: 0,
                backgroundImage: "",
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
        var containerRect = Stage.container().getBoundingClientRect()
        menuNode.style.top = containerRect.top + Stage.getPointerPosition().y + 4 + this.backgroundTop + "px"
        menuNode.style.left = containerRect.left + Stage.getPointerPosition().x + this.backgroundLeft + 4 + "px"
      })
      // 点击空白处隐藏menu
      window.addEventListener("click", () => {
        // hide menu
        menuNode.style.display = "none"
      })
      // 删除
      document.getElementById("delete-button").addEventListener("click", () => {
        // 销毁节点 清空tr节点
        currentShape.destroy()
        this.tr.nodes([])
        this.layer.draw()
      })
      // 上移一层
      document.getElementById("up-button").addEventListener("click", () => {
        // 获取当前节点的index，和tr一并设置index
        let curObjIndex = ++currentShape.attrs.index
        currentShape.setZIndex(curObjIndex)
        this.tr.setZIndex(curObjIndex)
        this.layer.draw()
      })
      // 下移一层
      document.getElementById("down-button").addEventListener("click", () => {
        // 获取当前节点的index，和tr一并设置index
        let curObjIndex = --currentShape.attrs.index
        currentShape.setZIndex(curObjIndex)
        this.tr.setZIndex(curObjIndex)
        this.layer.draw()
      })
      // 复制节点
      document.getElementById("copy-button").addEventListener("click", () => {
        // 获取当前节点的index，和tr一并设置index
        const { icon, width, height, index, scaleX, scaleY, rotation } = currentShape.attrs
        // 初始化image对象
        const imageObj = new window.Image()
        imageObj.src = icon
        imageObj.onload = () => {
          const Image = new Konva.Image({
            height,
            width,
            radius: 50,
            image: imageObj,
            icon,
            draggable: true,
            id: this.GenNonDuplicateID(),
            index,
            rotation,
            scaleX,
            scaleY,
          })
          this.layer.add(Image)
          Image.position(this.stage.getPointerPosition())
          // this.layer.add(Transformer);
          this.layer.draw()
        }
      })
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
  height: 100%;
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
    height: calc(100% - 50px);
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