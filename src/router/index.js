import Vue from "vue"
import Router from "vue-router"

Vue.use(Router)

export default new Router({
  routes: [
    // 组态编辑页面
    {
      path: "/visualization/detail",
      name: "visualizationDetail",
      component: () => import("@pages/visualization/detail"),
      hidden: true,
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@pages/login"),
      hidden: true,
    },
    {
      path: "/",
      redirect: "/material",
      component: () => import("@/view/layout"),
      name: "RootHome",
      hidden: true,
      children: [
        {
          path: "/material",
          name: "material",
          component: () => import("@pages/material"),
          meta: {},
          hidden: true,
        },
        {
          path: "/visualization",
          name: "visualization",
          component: () => import("@pages/visualization"),
          meta: {},
          hidden: true,
        },
      ],
    },
  ],
})
