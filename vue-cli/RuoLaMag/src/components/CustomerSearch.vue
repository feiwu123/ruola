<template>
    <div class="customer-search">
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
export default {
  name: "CustomerMag",
  data() {
    return {
      showBlock:"first",
    };
  },
  methods: {},
  mounted() {},
  watch: {},
  components: {
    "customer-list":CustomerList
  }
};
</script>
