<template>
  <div class="login-wrap label-print">
    <el-card class="form-wrap">
      <h1 class="mag-name">{{mag_name}}</h1>
      <p class="login-tip">{{login_tip}}</p>
      <el-input class="ipt" :placeholder="no.placeholder" type="text" v-model="no.value"></el-input>
      <el-button @click="wc">伟成</el-button>
      <el-button @click="bdt">八达通</el-button>
    </el-card>
    <footer-c class="footer" style="position:absolute; bottom: 0;"></footer-c>
    <div class="pdf" v-if="!!label_url">
      <embed type="application/pdf" :src="label_url" width="500" height="800">
    </div>
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
    height: 260px;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 160px;
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
.now-show {
  width: 1000px;
  height: 300px;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 100px;
  margin: 0 auto;
}
</style>

<style lang="scss">
.label-print .el-message-box__title {
  font-size: 30px;
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
      mag_name: "后台管理系统",
      login_tip: "LABEL PRINT",
      no: {
        placeholder: "No",
        value: ""
      },
      label_url: ""
    };
  },
  components: {
    "footer-c": Footer
  },
  methods: {
    wc() {
      let no = this.no.value;
      this.$http
        .post(CONST.HOST + "/order/wc/label", { no }, CONST.SESSION_CONFIG_CROS)
        .then(res => {
          console.log(res);
          let wc_body = res.body;
          let label = wc_body.data[0].lable_file;
          this.label_url = label;
          window.open(label, "wc");
          
        })
        .catch(error => {
          console.log(error)
        });
    },
    bdt() {
      let no = this.no.value;
      let uri = `http://post.8dt.com/apiLabelPrint/freemarkerPrint?&apUserId=8a2aa9e16072465501607794ca41000b&apRefNo=${no}&abOrder=&abOrderType=&=Y&printNumber=6&sellerID=1&pageType=Label_100_100&buyerID=0&printPosition=0&consignor=1&prTime=0&itemTitle=1&bglabel=1&mergePrint=1&refNo=2&sysAccount=1&barcodePrint=0&printType=pdf&fontSize=8`;
      this.label_url = uri;
      window.open(uri, "bdt");
    }
  },
  mounted() {}
};
</script>
