I<template>
  <div class="pwdupdate-wrap">
    <el-tag type="info" style="margin-bottom:3px">扫码</el-tag>
    <div class="clearfix">
      <router-link to="/skuprint" class="button" style="background-color:#303133;">发货扫码（SKU）</router-link>
      <!-- <router-link to="/print" class="button" style="background-color:#303133;">发货扫码（NO）</router-link> -->
      <router-link to="/thermaltransfer" class="button" style="background-color:#606166;">热转印</router-link>
    </div>
    <el-tag type="info" style="margin-bottom:3px">订单</el-tag>
    <div class="clearfix">
      <router-link to="/uploadmag" class="button" style="background-color:#409eff;">订单上传</router-link>
      <router-link to="/orderlist" class="button" style="background-color:#f56c6c;">订单查看及导出</router-link>
      <router-link to="/orderitemsearch" class="button" style="background-color:#e6a23c;">订单查询</router-link>
    </div>
    <div style="margin-top:20px;">
      <div style="width:600px;float:left;" v-if="line_date.rows&&line_date.rows.length>0">
        <ve-line :data="line_date"></ve-line>
      </div>
      <div style="width:600px;float:left;" v-if="pie_date.rows&&pie_date.rows.length>0">
        <p>产品状态分布饼状图</p>
        <ve-pie :data="pie_date"></ve-pie>
      </div>
      <div style="width:600px;float:left;" v-if="histogram_date.rows&&histogram_date.rows.length>0">
        <p>管理员销量（2019年1月12日起）柱状图</p>
        <ve-histogram :data="histogram_date"></ve-histogram>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.button {
  display: block;
  float: left;
  width: 300px;
  height: 80px;
  border-radius: 4px;
  color: white;
  text-align: center;
  line-height: 80px;
  font-size: 22px;
  margin-right: 20px;
  margin-bottom: 24px;
  &:hover {
    text-decoration: none;
  }
}
</style>


<script>
import Util from "../assets/Util";
import CONST from "../assets/CONST";
import Encryption from "../assets/Encryption";
import Footer from "./Footer";
import VeLine from "v-charts/lib/line.common";
import VePie from "v-charts/lib/pie.common";
import VeHistogram from "v-charts/lib/histogram.common";
let { encryptRsa, decryptRsa, pwdEncrypt } = Encryption;
export default {
  name: "first",
  data() {
    return {
      line_date: {},
      pie_date: {},
      histogram_date: {}
    };
  },
  components: {
    "footer-c": Footer
  },
  methods: {
    getHistogramData() {
      let key = this.$store.state.user.key;
      Util.cRequest(
        this,
        "/statistic/first/histogram",
        { key },
        data => {
          if (data && data.result && data.result.length > 0) {
            this.histogram_date = {
              columns: ["姓名", "总数", "已发", "已转印", "订单数","其他"],
              rows: data.result
            };
          } else {
            this.histogram_date = {};
          }
        }
      );
    },
    getPieData() {
      let key = this.$store.state.user.key;
      Util.cRequest(
        this,
        "/statistic/first/pie",
        { key },
        data => {
          if (data && data.result && data.result.length > 0) {
            this.pie_date = {
              columns: ["状态", "产品数量"],
              rows: data.result
            };
          } else {
            this.pie_date = {};
          }
        }
      );
    }
  },
  mounted() {
    this.getHistogramData();
    this.getPieData();
  },
  components: {
    "ve-line": VeLine,
    "ve-pie": VePie,
    "ve-histogram": VeHistogram
  }
};
</script>
