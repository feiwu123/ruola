<template>
  <div class="customer-wrap">
    <el-container class="outest-container">
      <el-header class="header">
        <top-nav></top-nav>
      </el-header>
      <el-container>
        <el-main class="main-wrap">
          <el-card shadow="hover">
            <el-alert
              title="It's for new orders. And order number without '#' may could be found."
              type="info"
            ></el-alert>
            <el-input
              class="order-no"
              placeholder="INPUT YOUR ORDER NUMBER"
              v-model="order_number"
              clearable
            ></el-input>
            <el-button @click="_selectRemoteMethod">FIND</el-button>
          </el-card>
          <el-card
            v-if="order_info.orderno"
            shadow="hover"
            style="font-size:16px; color: #999;margin-top: 10px;"
          >
            <p class="order-info-item no">{{order_info.no}} NO. {{order_info.orderno}}</p>
            <div class="order-info-item" v-for="(item,i) in order_info.details" :key="i">
              <i class="el-icon-time cgreen" style="margin-right: 3px;"></i>
              {{item.track_occur_date}}
              <i
                class="el-icon-location cgreen"
                v-if="item.track_location"
                style="margin-left:16px;margin-right: 3px;"
              ></i>
              {{item.track_location}}
              <i
                class="el-icon-circle-check cgreen"
                style="margin-left:16px;margin-right: 3px;"
              ></i>
              {{item.track_description_en}}
            </div>
          </el-card>

          <el-card shadow="hover" style="margin-top:10px;width: 50%;float: left;">
            <el-table
              :data="table.data"
              :default-sort="{prop: 'date', order: 'descending'}"
              @sort-change="sortChange"
              style="width: 100%"
              v-loading="table.loading"
            >
              <el-table-column sortable="custom" fixed prop="date" label="Date"></el-table-column>
              <el-table-column fixed="right" label="Operation" width="100">
                <template slot-scope="scope">
                  <el-button @click.native.prevent="Check(scope.row)" type="text" size="small">CHECK</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              class="pagination"
              :page-size="table.page_size"
              :page-sizes="[10,20,50,100]"
              :total="table.total"
              layout="prev, pager, next, total, slot ,sizes"
              @size-change="sizeChange"
              @current-change="currentChange"
              
            ></el-pagination>
          </el-card>
          <el-card
            shadow="hover"
            style="margin-top:10px;width: calc(50% - 20px);float: left;margin-left:20px;"
            v-if="date_order_id"
          >
            <p class="order-info-item no">DATE. {{date_order_date}}</p>
            <el-button @click="exportOut" style="float:right;">EXPORT SHIPPED</el-button>
            <el-table
              :data="date_order.data"
              :default-sort="{prop: 'no', order: 'ascending'}"
              style="width: 100%"
              v-loading="date_order.loading"
            >
              <el-table-column fixed prop="no" label="No."></el-table-column>
              <el-table-column
                prop="_print"
                label="STATE"
                width="180"
                :filters="[{ text: 'SHIPPING', value: 1 }, { text: 'IN PRODUCTION', value: 0 }]"
                :filter-method="filterIsSending"
                filter-placement="bottom-end"
              >
                <template slot-scope="scope">
                  <el-tag
                    :type="scope.row._print > 0 ? 'success' : 'primary'"
                    disable-transitions
                  >{{scope.row._print > 0 ? 'SHIPPING' : 'IN PRODUCTION'}}</el-tag>
                </template>
              </el-table-column>
              <el-table-column fixed="right" label="Operation" width="100">
                <template slot-scope="scope">
                  <el-button
                    @click.native.prevent="CheckNo(scope.row)"
                    type="text"
                    size="small"
                  >CHECK</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              class="pagination"
              :page-size="date_order.page_size"
              :page-sizes="[50,100,1000]"
              :total="date_order.total"
              layout="prev, pager, next, total, slot ,sizes"
              @size-change="sizeChangeForDateOrder"
              @current-change="currentChangeForDateOrder"
            ></el-pagination>
          </el-card>
        </el-main>
        <el-footer>
          <footer-c></footer-c>
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<style lang="scss" scoped>
.header {
  padding: 0;
}
.order-no {
  width: 300px;
  margin-top: 10px;
}
.cgreen {
  color: #23c6c8;
}
.order-info-item {
  padding: 10px 0;
}
.no {
  font-size: 20px;
  color: #666;
}
</style>

<script>
import Util from "../assets/Util";
import CONST from "../assets/CONST";
import Encryption from "../assets/Encryption";
import Footer from "./Footer";
import TopNav from "./TopNav";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
import XLSX from "xlsx";
locale.use(lang);
let { encryptRsa, decryptRsa, pwdEncrypt } = Encryption;
export default {
  name: "customer-home",
  data() {
    return {
      order_number: "",
      order_info: {
        no: "",
        country: "",
        details: [],
        orderno: ""
      },
      table: {
        prop: "default",
        order: "ascending", //ascending or descending
        page_size: 5,
        current_page: 1,
        loading: false,
        data: [],
        total: 0
      },
      date_order_id: "",
      date_order_date: "",
      date_order:{
        prop: "default",
        order: "ascending", //ascending or descending
        page_size: 50,
        current_page: 1,
        loading: false,
        data: [],
        total: 0
      },
      rule: {
        arr: "",
        _regexp: ""
      }
    };
  },
  components: {
    "footer-c": Footer,
    "top-nav": TopNav
  },
  methods: {
    _selectRemoteMethod() {
      this.selectRemoteMethod();
    },
    selectRemoteMethod(_no) {
      let key = this.$store.state.customer.key;
      let no = this.order_number;
      if (_no) {
        no = _no;
      }
      if (no) {
        no = no.replace("#", "");
      }
      Util.cRequest(this, "/customer/order/info/single", { no, key }, data => {
        switch (data.service_code) {
          case CONST.CUSTOMER_ORDER_INFO_SINGLE:
            if (data.result && data.result[0]) {
              let details = data.result[0].data[0].details;
              this.order_info.orderno = data.result[0].data[0].server_hawbcode;
              this.order_info.no = no;
              this.order_info.country =
                data.result[0].data[0].destination_country;
              this.order_info.details = details;
            } else {
              Util.showTip(this, "warning", "No logistics status information.");
            }
            break;
          default:
            Util.showTip(this, "warning", "UNKNOW ERROR!");
            break;
        }
      });
    },
    findOrderInfo() {
    },
    sortChange({ order, prop }) {
      this.table.prop = prop;
      this.table.order = order;
      this.requestData();
    },
    sortChangeForDateOrder({ order, prop }) {
      this.date_order.prop = prop;
      this.date_order.order = order;
      this.requestDateOrderData();
    },
    sizeChangeForDateOrder(page_size) {
      this.date_order.page_size = page_size;
      this.requestDateOrderData();
    },
    sizeChange(page_size) {
      this.table.page_size = page_size;
      this.requestData();
    },
    currentChange(current_page) {
      this.table.current_page = current_page;
      this.requestData();
    },
    currentChangeForDateOrder(current_page) {
      this.date_order.current_page = current_page;
      this.requestDateOrderData();
    },
    requestData() {
      this.table.loading = true;
      let { current_page, order, page_size, prop } = this.table;
      let key = this.$store.state.customer.key;

      Util.cRequest(
        this,
        "/customer/dateorder/list",
        { current_page, order, page_size, prop, key },
        data => {
          this.table.loading = false;
          switch (data.service_code) {
            case CONST.CUSTOMER_DATE_ORDER_LIST:
              this.table.data = data.result;
              this.table.total = data.result[0] ? data.result[0].total : 0;
              if (this.table.total == 0) {
                this.table.data = [];
              }
              break;
            default:
              this.table.data = [];
              Util.showTip(this, "warning", "UNKNOW ERROR!");
              break;
          }
        }
      );
    },
    getRule() {
      let key = this.$store.state.customer.key;
      Util.cRequest(this, "/customer/rule/get", { key }, data => {
        switch (data.service_code) {
          case CONST.CUSTOMER_RULE_GET:
            if (data.result && data.result[0]) {
              this.rule.arr = data.result[0].array;
              this.rule._regexp = data.result[0]._regexp;
            } else {
              Util.showTip(
                this,
                "warning",
                "YOU HAVE NO RULE.IT MEANS YOU COULD NOT SEE YOUR ORDER'S PICTURE."
              );
            }
            break;
          default:
            Util.showTip(this, "warning", "UNKNOW ERROR!");
            break;
        }
      });
    },
    Check(row) {
      this.date_order_id = row.id;
      this.date_order_date = row.date;
      this.requestDateOrderData();
    },
    requestDateOrderData() {
      this.date_order.loading = true;
      let { current_page, order, page_size, prop } = this.date_order;
      let key = this.$store.state.customer.key;
      let id = this.date_order_id;
      Util.cRequest(
        this,
        "/customer/dateorder/items",
        { id,current_page, order, page_size, prop, key },
        data => {
          this.date_order.loading = false;
          switch (data.service_code) {
            case CONST.CUSTOMER_DATE_ORDER_ITEMS:
              this.date_order.data = data.result;
              this.date_order.total = data.result[0] ? data.result[0].total : 0;
              if (this.date_order.total == 0) {
                this.date_order.data = [];
              }
              break;
            default:
              this.date_order.data = [];
              Util.showTip(this, "warning", "UNKNOW ERROR!");
              break;
          }
        }
      );
    },
    CheckNo(row) {
      this.selectRemoteMethod(row.no);
    },
    filterIsSending(value, row) {
      if(value) {
        return row._print > 0;
      }
      return row._print < 1;
    },
    exportOut() {
      let key = this.$store.state.customer.key;
      let id = this.date_order_id;
      Util.cRequest(
        this,
        "/customer/dateorder/items/all",
        { id, key },
        data => {
          switch (data.service_code) {
            case CONST.CUSTOMER_DATE_ORDER_ITEMS_ALL:
              this.excelOut(data.result)
              break;
            default:
              Util.showTip(this, "warning", "UNKNOW ERROR!");
              break;
          }
        }
      );
    },
    excelOut(json){
      var workbook = XLSX.utils.book_new();
      var ws = XLSX.utils.json_to_sheet(json, { header: ["no","time"] });
      XLSX.utils.book_append_sheet(workbook, ws, "SHIPPING");
      var wopts = { bookType: "xlsx", bookSST: false, type: "array" };
      let wbout = XLSX.write(workbook, wopts);
      saveAs(
        new Blob([wbout], { type: "application/octet-stream" }),
        "SHIPPING ORDERS.xlsx"
      );
    }
  },
  mounted() {
    this.getRule();
  }
};
</script>
