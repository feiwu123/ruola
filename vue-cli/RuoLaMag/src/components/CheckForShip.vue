<template>
  <div class="login-wrap label-print" @keyup.enter="getLabel($event)">
    <el-card class="form-wrap">
      <h1 class="mag-name">{{mag_name}}</h1>
      <p style="margin-bottom:10px;" v-if="is_next_order">{{no.tip}}</p>
      <p style="margin-bottom:10px;" v-else>请输入NO. {{no_show.no}}需求产品的SKU：</p>
      <el-input
        v-loading="loading"
        class="ipt"
        :placeholder="no.placeholder"
        type="text"
        v-model="no.value"
        @blur="$event.target.focus()"
      ></el-input>
      <el-button style="float: right;" v-if="!is_next_order" @click="clearNoShow">跳过该订单</el-button>
    </el-card>
    <el-card v-if="no_show.no" style="font-size:18px;line-height:22px;width:360px;position:absolute;left:60px;top:60px;">
      <p>NO. {{no_show.no}}</p>
      <p>SKU:</p>
      <div v-for="(item,k) in no_show.content" :key="k" style="font-size:18px;line-height:22px;">
        {{k+1}}. {{item.SKU}} <span v-if="item.own">✔</span><span v-else>✘</span>
      </div>
    </el-card>
    <footer-c class="footer"  style="position:fixed; bottom: 0;"></footer-c>
  </div>
</template>

<style lang="scss" scoped>
.login-wrap {
  position: relative;
  height: 100%;
  // min-height: 700px;
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
    height: 230px;
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
      mag_name: "发货核对",
      login_tip: "",
      no: {
        placeholder: "NO OR SKU",
        value: "",
        tip:"请输入订单号："
      },
      label_url: "",
      loading: false,
      can_enter: true,
      no_show: {
        no: "",
        content: []
      },
      is_next_order: true,
      success_order:[],
      skip_order:[],
    };
  },
  components: {
    "footer-c": Footer
  },
  methods: {
    getLabel(a, b) {
      if(!this.isNextOrder()){
        this.checkSKU(a);
        return;
      }
      if (this.loading || !this.can_enter||!this.no.value) {
        return;
      }
      this.can_enter = false;
      this.loading = true;
      this.label_url = "";
      let no = this.no.value;
      let key = this.$store.state.user.key;
      no= this.no.value.replace(/\s/g,"");
      Util.cRequest(this, "/process/ship/check", { key, no}, data => {
        if(data.result&&data.result.length>0) {
          this.no_show.content = data.result;
          this.no_show.no = no;
        }else{
          this.no_show.content = [];
          this.no_show.no = "";
          Util.showTip(this,"warning","查无此需打包单号。请检查是否为2019年1月12日以后并已打印面单且需要打包的订单。")
        }
        this.isNextOrder();
        this.loading = false;
        a.target.focus();
        this.can_enter = true;
        this.no.value = "";
      });
    },
    clearNoShow() {
      this.skip_order.push(this.no_show);
      this.no_show={
        no:"",
        content:[]
      }
      this.isNextOrder();
    },
    checkSKU(a){
      if (this.loading || !this.can_enter||!this.no.value) {
        return;
      }
      this.can_enter = false;
      this.loading = true;
      this.label_url = "";
      let SKU = this.no.value.toUpperCase();
      let r = false;
      let b = 0;
      for (const key in this.no_show.content) {
        if (this.no_show.content.hasOwnProperty(key)) {
          const element = this.no_show.content[key];
          b++;
          if(element.SKU == SKU&&!element.own) {
            element.own = true;
            r = true;
            break;
          }
        }
      }
      let no = this.no_show.no
      if(r==true&&b==this.no_show.content.length){
        this.$notify({
          title: '成功',
          message: '订单NO. '+no+`核对成功，可打包。`,
          type: 'success'
        });
        this.success_order.push(this.no_show);
      }
      this.isNextOrder();
      Util.showTip(this,r?"success":"waring",r?"SKU匹配成功":"SKU匹配错误！")
      this.loading = false;
      a.target.focus();
      this.can_enter = true;
      this.no.value = "";
    },
    isNextOrder(){
      if(!this.no_show.no
       ||!this.no_show.content
       ||this.no_show.content.length<1){
         this.is_next_order = true;
         return true;
       }
      let r = true;
      for (const key in this.no_show.content) {
        if (this.no_show.content.hasOwnProperty(key)) {
          const element = this.no_show.content[key];
          if(!element.own||(element.own&&element.own==false)) r = false;
        }
      }
      this.is_next_order = r;
      return r;
    }
  },
  computed: {
    
  },
  mounted() {
  },
};
</script>
