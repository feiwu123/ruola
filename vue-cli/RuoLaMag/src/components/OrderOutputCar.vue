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
              <el-radio :label="1">生产表</el-radio>
            </el-radio-group>
          </div>
        </el-card>
      </el-col>
      <el-col
        :xs="24"
        :sm="24"
        :md="12"
        :xl="6"
        v-if="out_type==1&&timearr[1]"
        v-loading="out_production_loading"
      >
        <el-card shadow="hover">
          <p style="margin-bottom:10px;">订单列表</p>
          <p v-if="print_already.length>0" style="margin-bottom: 10px;">{{print_already}}号订单已经打印过生产表</p>
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
        v-if="out_type==1&&timearr[1]"
        v-loading="out_production_loading"
      >
        <el-card shadow="hover">
          <el-button @click="outPutProduction">导出</el-button>
          <p>总数(未包含error项)：{{this.out_production_total}}</p>
          <el-table :data="out_production" style="width: 100%">
            <el-table-column prop="code" label="code"></el-table-column>
            <el-table-column prop="s" label="s" width="24"></el-table-column>
            <el-table-column prop="m" label="m" width="24"></el-table-column>
            <el-table-column prop="l" label="l" width="24"></el-table-column>
            <el-table-column prop="xl" label="xl" width="24"></el-table-column>
            <el-table-column prop="2xl" label="2xl" width="28"></el-table-column>
            <el-table-column prop="3xl" label="3xl" width="28"></el-table-column>
            <el-table-column prop="4xl" label="4xl" width="28"></el-table-column>
            <el-table-column prop="5xl" label="5xl" width="28"></el-table-column>
            <el-table-column prop="6xl" label="6xl" width="28"></el-table-column>
            <el-table-column prop="adult" label="adult" width="42"></el-table-column>
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
      out_production_loading: false,
      out_production_order_info: [],
      out_production: [],
      out_production_obj: {},
      out_production_total: 0,
      out_stock: [],
      out_stock_order_info: [],
      out_stock_loading: false,
      print_already: []
    };
  },
  methods: {
    getData() {
      if (this.out_type == 1 && this.timearr && this.timearr[1]) {
        this.infoClear();
        this.getProductionDate();
      }
    },
    infoClear() {
      this.out_production_loading = true;
      this.out_production = [];
      this.out_production_order_info = [];
      this.out_stock_loading = true;
      this.out_stock = [];
      this.out_stock_order_info = [];
      this.print_already=[];
    },
    getProductionDate() {
      let key = this.$store.state.user.key;
      let start = this.timearr[0];
      let end = this.timearr[1];
      Util.cRequest(
        this,
        "/order/regularly/production",
        { key, start, end },
        data => {
          switch (data.service_code) {
            case CONST.ORDER_OUT_REGULARLY_PRODUCTION:
              if (data.result && data.result[0]) {
                this.out_production_order_info = data.result[0];
                for (const key in this.out_production_order_info) {
                  if (this.out_production_order_info.hasOwnProperty(key)) {
                    const element = this.out_production_order_info[key];
                    if (element.out_regularly > 0) {
                      this.print_already.push(parseInt(key) + 1);
                    }
                  }
                }
                this.out_production = data.result[1];
                if (this.out_production && this.out_production[0]) {
                  this.orderProductionData();
                }
                this.out_production_total = data.result[1][0].total
                  ? data.result[1][0].total
                  : 0;
              } else {
                this.infoClear();
                Util.showTip(this, "warning", "该时间段暂无订单!");
              }
              break;
            default:
              this.infoClear();
              Util.showTip(this, "warning", "UNKNOW ERROR!");
              break;
          }
          this.out_stock_loading = false;
          this.out_production_loading = false;
        }
      );
    },
    getOutStockDate() {},
    outPutProduction() {
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
      let msg =
        "是否确认生成" +
        this.timearr[0] +
        "至" +
        this.timearr[1] +
        "时间段内模拟的订单?";
      if (this.print_already.length > 0) {
        msg +=
          "其中：" + this.print_already.toString() + "号订单已经导出过生产表。";
      }
      msg += "点击确认将导出订单，取消则不记录。";
      this.$confirm(msg, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.createPorductionExcelLog();
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消"
          });
        });
    },
    createPorductionExcelLog() {
      let key = this.$store.state.user.key;
      let a = [];
      for (const key in this.out_production_order_info) {
        if (this.out_production_order_info.hasOwnProperty(key)) {
          const element = this.out_production_order_info[key];
          a.push(element.id);
        }
      }
      if (a.length < 0) {
        Util.showTip(this, "warning", "订单数量为零！");
        return;
      }
      let arr = JSON.stringify(a);
      Util.cRequest(this, "/order/regularly/print/log", { key, arr }, data => {
        if (data.result[0].affectedRows > 0) {
          Util.downloadExcelMulti(
            this.out_production_obj,
            `生产表_${this.out_production_total}件_${this.timearr[0]} 至 ${
              this.timearr[1]
            }`
          );
        } else {
          Util.showTip(this, "warning", "未知错误请重新尝试！");
        }
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
    }
  },
  mounted() {},
  watch: {
    out_type(n) {
      this.getData();
    },
    timearr(n) {
      this.getData();
    }
  }
};
</script>
