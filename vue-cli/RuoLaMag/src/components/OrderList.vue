<template>
  <div class="upload-mag">
    <el-button @click="uploadSS">播种筐导出</el-button>
    <el-button @click="uploadSSFiveDay">播种筐5天以上未清导出</el-button>
    <el-button @click="uploadSSTenDay">播种筐10天以上未清导出</el-button>
    <el-button @click="uploadSeedToday">当天扫码导出</el-button>
    <el-card shadow="hover" v-if="false">
      <el-select
        class="user-select"
        v-model="user_select.value"
        filterable
        remote
        reserve-keyword
        placeholder="请输入客户邮箱地址"
        :remote-method="selectRemoteMethod"
        :loading="user_select.loading"
      >
        <el-option
          v-for="item in user_select.select"
          :key="item.account"
          :label="item.name+':'+item.account"
          :value="item.id"
        ></el-option>
      </el-select>
      <el-button @click="selectCustomer" v-show="user_select.value">绑定客户</el-button>
    </el-card>
    <el-tabs v-model="showBlock" type="card" style="margin-top:40px;">
      <el-tab-pane label="订单查看" name="first">
        <el-row class="content" :gutter="20">
          <el-col class="bind-list" :xs="24" :sm="24" :md="12">
            <el-card shadow="hover">
              <el-table :data="customer_data" style="width: 100%" v-loading="loading">
                <el-table-column prop="name" label="姓名" width="120"></el-table-column>
                <el-table-column prop="account" label="邮箱"></el-table-column>
                <el-table-column :label="'操作'" width="120">
                  <template slot-scope="scope">
                    <el-button
                      @click.native.prevent="showUpload(scope.$index)"
                      type="text"
                      size="small"
                    >选择</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
          <el-col v-show="operation_customer.name" :xs="24" :sm="24" :md="12">
            <el-card shadow="hover" v-if="operation_customer.name">
              <p style="color: #333;font-size:20px;">客户：{{operation_customer.account}}</p>
              <el-table
                :data="Orders.data"
                :default-sort="{prop: 'time', order: 'descending'}"
                @sort-change="sortChange"
                style="width: 100%"
                v-loading="Orders.loading&&upload_loading"
              >
                <el-table-column sortable="custom" fixed prop="time" label="时间" width="160"></el-table-column>
                <el-table-column prop="price" label="总金额" width="80"></el-table-column>
                <el-table-column prop="_describe" label="备注"></el-table-column>
                <el-table-column fixed="right" prop="state" label="状态" width="80">
                  <template slot-scope="scope">
                    <el-tag
                      :type="scope.row.state == 0 ? 'primary' : 'success'"
                      disable-transitions
                    >{{scope.row.state == 0 ? '未模拟' : '已模拟'}}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column fixed="right" label="操作" width="60">
                  <template slot-scope="scope">
                    <el-button
                      @click.native.prevent="check(scope.row)"
                      type="text"
                      size="small"
                      v-if="scope.row.state != 0"
                    >查看</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-pagination
                class="pagination"
                :page-size="Orders.page_size"
                :page-sizes="[5,10,20,50,100]"
                :total="Orders.total"
                layout="prev, pager, next, total, slot ,sizes"
                @size-change="sizeChange"
                @current-change="currentChange"
              ></el-pagination>
            </el-card>
          </el-col>
        </el-row>
        <el-dialog title="申报结果" :visible.sync="dialog_for_up_result">
          <el-button
            class="button"
            @click="downloadNoSendingFile"
            style="float:right;margin-right:20px;"
          >导出(缺货表)</el-button>
          <!-- <el-button
          class="button"
          @click="downloadNoTransferFile"
          style="float:right;margin-right:20px;"
          >导出(热转印缺货表)</el-button>-->
          <el-table :data="up_result_data">
            <el-table-column property="no" label="包裹号(no)" width="100" fixed="left"></el-table-column>
            <el-table-column property="transfer" label="已印花"></el-table-column>
            <el-table-column property="content" label="需求"></el-table-column>
            <el-table-column property="needcount" label="需求数量" width="80"></el-table-column>
            <el-table-column property="label" label="播种框编号" width="80"></el-table-column>
            <el-table-column property="quantity" label="数量" width="80"></el-table-column>
            <el-table-column
              prop="_result"
              label="状态"
              width="80"
              fixed="right"
              :filters="[{ text: '已发', value: 1 }, { text: '未发', value: 0 }]"
              :filter-method="filterIsSending"
              filter-placement="bottom-end"
            >
              <template slot-scope="scope">
                <el-tag
                  :type="scope.row._print > 0 ? 'success' : 'primary'"
                  disable-transitions
                >{{scope.row._print > 0 ? '已发' : '未发'}}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-dialog>
      </el-tab-pane>
      <el-tab-pane label="发货表" name="second">
        <order-car></order-car>
      </el-tab-pane>
      <el-tab-pane label="缺货表" name="third">
        <out-put-width-time></out-put-width-time>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<style lang="scss" scoped>
.el-col {
  transition: 0.3s all;
}
.el-card {
  transition: 0.3s all;
}
.pagination {
  text-align: center;
}
.user-select {
  width: 300px;
}
.sure-btn {
  margin-top: 20px;
}
.upload-btn {
  margin-top: 10px;
  margin-bottom: 40px;
  float: left;
}
.ipt-img-select {
  display: none;
}
.price-ipt {
  margin-bottom: 10px;
}
.describe-ipt {
  margin-bottom: 10px;
}
.col-img {
  width: 100%;
}
#print {
  font-size: 12px;
}
@media print {
  #print {
    width: 1000px;
  }
}
.single_up_wc {
  position: absolute;
  top: 30px;
  left: 40px;
  background-color: #fff;
  z-index: 999999;
  width: 590px;
  padding-bottom: 20px;

  .single_up_wc_inner_item_wrap {
    float: left;
    width: 250px;
    margin-right: 20px;
  }
}
.single_up_wc .el-input {
  margin-top: 3px;
  margin-bottom: 3px;
  width: 250px;
}
.order {
  transition: 0.3s all;
  border-bottom: 1px solid #ddd;
  margin-top: 20px;
  padding-bottom: 20px;
}
.ordershow {
  height: auto;
}
.ordernotshow {
  height: 30px;
  // border-radius: 3px;
}
.output {
  transition: 0.3s all;
  border-bottom: 1px solid #ddd;
  margin-top: 20px;
  padding-bottom: 10px;
}
.outputshow {
}
.outputnotshow {
}

.stockout {
  transition: 0.3s all;
  border-bottom: 1px solid #ddd;
  margin-top: 20px;
  padding-bottom: 10px;
}
.stockoutshow {
}
.stockoutnotshow {
}
</style>
<style lang="scss">
.upload-mag {
  .bind-list .el-card__body {
    padding: 0;
  }
  .el-card {
    margin-top: 20px;
  }
  .el-textarea {
    height: auto;
  }
  .lb-for-img {
    cursor: pointer;
  }
  .cell {
    padding-right: 0;
    word-break: break-all !important;
    text-overflow: normal !important;
    white-space: normal !important;
  }
}
</style>

<script>
import CONST from "../assets/CONST";
import Util from "../assets/Util";
import Encryption from "../assets/Encryption";
import XLSX from "xlsx";
import saveAs from "file-saver";
import "../assets/jQuery.print.min.js";
import moment from "moment";
import OrderOutputCarVue from "./OrderOutputCar";
import OutputWidthTimeVue from "./OutputWidthTime";
export default {
  name: "UploadMag",
  data() {
    return {
      showBlock: "first",
      CONST: CONST,
      HOST: CONST.HOST,
      Rsa: Encryption.encryptRsa,
      loading: false,
      customer_data: [],
      Files: [],
      user_select: {
        loading: false,
        select: [],
        value: ""
      },
      operation_customer: {},
      regexp_ipt: "",
      array_ipt: "",
      edit_rule: false,
      upload_loading: false,
      RuleImg: `png`,
      label_for_img_select: "Select Folder",
      Orders: {
        data: [],
        prop: "time",
        order: "ascending", //ascending or descending
        page_size: 5,
        current_page: 1,
        loading: false,
        total: 0
      },
      FileDefaultName: "excel.xlsx",
      fullscreenLoading: false, // 加载中
      excel_param: {
        id: "",
        key: "",
        price: "",
        _describe: ""
      },
      excelData: [],
      excelTitle: [],
      excelDataNoChange: [],
      order_table_width: undefined,
      img_progress: 0,
      img_progress_show: false,
      isProduction: false,
      download_excel_loading: false,

      dialog_for_up_result: false,
      up_result_data: [],
      dialog_for_up_result_up_once: false,
      show_result_row: {},
      single_up_wc: {
        id: "",
        no: "",
        method: "",
        weight: "",
        countrycode: "",
        province: "",
        city: "",
        name: "",
        postcode: "",
        street: "",
        telephone: "",
        enname: "",
        cnname: "",
        content: ""
      },
      create_barcode_show: false,
      create_barcode_loading: false,
      create_qrcode_loading: false,

      ordershow: false,
      outputshow: false,
      stockoutshow: false
    };
  },
  methods: {
    requestData() {
      this.loading = true;
      let key = this.$store.state.user.key;
      Util.cRequest(this, "/customer/all/havebind", { key }, data => {
        switch (data.service_code) {
          case CONST.CUSTOMER_HAVE_BIND_LIST:
            this.customer_data = data.result;
            break;
          default:
            this.customer_data = [];
            Util.showTip(this, "warning", "UNKNOW ERROR!");
            break;
        }
      });
    },
    uploadFiles() {
      if (!this.regexp_ipt || !this.array_ipt) {
        this.showTip("CREATE RULE FIRST PLEASE!");
        return;
      }
      var fd = new FormData();
      fd.append("key", Encryption.encryptRsa(this.$store.state.user.key));
      fd.append("id", Encryption.encryptRsa(this.operation_customer.id));
      fd.append("_regexp", Encryption.encryptRsa(this.regexp_ipt));
      fd.append("array", Encryption.encryptRsa(this.array_ipt));
      for (var i = 0; i < this.Files.length; i++) {
        fd.append("file", this.Files[i]);
      }
      this.img_progress_show = true;
      this.$http
        .post(this.HOST + "/order/upload/imgs", fd, {
          uploadProgress: e => {
            if (e.lengthComputable) {
              var percent = Math.floor((e.loaded / e.total) * 100);
              this.img_progress = percent;
              if (this.img_progress >= 100) {
                this.img_progress_show = false;
              }
            }
          }
        })
        .then(
          function(res) {
            res.json().then(result => {
              this.result = result.info;
            });
          },
          function(res) {}
        );
    },
    changeFile(event) {
      this.Files = event.target.files;
      this.percentage = 0;
    },
    selectRemoteMethod(query) {
      if (query == "") {
        this.user_select.select = [];
        return;
      }
      this.user_select.loading = true;
      let key = this.$store.state.user.key;

      Util.cRequest(this, "/customer/query", { query, key }, data => {
        switch (data.service_code) {
          case CONST.CUSTOMER_QUERY:
            this.user_select.select = data.result;
            break;
          default:
            this.user_select.select = [];
            Util.showTip(this, "warning", "UNKNOW ERROR!");
            break;
        }
        this.user_select.loading = false;
      });
    },
    selectCustomer() {
      let c_id = this.user_select.value;
      let key = this.$store.state.user.key;
      Util.cRequest(this, "/customer/choose", { key, c_id }, data => {
        switch (data.service_code) {
          case CONST.CUSTOMER_BIND:
            this.requestData();
            Util.showTip(this, "success", "BIND SUCCESSFULLY!");
            break;
          default:
            Util.showTip(this, "warning", "UNKNOW ERROR!");
            break;
        }
      });
    },
    unbindingCustomer(i) {},
    showUpload(i) {
      this.create_barcode_show = false;
      this.operation_customer = this.customer_data[i];
      this.excel_param.id = Encryption.encryptRsa(this.operation_customer.id);
      this.excel_param.key = Encryption.encryptRsa(this.$store.state.user.key);
      this.getRule();
      this.requestOrdersData();
    },
    updateRule() {
      let key = this.$store.state.user.key;
      let regexp = this.regexp_ipt;
      let array = this.array_ipt;
      if (!regexp || !array) {
        Util.showTip(this, "warning", "INPUT BOTH REGEXP AND ARRAY!");
        return;
      }
      let id = this.operation_customer.id;
      Util.cRequest(
        this,
        "/order/upload/rule/update",
        { key, regexp, array, id },
        data => {
          switch (data.service_code) {
            case CONST.ORDER_UPDATE_RULE:
              Util.showTip(this, "success", "UPDATE SUCCESSFULLY!");
              break;
            default:
              Util.showTip(this, "warning", "UNKNOW ERROR!");
              break;
          }
        }
      );
    },
    getRule() {
      this.upload_loading = true;
      let key = this.$store.state.user.key;
      let id = this.operation_customer.id;
      Util.cRequest(this, "/order/upload/rule/get", { key, id }, data => {
        switch (data.service_code) {
          case CONST.ORDER_GET_RULE:
            this.regexp_ipt = data.result[0]._regexp;
            this.array_ipt = data.result[0].array;
            break;
          default:
            Util.showTip(this, "warning", "RULE GET UNKNOW ERROR!");
            break;
        }
        this.upload_loading = false;
      });
    },
    surePaid() {},
    //翻页
    sortChange({ order, prop }) {
      this.Orders.prop = prop;
      this.Orders.order = order;
      this.requestOrdersData();
    },
    sizeChange(page_size) {
      this.Orders.page_size = page_size;
      this.requestOrdersData();
    },
    currentChange(current_page) {
      this.Orders.current_page = current_page;
      this.requestOrdersData();
    },
    requestOrdersData() {
      this.Orders.loading = true;
      let { current_page, order, page_size, prop } = this.Orders;
      let key = this.$store.state.user.key;
      let id = this.operation_customer.id;
      Util.cRequest(
        this,
        "/order/list",
        { current_page, order, page_size, prop, key, id },
        data => {
          switch (data.service_code) {
            case CONST.ORDER_LIST:
              this.Orders.data = data.result;
              this.Orders.total = data.result[0] ? data.result[0].total : 0;
              break;
            default:
              this.Orders.data = [];
              Util.showTip(this, "warning", "UNKNOW ERROR!");
              break;
          }
          this.Orders.loading = false;
        }
      );
    },
    //upload excel
    showTip: function(message, type) {
      Util.showTip(this, type, message);
    },
    handleRemove(file, fileList) {},
    handlePreview(file) {},
    handleExceed(files, fileList) {
      this.$message.warning(
        `当前限制选择 1 个文件，本次选择了 ${
          files.length
        } 个文件，共选择了 ${files.length + fileList.length} 个文件`
      );
    },
    beforeUpload(file) {
      this.fullscreenLoading = true;
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`);
    },
    onUploadSuccess(res, file, fileList) {},
    importExcel: function(file, fileList) {
      if (!file) {
        this.fullscreenLoading = false;
        return;
      }
      this.requestOrdersData();
    },
    priceChange() {
      this.excel_param.price = (
        this.excel_param.price
          .replace(/[^0-9\.]/g, "")
          .replace(/^\./, "0.")
          .replace(/^([0-9]+\.[0-9]*)([0-9\.]*)/, "$1") / 1
      ).toFixed(2);
    },
    checkOrderDetial(i) {
      this.isProduction = false;
      this.getFile(i);
      this.create_barcode_show = true;
    },

    analyzeData: function(data) {
      return data;
    },
    dealFile: function(_data, changeJson) {
      let data = _data;

      // 处理导入的数据
      this.excelTitle = [];

      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const element = data[key];
          element["Image"] = `${CONST.UPLOADS_IMGS_HOSTS +
            this.operation_customer.id +
            "/" +
            this.getUrl(element["SKU"])}`.toLowerCase();
        }
      }
      this.excelDataNoChange = JSON.parse(JSON.stringify(data));
      if (changeJson) {
        data = changeJson(_data);
      }
      for (const key in data[0]) {
        if (data[0].hasOwnProperty(key)) {
          this.excelTitle.push(key);
        }
      }
      this.fullscreenLoading = false;
      if (data.length <= 0) {
        this.showTip("NO DATA!", "warning");
      } else {
        this.excelData = data;
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
    getFile: function(i, changeJson) {
      this.operation_order = this.Orders.data[i];
      this.$http({
        method: "get",
        url:
          CONST.SOURCE_HOST +
          "/uploads/excels/" +
          this.Orders.data[i].excel_name,
        responseType: "arraybuffer"
      })
        .then(res => {
          let blob = new Blob([res.data], { type: "" });
          let objectUrl = URL.createObjectURL(blob);
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
            let json = XLSX.utils.sheet_to_json(
              $t.wb.Sheets[$t.wb.SheetNames[0]]
            );
            $t.dealFile($t.analyzeData(json), changeJson); // analyzeData: 解析导入数据
          };
          if (this.rABS) {
            reader.readAsArrayBuffer(blob);
          } else {
            reader.readAsBinaryString(blob);
          }
        })
        .catch(error => {});
    },
    getUrl(sku) {
      return Util.getUrlWidthRules(this.regexp_ipt, this.array_ipt, sku);
    },
    createBarCode() {
      this.create_barcode_loading = true;
      let arr = [];
      for (let i = 0; i < this.excelData.length; i++) {
        const element = this.excelData[i];
        arr.push(element["no"]);
      }
      if (arr.length == 0) {
        this.create_barcode_loading = false;
        Util.showTip(this, "warning", "请确保excel中包含'no'列，即包裹号!");
        return;
      }
      let json = JSON.stringify(arr);
      let fd = new FormData();
      let key = this.$store.state.user.key;
      key = Encryption.encryptRsa(key);
      json = Encryption.encryptRsa(json);
      fd.append("json", json);
      fd.append("key", key);
      this.$http
        .post(CONST.HOST + "/order/mbarcode", fd, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          ...CONST.SESSION_CONFIG_CROS
        })
        .then(res => {
          let data = Util.decryptResponse(res);

          this.create_barcode_loading = false;
          switch (data.service_code) {
            case CONST.CREATE_BARCODE:
              Util.showTip(this, "success", "条码创建成功，可以下载发货表!");
              break;
            default:
              Util.showTip(this, "warning", "UNKNOW ERROR!");
              break;
          }
        })
        .catch(error => {});
    },
    createQrCode() {
      this.create_qrcode_loading = true;
      let arr = [];
      for (let i = 0; i < this.excelData.length; i++) {
        const element = this.excelData[i];
        arr.push(element["SKU"]);
      }
      if (arr.length == 0) {
        this.create_barcode_loading = false;
        Util.showTip(this, "warning", "请确保excel中包含'SKU'列!");
        return;
      }
      let json = JSON.stringify(arr);
      let fd = new FormData();
      let key = this.$store.state.user.key;
      key = Encryption.encryptRsa(key);
      json = Encryption.encryptRsa(json);
      fd.append("json", json);
      fd.append("key", key);
      this.$http
        .post(CONST.HOST + "/order/mqrcode", fd, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          ...CONST.SESSION_CONFIG_CROS
        })
        .then(res => {
          let data = Util.decryptResponse(res);

          this.create_qrcode_loading = false;
          switch (data.service_code) {
            case CONST.CREATE_QRCODE:
              Util.showTip(this, "success", "二维码创建成功!");
              break;
            default:
              Util.showTip(this, "warning", "UNKNOW ERROR!");
              break;
          }
        })
        .catch(error => {});
    },
    imgError(e, i) {
      this.excelData[i]["Image"] = this.excelData[i]["Image"].replace(
        /\/[^\/\.]+\.(jpeg|png|jpg)$/,
        "/front.$1"
      );
    },
    createProduction(i) {
      this.create_barcode_show = false;
      this.getFile(i, this.changeJson);
    },
    changeJson(data) {
      this.isProduction = true;
      let already = [];
      let re = [];
      const reg = /[_|-|-]{1}([xsml23456]+)$/i;
      let total = 0;
      for (let i = 0; i < data.length; i++) {
        let element = data[i];
        let sku = element["SKU"];
        if (sku) sku = sku.replace(/\s/g, "");
        if (!sku) {
          continue;
        } else if (!reg.exec(sku)) {
          sku = sku.replace(/\s/g, "");
          already.push("[error]" + sku);
          re.push({
            code: "[error]" + sku,
            Image: element["Image"],
            other: element["Quantity"],
            xs: 0,
            s: 0,
            m: 0,
            l: 0,
            xl: 0,
            "2xl": 0,
            "3xl": 0,
            "4xl": 0,
            "5xl": 0,
            "6xl": 0
          });
          continue;
        }
        let code = sku.replace(/\s/g, "").replace(reg, "");
        let q = element["Quantity"] ? parseInt(element["Quantity"]) : 0;
        total += q;
        let _index = already.indexOf(code);
        let size = "";
        try {
          size = reg.exec(sku)[1].toLowerCase();
        } catch (error) {
          continue;
        }
        let match = {
          xs: "xs",
          s: "s",
          m: "m",
          l: "l",
          xl: "xl",
          xxl: "2xl",
          "2xl": "2xl",
          xxxl: "3xl",
          "3xl": "3xl",
          xxxxl: "4xl",
          "4xl": "4xl",
          xxxxxl: "5xl",
          "5xl": "5xl",
          xxxxxxl: "6xl",
          "6xl": "6xl"
        };
        if (_index > -1) {
          re[_index][match[size]] += q;
        } else {
          already.push(code);
          re.push({
            code,
            Image: element["Image"],
            other: 0,
            xs: 0,
            s: 0,
            m: 0,
            l: 0,
            xl: 0,
            "2xl": 0,
            "3xl": 0,
            "4xl": 0,
            "5xl": 0,
            "6xl": 0
          });
          re[re.length - 1][match[size]] += q;
        }
      }
      re.sort((a, b) => (a.code > b.code ? -1 : 1));
      re[0].total = total;
      return re;
    },
    downloadFile() {
      var workbook = XLSX.utils.book_new();
      let ws1 = XLSX.utils.table_to_sheet(
        document.querySelector("#print .el-table__header")
      );
      let ws2 = XLSX.utils.table_to_sheet(
        document.querySelector("#print .el-table__body-wrapper")
      );
      XLSX.utils.book_append_sheet(workbook, ws1, "表头");
      XLSX.utils.book_append_sheet(workbook, ws2, "内容");
      var wopts = { bookType: "xlsx", bookSST: false, type: "array" };
      let wbout = XLSX.write(workbook, wopts);
      saveAs(
        new Blob([wbout], { type: "application/octet-stream" }),
        "test.xlsx"
      );
    },
    downloadNoSendingFile() {
      var workbook = XLSX.utils.book_new();
      let a = [];
      for (const key in this.up_result_data) {
        if (this.up_result_data.hasOwnProperty(key)) {
          const element = this.up_result_data[key];
          if (element && element["no"] && element["_print"] == 0) {
            a.push({
              no: element["no"],
              label: element["label"],
              quantity: element["quantity"]
            });
          }
        }
      }
      var ws = XLSX.utils.json_to_sheet(a, { header: ["no"] });
      XLSX.utils.book_append_sheet(workbook, ws, "缺货表");
      var wopts = { bookType: "xlsx", bookSST: false, type: "array" };
      let wbout = XLSX.write(workbook, wopts);
      saveAs(
        new Blob([wbout], { type: "application/octet-stream" }),
        this.operation_customer.name + "缺货表.xlsx"
      );
    },
    downloadNoTransferFile() {
      var workbook = XLSX.utils.book_new();
      let a = [];
      for (const key in this.up_result_data) {
        if (this.up_result_data.hasOwnProperty(key)) {
          const element = this.up_result_data[key];
          if (element && element["no"] && element["_print"] == 0) {
            a.push({
              no: element["no"],
              label: element["label"],
              quantity: element["quantity"]
            });
          }
        }
      }
      var ws = XLSX.utils.json_to_sheet(a, { header: ["no"] });
      XLSX.utils.book_append_sheet(workbook, ws, "缺货表");
      var wopts = { bookType: "xlsx", bookSST: false, type: "array" };
      let wbout = XLSX.write(workbook, wopts);
      saveAs(
        new Blob([wbout], { type: "application/octet-stream" }),
        this.operation_customer.name + "缺货表.xlsx"
      );
    },
    orderCode() {
      this.excelData.sort((a, b) => {
        if (a.hasOwnProperty("code")) {
          return a.code
            .split("")
            .reverse()
            .join("") >
            b.code
              .split("")
              .reverse()
              .join("")
            ? -1
            : 1;
        } else if (a.hasOwnProperty("SKU")) {
          return a.SKU.split("")
            .reverse()
            .join("") >
            b.SKU.split("")
              .reverse()
              .join("")
            ? -1
            : 1;
        }
      });
    },
    orderCodeASC() {
      this.excelData.sort((a, b) => {
        if (a.hasOwnProperty("code")) {
          return a.code > b.code ? 1 : -1;
        } else if (a.hasOwnProperty("SKU")) {
          return a.SKU > b.SKU ? 1 : -1;
        }
      });
    },
    uploadFromServer() {
      this.download_excel_loading = true;
      let json = JSON.stringify(this.excelData);
      json = json ? json : "";
      json = json.replace(/\:0,/g, ':"",').replace(/\:0}/g, ':""}');
      let fd = new FormData();
      fd.append("json", json);
      this.$http
        .post(CONST.HOST + "/order/excel/production", fd, {
          responseType: "arraybuffer",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        })
        .then(res => {
          let blob = new Blob([res.data], { type: "" });
          let s = moment().format("YYYY-MM-DD HH.mm.ss");
          let name = "order_with_barcode" + s + ".xlsx";
          if (json.indexOf("code") > -1 && json.indexOf("total")) {
            name = "production_file" + s + ".xlsx";
          }
          saveAs(new Blob([blob], { type: "application/octet-stream" }), name);
          this.download_excel_loading = false;
        })
        .catch(error => {
          this.download_excel_loading = false;
        });
    },
    filterUpResult(value, row) {
      return row._result === value;
    },
    filterIsSending(value, row) {
      //value 0 未发 1 已发
      if (value) {
        return row._print - 0 > 0;
      }
      return row._print - 0 <= 0;
    },
    check(item) {
      this.wcUpResult(item);
    },
    wcUpResult(row) {
      this.show_result_row = row;
      let id = row.id;
      let key = this.$store.state.user.key;
      Util.cRequest(this, "/order/wc/up/result", { id, key }, data => {
        switch (data.service_code) {
          case CONST.WC_UP_RESULT:
            this.showUpResult(data.result, id);
            break;
          default:
            Util.showTip(this, "warning", "UNKNOW ERROR!");
            break;
        }
      });
    },
    showUpResult(data, id) {
      this.up_result_data = data;
      this.getTransferResult(id);
      for (const key in this.up_result_data) {
        if (this.up_result_data.hasOwnProperty(key)) {
          const element = this.up_result_data[key];
          element.re = JSON.parse(element.re);
          element.cnmessage = element.re.cnmessage;
          element._result = element.re.success;
        }
      }
      this.dialog_for_up_result = true;
    },
    getTransferResult(id) {
      let nos = [];
      for (const key in this.up_result_data) {
        if (this.up_result_data.hasOwnProperty(key)) {
          const element = this.up_result_data[key];
          nos.push(element["no"]);
          this.$set(element, "transfer", "");
        }
      }
      if (nos.length < 0) {
        return;
      }
      let s = JSON.stringify(nos);
      let key = this.$store.state.user.key;
      Util.cRequest(
        this,
        "/process/transfer/by/order/id",
        { key, id },
        data => {
          if (data && data["result"] && data["result"].length > 0) {
            let r = data["result"];
            for (const key in r) {
              if (r.hasOwnProperty(key)) {
                const element = r[key];
                const SKU = element["SKU"];
                const no = element["no"];
                let i = nos.indexOf(no);
                if (i > -1) {
                  this.up_result_data[i].transfer += "[" + SKU + "]";
                }
              }
            }
          }
        }
      );
    },
    uploadSS() {
      let key = this.$store.state.user.key;
      Util.cRequest(this, "/sort/box/info", { key }, data => {
        switch (data.service_code) {
          case CONST.BOX_ALL_INFO:
            var workbook = XLSX.utils.book_new();
            var ws = XLSX.utils.json_to_sheet(data.result);
            XLSX.utils.book_append_sheet(workbook, ws, "播种筐");
            var wopts = { bookType: "xlsx", bookSST: false, type: "array" };
            let wbout = XLSX.write(workbook, wopts);
            saveAs(
              new Blob([wbout], { type: "application/octet-stream" }),
              "播种筐.xlsx"
            );

            break;
          default:
            Util.showTip(this, "warning", "UNKNOW ERROR!");
            break;
        }
      });
    },
    uploadSSFiveDay() {
      let key = this.$store.state.user.key;
      Util.cRequest(this, "/sort/box/info/fivedays", { key }, data => {
        switch (data.service_code) {
          case CONST.BOX_FIVE_DAYS_INFO:
            var workbook = XLSX.utils.book_new();
            var ws = XLSX.utils.json_to_sheet(data.result);
            XLSX.utils.book_append_sheet(workbook, ws, "播种筐5天以上未清");
            var wopts = { bookType: "xlsx", bookSST: false, type: "array" };
            let wbout = XLSX.write(workbook, wopts);
            saveAs(
              new Blob([wbout], { type: "application/octet-stream" }),
              "播种筐5天以上未清.xlsx"
            );
            break;
          default:
            Util.showTip(this, "warning", "UNKNOW ERROR!");
            break;
        }
      });
    },
    uploadSSTenDay() {
      let key = this.$store.state.user.key;
      Util.cRequest(this, "/sort/box/info/tendays", { key }, data => {
        switch (data.service_code) {
          case CONST.BOX_TEN_DAYS_INFO:
            var workbook = XLSX.utils.book_new();
            var ws = XLSX.utils.json_to_sheet(data.result);
            XLSX.utils.book_append_sheet(workbook, ws, "播种筐10天以上未清");
            var wopts = { bookType: "xlsx", bookSST: false, type: "array" };
            let wbout = XLSX.write(workbook, wopts);
            saveAs(
              new Blob([wbout], { type: "application/octet-stream" }),
              "播种筐10天以上未清.xlsx"
            );
            break;
          default:
            Util.showTip(this, "warning", "UNKNOW ERROR!");
            break;
        }
      });
    },
    uploadSeedToday() {
      let key = this.$store.state.user.key;
      Util.cRequest(this, "/sort/today", { key }, data => {
        switch (data.service_code) {
          case CONST.SORT_TODAY:
            var workbook = XLSX.utils.book_new();
            var ws = XLSX.utils.json_to_sheet(data.result);
            XLSX.utils.book_append_sheet(workbook, ws, "当天扫码");
            var wopts = { bookType: "xlsx", bookSST: false, type: "array" };
            let wbout = XLSX.write(workbook, wopts);
            saveAs(
              new Blob([wbout], { type: "application/octet-stream" }),
              "当天扫码（请自行剔除当天修改单号及需求的订单）.xlsx"
            );
            break;
          default:
            Util.showTip(this, "warning", "UNKNOW ERROR!");
            break;
        }
      });
    }
  },
  mounted() {
    this.requestData();
  },
  watch: {},
  components: {
    "order-car": OrderOutputCarVue,
    "out-put-width-time": OutputWidthTimeVue
  }
};
</script>
