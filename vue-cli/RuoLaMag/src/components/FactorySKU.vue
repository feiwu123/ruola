<template>
  <div class="login-wrap label-print" @keyup.enter="newSKU($event)">
    <el-card class="form-wrap">
      <h1 class="mag-name">{{mag_name}}</h1>
      <p class="login-tip">{{login_tip}}</p>
      <el-input
        v-loading="loading"
        class="ipt"
        :placeholder="sku.placeholder"
        type="text"
        v-model="sku.value"
        @blur="$event.target.focus()"
      ></el-input>
      <el-button @click="number = 0">{{number}}（点击计数清零）</el-button>
      <el-button @click="back99To98" v-if="last_code">返回上一次</el-button>
    </el-card>
    <el-card class="info" style="width: auto; position: fixed; bottom:20px;left:20px;font-size:12px;z-index:-1;" v-if="new_20th.length>0">
      <p v-for="(item,k) in new_20th" :key="k" style="margin-bottom:10px;">
        &lt;{{item.time}}>{{item.sku}} ====> {{item.name}}
      </p>
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
.info{
  p:last-of-type {
    font-size: 14px;
    color: green;
  }
}
</style>

<style lang="scss">
</style>
<script>
import Util from "../assets/Util";
import CONST from "../assets/CONST";
import Encryption from "../assets/Encryption";
import Footer from "./Footer";
import io from "socket.io-client";
let { encryptRsa, decryptRsa, pwdEncrypt } = Encryption;
export default {
  name: "FactorySKU",
  data() {
    return {
      mag_name: "整单发货扫码系统",
      login_tip: "FACTORY SKU SYSTEM",
      sku: {
        placeholder: "SKU",
        value: ""
      },
      loading: false,
      number:0,
      can_enter: true,
      new_20th:[],
      last_code: "",
      last_size: "",
    };
  },
  components: {
    "footer-c": Footer
  },
  methods: {
    newSKU() {
    //   var socket = io(CONST.ip,{
    //     path: '/transfer'
    //   });
    //   socket.emit("talk",this.sku.value);
    // return;
      if (this.loading || !this.can_enter||!this.sku.value) {
        return;
      }
      this.can_enter = false;
      this.loading = true;
      let sku = this.sku.value;
      let key = this.$store.state.user.key;
      sku= sku.replace(/\s/g,"");
      let reg = /^([a-z0-9\.\-]+)-([a-z0-9]+)$/i
      let regObj = reg.exec(sku);
      let code = "";
      let size = "";
      if(!regObj){
        Util.showTip(this,"warning","记录失败，该SKU不处于可录入订单内！");
        return;
      }else{
        code = regObj[1];
        size = regObj[2];
      }
      Util.cRequest(this, "/process/factory/new", { key, code, size }, data => {
        this.can_enter = true;
        this.loading = false;
        if(data&&data["result"]&&data["result"][0]){
          this.number ++;
          Util.showTip(this,"success","记录成功！");
          this.last_code = code;
          this.last_size = size;
          this.sku.value = "";
          this.$notify({
                  title: '成功录入!',
                  message: `订单名称：${data.result[0].name}；SKU：${data.result[0].code+"-"+data.result[0].size}`,
                });
        }else{
          Util.showTip(this,"warning","记录失败，该SKU不处于可录入订单内！");
          this.sku.value = "";
        }
      });
    },
    back99To98() {
      let key = this.$store.state.user.key;
      let code = this.last_code;
      let size = this.last_size;
      Util.cRequest(this, "/process/factory/back/99/98", { key, code, size }, data => {
        if(data&&data["result"]&&data["result"][0]&&data["result"][0].affectedRows>0){
          Util.showTip(this,"success","撤销成功！");
          this.last_code = "";
          this.last_size = "";
        }else{
          Util.showTip(this,"warning","撤销失败！");
        }
      });
    }
  },
  mounted() {
    var socket = io(CONST.ip,{
      path: '/factory/send'
    });
    socket.on('connect', function(msg){
    });
    socket.on('flesh', msg=>{
      let r = JSON.parse(Encryption.decryptRsa(msg));
      this.new_20th = r.reverse();
    });
  }
};
</script>
