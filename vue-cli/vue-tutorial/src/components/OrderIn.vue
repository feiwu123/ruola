<template>
<div class="wrap">
  <div class="order-in">
    <div class="index" v-loading.fullscreen.lock="fullscreenLoading" element-loading-text="拼命加载中...">
      <el-upload
        class="upload-demo"
        :action="HOST+'/order/upload'"
        :data="user"
        :name ="FileDefaultName"
        :on-preview="handlePreview"
        :on-remove="handleRemove"
        :before-remove="beforeRemove"
        :before-upload="beforeUpload"
        :limit="1"
        :on-exceed="handleExceed"
        :on-success="onUploadSuccess"
        :on-change="importFile"
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel">
        <el-button size="small" type="primary">点击上传 Excel</el-button>
        <div slot="tip" class="el-upload__tip">只能上传excel文件，且不超过500kb</div>
      </el-upload>
      <el-button class="button" @click="downloadFile(excelData)">导出</el-button>
      <a href="javascript:void(0);" id="downlink"></a>
      <!--错误信息提示-->
      <el-dialog title="提示" v-model="errorDialog" size="tiny">
    <span>{{errorMsg}}</span>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="errorDialog=false">确认</el-button>
      </span>
      </el-dialog>
      <!--展示导入信息-->
      <el-table :data="excelData" tooltip-effect="dark">
        <el-table-column :label="`Image`" width="100" :key="'Image'">
          <template slot-scope="scope"  > 
            <img class="col-img" :src="`${CONST.UPLOADS_IMGS_HOSTS+$store.state.user.id+'/'+getUrl(scope.row['SKU'])}.${RuleImg}`.toLowerCase()">
          </template>
        </el-table-column>
        <el-table-column v-if="item!=`Image`" :label="item" :prop="item" show-overflow-tooltip v-for="item in excelTitle" :key="item">
        </el-table-column>
      </el-table>
    </div>
  </div>
</div>
</template>

<style lang='scss' scoped>
@import "../assets/scss/reload.scss";
.wrap {
  width: 100%;
  height: 100%;
}
.order-in {
  // min-width: $MIN_WIDTH;
  max-width: 1000px;
  margin: 0 auto;
  padding: 80px 0 1rem;
  @extend .clearfix;
}
.col-img {
  width: 100%;
}
</style>
<style lang="scss">
.order-in {
  *.cell {
    padding-right: 0;
    word-break: break-all !important;
    text-overflow: normal !important;
    white-space: normal !important;
  }
}
</style>

<script>
import Rsa from "../assets/Encryption";
import Util from "../assets/Util";
import CONST from "../assets/CONST";
var XLSX = require("xlsx");
const HOST = CONST.HOST;
export default {
  name: "OrderIn",
  data() {
    return {
      HOST: HOST,
      CONST: CONST,
      user: {
        id: "",
        key: ""
      },
      FileDefaultName: "excel.xlsx",
      fullscreenLoading: false, // 加载中
      outFile: "", // 导出文件el
      errorDialog: false, // 错误信息弹窗
      errorMsg: "", // 错误信息内容
      excelData: [
        // 测试数据
      ],
      excelTitle: ["1", "2", "3", "4", "5"],
      // fileList: []
      RuleRegexp: ``,
      RuleArray: ``,
      RuleImg: `png`
    };
  },
  components: {},
  mounted() {},
  methods: {
    showTip: function(message, type) {
      Util.showTip(this, type, message);
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePreview(file) {
      console.log(file);
    },
    handleExceed(files, fileList) {
      this.$message.warning(
        `当前限制选择 3 个文件，本次选择了 ${
          files.length
        } 个文件，共选择了 ${files.length + fileList.length} 个文件`
      );
    },
    beforeUpload(file) {
      this.fullscreenLoading = true;
      console.log(file);
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`);
    },
    onUploadSuccess(res, file, fileList) {
      console.log("success");
    },
    downloadFile: function(rs) {
      // 点击导出按钮
      let data = [{}];
      for (let k in rs[0]) {
        data[0][k] = k;
      }
      data = data.concat(rs);
      this.downloadExl(data, "菜单");
    },
    importFile: function(file, fileList) {
      if (!file) {
        this.fullscreenLoading = false;
        return;
      }
      var f = file;
      var reader = new FileReader();
      let $t = this;
      reader.onload = function(e) {
        var data = e.target.result;
        console.log(e);
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
        console.log("dealfile");
        $t.dealFile($t.analyzeData(json)); // analyzeData: 解析导入数据
      };
      if (this.rABS) {
        reader.readAsArrayBuffer(f.raw);
      } else {
        reader.readAsBinaryString(f.raw);
      }
    },
    downloadExl: function(json, downName, type) {
      // 导出到excel
      let keyMap = []; // 获取键
      for (let k in json[0]) {
        keyMap.push(k);
      }
      console.info("keyMap", keyMap, json);
      let tmpdata = []; // 用来保存转换好的json
      json
        .map((v, i) =>
          keyMap.map((k, j) =>
            Object.assign(
              {},
              {
                v: v[k],
                position:
                  (j > 25 ? this.getCharCol(j) : String.fromCharCode(65 + j)) +
                  (i + 1)
              }
            )
          )
        )
        .reduce((prev, next) => prev.concat(next))
        .forEach(function(v) {
          tmpdata[v.position] = {
            v: v.v
          };
        });
      let outputPos = Object.keys(tmpdata); // 设置区域,比如表格从A1到D10
      let tmpWB = {
        SheetNames: ["mySheet"], // 保存的表标题
        Sheets: {
          mySheet: Object.assign(
            {},
            tmpdata, // 内容
            {
              "!ref": outputPos[0] + ":" + outputPos[outputPos.length - 1] // 设置填充区域
            }
          )
        }
      };
      let tmpDown = new Blob(
        [
          this.s2ab(
            XLSX.write(
              tmpWB,
              {
                bookType: type === undefined ? "xlsx" : type,
                bookSST: false,
                type: "binary"
              } // 这里的数据是用来定义导出的格式类型
            )
          )
        ],
        {
          type: ""
        }
      ); // 创建二进制对象写入转换好的字节流
      var href = URL.createObjectURL(tmpDown); // 创建对象超链接
      this.outFile.download = downName + ".xlsx"; // 下载名称
      this.outFile.href = href; // 绑定a标签
      this.outFile.click(); // 模拟点击实现下载
      setTimeout(function() {
        // 延时释放
        URL.revokeObjectURL(tmpDown); // 用URL.revokeObjectURL()来释放这个object URL
      }, 100);
    },
    analyzeData: function(data) {
      // 此处可以解析导入数据
      return data;
    },
    dealFile: function(data) {
      // 处理导入的数据
      this.excelTitle = [];
      for (const key in data[0]) {
        if (data[0].hasOwnProperty(key)) {
          this.excelTitle.push(key);
        }
      }
      this.fullscreenLoading = false;
      if (data.length <= 0) {
        this.errorDialog = true;
        this.errorMsg = "请导入正确信息";
      } else {
        this.excelData = data;
      }
    },
    s2ab: function(s) {
      // 字符串转字符流
      var buf = new ArrayBuffer(s.length);
      var view = new Uint8Array(buf);
      for (var i = 0; i !== s.length; ++i) {
        view[i] = s.charCodeAt(i) & 0xff;
      }
      return buf;
    },
    getCharCol: function(n) {
      // 将指定的自然数转换为26进制表示。映射关系：[0-25] -> [A-Z]。
      let s = "";
      let m = 0;
      while (n > 0) {
        m = (n % 26) + 1;
        s = String.fromCharCode(m + 64) + s;
        n = (n - m) / 26;
      }
      return s;
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
    getFile: function() {
      this.$http({
        method: "get",
        url:
          HOST +
          "/uploads/excel/1536567741819a3bfd4b0b4d211e8ac3dd7397b589d58-1540776216563.xlsx",
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
            console.log("dealfile");
            $t.dealFile($t.analyzeData(json)); // analyzeData: 解析导入数据
          };
          if (this.rABS) {
            reader.readAsArrayBuffer(blob);
          } else {
            reader.readAsBinaryString(blob);
          }
        })
        .catch(error => {
          console.error(error);
        });
    },
    getUrl(sku) {
      console.log(sku);
      return Util.getUrlWidthRules(this.RuleRegexp, this.RuleArray, sku);
    },
    getRule() {
        this.$http
        .post(CONST.HOST + "/order/rule/get", {
          id: Rsa.encryptRsa(this.$store.state.user.id),
          key: Rsa.encryptRsa(this.$store.state.user.key)
        })
        .then(response => {
          let {
            data: { result, service_code, service_msg }
          } = response;
          result = JSON.parse(Rsa.decryptRsa(result));
          service_code = Rsa.decryptRsa(service_code);
          service_msg = Rsa.decryptRsa(service_msg);
          switch (service_code + "") {
            case CONST.ORDER_RULE_GET:
              this.RuleRegexp = result[0]._regexp;
              this.RuleArray = result[0].array;
              break;
            case CONST.USER_LOGIN_STATE_NONE:
              Util.noLogonStatusCallBack(this);
              break;
            default:
              this.$message({
                type: "warning",
                message: "GET RULE WRONG!"
              });
              break; //send error
          }
        })
        .catch(error => {
          console.error(error);
        });
    },

  },
  computed: {},
  mounted() {
    this.outFile = document.getElementById("downlink");
    let id = Rsa.encryptRsa(this.$store.state.user.id),
      key = Rsa.encryptRsa(this.$store.state.user.key);
    this.user = {
      id,
      key
    };
    // this.getFile();
    this.getRule();
  },
  watch: {
    RuleRegexp() {
      this.$forceUpdate();
    }
  }
};
</script>
 