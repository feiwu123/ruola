<template>
  <div class="upload-mag">
    <!-- <router-link to="./print">
      <el-button>订单号扫码系统</el-button>
    </router-link>
    <router-link to="./skuprint">
      <el-button>SKU扫码系统</el-button>
    </router-link>
    <router-link to="./thermaltransfer">
      <el-button>热转印系统</el-button>
    </router-link>-->
    <el-card shadow="hover">
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
      <el-button @click="bindingCustomer" v-show="user_select.value">绑定客户</el-button>
    </el-card>
    <el-card shadow="hover" v-show="operation_customer.name&&edit_rule">
      <el-input type="textarea" autosize resize="none" placeholder="REGEXP" v-model="regexp_ipt"></el-input>
      <div style="margin: 20px 0;"></div>
      <el-input type="textarea" resize="none" autosize placeholder="ARRAY" v-model="array_ipt"></el-input>
      <el-button class="sure-btn" @click="updateRule">SURE</el-button>
    </el-card>
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
                >操作</el-button>
                <!-- <el-button
                  @click.native.prevent="unbindingCustomer(scope.$index)"
                  type="text"
                  size="small"
                >解绑</el-button>-->
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col v-show="operation_customer.name" :xs="24" :sm="24" :md="12">
        <el-card shadow="hover" v-loading="upload_loading">
          <div>
            <span style="font-size: 20px;">{{'(当前:'+operation_customer.name+')'}}</span>
            <el-button type="text" @click="showRule">EDIT RULE</el-button>
          </div>
          <el-alert
            title="TIP: 选择一个总文件夹，然后点击Upload按钮，文件总大小不要超过1G。"
            type="info"
            style="margin-top:10px;margin-bottom:10px;"
          ></el-alert>
          <label for="file" class="lb-for-img">
            <input
              class="ipt-img-select"
              type="file"
              name="file"
              id="file"
              webkitdirectory
              @change="changeFile($event)"
            >
            <div
              style="cusor:pointer;font-size: 20px;color:#999;"
            >{{Files.length?'已选择:'+Files.length:label_for_img_select}}</div>
          </label>
          <el-progress :percentage="img_progress" v-show="img_progress_show"></el-progress>
          <el-button @click="uploadFiles" class="upload-btn" type="primary">Upload</el-button>
          <div>
            <el-alert
              title="TIP: EXCEL 导入第一行必须含有'SKU'、'Quantity'注意大小写，同时生产表只有在SKU末尾是尺码的情况下有用。"
              type="info"
              style="margin-bottom:10px;"
            ></el-alert>
            <el-input
              class="price-ipt"
              v-model="excel_param.price"
              @change="priceChange"
              placeholder="总价（选填）"
            ></el-input>
            <el-input
              class="describe-ipt"
              type="textarea"
              resize="none"
              autosize
              v-model="excel_param._describe"
              placeholder="描述（选填）"
            ></el-input>
            <el-date-picker
              class="describe-ipt"
              v-model="excel_param.date"
              type="date"
              value-format="yyyy-MM-dd"
              format="yyyy 年 MM 月 dd 日"
              placeholder="选择日期 (必须)"
            ></el-date-picker>
            <el-upload
              :disabled="!excel_param.date"
              class="upload-excel"
              :action="HOST+'/order/upload/excel'"
              :data="{
                  id: excel_param.id,
                  key: excel_param.key,
                  price: Rsa(excel_param.price),
                  _describe: Rsa(excel_param._describe),
                  date: Rsa(excel_param.date),
                }"
              :name="FileDefaultName"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :before-remove="beforeRemove"
              :before-upload="beforeUpload"
              :limit="1"
              :on-exceed="handleExceed"
              :on-success="onUploadSuccess"
              :on-change="importExcel"
              :with-credentials="true"
              accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            >
              <el-button type="primary" :disabled="!excel_param.date">点击上传 Excel</el-button>
              <el-alert
                slot="tip"
                title="只能上传excel文件，且不超过500kb"
                type="info"
                style="font-size:10px;margin-top:10px;"
              ></el-alert>
            </el-upload>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-card shadow="hover" v-if="operation_customer.name">
      <el-table
        :data="Orders.data"
        :default-sort="{prop: 'time', order: 'descending'}"
        @sort-change="sortChange"
        style="width: 100%"
        v-loading="Orders.loading&&upload_loading"
      >
        <el-table-column sortable="custom" fixed prop="date" label="时间" width="240"></el-table-column>
        <el-table-column prop="price" label="总金额" width="80"></el-table-column>
        <el-table-column prop="_describe" label="备注"></el-table-column>
        <el-table-column fixed="right" prop="state" label="状态" width="80"></el-table-column>
        <el-table-column fixed="right" label="操作" width="280">
          <template slot-scope="scope">
            <el-button
              @click.native.prevent="wcUp(scope.row)"
              type="text"
              size="small"
              v-if="scope.row['state']+''=='0'"
            >模拟申报</el-button>
            <el-button
              @click.native.prevent="wcUpResult(scope.row)"
              type="text"
              size="small"
              v-else
            >申报结果</el-button>
            <el-button
              @click.native.prevent="checkOrderDetial(scope.$index)"
              type="text"
              size="small"
            >发货表</el-button>
            <el-button
              @click.native.prevent="createProduction(scope.$index)"
              type="text"
              size="small"
            >生产表</el-button>

            <el-button
              @click.native.prevent="deleteItemOrder(scope.row)"
              type="text"
              size="small"
            >删除</el-button>
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
    <div v-if="operation_customer.name" style="margin-top: 20px;">
      <el-button class="button" @click="downloadFile">导出(无图)</el-button>
      <el-button class="button" @click="orderCode">重新排序(字母倒排)</el-button>
      <el-button class="button" @click="orderCodeASC">排序(字母顺排)</el-button>
      <el-button
        @click="createBarCode"
        v-if="create_barcode_show"
        v-loading="create_barcode_loading"
        :disabled="create_barcode_loading"
      >生成码</el-button>
      <!-- <el-button
        @click="createQrCode"
        v-if="create_barcode_show"
        v-loading="create_qrcode_loading"
        :disabled="create_qrcode_loading"
      >生成二维码</el-button>-->
      <el-button
        class="button"
        @click="uploadFromServer"
        v-loading="download_excel_loading"
        :disabled="download_excel_loading"
      >下载(有图)</el-button>

      <el-table id="print" :data="excelData" tooltip-effect="dark" border style="margin-top: 20px;">
        <el-table-column :label="`Image`" width="100" :key="'Image'" v-if="excelData.length>0">
          <template slot-scope="scope">
            <img
              class="col-img"
              :src="scope.row['Image']"
              v-if="scope.row['SKU']||scope.row['code']"
              @error.once="imgError($event, scope.$index)"
            >
          </template>
        </el-table-column>
        <template v-for="(item) in excelTitle">
          <el-table-column
            class="col-info"
            :width="isProduction?(item=='code'||item=='Address')?160:order_table_width:140"
            v-if="item!=`Image`"
            :label="item"
            :prop="item"
            :key="item"
          ></el-table-column>
        </template>
      </el-table>
    </div>
    <el-dialog title="申报结果" :visible.sync="dialog_for_up_result">
      <span>订单总数:{{up_result_data.length}}</span>
      <el-button
        class="button"
        @click="downloadNoSendingFile"
        style="float:right;margin-right:20px;"
      >导出(缺货表)</el-button>
      <el-button
        class="button"
        @click="downloadSendingFile"
        style="float:right;margin-right:20px;"
      >导出(发货表)</el-button>
      <el-table :data="up_result_data">
        <el-table-column property="no" label="包裹号(no)" fixed="left"></el-table-column>
        <el-table-column property="label" label="播种框编号" width="100"></el-table-column>
        <el-table-column property="quantity" label="数量" width="100"></el-table-column>
        <el-table-column label="操作" width="250">
          <template slot-scope="scope">
            <el-button
              @click.native.prevent="updateOrderNo(scope.row)"
              type="text"
              size="small"
              v-if="!scope.row.label&&scope.row._print < 1"
            >单号修改</el-button>
            <el-button
              @click.native.prevent="updateOrderContent(scope.row)"
              type="text"
              size="small"
              v-if="!scope.row.label&&scope.row._print < 1"
            >需求修改</el-button>
            <el-button
              @click.native.prevent="updateDidPrintTag(scope.row)"
              type="text"
              size="small"
              v-if="!scope.row.label&&scope.row._print == 0"
            >标记已发货</el-button>
            <el-button
              @click.native.prevent="updateDidNotPrintTag(scope.row)"
              type="text"
              size="small"
              v-if="scope.row._print > 0"
            >标记未发货</el-button>
          </template>
        </el-table-column>
        <el-table-column
          prop="_result"
          label="申报(成功)"
          width="90"
          :filters="[{ text: '成功', value: 1 }, { text: '失败', value: 0 }]"
          :filter-method="filterUpResult"
          filter-placement="bottom-end"
        >
          <template slot-scope="scope">
            <el-popover trigger="hover" placement="bottom">
              <p>{{ scope.row.cnmessage }}</p>
              <div slot="reference" class="name-wrapper">
                <el-tag
                  :type="scope.row._result === 0 ? 'primary' : 'success'"
                  disable-transitions
                >{{scope.row._result === 0 ? '失败' : '成功'}}</el-tag>
              </div>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column
          prop="_print"
          label="状态"
          width="80"
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
      <el-card class="single_up_wc" v-show="dialog_for_up_result_up_once&&dialog_for_up_result">
        <i
          class="el-icon el-icon-close"
          style="position: absolute; top: 10px;right: 10px; font-size:20px;color:#999;cursor: pointer;"
          @click="dialog_for_up_result_up_once=false"
        ></i>
        <div class="single_up_wc_inner_item_wrap">
          <p>no</p>
          <el-input placeholder="no" v-model="single_up_wc.no"></el-input>
        </div>
        <div class="single_up_wc_inner_item_wrap">
          <p>method</p>
          <el-input placeholder="method" v-model="single_up_wc.method"></el-input>
        </div>
        <div class="single_up_wc_inner_item_wrap">
          <p>weight</p>
          <el-input placeholder="weight" v-model="single_up_wc.weight"></el-input>
        </div>
        <div class="single_up_wc_inner_item_wrap">
          <p>countrycode</p>
          <el-input placeholder="countrycode" v-model="single_up_wc.countrycode"></el-input>
        </div>
        <div class="single_up_wc_inner_item_wrap">
          <p>province</p>
          <el-input placeholder="province" v-model="single_up_wc.province"></el-input>
        </div>
        <div class="single_up_wc_inner_item_wrap">
          <p>city</p>
          <el-input placeholder="city" v-model="single_up_wc.city"></el-input>
        </div>
        <div class="single_up_wc_inner_item_wrap">
          <p>name</p>
          <el-input placeholder="name" v-model="single_up_wc.name"></el-input>
        </div>
        <div class="single_up_wc_inner_item_wrap">
          <p>postcode</p>
          <el-input placeholder="postcode" v-model="single_up_wc.postcode"></el-input>
        </div>
        <div class="single_up_wc_inner_item_wrap" style="width:520px">
          <p>street</p>
          <el-input placeholder="street" v-model="single_up_wc.street" style="width:520px"></el-input>
        </div>
        <div class="single_up_wc_inner_item_wrap">
          <p>telephone</p>
          <el-input placeholder="telephone" v-model="single_up_wc.telephone"></el-input>
        </div>
        <div class="single_up_wc_inner_item_wrap">
          <p>enname</p>
          <el-input placeholder="enname" v-model="single_up_wc.enname"></el-input>
        </div>
        <div class="single_up_wc_inner_item_wrap" style="width:520px">
          <p>cnname</p>
          <el-input placeholder="cnname" v-model="single_up_wc.cnname" style="width:520px"></el-input>
        </div>
        <div class="single_up_wc_inner_item_wrap">
          <p>content</p>
          <el-input
            placeholder="content"
            v-model="single_up_wc.content"
            disabled
            style="width:400px"
          ></el-input>
        </div>
        <div class="single_up_wc_inner_item_wrap">
          <el-button style="float:right;margin-top:20px;" @click="upSingleWc">提交预报</el-button>
        </div>
      </el-card>
    </el-dialog>
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
  .el-dialog__body {
    padding-top: 0;
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
export default {
  name: "UploadMag",
  data() {
    return {
      CONST: CONST,
      HOST: CONST.HOST,
      Rsa: Encryption.encryptRsa,
      loading: false,
      customer_data: [],
      table: {
        prop: "default",
        order: "ascending", //ascending or descending
        page_size: 5,
        current_page: 1
      },
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
        _describe: "",
        date: ""
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
      create_qrcode_loading: false
    };
  },
  methods: {
    requestData() {
      this.loading = true;
      let key = this.$store.state.user.key;
      Util.cRequest(this, "/customer/bind/list", { key }, data => {
        switch (data.service_code) {
          case CONST.CUSTOMER_BIND_LIST:
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
    bindingCustomer() {
      let c_id = this.user_select.value;
      let key = this.$store.state.user.key;
      Util.cRequest(this, "/customer/bind", { key, c_id }, data => {
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
    showRule() {
      if (this.edit_rule) {
        return;
      }
      this.edit_rule = true;
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
      console.log(this.excel_param.date);
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
        // arr.push(`${element["no"]}`);
        arr.push(`[SKU_${element["SKU"]}][NO_${element["no"]}]`);
      }
      if (arr.length == 0) {
        this.create_barcode_loading = false;
        Util.showTip(
          this,
          "warning",
          "请确保excel中包含'no'及'SKU'列，即包裹号!"
        );
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
      const reg = /[_|-|-]{1}([a-z23456]+)$/i;
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
            "6xl": 0,
            adult: 0,
            youth: 0,
            "2t": 0,
            "3t": 0,
            "4t": 0,
            "5t": 0,
            yxs: 0,
            ys: 0,
            ym: 0,
            yl: 0,
            yxl: 0
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
          "6xl": "6xl",
          adult: "adult",
          youth: "youth",
          "2t": "2t",
          "3t": "3t",
          "4t": "4t",
          "5t": "5t",
          yxs: "yxs",
          ys: "ys",
          ym: "ym",
          yl: "yl",
          yxl: "yxl"
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
            "6xl": 0,
            adult: 0,
            youth: 0,
            "2t": 0,
            "3t": 0,
            "4t": 0,
            "5t": 0,
            yxs: 0,
            ys: 0,
            ym: 0,
            yl: 0,
            yxl: 0
          });
          re[re.length - 1][match[size]] += q;
        }
      }
      re.sort((a, b) => (a.code > b.code ? -1 : 1));
      if (re[0]) {
        re[0].total = total;
      }
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
      console.log(this.up_result_data);
      for (const key in this.up_result_data) {
        if (this.up_result_data.hasOwnProperty(key)) {
          const element = this.up_result_data[key];
          if (element && element["no"] && element["_print"] == 0) {
            a.push({
              no: element["no"],
              label: element["label"],
              quantity: element["quantity"],
              content: element["content"],
              print: element["_print"]
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
    downloadSendingFile() {
      var workbook = XLSX.utils.book_new();
      let a = [];
      for (const key in this.up_result_data) {
        if (this.up_result_data.hasOwnProperty(key)) {
          const element = this.up_result_data[key];
          if (element && element["no"] && element["_print"] > 0) {
            a.push({
              no: element["no"]
            });
          }
        }
      }
      var ws = XLSX.utils.json_to_sheet(a, { header: ["no"] });
      XLSX.utils.book_append_sheet(workbook, ws, "发货表");
      var wopts = { bookType: "xlsx", bookSST: false, type: "array" };
      let wbout = XLSX.write(workbook, wopts);
      saveAs(
        new Blob([wbout], { type: "application/octet-stream" }),
        this.operation_customer.name + "发货表.xlsx"
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

          let s = this.operation_order.date;
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
    wcUp(row) {
      let id = row.id;
      let key = this.$store.state.user.key;
      Util.cRequest(this, "/order/wc/up", { id, key }, data => {
        switch (data.service_code) {
          case CONST.WC_UP:
            if (data.result.affectedRows) {
              this.requestOrdersData();
            } else {
              Util.showTip(this, "warning", "SOME ERROR IN YOUR EXCEL!");
            }
            break;
          default:
            Util.showTip(this, "warning", "UNKNOW ERROR!");
            break;
        }
      });
    },
    wcUpResult(row) {
      this.show_result_row = row;
      let id = row.id;
      let key = this.$store.state.user.key;
      Util.cRequest(this, "/order/wc/up/result", { id, key }, data => {
        switch (data.service_code) {
          case CONST.WC_UP_RESULT:
            this.showUpResult(data.result);
            break;
          default:
            Util.showTip(this, "warning", "UNKNOW ERROR!");
            break;
        }
      });
    },
    showUpResult(data) {
      this.up_result_data = data;
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
    filterUpResult(value, row) {
      return row._result === value;
    },
    filterIsSending(value, row) {
      if (value) {
        return row._print > 0;
      }
      return row._print < 1;
    },
    upWcOnce(row) {
      this.dialog_for_up_result_up_once = true;
      let id = row.id;
      let key = this.$store.state.user.key;
      Util.cRequest(this, "/order/get/item", { id, key }, data => {
        switch (data.service_code) {
          case CONST.WC_UP_SINGLE_GET_ORDER_ITEM:
            this.single_up_wc = data.result[0];
            break;
          default:
            Util.showTip(this, "warning", "UNKNOW ERROR!");
            break;
        }
      });
    },
    upSingleWc() {
      this.single_up_wc.id;
      let single = "";
      try {
        single = JSON.stringify(this.single_up_wc);
      } catch (error) {
        Util.showTip(this, "warning", "BEFORE ERQUEST ERROR!");
        return;
      }
      let key = this.$store.state.user.key;
      Util.cRequest(this, "/order/wc/up/single", { single, key }, data => {
        switch (data.service_code) {
          case CONST.WC_UP_SINGLE:
            this.dialog_for_up_result_up_once = false;
            this.wcUpResult(this.show_result_row);
            Util.showTip(
              this,
              "success",
              "预报提交成功，请等待数据刷新，查看预报结果!"
            );
            break;
          default:
            Util.showTip(this, "warning", "UNKNOW ERROR!");
            break;
        }
      });
    },
    updateOrderNo(row) {
      this.$prompt(`NO.${row.no}`, "单号修改", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /^[0-9a-z\-_\.]*$/i,
        inputErrorMessage: "单号格式不正确"
      })
        .then(({ value }) => {
          this._updateOrderNo(row, value);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "取消输入"
          });
        });
    },
    _updateOrderNo(row, value) {
      let id = row.id;
      let no = value;
      let key = this.$store.state.user.key;
      Util.cRequest(this, "/order/item/no/update", { id, no, key }, data => {
        switch (data.service_code) {
          case CONST.UPDATE_NO:
            if (!data.result) {
              Util.showTip(this, "warning", "UNKNOW ERROR!");
            } else if (data.result.length == 0) {
              Util.showTip(
                this,
                "warning",
                "修改失败，请确认被修改的订单没有发货或在配货。同时确认输入单号不存在!"
              );
            } else if (data.result[0].affectedRows == 1) {
              Util.showTip(this, "success", "修改成功!");
              this.wcUpResult(this.show_result_row);
            }
            break;
          default:
            Util.showTip(this, "warning", "UNKNOW ERROR!");
            break;
        }
      });
    },
    updateOrderContent(row) {
      this.$prompt(`${row.content}`, "需求修改", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /^\[\{\"[\{\[\}\]\"\,\:0-9a-z\-_\.]*\"\}\]$/i,
        inputErrorMessage: "单号格式不正确"
      })
        .then(({ value }) => {
          this._updateOrderContent(row, value);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "取消输入"
          });
        });
    },
    _updateOrderContent(row, value) {
      let content = value;
      let _content = {};
      try {
        _content = JSON.parse(content);
      } catch (error) {
        Util.showTip(this, "warning", "输入错误，请注意格式!");
        return;
      }
      //check content input
      for (const key in _content) {
        if (_content.hasOwnProperty(key)) {
          let item = _content[key];
          for (const _key in item) {
            if (_key === "Quantity" || _key === "SKU") {
              const element = item[_key];
              if (_key != "Quantity" && _key != "SKU") {
                Util.showTip(this, "warning", "输入错误，请注意格式!");
                return;
              } else if (_key == "Quantity") {
                try {
                  if (!parseInt(element) || parseInt(element) < 1) {
                    Util.showTip(this, "warning", "输入错误，请注意格式!");
                    return;
                  }
                } catch (error) {
                  Util.showTip(this, "warning", "输入错误，请注意格式!");
                  return;
                }
              }
            } else {
              Util.showTip(this, "warning", "输入错误，请注意格式!");
              return;
            }
          }
        }
      }
      let id = row.id;
      let key = this.$store.state.user.key;
      Util.cRequest(
        this,
        "/order/item/content/update",
        { id, content, key },
        data => {
          switch (data.service_code) {
            case CONST.UPDATE_CONTENT:
              if (!data.result) {
                Util.showTip(this, "warning", "UNKNOW ERROR!");
              } else if (data.result.length == 0) {
                Util.showTip(this, "warning", "输入错误，请注意格式!");
              } else if (data.result[0].affectedRows == 1) {
                Util.showTip(this, "success", "修改成功!");
                this.wcUpResult(this.show_result_row);
              } else if (data.result[0].affectedRows == 0) {
                Util.showTip(this, "warning", "修改失败，订单已经生产!");
              }
              break;
            default:
              Util.showTip(this, "warning", "UNKNOW ERROR!");
              break;
          }
        }
      );
    },
    _updateDidPrintTag(row) {
      let id = row.id;
      let key = this.$store.state.user.key;
      Util.cRequest(this, "/order/item/print/did", { id, key }, data => {
        switch (data.service_code) {
          case CONST.PRINT_DID:
            if (!data.result) {
              Util.showTip(this, "warning", "UNKNOW ERROR!");
            } else if (data.result.length == 0) {
              Util.showTip(this, "warning", "UNKNOW ERROR!");
            } else if (data.result[0].affectedRows == 0) {
              Util.showTip(
                this,
                "warning",
                "发货确认失败！请检查播种筐内该订单情况!"
              );
              this.wcUpResult(this.show_result_row);
            } else if (data.result[0].affectedRows == 1) {
              Util.showTip(this, "success", "修改成功!");
              this.wcUpResult(this.show_result_row);
            }
            break;
          default:
            Util.showTip(this, "warning", "UNKNOW ERROR!");
            break;
        }
      });
    },
    updateDidPrintTag(row) {
      this.$confirm("请确认是否已发货?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this._updateDidPrintTag(row);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消修改"
          });
        });
    },
    updateDidNotPrintTag(row) {
      this.$confirm("请确认改为未发货状态?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this._updateDidNotPrintTag(row);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消修改"
          });
        });
    },
    _updateDidNotPrintTag(row) {
      let id = row.id;
      let key = this.$store.state.user.key;
      Util.cRequest(this, "/order/item/print/didnot", { id, key }, data => {
        switch (data.service_code) {
          case CONST.PRINT_DID_NOT:
            if (
              data &&
              data.result &&
              data.result[0] &&
              data.result[0].affectedRows == 1
            ) {
              Util.showTip(this, "success", "修改成功!");
              this.wcUpResult(this.show_result_row);
            } else {
              Util.showTip(this, "warning", "修改失败!");
            }
            break;
          default:
            Util.showTip(this, "warning", "UNKNOW ERROR!");
            break;
        }
      });
    },
    deleteItemOrder(row) {
      this.$confirm(
        `请确认是否删除时间为"${row.date}",描述为:"${row._describe}"的订单?`,
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(() => {
          this._deleteItemOrder(row);
          this.$message({
            type: "info",
            message: `删除描述为${row._describe}的订单`
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消"
          });
        });
    },
    _deleteItemOrder(row) {
      let id = row.id;
      let _describe = row._describe;
      let date = row.date;
      let customer = this.operation_customer.id;
      let key = this.$store.state.user.key;
      Util.cRequest(
        this,
        "/order/delete",
        { id, key, _describe, date, customer },
        data => {
          switch (data.service_code) {
            case CONST.ORDER_DELETE:
              if (
                data &&
                data.result &&
                data.result[0] &&
                data.result[0].affectedRows == 1
              ) {
                Util.showTip(this, "success", "删除成功!");
                this.requestOrdersData();
              } else {
                Util.showTip(
                  this,
                  "warning",
                  "删除失败，请检查播种筐以及是否有商品已发货!"
                );
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
  mounted() {
    this.requestData();
  },
  watch: {
    operation_customer() {
      this.edit_rule = false;
    }
  }
};
</script>
