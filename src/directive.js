import Vue from "vue"

/**
 * 按钮重复点击
 */
Vue.directive("preventReClick", {
  inserted(el, binding) {
    el.addEventListener("click", () => {
      if (!el.disabled) {
        el.disabled = true
        el.style.cursur = "not-allowed"
        setTimeout(() => {
          el.disabled = false
          el.style.cursor = "pointer"
        }, binding.value || 2000)
      }
    })
  },
})
