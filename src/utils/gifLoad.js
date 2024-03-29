// var CANVAS = document.createElement("canvas")
// var CTX = CANVAS.getContext("2d")
var CANVAS = null
var CTX = null
var FRAME_LIST = [] // 存放每一帧以及对应的延时
var TEMP_CANVAS = document.createElement("canvas") //用来拿 imagedata 的工具人
var TEMP_CANVAS_CTX = null // 工具人的 getContext('2d')
var GIF_INFO = {} // GIF 的一些信息
var STREAM = null
var LAST_DISPOSA_METHOD = null
var CURRENT_FRAME_INDEX = -1 //当前帧的下标
var TRANSPARENCY = null
var DELAY = 0 // 当前帧的时间

class Stream {
  constructor(data) {
    this.data = data
    this.len = data.length
    this.pos = 0
  }

  readByte() {
    if (this.pos >= this.data.length) {
      throw new Error("Attempted to read past end of stream.")
    }
    if (this.data instanceof Uint8Array) return this.data[this.pos++]
    else return this.data.charCodeAt(this.pos++) & 0xff
  }

  readBytes(n) {
    let bytes = []
    for (let i = 0; i < n; i++) {
      bytes.push(this.readByte())
    }
    return bytes
  }

  read(n) {
    let chars = ""
    for (let i = 0; i < n; i++) {
      chars += String.fromCharCode(this.readByte())
    }
    return chars
  }

  readUnsigned() {
    // Little-endian.
    let unsigned = this.readBytes(2)
    return (unsigned[1] << 8) + unsigned[0]
  }
}

// 转流数组
function byteToBitArr(bite) {
  let byteArr = []
  for (let i = 7; i >= 0; i--) {
    byteArr.push(!!(bite & (1 << i)))
  }
  return byteArr
}

// Generic functions
function bitsToNum(ba) {
  return ba.reduce(function (s, n) {
    return s * 2 + n
  }, 0)
}

function lzwDecode(minCodeSize, data) {
  // TODO: Now that the GIF parser is a bit different, maybe this should get an array of bytes instead of a String?
  let pos = 0 // Maybe this streaming thing should be merged with the Stream?
  function readCode(size) {
    let code = 0
    for (let i = 0; i < size; i++) {
      if (data.charCodeAt(pos >> 3) & (1 << (pos & 7))) {
        code |= 1 << i
      }
      pos++
    }
    return code
  }

  let output = [],
    clearCode = 1 << minCodeSize,
    eoiCode = clearCode + 1,
    codeSize = minCodeSize + 1,
    dict = []

  function clear() {
    dict = []
    codeSize = minCodeSize + 1
    for (let i = 0; i < clearCode; i++) {
      dict[i] = [i]
    }
    dict[clearCode] = []
    dict[eoiCode] = null
  }

  let code = null,
    last = null
  while (true) {
    last = code
    code = readCode(codeSize)

    if (code === clearCode) {
      clear()
      continue
    }
    if (code === eoiCode) {
      break
    }
    if (code < dict.length) {
      if (last !== clearCode) {
        dict.push(dict[last].concat(dict[code][0]))
      }
    } else {
      if (code !== dict.length) {
        throw new Error("Invalid LZW code.")
      }
      dict.push(dict[last].concat(dict[last][0]))
    }
    output.push.apply(output, dict[code])

    if (dict.length === 1 << codeSize && codeSize < 12) {
      // If we're at the last code and codeSize is 12, the next code will be a clearCode, and it'll be 12 bits long.
      codeSize++
    }
  }
  return output
}

function readSubBlocks() {
  let size = null,
    data = ""
  do {
    size = STREAM.readByte()
    data += STREAM.read(size)
  } while (size !== 0)
  return data
}

function doImg(img) {
  if (!TEMP_CANVAS_CTX) {
    // 没有就创建
    TEMP_CANVAS_CTX = TEMP_CANVAS.getContext("2d")
  }

  const currIdx = FRAME_LIST.length,
    ct = img.lctFlag ? img.lct : GIF_INFO.gct
  /*
            LAST_DISPOSA_METHOD indicates the way in which the graphic is to
            be treated after being displayed.
            Values :    0 - No disposal specified. The decoder is
                            not required to take any action.
                        1 - Do not dispose. The graphic is to be left
                            in place.
                        2 - Restore to background color. The area used by the
                            graphic must be restored to the background color.
                        3 - Restore to previous. The decoder is required to
                            restore the area overwritten by the graphic with
                            what was there prior to rendering the graphic.
                            Importantly, "previous" means the frame state
                            after the last disposal of method 0, 1, or 2.
            */
  if (currIdx > 0) {
    // 这块不要动
    if (LAST_DISPOSA_METHOD === 3) {
      // Restore to previous
      // If we disposed every TEMP_CANVAS_CTX including first TEMP_CANVAS_CTX up to this point, then we have
      // no composited TEMP_CANVAS_CTX to restore to. In this case, restore to background instead.
      if (CURRENT_FRAME_INDEX !== null && CURRENT_FRAME_INDEX > -1) {
        TEMP_CANVAS_CTX.putImageData(FRAME_LIST[CURRENT_FRAME_INDEX].data, 0, 0)
      } else {
        TEMP_CANVAS_CTX.clearRect(0, 0, TEMP_CANVAS.width, TEMP_CANVAS.height)
      }
    } else {
      CURRENT_FRAME_INDEX = currIdx - 1
    }

    if (LAST_DISPOSA_METHOD === 2) {
      // Restore to background color
      // Browser implementations historically restore to transparent; we do the same.
      // http://www.wizards-toolkit.org/discourse-server/viewtopic.php?f=1&t=21172#p86079
      TEMP_CANVAS_CTX.clearRect(0, 0, TEMP_CANVAS.width, TEMP_CANVAS.height)
    }
  }
  let imgData = TEMP_CANVAS_CTX.getImageData(img.leftPos, img.topPos, img.width, img.height)
  img.pixels.forEach(function (pixel, i) {
    if (pixel !== TRANSPARENCY) {
      imgData.data[i * 4 + 0] = ct[pixel][0]
      imgData.data[i * 4 + 1] = ct[pixel][1]
      imgData.data[i * 4 + 2] = ct[pixel][2]
      imgData.data[i * 4 + 3] = 255 // Opaque.
    }
  })
  TEMP_CANVAS_CTX.putImageData(imgData, img.leftPos, img.topPos)
  // 补充第1帧
  if (currIdx == 0) {
    pushFrame(DELAY)
  }
}

function pushFrame(delay) {
  if (!TEMP_CANVAS_CTX) {
    return
  }
  FRAME_LIST.push({
    delay,
    data: TEMP_CANVAS_CTX.getImageData(0, 0, GIF_INFO.width, GIF_INFO.height),
  })
}

// 解析
function parseExt(block) {
  function parseGCExt(block) {
    STREAM.readByte() // Always 4
    var bits = byteToBitArr(STREAM.readByte())
    block.reserved = bits.splice(0, 3) // Reserved; should be 000.

    block.disposalMethod = bitsToNum(bits.splice(0, 3))

    LAST_DISPOSA_METHOD = block.disposalMethod

    block.userInput = bits.shift()
    block.transparencyGiven = bits.shift()
    block.delayTime = STREAM.readUnsigned()
    DELAY = block.delayTime
    block.transparencyIndex = STREAM.readByte()
    block.terminator = STREAM.readByte()
    pushFrame(block.delayTime)
    TRANSPARENCY = block.transparencyGiven ? block.transparencyIndex : null
  }

  function parseComExt(block) {
    block.comment = readSubBlocks()
  }

  function parsePTExt(block) {
    // No one *ever* uses this. If you use it, deal with parsing it yourself.
    STREAM.readByte() // Always 12 这个必须得这样执行一次
    block.ptHeader = STREAM.readBytes(12)
    block.ptData = readSubBlocks()
  }

  function parseAppExt(block) {
    var parseNetscapeExt = function (block) {
      STREAM.readByte() // Always 3 这个必须得这样执行一次
      block.unknown = STREAM.readByte() // ??? Always 1? What is this?
      block.iterations = STREAM.readUnsigned()
      block.terminator = STREAM.readByte()
    }

    function parseUnknownAppExt(block) {
      block.appData = readSubBlocks()
      // FIXME: This won't work if a handler wants to match on any identifier.
      // handler.app && handler.app[block.identifier] && handler.app[block.identifier](block);
    }

    STREAM.readByte() // Always 11 这个必须得这样执行一次
    block.identifier = STREAM.read(8)
    block.authCode = STREAM.read(3)
    switch (block.identifier) {
      case "NETSCAPE":
        parseNetscapeExt(block)
        break
      default:
        parseUnknownAppExt(block)
        break
    }
  }

  function parseUnknownExt(block) {
    block.data = readSubBlocks()
  }

  block.label = STREAM.readByte()
  switch (block.label) {
    case 0xf9:
      block.extType = "gce"
      parseGCExt(block)
      break
    case 0xfe:
      block.extType = "com"
      parseComExt(block)
      break
    case 0x01:
      block.extType = "pte"
      parsePTExt(block)
      break
    case 0xff:
      block.extType = "app"
      parseAppExt(block)
      break
    default:
      block.extType = "unknown"
      parseUnknownExt(block)
      break
  }
}

function parseImg(img) {
  function deinterlace(pixels, width) {
    // Of course this defeats the purpose of interlacing. And it's *probably*
    // the least efficient way it's ever been implemented. But nevertheless...
    let newPixels = new Array(pixels.length)
    const rows = pixels.length / width

    function cpRow(toRow, fromRow) {
      const fromPixels = pixels.slice(fromRow * width, (fromRow + 1) * width)
      newPixels.splice.apply(newPixels, [toRow * width, width].concat(fromPixels))
    }

    // See appendix E.
    const offsets = [0, 4, 2, 1],
      steps = [8, 8, 4, 2]

    let fromRow = 0
    for (var pass = 0; pass < 4; pass++) {
      for (var toRow = offsets[pass]; toRow < rows; toRow += steps[pass]) {
        cpRow(toRow, fromRow)
        fromRow++
      }
    }

    return newPixels
  }

  img.leftPos = STREAM.readUnsigned()
  img.topPos = STREAM.readUnsigned()
  img.width = STREAM.readUnsigned()
  img.height = STREAM.readUnsigned()

  let bits = byteToBitArr(STREAM.readByte())
  img.lctFlag = bits.shift()
  img.interlaced = bits.shift()
  img.sorted = bits.shift()
  img.reserved = bits.splice(0, 2)
  img.lctSize = bitsToNum(bits.splice(0, 3))

  if (img.lctFlag) {
    img.lct = parseCT(1 << (img.lctSize + 1))
  }

  img.lzwMinCodeSize = STREAM.readByte()

  const lzwData = readSubBlocks()

  img.pixels = lzwDecode(img.lzwMinCodeSize, lzwData)

  if (img.interlaced) {
    // Move
    img.pixels = deinterlace(img.pixels, img.width)
  }
  doImg(img)
}

// LZW (GIF-specific)
function parseCT(entries) {
  // Each entry is 3 bytes, for RGB.
  let ct = []
  for (let i = 0; i < entries; i++) {
    ct.push(STREAM.readBytes(3))
  }
  return ct
}

function parseHeader() {
  GIF_INFO.sig = STREAM.read(3)
  GIF_INFO.ver = STREAM.read(3)
  if (GIF_INFO.sig !== "GIF") throw new Error("Not a GIF file.") // XXX: This should probably be handled more nicely.
  GIF_INFO.width = STREAM.readUnsigned()
  GIF_INFO.height = STREAM.readUnsigned()

  let bits = byteToBitArr(STREAM.readByte())
  GIF_INFO.gctFlag = bits.shift()
  GIF_INFO.colorRes = bitsToNum(bits.splice(0, 3))
  GIF_INFO.sorted = bits.shift()
  GIF_INFO.gctSize = bitsToNum(bits.splice(0, 3))

  GIF_INFO.bgColor = STREAM.readByte()
  GIF_INFO.pixelAspectRatio = STREAM.readByte() // if not 0, aspectRatio = (pixelAspectRatio + 15) / 64
  if (GIF_INFO.gctFlag) {
    GIF_INFO.gct = parseCT(1 << (GIF_INFO.gctSize + 1))
  }
  // 给 TEMP_CANVAS 设置大小
  TEMP_CANVAS.width = GIF_INFO.width
  TEMP_CANVAS.height = GIF_INFO.height
  TEMP_CANVAS.style.width = GIF_INFO.width + "px"
  TEMP_CANVAS.style.height = GIF_INFO.height + "px"
  TEMP_CANVAS.getContext("2d").setTransform(1, 0, 0, 1, 0, 0)
}

function parseBlock() {
  let block = {}
  block.sentinel = STREAM.readByte()
  switch (
    String.fromCharCode(block.sentinel) // For ease of matching
  ) {
    case "!":
      block.type = "ext"
      parseExt(block)
      break
    case ",":
      block.type = "img"
      parseImg(block)
      break
    case ";":
      block.type = "eof"
      // 已经结束啦。结束就跑这
      playGif()
      break
    default:
      throw new Error("Unknown block: 0x" + block.sentinel.toString(16)) // TODO: Pad this with a 0.
  }

  // 递归
  if (block.type !== "eof") {
    setTimeout(parseBlock, 0)
  }
}

// 播放gif
function playGif() {
  let len = FRAME_LIST.length
  let index = 0
  function play() {
    TEMP_CANVAS.getContext("2d").putImageData(FRAME_LIST[index].data, 0, 0)
    CTX.globalCompositeOperation = "copy"
    CTX.drawImage(TEMP_CANVAS, 100, 200)
    index++
    if (index >= len) {
      index = 0
    }
    setTimeout(play, FRAME_LIST[index].delay * 10)
  }
  play()
}

function base64ToUrl(base64, filename = "file") {
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
}

function dataURLtoBlob(dataurl) {
  var arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], {
    type: mime,
  })
}
// 用xhr请求本地文件
export function loadGIFNew(url, CANVAS) {
  debugger
  CANVAS = CANVAS
  CTX = CANVAS.getContext("2d")
  const data = base64ToUrl(url)
  // const data = dataURLtoBlob(url);
  return loadGIF(data, CANVAS)
  // STREAM = new Stream(data);
  // parseHeader()
  // parseBlock()
  // return CANVAS
}
function loadGIF(url, CANVAS) {
  const h = new XMLHttpRequest()
  h.open("GET", url, true)
  // 浏览器兼容处理
  if ("overrideMimeType" in h) {
    h.overrideMimeType("text/plain; charset=x-user-defined")
  }
  // old browsers (XMLHttpRequest-compliant)
  else if ("responseType" in h) {
    h.responseType = "arraybuffer"
  }
  // IE9 (Microsoft.XMLHTTP-compliant)
  else {
    h.setRequestHeader("Accept-Charset", "x-user-defined")
  }

  h.onload = function (e) {
    // console.log("this.response", this.response)
    if (this.status != 200) {
      doLoadError("xhr - response")
    }
    // emulating response field for IE9
    if (!("response" in this)) {
      this.response = new VBArray(this.responseText).toArray().map(String.fromCharCode).join("")
    }
    let data = this.response
    if (data.toString().indexOf("ArrayBuffer") > 0) {
      data = new Uint8Array(data)
    }

    STREAM = new Stream(data)
    parseHeader()
    parseBlock()
    return CANVAS
  }

  h.onerror = function (e) {
    console.log("摆烂 error", e)
  }

  h.send()
}

// 测试
// loadGIF('./example_gifs/bule_dark_2.gif');
// loadGIFNew(
//   'data:image/gif;base64,R0lGODlhjACMAKIFAP///8zM/5mZ/2Zm/2Yz/////wAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/wtYTVAgRGF0YVhNUDw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ1IDc5LjE2MzQ5OSwgMjAxOC8wOC8xMy0xNjo0MDoyMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDoyNTdmNmY2NC1mZjE1LTQ0YjMtODZjMy1hYzEyY2M3NDRjOWUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6Q0FCQzBCQkFDNkM4MTFFREEwMTVGQUIwMDdBNDBERDIiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6Q0FCQzBCQjlDNkM4MTFFREEwMTVGQUIwMDdBNDBERDIiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo1YWNhZTNhMC0wZWUxLTQ2NDItODZiYS0wNzEyZmFhOTVhNzIiIHN0UmVmOmRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo2YTQ5NDdiNy1lMTU3LWRjNGYtODE3YS0yMGQ3NzkxOGIzYzQiLz4gPC9yZGY6RGVzY3Jp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'
// );
