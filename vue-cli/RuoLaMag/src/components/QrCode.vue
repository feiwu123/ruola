<template>
  <div class="login-wrap" @keyup.enter="getQrCode"> &nbsp;
    <el-card class="form-wrap">
      <h1 class="mag-name">{{mag_name}}</h1>
      <p class="login-tip">{{login_tip}}</p>
      <el-input
        class="ipt"
        placeholder="SKU"
        prefix-icon="el-icon-search"
        type="text"
        maxlength="64"
        v-model="SKU"
      ></el-input>
    </el-card>
    <el-card id="img-wrap" style="width:228px;height:228px;margin: 400px auto 0 auto;">
    </el-card>
    <footer-c class="footer" style="position:absolute; bottom: 0;"></footer-c>
  </div>
</template>

<style lang="scss" scoped>
.login-wrap {
  position: relative;
  min-height: 100%;
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
    height: 200px;
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
      login_tip: "QRCODE WITH SKU",
      SKU: "",
      qrcode:"",
    };
  },
  components: {
    "footer-c": Footer
  },
  methods: {
    getQrCode() {
      if(!this.SKU){
        return;
      }
      this.$http
        .get(`${CONST.HOST}/order/qrcode/${this.SKU}`, {
          responseType: "blob"
        })
        .then(res => {
          console.log(res)
          var reader = new FileReader();
          reader.onloadend = function() {
            this.qrcode = reader.result;
            var img = new Image();
            img.src = this.qrcode;
            img.width = "228";
            document.getElementById("img-wrap").innerHTML = "";
            document.getElementById("img-wrap").appendChild(img);
          };
          reader.readAsDataURL(res.body);
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
};
</script>
