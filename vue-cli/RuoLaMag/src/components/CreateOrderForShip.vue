<template>
  <div>
    <el-tabs v-model="show_block" type="card" style="margin-top:40px;">
      <el-tab-pane label="草稿箱" name="first">
      </el-tab-pane>
      <el-tab-pane label="失败" name="second">
      </el-tab-pane>
      <el-tab-pane label="已预报" name="third">
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
</style>

<script>
import CONST from "../assets/CONST";
import Util from "../assets/Util";
import Encryption from "../assets/Encryption";
import XLSX from "xlsx";
import saveAs from "file-saver";
import moment from "moment";
export default {
  name: "CreateOrderForShip",
  data() {
    return {
      show_block:"first"
    };
  },
  methods: {},
  mounted() {},
  watch: {},
  components: {}
};
</script>
