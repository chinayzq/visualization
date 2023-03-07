<template>
  <div class="LoginBox">
    <div class="loginContent">
      <div class="logo">
        <img src="../../../assets/images/jm-logo.png" />
        <span class="title">组态软件平台</span>
        <!-- <span class="title">空调冷冻站能效管理系统</span> -->
      </div>
      <p class="subtitle">智慧建筑能效领跑者</p>
      <div class="loginConRight">
        <div>
          <p class="names">用户登录</p>
          <el-form ref="ruleForm2" :model="ruleForm2" :rules="rules" class="logonRuleForm">
            <el-form-item prop="username">
              <el-input
                placeholder="请输入内容"
                prefix-icon="el-icon-user"
                v-model="ruleForm2.username"
                @keyup.enter.native="onSubmit('ruleForm2')"
              >
                <!-- <span slot="prefix" class="prefixName">账号</span> -->
              </el-input>
              <!-- <el-input v-model="ruleForm2.username" placeholder="账号" @keyup.enter.native="onSubmit('ruleForm2')"></el-input> -->
            </el-form-item>
            <el-form-item prop="password" class="passwords">
              <el-input
                placeholder="请输入内容"
                prefix-icon="el-icon-lock"
                v-model="ruleForm2.password"
                @keyup.enter.native="onSubmit('ruleForm2')"
                type="password"
              ></el-input>
              <!-- <el-input v-model="ruleForm2.password" placeholder="密码" type="password" @keyup.enter.native="onSubmit('ruleForm2')"></el-input> -->
            </el-form-item>
            <el-form-item class="remembrtPassWord">
              <el-checkbox v-model="rememberFlag">记住密码</el-checkbox>
            </el-form-item>
            <el-form-item class="submits" style="border: 0">
              <el-button @click="onSubmit('ruleForm2')" :plain="true" v-loading="loginLoading">登录</el-button>
            </el-form-item>
          </el-form>
          <p class="areaName">技术支持@金马节能科技(深圳)有限公司</p>
          <p class="areaName areaName1" @click="goLink()">备案号:粤ICP备18079475号</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { loginRequest } from "@/api"
export default {
  data() {
    return {
      loginLoading: false,
      rememberFlag: true,
      ruleForm2: {
        username: "",
        password: "",
        rememberFlag: 0,
      },
      rules: {
        username: [
          {
            required: true,
            message: "请输入用户名",
            trigger: "blur",
          },
        ],
        password: {
          required: true,
          message: "请输入密码",
          trigger: "blur",
        },
      },
      newUrl: "",
      imgUrl: "",
    }
  },
  methods: {
    onSubmit(formName) {
      var vm = this
      vm.ruleForm2.rememberFlag = vm.rememberFlag ? 1 : 0
      // console.log(vm.ruleForm2)
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // this.$http
          //   .post("/api/console/login", vm.ruleForm2)
          //   .then(function (response) {
          //     // console.log(response.code)
          //     if (response.code == 0) {
          //       localStorage.setItem("loginUserBaseInfo", "admin")
          //       vm.$router.push({
          //         path: "temp",
          //       })
          //       //存储是否记住密码
          //       localStorage.setItem("ifRemember", vm.rememberFlag)
          //       localStorage.removeItem("Cid")
          //       localStorage.removeItem("Pid")
          //       // vm.getComPro()
          //     }
          //   })
          //   .catch(function (err) {
          //     console.log(err)
          //   })
          this.loginLoading = true
          loginRequest(this.ruleForm2)
            .then((res) => {
              console.log("xxx", res)
              if (res.code === 200) {
                this.$router.push({
                  path: "/",
                })
              } else {
                this.$message.warning(res.msg)
              }
            })
            .catch(() => {
              this.$message.warning("登录失败！")
            })
            .finally(() => {
              this.loginLoading = false
            })
        } else {
          return false
        }
      })
    },
    goLink() {
      window.open("https://beian.miit.gov.cn/")
    },
  },
  mounted() {
    // console.log(localStorage.getItem('ifRemember'))
    var s = localStorage.getItem("ifRemember")
    if (localStorage.getItem("ifRemember")) {
      this.rememberFlag = true
    } else {
      this.rememberFlag = false
    }
  },
}
</script>
<style lang="less">
.LoginBox {
  background: url("../../../assets/images/bgLogin1.jpg") no-repeat;
  height: 100%;
  width: 100%;
  position: absolute;
  background-size: 100% 100%;
  left: 0;
  top: 0;
  bottom: 0;
  .loginContent {
    width: 900px;
    height: 490px;
    background: linear-gradient(41.07deg, rgba(69, 31, 210, 1) 0%, rgba(50, 91, 238, 1) 100%);
    box-shadow: 0px 5px 40px 0px rgba(0, 0, 0, 0.2);
    border-radius: 16px;
    background: white;
    position: fixed;
    top: 50%;
    left: 50%;
    margin-left: -450px;
    margin-top: -245px;
    /* transform: translate(-50%,-50%); */
    background: url("../../../assets/images/conetentBg.png") no-repeat;
    background-size: 100% 100%;
    .logo {
      box-sizing: border-box;
      padding: 20px 0 6px 68px;
      text-align: left;
      .title {
        font-size: 24px;
        font-family: Source Han Sans CN;
        font-weight: 400;
        color: rgba(51, 51, 51, 1);
        vertical-align: middle;
        margin-left: 17px;
        position: relative;
        top: -2px;
      }
      img {
        width: 139px;
        height: 24px;
        vertical-align: middle;
      }
    }
    p.subtitle {
      text-align: left;
      letter-spacing: 13px;
      padding: 0px 0 0px 98px;
      font-size: 16px;
      font-family: Source Han Sans CN !important;
      font-weight: 400;
      color: rgba(51, 51, 51, 0.9);
    }
    .loginConRight {
      box-sizing: border-box;
      padding: 5px 56px 0px 0px;
      position: relative;
      display: flex;
      justify-content: flex-end;
      p.names {
        font-size: 24px;
        font-family: Source Han Sans CN;
        font-weight: 400;
        color: rgba(51, 51, 51, 1);
        text-align: center;
      }
      .logonRuleForm {
        width: 300px;
        margin-top: 50px;
        .el-form-item__error {
          padding-top: 14px !important;
        }
        .el-form-item {
          margin-bottom: 40px;
        }
        .el-form-item__content {
          line-height: 44px;
        }
        .el-input__inner {
          height: 44px;
          line-height: 44px;
          background: rgba(255, 255, 255, 1);
          border: 1px solid rgba(255, 255, 255, 1) !important;
          border-bottom: 1px solid rgba(102, 102, 102, 0.52) !important;
          border-radius: 0px;
        }
        .el-input--prefix .el-input__inner {
          padding-left: 40px;
        }
        .iconfont {
          color: #111111;
          font-size: 24px;
        }
        .el-input--prefix .el-input__icon {
          color: #111111;
          font-size: 24px;
        }
        .prefixName {
          font-size: 16px;
          font-family: Source Han Sans CN;
          font-weight: 300;
          color: rgba(77, 76, 76, 1);
          padding-left: 18px;
        }
        .remembrtPassWord {
          .el-form-item__content {
            text-align: right;
          }
          .el-checkbox-group {
            text-align: right;
          }
          .el-form-item__content {
            line-height: 19px;
          }
          .is-checked .el-checkbox__inner {
            border: 1px solid #409eff;
          }
          .el-checkbox__inner {
            border-radius: 50%;
          }
          .el-checkbox__label {
            font-size: 14px;
            font-family: Source Han Sans CN;
            font-weight: 500;
            color: rgba(51, 51, 51, 1);
          }
        }
        .passwords {
          margin-bottom: 14px;
        }
        .submits {
          height: 46px;
          background: linear-gradient(98deg, rgba(44, 112, 247, 1), rgba(109, 92, 236, 1));
          border-radius: 34px;
          margin-top: 30px;
          line-height: 46px;
          margin-bottom: 0;
          .el-button {
            background: none;
            border: 0px;
            width: 100%;
            color: rgba(255, 255, 255, 1);
            height: 46px;
            span {
              font-size: 20px;
              font-family: Source Han Sans CN;
              font-weight: 500;
              letter-spacing: 5px;
            }
          }
        }
      }
      .areaName {
        font-size: 14px;
        font-family: Source Han Sans CN;
        font-weight: 400;
        color: rgba(74, 74, 74, 1);
        margin-top: 20px;
        text-align: center;
      }
      .areaName1 {
        margin-top: 4px;
        cursor: pointer;
      }
    }
  }
}
</style>
