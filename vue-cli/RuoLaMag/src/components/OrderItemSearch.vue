I<template>
  <div class="pwdupdate-wrap" >
    <el-card class="form-wrap" shadow="hover" style="width:400px;">
      <el-input
        class="ipt"
        placeholder="Order No 多件请回车分割 (系统会自动删除‘a-zA-Z0-9_-#’以外的所有字符，且‘_’统一转为‘-’)"
        prefix-icon="el-icon-search"
        type="textarea"
        maxlength="10000"
        v-model="order_no"
        @keydown.enter="searchFn"
      ></el-input>
      <el-button class="btn" plain @click="searchFn" v-if="order_no">查询</el-button>
    </el-card>
    <el-card class="form-wrap" shadow="hover" style="width:400px;margin-top:20px;">
      <el-input
        class="ipt"
        placeholder="SKU 多件请回车分割 (系统会自动删除‘a-zA-Z0-9_-#’以外的所有字符，且‘_’统一转为‘-’)"
        prefix-icon="el-icon-search"
        type="textarea"
        maxlength="10000"
        v-model="order_sku"
        @keydown.enter="searchWidthSKUFn"
      ></el-input>
      <el-button class="btn" plain @click="searchWidthSKUFn" v-if="order_sku">查询</el-button>
    </el-card>
    <el-card v-if="orders[0]" style="margin-top: 20px;" shadow="hover">
      <el-button class="btn" plain @click="downloadExcel" v-if="order_no" style="margin-bottom: 10px">导出</el-button>      
      <el-collapse v-model="activeName" accordion>
        <el-collapse-item :title="item.no" :name="i" v-for="(item,i) in orders" :key="item.no">
          <div>所属客户：{{item.user_name}}</div>
          <div>所属管理员：{{item.manager_name}}</div>
          <div>content: {{item.content}}</div>
          <div>订单状态：{{item.print_times?"已打包":"未打包"}}</div>
          <div v-if="item.print_times">面单打印管理员：{{item.print_person}}</div>
          <div v-if="item.ship_check_person">最后发货检查员：{{item.ship_check_person}}</div>
          <div><span v-for="(_item,k) in item.states" :key="k">[{{_item.SKU}}:{{_item.state>0?"已生产":"未生产"}}]</span></div>
          <div v-if="item.print_time&&item.print_times">订单打包时间:{{item.print_time}}</div>
          <div>订单最新更新时间：{{item.time}}</div>
          <div>订单日期：{{item.date}};订单描述:{{item._describe}};</div>
          <div>渠道：{{item["SHIPPING WAY"]}}</div>
          <div v-if="item.box">
            订单正处于播种流程：
            <div>筐号：{{item.box}};</div>
            <div>最后更新时间：{{item.box_time}};</div>
            <div>筐内产品：{{item.have}}</div>
            <div v-if="item.BDT">八达通：{{item.BDT}}</div>
            <div v-if="item.WC">伟成{{item.WC}}</div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.pwdupdate-wrap {
  height: 0;
  transition: 0.3s all;
  * {
    height: auto;
    transition: 0.3s all;
  }
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
  name: "orderitemsearch",
  data() {
    return {
      order_no: "",
      order_sku: "",
      orders: [],
      activeName: 0
    };
  },
  components: {
    "footer-c": Footer
  },
  methods: {
    
    searchFn() {
      let order_no = this.order_no;
      let order_arr = order_no.split("\n");
      for (const key in order_arr) {
        if (order_arr.hasOwnProperty(key)) {
          order_arr[key] = order_arr[key]
            ? order_arr[key].replace(/[^a-z0-9#\_\-]{1}/gi, "")
            : "";
        }
      }
      let rem = [];
      for (const key in order_arr) {
        if (order_arr.hasOwnProperty(key)) {
          if (!order_arr[key]) {
            rem.push(key);
          }
        }
      }
      for (const key in rem) {
        if (rem.hasOwnProperty(key)) {
          rem[key] = rem[key] - key;
          order_arr.splice(rem[key], 1);
        }
      }
      let string_order_arr = JSON.stringify(order_arr);
      if (order_no) {
        let key = this.$store.state.user.key;
        Util.cRequest(
          this,
          "/order/search/byno",
          { key, order_arr: string_order_arr },
          data => {
            switch (data.service_code) {
              case CONST.ORDER_ITEM_INFO:
                if (!data.result) {
                  Util.showTip(this, "warning", "UNKNOW ERROR!");
                } else if (data.result[0]) {
                  this.orders = data.result;
                  this.bdtRequest(string_order_arr);
                  this.wcRequest(string_order_arr);
                } else {
                  Util.showTip(this, "warning", "无单号信息!");
                }
                break;
              default:
                Util.showTip(this, "warning", "UNKNOW ERROR!");
                break;
            }
          }
        );
      }
    },
    downloadExcel() {
      Util.downloadExcelWithJson(this.orders,"RESULT_OF_SEARCH")
    },
    bdtRequest(no_arr) {
        // let key = this.$store.state.user.key;
        // Util.cRequest(
        //   this,
        //   "/order/bdt/info",
        //   { key, no_arr},
        //   data => {
        //     switch (data.service_code) {}
        //   }
        // );
    },
    wcRequest(no_arr) {
    },
    searchWidthSKUFn(){
      let order_sku = this.order_sku;
      let sku_arr = order_sku.split("\n");
      for (const key in sku_arr) {
        if (sku_arr.hasOwnProperty(key)) {
          sku_arr[key] = sku_arr[key]
            ? sku_arr[key].replace(/[^a-z0-9#\_\-\s]{1}/gi, "")
            : "";
        }
      }
      //去重
      let rem = [];
      for (const key in sku_arr) {
        if (sku_arr.hasOwnProperty(key)) {
          if (!sku_arr[key]) {
            rem.push(key);
          }
        }
      }
      for (const key in rem) {
        if (rem.hasOwnProperty(key)) {
          rem[key] = rem[key] - key;
          sku_arr.splice(rem[key], 1);
        }
      }
      let string_order_arr = JSON.stringify(sku_arr);
      if (order_sku) {
        let key = this.$store.state.user.key;
        Util.cRequest(
          this,
          "/order/search/bysku",
          { key, sku_arr: string_order_arr },
          data => {
            switch (data.service_code) {
              case CONST.ORDER_ITEM_INFO:
                if (!data.result) {
                  Util.showTip(this, "warning", "UNKNOW ERROR!");
                } else if (data.result[0]) {
                  this.orders = data.result;
                  this.bdtRequest(string_order_arr);
                  this.wcRequest(string_order_arr);
                } else {
                  Util.showTip(this, "warning", "无SKU相关订单信息!");
                }
                break;
              default:
                Util.showTip(this, "warning", "UNKNOW ERROR!");
                break;
            }
          }
        );
      }
    },
  }
};
</script>
