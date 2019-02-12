<template>
  <div class="login-wrap label-print" @keyup.enter="getLabel($event)">
    <el-card class="form-wrap">
      <h1 class="mag-name">{{mag_name}}</h1>
      <p class="login-tip">
        {{login_tip}}<br>
        <a href="/singleprint" target="singleprint">GET LABEL</a>
      </p>
      <el-input
        v-loading="loading"
        class="ipt"
        :placeholder="no.placeholder"
        type="text"
        v-model="no.value"
        @blur="$event.target.focus()"
      ></el-input>
      <el-button v-if="!!label_url" @click="printLabel">PRINT</el-button>
      <el-button @click="checkAllBox" style="float: right;">ALL BOX</el-button>
    </el-card>
    <footer-c class="footer" style="position:absolute; bottom: 0;"></footer-c>
    <div class="pdf" v-if="!!label_url">
      <embed type="application/pdf" :src="label_url" width="500" height="800" @load="embedOnload">
    </div>
    <el-card class="now-show" v-show="now_show.no">
      <div class="clearfix">
        <p style="float:left;">操作：
          <span style="font-size: 28px;">{{(now_show.total-1) > now_show.quantity ? "投入" : "打包"}}</span>
        </p>
        <p style="float:left; margin-left: 12px;">NO：
          <span style="font-size: 28px;">{{now_show.no}}</span>
        </p>
        <p style="float:left; margin-left: 12px;">SKU：
          <span style="font-size: 28px;">{{now_show.sku}}</span>
        </p>
        <p style="float:left; margin-left: 12px;">筐号：
          <span style="font-size: 28px;">{{now_show.label}}</span>
        </p>
        <p style="float:left; margin-left: 12px;">订单数量(目前筐内/总数)：
          <span style="font-size: 28px; color: green;margin-right: 5px;">{{now_show.quantity+1}}</span>/
          <span style="font-size: 28px;color: red;margin-left: 5px;">{{now_show.total}}</span>
        </p>
      </div>
      <p style="margin-top:16px;">订单需要：{{now_show.content}}</p>
      <p style="margin-top:16px;">{{now_show.label}}筐内：{{now_show.box_content}}</p>
    </el-card>

    <el-dialog title="播种筐信息" :visible.sync="all_box.show">
      <el-table
        :data="all_box.table.data"
        @sort-change="sortChange"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column sortable="custom" fixed prop="label" label="筐号" width="80"></el-table-column>
        <el-table-column prop="no" label="包裹号" width="120"></el-table-column>
        <el-table-column prop="have" label="目前框内"></el-table-column>
        <el-table-column prop="quantity" label="目前数量" width="80"></el-table-column>
        <el-table-column prop="content" label="需求"></el-table-column>
        <el-table-column prop="content_num" label="需求数量" width="80"></el-table-column>
        <el-table-column fixed="right" label="操作" width="80">
          <template slot-scope="scope">
            <el-button @click.native.prevent="clearBox(scope.row)" type="text" size="small">清空</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="pagination"
        :page-size="all_box.table.page_size"
        :page-sizes="[10,20,50,100]"
        :total="all_box.table.total"
        layout="prev, pager, next, total, slot ,sizes"
        @size-change="sizeChange"
        @current-change="currentChange"
      ></el-pagination>
    </el-dialog>
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
      mag_name: "订单号扫码系统",
      login_tip: "同个客户，请不要和SKU扫码混用。",
      no: {
        placeholder: "No",
        value: ""
      },
      label_url: "",
      loading: false,
      can_enter: true,
      now_show: {
        no: "",
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
          data: [],
          prop: "label",
          order: "ascending", //ascending or descending
          page_size: 10,
          current_page: 1
        }
      }
    };
  },
  components: {
    "footer-c": Footer
  },
  methods: {
    getLabel(a, b) {
      if (this.loading || !this.can_enter) {
        return;
      }
      this.loading = true;
      this.label_url = "";
      let no = this.no.value?this.no.value.replace(/\s/g,""):"";
      let key = this.$store.state.user.key;
      let reg_arr = CONST.REG_FOR_GET_SKU_NO.exec(no);
      let sku = "";
      if (reg_arr && reg_arr[1] && reg_arr[2]) {
        no = reg_arr[2];
        sku = reg_arr[1];
      }
      if(sku) {
        sku.replace(/\s/g,"");
      }
      Util.cRequest(this, "/order/label/get", { key, no, sku }, data => {
        console.log(data)
        if (data.result && data.result[0]) {
          this.now_show.no = data.result[0].no;
          this.now_show.label = data.result[0].can_put_no;
          this.now_show.content = data.result[0].goods;
          this.now_show.box_content = data.result[0].have;
          this.now_show.total = data.result[0].total;
          this.now_show.quantity = data.result[0].Quantity;
        }else{
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
          case CONST.WC_LABEL_GET_ERROR:
            Util.showTip(this, "warning", `处理失败，请重新扫码!`);
            break;
          case CONST.WC_LABEL_GET_GOODS_ERROR:
            Util.showTip(this, "warning", "商品信息错误!");
            break;
          case CONST.WC_LABEL_GET_NO_GOODS:
            Util.showTip(this, "warning", "订单商品数量为零!");
            break;
          case CONST.WC_LABEL_GET_WC_ERROR:
            Util.showTip(
              this,
              "warning",
              "系统未能拉取到面单！" + data.result[0].wc_body
            );
            break;
          case CONST.WC_LABEL_GET_SINGLE:
            this.$confirm("请打包！", `单号${no} 单件`, {
              confirmButtonText: "确认"
            })
              .then(() => {
                this.can_enter = true;
              })
              .catch(action => {
                this.can_enter = true;
              });
            this.label_url = data.result[0].wc_body.data[0].lable_file;
            this.no.value = "";
            break;
          case CONST.WC_LABEL_GET_NO_SENT:
            Util.showTip(this, "warning", "该单号商品已发，请转交给业务员，并核实该单号情况！");
            break;
          default:
            this.seedSortingInfo(data.result, no);
            break;
        }
      });
    },
    seedSortingInfo(result) {
      let goods = result[0].goods;
      let no = result[0].no;
      let wc_body = result[0].wc_body;
      let can_put_no = result[0].can_put_no,
        Quantity = result[0].Quantity;
      let need_quantity = result[0].total;

      let confirm_text = "";
      confirm_text = `订单${no}共需${need_quantity},当前（不包含当件）‘${can_put_no}’筐内有${Quantity}件。`;
      let whether_full = false;
      if (need_quantity - 1 == Quantity) {
        this.label_url = wc_body.data[0].lable_file;
        whether_full = true;
        confirm_text += "商品已齐全，请打单包货(清空篮子)。";
      } else {
        confirm_text += "商品未齐，请确认信息并投入筐中。";
      }
      this.can_enter = false;
      this.$confirm(
        confirm_text,
        `${
          whether_full ? "请打包" : "请放入"
        } 筐号${can_put_no} 单号${no} 共需${need_quantity}`,
        {
          confirmButtonText: "确认",
          showClose: false,
          showCancelButton: false
        }
      )
        .then(() => {
          this.no.value = "";
          this.can_enter = true;
        })
        .catch(action => {
          this.can_enter = true;
        });
    },
    printLabel() {
      window.open(this.label_url, "_blank");
    },
    checkAllBox() {
      this.all_box.show = true;
      this.requestData();
    },
    clearBox(row) {
      let key = this.$store.state.user.key;
      let label = row.label;
      Util.cRequest(
        this,
        "/order/seedsorting/box/clear",
        { label, key },
        data => {
          console.log(data);
          switch (data.service_code) {
            case CONST.BOX_CLEAR:
              Util.showTip(this, "success", "OK!");
              this.requestData();
              break;
            default:
              Util.showTip(this, "warning", "UNKNOW ERROR!");
              break;
          }
        }
      );
    },
    sortChange({ order, prop }) {
      this.all_box.table.prop = prop;
      this.all_box.table.order = order;
      this.requestData();
    },
    sizeChange(page_size) {
      this.all_box.table.page_size = page_size;
      this.requestData();
    },
    currentChange(current_page) {
      this.all_box.table.current_page = current_page;
      this.requestData();
    },
    requestData() {
      this.all_box.loading = true;
      let { current_page, order, page_size, prop } = this.all_box.table;
      let key = this.$store.state.user.key;
      Util.cRequest(
        this,
        "/order/seedsorting/box/list",
        { current_page, order, page_size, prop, key },
        data => {
          this.all_box.loading = false;
          switch (data.service_code) {
            case CONST.BOX_ALL:
            for (const key in this.all_box.table.data) {
              if (this.all_box.table.data.hasOwnProperty(key)&&this.all_box.table.data[key]) {
                const element = this.all_box.table.data[key];
                const content = element["content"];
                const a = JSON.parse(content);
                element["content_num"] = a?a.length:0;
              }
            }
              this.all_box.table.data = data.result;
              this.all_box.table.total = 1500;
              break;
            default:
              this.all_box.table.data = [];
              Util.showTip(this, "warning", "UNKNOW ERROR!");
              break;
          }
        }
      );
    },
    embedOnload(){
      console.log("ready")
    }
  },
  mounted() {
  }
};
</script>
