<template>
    <div class="login-wrap" @keyup.enter="loginFn">
        <el-card class="form-wrap" >
            <h1 class="mag-name">{{mag_name}}</h1>
            <p class="login-tip">{{login_tip}}</p>
            <el-input
                class="ipt"
                :placeholder="account.placeholder"
                prefix-icon="el-icon-location-outline"
                type="text"
                maxlength="32"
                v-model="account.value"
                @keydown.enter="loginFn"
                >
            </el-input>
            <el-input
                class="ipt"
                :placeholder="password.placeholder"
                prefix-icon="el-icon-location"
                type="password"
                maxlength="32"
                v-model="password.value">
            </el-input>
            <el-button class="login-btn" plain @click="loginFn">{{login_btn.word}}</el-button>
        </el-card>
        <footer-c class="footer"  style="position:absolute; bottom: 0;"></footer-c>
    </div>
</template>

<style lang="scss" scoped>
.login-wrap {
  position: relative;
  height: 100%;
  min-height: 700px;
  .mag-name {
    font-size: 32px;
    // font-weight: 600;
    text-align: center;
    margin-bottom: 10px;
  }
  .login-tip {
    margin-bottom: 30px;
    text-align: center;
    color: #888;
  }
  .form-wrap {
    width: 360px;
    height: 330px;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 180px;
    margin: 0 auto;
  }
  .ipt {
    margin-bottom: 20px;
  }
  .login-btn {
    width: 100%;
    margin-top: 20px;
  }
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
      mag_name: "WELCOME",
      login_tip: "LOGIN RUOLA MAG FOR CUSTOMER",
      account: {
        placeholder: "Account",
        value: ""
      },
      password: {
        placeholder: "Password",
        value: ""
      },
      login_btn: {
        word: "LOGIN"
      }
    };
  },
  components: {
    "footer-c": Footer
  },
  methods: {
    loginCheck() {
      return (
        Util.checkPassword(this.password.value) &&
        Util.checkEmail(this.account.value)
      );
    },
    loginFn() {
      if (!this.loginCheck()) {
        Util.showTip(this, "warning", "Input error!");
        return true;
      }
      let password = encryptRsa(pwdEncrypt(this.password.value)),
        account = encryptRsa(this.account.value);
      //post
      this.loginPost(password, account);
    },
    loginPost(password, account) {
      this.$http
        .post(
          `${CONST.HOST}/customer/login`,
          {
            password,
            account
          },
          CONST.SESSION_CONFIG_CROS
        )
        .then(res => {
          let { data: { result, service_code, service_msg } } = res;
          result = JSON.parse(decryptRsa(result));
          service_code = decryptRsa(service_code);
          switch (service_code) {
            case CONST.CUSTOMER_LOGIN:
              if(result&&result.length>0) {
                this.loginSuccess(result);
              }else{
                Util.showTip(this, "warning", "ERROR ACCOUNT OR PASSWORD!");
              }
              break;
            default:
              Util.showTip(this, "warning", "UNKNOW ERROR!");
              break;
          }
        })
        .catch(err => {
          Util.showTip(this, "warning", "ERROR ACCOUNT OR PASSWORD!");
        });
    },
    loginSuccess(result) {
      if (result.length > 0) {
        let customer = {};
        customer.key = result[0].key;
        customer.name = result[0].name;
        this.$store.commit("changeCustomer", { customer });
        Util.showTip(this, "success", `WELECOM COME BACK ${customer.name}!`);
        this.$router.push("/customerhome");
      } else {
        Util.showTip(this, "warning", "UNKNOW ERROR!");
      }
    }
  },

};
</script>
