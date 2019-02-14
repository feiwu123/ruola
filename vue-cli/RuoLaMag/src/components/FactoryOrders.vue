<template>
  <div class="factory-orders" style="padding-top:10px;">
    <el-row class="content" :gutter="20">
      <el-col style="margin-bottom:20px;" :xs="24" :sm="24" :md="12">
        <el-card shadow="hover">
          <h1 style="font-size:24px;margin-bottom:10px;">导入工厂订单</h1>
          <el-upload
            class="upload-demo"
            ref="upload"
            action="https://127.0.0.1/posts/"
            :file-list="fileList"
            :auto-upload="false"
            accept=".xlsx"
            :on-change="xlxsChange"
          >
            <el-button slot="trigger" size="small" type="primary">选取EXCEL文件</el-button>
            <div slot="tip" class="el-upload__tip">只能上传.xlxs文件</div>
          </el-upload>
          <el-button type="text" @click="downloadMb">下载模版</el-button>
        </el-card>
      </el-col>
      <el-col style="margin-bottom:20px;" :xs="24" :sm="24" :md="12">
        <el-card shadow="hover">
          <el-table :data="order_list" style="width: 100%" v-loading="order_list_loading">
            <el-table-column fixed prop="time" label="时间" width="180"></el-table-column>
            <el-table-column fixed prop="name" label="订单名"></el-table-column>
            <el-table-column fixed="right" label="查看" width="120">
              <template slot-scope="scope">
                <el-button @click.native.prevent="check(scope)" type="text" size="small">全部</el-button>
                <el-button @click.native.prevent="notSent(scope)" type="text" size="small">未发货</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            class="pagination"
            :page-size="order_list_size"
            :page-sizes="[5,10,20,50,100]"
            :total="order_list_total"
            layout="prev, pager, next, total, slot ,sizes"
            @size-change="orderListSizeChange"
            @current-change="orderListCurrentChange"
          ></el-pagination>
        </el-card>
      </el-col>
      <el-col style="margin-bottom:20px;" :xs="24" :sm="24" :md="24" :xl="24">
        <el-card shadow="hover">
          <span>{{check_type}}总数:{{order_check_total}}</span>
          <el-table :data="order_check_format" style="width: 100%" v-loading="order_check_loading">
            <el-table-column prop="code" label="编号" width="180"></el-table-column>
            <el-table-column prop="XS" label="XS"></el-table-column>
            <el-table-column prop="S" label="S"></el-table-column>
            <el-table-column prop="M" label="M"></el-table-column>
            <el-table-column prop="L" label="L"></el-table-column>
            <el-table-column prop="XL" label="XL"></el-table-column>
            <el-table-column prop="2XL" label="2XL"></el-table-column>
            <el-table-column prop="3XL" label="3XL"></el-table-column>
            <el-table-column prop="4XL" label="4XL"></el-table-column>
            <el-table-column prop="5XL" label="5XL"></el-table-column>
            <el-table-column prop="6XL" label="6XL"></el-table-column>
            <el-table-column prop="ADULT" label="ADULT"></el-table-column>
            <el-table-column prop="YOUTH" label="YOUTH"></el-table-column>
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
  name: "FactoryOrders",
  data() {
    return {
      fileList: [],
      order_list_size: 5,
      order_list_total: 0,
      order_list_current: 1,
      order_list_loading: false,
      order_list: [],
      order_check: [],
      order_check_total: 0,
      order_check_loading: false,
      check_type:""
    };
  },
  methods: {
    xlxsChange(file, fileList) {
      let url = file.url;
      console.log(file);
      var reader = new FileReader();
      let $t = this;
      reader.onload = function(e) {
        var data = e.target.result;
        if ($t.rABS) {
          $t.wb = XLSX.read(btoa(this.fixdata(data)), {
            // 手动转化
            type: "base64"
          });
        } else {
          $t.wb = XLSX.read(data, {
            type: "binary"
          });
        }
        let json = XLSX.utils.sheet_to_json($t.wb.Sheets[$t.wb.SheetNames[0]]);
        $t.submitExcel(file.name.replace(/\.xlsx$/, ""), json);
      };
      if (this.rABS) {
        reader.readAsArrayBuffer(file.raw);
      } else {
        reader.readAsBinaryString(file.raw);
      }
    },
    fixdata: function(data) {
      // 文件流转BinaryString
      var o = "";
      var l = 0;
      var w = 10240;
      for (; l < data.byteLength / w; ++l) {
        o += String.fromCharCode.apply(
          null,
          new Uint8Array(data.slice(l * w, l * w + w))
        );
      }
      o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
      return o;
    },
    submitExcel(name, json) {
      let key = this.$store.state.user.key;
      let json_string = JSON.stringify(json);
      Util.cRequest(
        this,
        "/factory/order/in",
        { key, name, json: json_string },
        data => {
          if (data && data.result && data.result.affectedRows > 0) {
            this.getOrderList();
          } else {
            Util.showTip(this, "warning", "导入失败！请检查表格！");
          }
        }
      );
    },
    getOrderList() {
      this.order_list_loading = true;
      let key = this.$store.state.user.key;
      let current_page = this.order_list_current;
      let page_size = this.order_list_size;
      Util.cRequest(
        this,
        "/factory/order/list",
        { current_page, page_size, key },
        data => {
          if (data && data.result && data.result.length > 0) {
            this.order_list = data.result;
            this.order_list_total = data.result[0].total;
          }
          this.order_list_loading = false;
        }
      );
    },
    orderListSizeChange(page_size) {
      this.order_list_size = page_size;
      this.getOrderList();
    },
    orderListCurrentChange(current) {
      this.order_list_current = current;
      this.getOrderList();
    },
    check(item) {
      let id = item.row.id;
      let key = this.$store.state.user.key;
      this.order_check_loading = true;
      Util.cRequest(this, "/factory/order/check", { id, key }, data => {
        if (data && data.result && data.result.length > 0) {
          this.order_check = data.result;
          this.order_check_total = this.order_check.length;
          this.check_type = "全部";
        } else {
          this.order_check = [];
          this.order_check_total = 0;
          this.check_type = "";
        }
        this.order_check_loading = false;
      });
    },
    notSent(item) {
      let id = item.row.id;
      let key = this.$store.state.user.key;
      this.order_check_loading = true;
      Util.cRequest(this, "/factory/order/notsent", { id, key }, data => {
        if (data && data.result && data.result.length > 0) {
          this.order_check = data.result;
          this.order_check_total = this.order_check.length;
          this.check_type = "未发";
        } else {
          this.order_check = [];
          this.order_check_total = 0;
          this.check_type = "";
        }
        this.order_check_loading = false;
      });
    },
    downloadMb() {
      saveAs(
        CONST.ip + "/uploads/工厂导单模版.xlsx",
        "工厂导单模版.xlsx"
      );
    }
  },
  mounted() {
    this.getOrderList();
  },
  watch: {},
  computed: {
    order_check_format() {
      let a = [];
      let have = [];
      for (const key in this.order_check) {
        if (this.order_check.hasOwnProperty(key)) {
          const element = this.order_check[key];
          const code = element["code"];
          const size = element["size"];
          if (have.indexOf(code) < 0) {
            have.push(code);
            a.push({
              code
            });
          }
          let index = have.indexOf(code);
          a[index][size] = a[index][size] ? a[index][size] + 1 : 1;
        }
      }
      return a;
    }
  }
};
</script>
