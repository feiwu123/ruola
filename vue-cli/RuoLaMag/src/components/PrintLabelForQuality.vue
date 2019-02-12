<template>
  <div class="login-wrap label-print" @keyup.enter="getLabel($event)">
    <el-card class="form-wrap">
      <h1 class="mag-name">{{mag_name}}</h1>
      <el-input
        v-loading="loading"
        class="ipt"
        :placeholder="no.placeholder"
        type="text"
        v-model="no.value"
        @blur="$event.target.focus()"
      ></el-input>
    </el-card>
    <footer-c class="footer"  style="position:absolute; bottom: 0;"></footer-c>
    <div class="pdf" v-if="!!label_url">
      <embed type="application/pdf" :src="label_url" width="500" height="800">
    </div>
    <el-card class="now-show" v-show="now_show.no">
      <div class="clearfix">
        <p style="float:left;">操作：<span style="font-size: 28px;">{{now_show.total > now_show.quantity ? "投入" : "打包"}}</span></p>
        <p style="float:left; margin-left: 12px;">NO：<span style="font-size: 28px;">{{now_show.no}}</span></p>
        <p style="float:left; margin-left: 12px;">SKU：<span style="font-size: 28px;">{{now_show.sku}}</span></p>
        <p style="float:left; margin-left: 12px;">筐号：<span style="font-size: 28px;">{{now_show.label}}</span></p>
        <p style="float:left; margin-left: 12px;">订单数量(目前筐内/总数)：<span style="font-size: 28px; color: green;margin-right: 5px;">{{now_show.quantity}}</span>/<span style="font-size: 28px;color: red;margin-left: 5px;">{{now_show.total}}</span></p>
      </div>
      <p style="margin-top:16px;">订单需要：{{now_show.content}}</p>
      <p style="margin-top:16px;">{{now_show.label}}筐内（完成操作以后）：{{now_show.box_content}}</p>
    </el-card>
    <object  id="LODOP_OB" classid="clsid:2105C259-1E0C-4534-8141-A753534CB4CA" width=0 height=0> 
       <embed id="LODOP_EM" type="application/x-print-lodop" width=0 height=0>
    </object>
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
import LodopFuncs from "../assets/LodopFuncs";
LodopFuncs.init();
let { encryptRsa, decryptRsa, pwdEncrypt } = Encryption;
export default {
  name: "login",
  data() {
    return {
      mag_name: "即时打印",
      login_tip: "",
      no: {
        placeholder: "SKU",
        value: ""
      },
      label_url: "",
      loading: false,
      can_enter: true,
      now_show: {
        no: "",
        sku: "",
        content: "",
        label: "",
        box_content: "",
        total: 0,
        quantity: 0
      },
      all_box: {
        show: false,
        loading: false,
        table: {
          data:[],
          prop: "label",
          order: "ascending", //ascending or descending
          page_size: 10,
          current_page: 1
        }
      },
      LODOP: undefined
    };
  },
  components: {
    "footer-c": Footer
  },
  methods: {
    getLabel(a, b) {
      this.printLabel();
      return;
      if (this.loading || !this.can_enter||!this.no.value) {
        return;
      }
      this.can_enter = false;
      this.loading = true;
      this.label_url = "";
      let sku = this.no.value;
      let key = this.$store.state.user.key;
      let reg_arr = CONST.REG_FOR_GET_SKU_NO.exec(sku);
      let no = "";
      if(reg_arr&&reg_arr[1]&&reg_arr[2]) {
        this.$confirm(`请不要使用SKU系统扫订单号！`, `不是扫码人员，请不要使用系统，谢谢！`, {
              confirmButtonText: "确认"
            }).then(() => {
              this.can_enter = true;
              this.loading = false;
              })
              .catch(action => {
                Util.showTip(this,"warning","你拒绝了？？？ 拜拜。")
                setTimeout(()=>{
                  window.location.href = "about:blank"
                },3000)
              });
        return;
      }else{
        sku= this.no.value.replace(/\s/g,"");
      }
      Util.cRequest(this, "/sort/up/sku", { key, no, sku }, data => {
        console.log(data.result[0])
        if(data.result&&data.result[0]) {
          this.now_show.no = data.result[0].no;
          this.now_show.label= data.result[0].label;
          this.now_show.content = data.result[0].content;
          this.now_show.box_content = data.result[0].have;
          this.now_show.sku = data.result[0].sku;
          let total = 0;
          if(!data.result[0].content) {
            total = 1;
          }else{
            for (const key in data.result[0].content) {
              total+=data.result[0].content[key]["Quantity"]-0;
            }
          }
          this.now_show.total = total;
          this.now_show.quantity = data.result[0].have?data.result[0].have.length:this.now_show.total;
        }else{
          this.now_show.sku=""
          this.now_show.no = "";
          this.now_show.label = "";
          this.now_show.content = "";
          this.now_show.box_content = "";
          this.now_show.total = 0;
          this.now_show.quantity = 0;
        }
        this.loading = false;
        a.target.focus();
        switch (data.service_code) {
          case CONST.SEED_SORTING_WIDTH_SKU_NOT_NEED:
            this.can_enter = true;
            Util.showTip(this, "warning", "暂不需要该商品！");
            break;
          case CONST.PUT_BOX:
            this.$confirm(`请投入${this.now_show.label}！`, `单号${this.now_show.no} 产品SKU${this.now_show.sku}`, {
              confirmButtonText: "确认"
            })
              .then(() => {
                this.can_enter = true;
              })
              .catch(action => {
                this.can_enter = true;
              });
            this.no.value = "";
            break;
          case CONST.PUT_BOX_ERROR:
            this.can_enter = true;
            Util.showTip(
              this,
              "warning",
              "投筐错误，请确认该筐状态并修正状态！"
            );
            break;
          case CONST.SINGLE_PRINT:
            this.$confirm("请打包！", `单号${this.now_show.no} 产品SKU${this.now_show.sku}`, {
              confirmButtonText: "确认"
            })
              .then(() => {
                this.can_enter = true;
              })
              .catch(action => {
                this.can_enter = true;
              });
            this.label_url = data.result[0].lable_file;
            this.no.value = "";
            break;
          case CONST.CLEAR_BOX:
              this.$confirm(`${this.now_show.label}筐满，请打包！`, `单号${this.now_show.no} 产品SKU${this.now_show.sku}`, {
                confirmButtonText: "确认"
              })
              .then(() => {
                this.can_enter = true;
              })
              .catch(action => {
                this.can_enter = true;
              });
            this.label_url = data.result[0].lable_file;
            this.no.value = "";
            break;
          case CONST.CLEAR_BOX_ERROR:
            this.can_enter = true;
            Util.showTip(
              this,
              "warning",
              "投筐错误，请确认该筐状态并修正状态！"
            );
            this.label_url = data.result[0].lable_file;
            this.no.value = "";
            break;
          default:
            this.can_enter = true;
            Util.showTip(
              this,
              "warning",
              "不好意思，意料之外的错误！"
            );
            break;
        }
      });
    },
    printLabel() {
      if(!this.LODOP){
        return;
      }
      this.LODOP.PRINT_INIT("质检打印任务："+this.no.value);
      this.LODOP.ADD_PRINT_TEXT(168,0,100,20,this.no.value);
      this.LODOP.ADD_PRINT_BARCODE(0,0,168,146,"QRCode",this.no.value);
      this.LODOP.PRINT();   
    },
  },
  mounted() {
    this.LODOP=LodopFuncs.getLodop();
  }
};
</script>
