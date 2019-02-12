<template>
  <div class="login-wrap label-print" @keyup.enter="getLabel($event)">
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
      <el-button @click="back1To0" v-if="last_sku">返回上一次</el-button>
    </el-card>
    <el-card class="info" style="width: auto; position: fixed; bottom:20px;left:20px;font-size:12px;z-index:-1;" v-if="new_20th.length>0">
      <p v-for="(item,k) in new_20th" :key="k" style="margin-bottom:10px;">
        &lt;{{item.time}}>{{item.sku}} ====> {{item.no}}
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
import LodopFuncs from "../assets/LodopFuncs";

let { encryptRsa, decryptRsa, pwdEncrypt } = Encryption;
export default {
  name: "login",
  data() {
    return {
      mag_name: "质检扫码系统",
      login_tip: "QUALITY SYSTEM",
      sku: {
        placeholder: "SKU",
        value: ""
      },
      loading: false,
      number:0,
      can_enter: true,
      new_20th:[],
      last_sku: "",
    };
  },
  components: {
    "footer-c": Footer
  },
  methods: {
    getLabel() {
      this.printLabel();
      Util.showTip(this,"warning","打印任务已提交，请稍等片刻！")
      return;
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
      Util.cRequest(this, "/process/new", { key, sku }, data => {
        this.can_enter = true;
        this.loading = false;
        if(data&&data["result"]&&data["result"][0]){
          this.number ++;
          Util.showTip(this,"success","记录成功！");
          this.last_sku = this.sku.value;
          this.sku.value = "";
          this.$notify({
                  title: '成功录入!',
                  message: `<${data["result"][0]["time"].replace(/\s/g,"").replace(/^([0-9\-]{10})/,"$1.")}>${data["result"][0]["sku"]}-->${data["result"][0]["no"]}`,
                });
        }else{
          Util.showTip(this,"warning","记录失败，该SKU不处于可录入订单内！");
          this.sku.value = "";
        }
      });
    },
    back1To0() {
      let key = this.$store.state.user.key;
      let sku = this.last_sku;
      Util.cRequest(this, "/process/back/1/0", { key, sku }, data => {
        if(data&&data["result"]&&data["result"][0]&&data["result"][0].changedRows>0){
          Util.showTip(this,"success","撤销成功！");
          this.last_sku = "";
        }else{
          Util.showTip(this,"warning","撤销失败！");
        }
      });
    },
    printLabel() {
      // console.log(this.LODOP)
      if(!this.LODOP){
        return;
      }
      this.LODOP.PRINT_INIT("质检打印任务："+this.sku.value);
      this.LODOP.ADD_PRINT_TEXT(168,0,100,20,this.sku.value);
      this.LODOP.ADD_PRINT_BARCODE(0,0,168,146,"QRCode",this.sku.value);
      this.LODOP.PRINT();   
    },
  },
  mounted() {
    var socket = io(CONST.ip,{
      path: '/transfer'
    });
    console.log(socket)
    socket.on('connect', function(msg){
      console.log("connect io",msg)
    });
    socket.on('flesh', msg=>{
      let r = JSON.parse(Encryption.decryptRsa(msg));
      this.new_20th = r.reverse();
    });

    LodopFuncs.init();
    this.LODOP=LodopFuncs.getLodop();
    
  }
};
</script>
