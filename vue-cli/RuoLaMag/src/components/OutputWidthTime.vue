<template>
  <div class="order-car" style="padding-top:10px;">
    <el-row class="content" :gutter="20">
      <el-col :xs="24" :sm="24" :md="12" :xl="7">
        <el-card shadow="hover">
          <div>
            <el-date-picker
              v-model="timearr"
              type="datetimerange"
              :picker-options="TimeOptions"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              align="right"
              style="width:100%"
              value-format="yyyy-MM-dd HH:mm:ss"
            ></el-date-picker>
          </div>
          <div>
            <el-radio-group v-model="out_type" style="padding-top:20px;">
              <el-radio :label="1">印花缺货表</el-radio>
              <el-radio :label="2">发货缺货表</el-radio>
            </el-radio-group>
          </div>
        </el-card>
      </el-col>
      <el-col
        :xs="24"
        :sm="24"
        :md="12"
        :xl="6"
        v-if="out_type&&timearr[1]"
        v-loading="out_production_loading"
      >
        <el-card shadow="hover">
          <p style="margin-bottom:10px;">订单列表</p>
          <el-checkbox
            :indeterminate="check_orders_isIndeterminate"
            @change="checkOrdersAllChange"
            v-model="check_orders_all"
          >全选</el-checkbox>
          <el-checkbox-group v-model="check_orders" @change="checkOrdersChange" style="margin-bottom:10px;">
            <el-checkbox
              v-for="(item,i) in out_production_order_info"
              :label="item.id"
              :key="item.id"
            >{{i+1}}号订单</el-checkbox>
          </el-checkbox-group>
          <el-collapse>
            <el-collapse-item
              v-for="(item,i) in out_production_order_info"
              :key="item.id"
              :title="i+1+'号订单 客户：'+item.name+' 订单描述：'+item._describe"
              :name="item.id"
            >
              <div>订单上传时间：{{item.time}}</div>
              <div>订单日期：{{item.date}}</div>
              <div>订单用户：{{item.name}}</div>
              <div>订单描述：{{item._describe}}</div>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </el-col>
      <el-col
        :xs="24"
        :sm="24"
        :md="24"
        :xl="11"
        v-if="out_type&&timearr[1]&&check_orders.length>0"
        v-loading="out_production_loading"
      >
        <el-card shadow="hover">
          <el-button @click="outPutProduction" v-loading="output_loading" :disabled="output_loading">导出</el-button>
          <p>总数(未包含error项)：{{this.out_production_total}}</p>
          <el-table :data="out_production" style="width: 100%">
            <el-table-column prop="code" label="code"></el-table-column>
            <el-table-column prop="s" label="s" width="28"></el-table-column>
            <el-table-column prop="m" label="m" width="28"></el-table-column>
            <el-table-column prop="l" label="l" width="28"></el-table-column>
            <el-table-column prop="xl" label="xl" width="28"></el-table-column>
            <el-table-column prop="2xl" label="2xl" width="32"></el-table-column>
            <el-table-column prop="3xl" label="3xl" width="32"></el-table-column>
            <el-table-column prop="4xl" label="4xl" width="32"></el-table-column>
            <el-table-column prop="5xl" label="5xl" width="32"></el-table-column>
            <el-table-column prop="6xl" label="6xl" width="32"></el-table-column>
            <el-table-column prop="adult" label="adult" width="46"></el-table-column>
            <el-table-column prop="youth" label="youth" width="46"></el-table-column>
            <el-table-column prop="qil" label="qil" width="46"></el-table-column>
            <el-table-column prop="qim" label="qim" width="46"></el-table-column>
            <el-table-column prop="blm" label="blm" width="46"></el-table-column>
            <el-table-column prop="other" label="other" width="42"></el-table-column>
            <!-- <el-table-column prop="total" label="total" width="36"></el-table-column> -->
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<style lang="scss" scoped>
</style>
<style lang="scss">
</style>

<script>
import CONST from "../assets/CONST";
import Util from "../assets/Util";
import Encryption from "../assets/Encryption";
import XLSX from "xlsx";
import saveAs from "file-saver";
import moment from "moment";
export default {
  name: "OrderOutputCar",
  data() {
    return {
      timearr: [],
      TimeOptions: {
        shortcuts: [
          {
            text: "今天",
            onClick(picker) {
              const end = new Date(moment().format("YYYY-MM-DD 24:00:00"));
              const start = new Date(moment().format("YYYY-MM-DD 00:00:00"));
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "昨天",
            onClick(picker) {
              const end = new Date(
                moment()
                  .subtract(1, "days")
                  .format("YYYY-MM-DD 24:00:00")
              );
              const start = new Date(
                moment()
                  .subtract(1, "days")
                  .format("YYYY-MM-DD 00:00:00")
              );
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "前3天所有",
            onClick(picker) {
              const end = new Date(moment().format("YYYY-MM-DD 00:00:00"));
              const start = new Date(
                moment()
                  .subtract(2, "days")
                  .format("YYYY-MM-DD 00:00:00")
              );
              picker.$emit("pick", [start, end]);
            }
          }
        ],
        disabledDate(data) {
          return data < new Date("2019-01-12 00:00:00");
        }
      },
      out_type: 0,
      OutTypeOption:[{
        orders:"/order/regularly/transfer/outstock/orders",
        items:"/order/regularly/transfer/outstock/orders/items"
      },{
        orders:"/order/regularly/nosent/outstock/orders",
        items:"/order/regularly/nosent/outstock/orders/items"
      }],
      out_production_loading: false,
      out_production_order_info: [],
      out_production: [],
      out_production_obj: {},
      out_production_total: 0,
      out_stock: [],
      out_stock_order_info: [],
      out_stock_loading: false,
      check_orders: [],
      check_orders_isIndeterminate: false,
      check_orders_all: false,
      output_loading: false
    };
  },
  methods: {
    getData() {
      if (this.out_type == 1 && this.timearr && this.timearr[1]) {
        this.infoClear();
        this.getOutStockData();
      } else if (this.out_type == 2 && this.timearr && this.timearr[1]) {
        this.infoClear();
        this.getOutStockData();
      }
    },
    infoClear() {
      this.out_production_loading = true;
      this.out_production = [];
      this.out_production_order_info = [];
      this.check_orders = [];
      this.check_orders_all = false;
    },
    getOutStockData() {
      let key = this.$store.state.user.key;
      let start = this.timearr[0];
      let end = this.timearr[1];
      let url = this.OutTypeOption[this.out_type-1].orders;
      Util.cRequest(
        this,
        url,
        { key, start, end },
        data => {
          if (data.result && data.result[0]) {
            this.out_production_order_info = data.result;
          } else {
            this.infoClear();
            Util.showTip(this, "warning", "该时间段暂无订单!");
          }
          this.out_stock_loading = false;
          this.out_production_loading = false;
        }
      );
    },
    outPutProduction() {
      this.output_loading = true;
      for (const key in this.out_production) {
        if (this.out_production.hasOwnProperty(key)) {
          const element = this.out_production[key];
          for (const k in element) {
            delete element.total;
            if (element.hasOwnProperty(k)) {
              const e = element[k];
              if (e == 0) {
                element[k] = "";
              }
            }
          }
        }
      }
      // Util.downloadExcelMulti(
      //   this.out_production_obj,
      //   `生产表_${this.out_production_total}件_${this.timearr[0]} 至 ${
      //     this.timearr[1]
      //   }`
      // );
      // console.log(this.out_production)
      for (const key in this.out_production) {
        if (this.out_production.hasOwnProperty(key)) {
          const element = this.out_production[key];
          delete element._regexp;
          delete element.arr;
          delete element.u_id;
        }
      }
      let json = JSON.stringify(this.out_production);
      json = json ? json : "";
      // json = json.replace(/\:0,/g, ':"",').replace(/\:0}/g, ':""}');
      // console.log(json)
      let fd = new FormData();
      fd.append("json", json);
      // console.log(fd)
      this.$http
        .post(CONST.HOST + "/order/excel/production", fd, {
          responseType: "arraybuffer",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        })
        .then(res => {
          let blob = new Blob([res.data], { type: "" });
          let name = `生产表_${this.out_production_total}件_${this.timearr[0]} 至 ${
          this.timearr[1]
        }.xlsx`
          saveAs(new Blob([blob], { type: "application/octet-stream" }), name);
          this.output_loading = false;
        })
        .catch(error => {
          console.log(error)
          this.output_loading = false;
        });




    },
    orderProductionData() {
      let a = this.out_production;
      let b = {};
      b["other"] = [];
      for (const key in CONST.PRODUCTION_TYPE) {
        if (CONST.PRODUCTION_TYPE.hasOwnProperty(key)) {
          const e = CONST.PRODUCTION_TYPE[key];
          b[e] = [];
        }
      }

      for (const key in a) {
        let r = false;
        if (a.hasOwnProperty(key)) {
          const element = a[key];
          const code = element["code"];

          for (const k in CONST.PRODUCTION_TYPE) {
            if (CONST.PRODUCTION_TYPE.hasOwnProperty(k)) {
              const e = CONST.PRODUCTION_TYPE[k];
              if (code.indexOf(k) > -1) {
                b[e].push(element);
                r = true;
                break;
              }
            }
          }
          if (!r) {
            b["other"].push(element);
          }
        }
      }
      let c = [];
      for (const key in b) {
        if (b.hasOwnProperty(key)) {
          let element = b[key];
          c = c.concat(element);
          element = null;
        }
      }
      this.out_production_obj = b;
      this.out_production = c;
      // this.productionTotal();
    },
    checkOrdersAllChange(val) {
      let orders = [];
      for (const key in this.out_production_order_info) {
        if (this.out_production_order_info.hasOwnProperty(key)) {
          const element = this.out_production_order_info[key];
          orders.push(element.id);
        }
      }
      this.check_orders = val ? orders : [];
      this.check_orders_isIndeterminate = false;
    },
    checkOrdersChange(value) {
      let checkedCount = value.length;
      this.check_orders_all =
        checkedCount === this.out_production_order_info.length;
      this.check_orders_isIndeterminate =
        checkedCount > 0 &&
        checkedCount < this.out_production_order_info.length;
    },
    getProductionData() {
      if(this.check_orders.length<1){
        return;
      }
      let url = this.OutTypeOption[this.out_type-1].items;
      let key = this.$store.state.user.key;
      let arr = JSON.stringify(this.check_orders);
      Util.cRequest(
        this,
        url,
        { key, arr},
        data => {
          console.log(data);
          if (data.result && data.result[0]) {
            this.out_production = data.result;
            this.orderProductionData();
            this.out_production_total = data.result[0].total
          } else {
            this.out_production = [];
            Util.showTip(this, "warning", "该时间段暂无订单!");
          }
          this.out_stock_loading = false;
          this.out_production_loading = false;
        }
      );
    },
  },
  mounted() {},
  watch: {
    out_type(n) {
      this.getData();
    },
    timearr(n) {
      this.getData();
    },
    check_orders(a) {
      this.getProductionData();
    }
  }
};
</script>
