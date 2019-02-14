<template>
  <div class="login-wrap" style="min-height:100%;">
    <el-row class="content" :gutter="20" style="margin-left: 0px;margin-right: 0px;min-height:100%;">
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8" style="margin-top:30px;">
        <el-card class="form-wrap" style="">
          <p>说明：</p>
          <p>此为 生产文件路径以及 二维码 合成位置、宽度 录入界面。录入不代表马上合成。请谨慎添加。</p>
          <br>
          <p>步骤：</p>
          <p>1、数据录入。</p>
          <p>2、生产文件（newfiles）文件夹删除。</p>
          <p>3、等待或者直接重启工作站合成系统。请不用使用工作站以外电脑上的合成（被子毯子那台处理程序除外）。</p>
          <p>4、等待。</p>
          <p>5、检查合成的正确性。</p>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8" style="margin-top:30px;">
        <el-card class="form-wrap">
          <el-form :model="numberValidateForm" ref="numberValidateForm" label-width="100px">
            <el-form-item
              label="X"
              prop="x"
              :rules="[
                { required: true, message: 'X值不能为空'},
                { type: 'number', message: 'X值必须为数字值'}
              ]"
            >
              <el-input v-model.number="numberValidateForm.x" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item
              label="Y"
              prop="y"
              :rules="[
                { required: true, message: 'Y值不能为空'},
                { type: 'number', message: 'Y值必须为数字值'}
              ]"
            >
              <el-input v-model.number="numberValidateForm.y" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item
              label="W"
              prop="w"
              :rules="[
                { required: true, message: 'W值不能为空'},
                { type: 'number', message: 'W值必须为数字值'}
              ]"
            >
              <el-input v-model.number="numberValidateForm.w" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item
              label="本地路径"
              prop="url"
              :rules="[
                { required: true, message: '地址不能为空'},
                { message: '请使用正确格式的局域网地址',validator:urlCheck}
              ]"
            >
              <el-input
                v-model.number="numberValidateForm.url"
                auto-complete="off"
                placeholder="例如：\\pc-1\g\博格\带帽卫衣\L"
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitForm('numberValidateForm')">提交</el-button>
              <el-button @click="resetForm('numberValidateForm')">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8" style="margin-top:30px;padding:0;">
        <el-card style="height:605px;padding:0;">
          <p style="margin-bottom:10px;">记录列表：</p>
          <el-scrollbar
            style="height:570px;"
            wrapStyle
            wrapClass
            viewClass
            viewStyle
            :noresize="false"
            tag="section"
          >
            
            <p v-for="(item,i) in LOG" :key="item.id">
              {{i+1}}.本地路径：{{item.url}}，X：{{item.x}}，Y：{{item.y}}，W：{{item.w}}
              <el-button type="text" @click="deleteItem(item.id)">删除</el-button>
            </p>
          </el-scrollbar>
        </el-card>
      </el-col>
    </el-row>
    <footer-c class="footer"></footer-c>
  </div>
</template>

<style lang="scss" scoped>
</style>

<script>
import Util from "../assets/Util";
import CONST from "../assets/CONST";
import Footer from "./Footer";
import Encryption from "../assets/Encryption";
export default {
  name: "imgdeal",
  data() {
    return {
      numberValidateForm: {
        x: 0,
        y: 0,
        w: 425,
        url: ""
      },
      LOG: []
    };
  },
  components: {
    "footer-c": Footer
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          // Util.showTip(this, "success", "已提交！");
          this.addItem();
        } else {
          Util.showTip(this, "warning", "输入错误！");
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    urlCheck(rule, value, callback) {
      if (value === "") {
        callback(new Error("生产文件地址为空"));
      } else {
        if (/^\\\\pc/i.test(value)) {
          callback();
        } else {
          callback(new Error("生产文件地址格式错误"));
        }
      }
    },
    addItem() {
      let { x, y, w, url } = this.numberValidateForm;
      this.$http
        .post(
          CONST.HOST + "/factory/image/deal/add",
          { x, y, w, url },
          CONST.SESSION_CONFIG_CROS
        )
        .then(res => {
          let data = JSON.parse(Encryption.decryptRsa(res.body.result));
          if (data && data.affectedRows > 0) {
            this.getData();
            this.resetForm("numberValidateForm");
            Util.showTip(this, "success", "添加成功！");
          } else {
            Util.showTip(this, "warning", "请勿重复添加！");
          }
        })
        .catch(error => {
          console.warn(error);
          Util.showTip(this, "warning", "UNKNOW ERROR!");
        });
    },
    getData() {
      this.$http
        .post(
          CONST.HOST + "/factory/image/deal/logs",
          {},
          CONST.SESSION_CONFIG_CROS
        )
        .then(res => {
          this.LOG = JSON.parse(Encryption.decryptRsa(res.body.result));
        })
        .catch(error => {
          console.warn(error);
          Util.showTip(this, "warning", "UNKNOW ERROR!");
        });
    },
    deleteItem(id) {
      this.$http
        .post(
          CONST.HOST + "/factory/image/deal/delete",
          { id },
          CONST.SESSION_CONFIG_CROS
        )
        .then(res => {
          let data = JSON.parse(Encryption.decryptRsa(res.body.result));
          if (data && data.affectedRows > 0) {
            this.getData();
            Util.showTip(this, "success", "删除成功！");
          } else {
            Util.showTip(this, "warning", "删除失败，尝试刷新页面！");
          }
        })
        .catch(error => {
          console.warn(error);
          Util.showTip(this, "warning", "UNKNOW ERROR!");
        });
    }
  },
  mounted() {
    this.getData();
  }
};
</script>
