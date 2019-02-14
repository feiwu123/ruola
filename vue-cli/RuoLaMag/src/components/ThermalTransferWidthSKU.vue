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
        <!-- <el-alert
          :title="LODOP?'打印控件加载成功。':'打印控件正在加载，请稍等。'"
          :type="LODOP?'success':'warning'"
          :closable="false">
        </el-alert> -->
        <!-- CLodop_Setup_for_Win32NT.exe -->
        <!-- install_lodop64.exe -->
        <p><a :href="CONST.ip+'/uploads/other/CLodop_Setup_for_Win32NT.exe'" v-if="!LODOP">下载控件(安装后重启浏览器)</a>{{LODOP?'打印控件加载成功。':'打印控件正在加载，请稍等。'}}<el-button type="text" @click="printLabel" :disabled="!LODOP">直接打印</el-button></p>
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
      CONST,
      mag_name: "热转印扫码系统",
      login_tip: "THERMAL TRANSFER PRINT SYSTEM",
      sku: {
        placeholder: "SKU",
        value: ""
      },
      loading: false,
      number:0,
      can_enter: true,
      new_20th:[],
      last_sku: "",
      LODOP:undefined,
    };
  },
  components: {
    "footer-c": Footer
  },
  methods: {
    getLabel() {
    //   var socket = io(CONST.ip,{
    //     path: '/transfer'
    //   });
    //   socket.emit("talk",this.sku.value);
    // return;
      if(!this.LODOP){
        Util.showTip(this,"info","请稍等，打印控件没有加载成功。");
        return;
      }
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
          this.printLabel();
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
      if(!this.LODOP){
        return;
      }
      if(!this.sku.value){
        Util.showTip(this,"warning","SKU为空！");
        return;
      }
      let name = this.sku.value+new Date().getTime();
      console.log("质检打印任务："+name)
      this.LODOP.PRINT_INIT("质检打印任务："+ name);
      // this.LODOP.SET_PRINT_PAGESIZE(1,5000,5000,""); 
      this.LODOP.ADD_PRINT_TEXT("30mm","1cm","40mm","3mm",this.sku.value);
      this.LODOP.ADD_PRINT_BARCODE("1mm","10mm","32mm","32mm","QRCode",this.sku.value);
      // this.LODOP.ADD_PRINT_TEXT("60mm","25mm","100mm","3mm",this.sku.value);
      // this.LODOP.ADD_PRINT_BARCODE("2mm","25mm","50mm","50mm","QRCode",this.sku.value);
      this.LODOP.PRINT();
    },
  },
  mounted() {
    var socket = io(CONST.ip,{
      path: '/transfer'
    });
    socket.on('connect', function(msg){
      console.log("connect io")
    });
    socket.on('flesh', msg=>{
      let r = JSON.parse(Encryption.decryptRsa(msg));
      this.new_20th = r.reverse();
    });
    this.LODOP=LodopFuncs.getLodop();



      // this.$http
      //   .get(
      //     'http://192.168.5.137:3001/service/logistics/label/get',
      //     {},
      //     CONST.SESSION_CONFIG_CROS
      //   )
      //   .then(res => {
      //   })
      //   .catch(error => {
      //   });

  }
};
</script>
