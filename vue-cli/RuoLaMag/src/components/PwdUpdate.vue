<template>
  <div class="pwdupdate-wrap" @keyup.enter="updatePwd">
    <el-card class="form-wrap">
      <el-input
        class="ipt"
        placeholder="Old Password"
        prefix-icon="el-icon-date"
        type="password"
        maxlength="18"
        v-model="password.old_value"
        @keydown.enter="loginFn"
      ></el-input>
      <el-input
        class="ipt"
        placeholder="New Password"
        prefix-icon="el-icon-date"
        type="password"
        maxlength="18"
        v-model="password.new_value"
      ></el-input>
      <el-input
        class="ipt"
        placeholder="New Password Confirm"
        prefix-icon="el-icon-date"
        type="password"
        maxlength="18"
        v-model="password.confirm_value"
      ></el-input>
      <el-button
        class="btn"
        plain
        @click="updatePwd"
        v-if="password.old_value&&password.new_value&&password.confirm_value"
      >修改密码</el-button>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.pwdupdate-wrap {
  width: 400px;
}
.ipt {
  margin-bottom: 16px;
}
</style>

<script>
import Util from "../assets/Util";
import CONST from "../assets/CONST";
import Encryption from "../assets/Encryption";
import Footer from "./Footer";
let { encryptRsa, decryptRsa, pwdEncrypt } = Encryption;
export default {
  name: "login",
  data() {
    return {
      password: {
        old_value: "",
        new_value: "",
        confirm_value: ""
      }
    };
  },
  components: {
    "footer-c": Footer
  },
  methods: {
    updatePwd() {
      if (
        CONST.REGFORPASSWORD.test(this.password.old_value) &&
        CONST.REGFORPASSWORD.test(this.password.new_value) &&
        CONST.REGFORPASSWORD.test(this.password.confirm_value) &&
        this.password.new_value === this.password.confirm_value
      ) {
        let key = this.$store.state.user.key;
        let old_value = pwdEncrypt(this.password.old_value);
        let new_value = pwdEncrypt(this.password.new_value);
        Util.cRequest(this, "/users/pwdupdate", { key,old_value,new_value }, data => {
          switch (data.service_code) {
            case CONST.PASSWORD_UPDATE:
              if (!data.result) {
                Util.showTip(this, "warning", "UNKNOW ERROR!");
              } else if (data.result[0].affectedRows == 0) {
                Util.showTip(
                  this,
                  "warning",
                  "原密码输入错误! 或刷新页面后重新尝试！"
                );
              } else if (data.result[0].affectedRows >= 1) {
                Util.showTip(this, "success", "修改成功!");
              }
              break;
            default:
              Util.showTip(this, "warning", "UNKNOW ERROR!");
              break;
          }
        });
      }else{
        Util.showTip(this, "warning", "请输入!");
      }
    }
  }
};
</script>
