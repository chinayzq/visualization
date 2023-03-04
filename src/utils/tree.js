/**
 * 转换权限树数据结构
 * 必须为二级结构, 自动处理归并root节点,最终显示为三级结构 {id: null,label: '平台',children: [{id: null,label: '数据范围',children: [{id: 99,label: '查询'}]}]}
 * @param {array} list
 * @param {function} vue.$t
 */
export function permissionStructTree(list, vue) {
  let resourceMap = new Map() //资源集
  //root根据resourceMap的key进行处理 如: ruge.resource.programService = 平台*数据管理 root处理后自动归并到“平台”，数据管理为资源

  //parent
  //{"code":"programService","desc":"ruge.resource.programService","rescode": null,"permissionKey":null,"operationId":null}
  for (let i = 0; i < list.length; i++) {
    if (!list[i].rescode) {
      resourceMap.set(list[i].code, _toTreeObj(list[i]))
    }
  }

  //children
  //{"code":"create","desc":"ruge.operation.createProgram","rescode":"programService","permissionKey":"Service$programService$create","operationId":3}
  for (let i = 0; i < list.length; i++) {
    let rescode = list[i].rescode
    if (rescode) {
      resourceMap.get(rescode).children.push(_toTreeObj(list[i]))
    }
  }

  let rootMap = new Map()
  let invId = -1
  //root
  for (let value of resourceMap.values()) {
    let label = value.label
    let root = label.split("*")
    let exist_root = rootMap.get(root[0])
    if (root.length == 2) {
      label = root[1]
    }
    if (exist_root) {
      exist_root.children.push({
        id: --invId,
        label: label,
        check: false,
        indeterminate: false,
        children: value.children,
      })
    } else {
      rootMap.set(root[0], {
        id: --invId,
        label: root[0],
        check: false,
        indeterminate: false,
        children: [{ id: --invId, label: label, check: false, indeterminate: false, children: value.children }],
      })
    }
  }

  let permissionTree = new Array()
  let permissionList = [...rootMap.values()]
  _sort(permissionList)
  for (let value of permissionList) {
    permissionTree.push(value)
  }
  return permissionTree

  function _toTreeObj(obj) {
    return { id: obj.operationId, label: vue.$t(obj.desc), check: false, children: [], value: obj.permissionKey } //obj.desc
  }

  function _sort(pmlist) {
    if (pmlist && pmlist.length > 0) {
      pmlist = pmlist.sort((a, b) => a.label.localeCompare(b.label, "zh"))
      for (let pm of pmlist) {
        let pmchild = pm.children
        pmchild && (pmchild = _sort(pmchild))
      }
    }
  }
}

export function listToTree(list, node, parentNode) {
  let tree = []
  let map = {}
  for (let i = 0, l = list.length; i < l; i++) {
    // 以每条数据的id作为obj的key值，数据作为value值存入到一个临时对象里面
    map[list[i][node]] = list[i]
  }
  //console.log('map',map)
  for (let i = 0, l = list.length; i < l; i++) {
    let key = map[list[i][parentNode]]
    //console.log('key',key)
    //循环每一条数据的pid，假如这个临时对象有这个key值，就代表这个key对应的数据有children，需要Push进去
    //如果这一项数据属于哪个数据的子级
    if (key) {
      // 如果这个数据没有children
      if (!key["children"]) {
        key["children"] = []
        key["children"].push(list[i])
        // 如果这个数据有children
      } else {
        key["children"].push(list[i])
      }
    } else {
      //如果没有这个Key值，就代表找不到属于哪个数据，那就代表没有父级,直接放在最外层
      tree.push(list[i])
    }
  }
  return tree
}
