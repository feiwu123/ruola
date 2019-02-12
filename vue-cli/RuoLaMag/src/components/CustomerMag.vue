<template>
  <div class="customer-mag">
    <el-tabs v-model="showBlock" type="card">
      <el-tab-pane label="客户列表" name="first">
        <el-row class="content" :gutter="20">
          <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
            <customer-list></customer-list>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="客户查询" name="second">
        <customer-search></customer-search>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<style lang="scss" scoped>
.pagination {
  text-align: center;
}
</style>
<script>
import CONST from "../assets/CONST";
import Util from "../assets/Util";
import Encryption from "../assets/Encryption";
import CustomerList from "./CustomerList";
import CustomerSearch from "./CustomerSearch";
export default {
  name: "CustomerMag",
  data() {
    return {
      showBlock: "first"
    };
  },
  methods: {},
  mounted() {},
  watch: {},
  components: {
    "customer-list": CustomerList,
    "customer-search": CustomerSearch
  }
};
</script>
