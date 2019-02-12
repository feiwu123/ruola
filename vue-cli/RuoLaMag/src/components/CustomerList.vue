<template>
  <div class="user-mag-wrap">
    <el-card shadow="hover">
      <el-button @click="showAdd()">新增</el-button>
      <el-table
        :data="users_data"
        :default-sort="{prop: 'name', order: 'descending'}"
        @sort-change="sortChange"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column sortable="custom" fixed prop="name" label="姓名" width="120"></el-table-column>
        <el-table-column sortable="custom" prop="account" label="账号" width="260"></el-table-column>
        <el-table-column sortable="custom" prop="admin" label="管理员姓名"></el-table-column>
        <!-- <el-table-column
                sortable="custom"
                prop="state" 
                label="状态"
                width="120">
        </el-table-column>-->
        <el-table-column fixed="right" label="操作" width="120">
          <template slot-scope="scope">
            <el-button @click.native.prevent="showAdd(scope.row)" type="text" size="small">修改</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="pagination"
        :page-size="table.page_size"
        :page-sizes="[5,10,20,50,100]"
        :total="table.total"
        layout="prev, pager, next, total, slot ,sizes"
        @size-change="sizeChange"
        @current-change="currentChange"
      ></el-pagination>
    </el-card>
    <el-dialog :title="title" :visible.sync="AddForm.visible" :width="'400px'">
      <el-form :model="AddForm" v-loading="AddForm.loading">
        <el-form-item>
          <el-select v-model="AddForm.adminid" placeholder="请选择管理员" style="width:100%;">
            <el-option
              v-for="item in AddForm.admins"
              :key="item.id"
              :label="`${item.name}:${item.account}`"
              :value="item.id"
              :disabled="item.state=='1'?false:true"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input v-model="AddForm.name" auto-complete="off" placeholder="客户姓名"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="AddForm.account" auto-complete="off" placeholder="客户账号（邮箱）"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input type="password" v-model="AddForm.password" auto-complete="off" placeholder="密码"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="AddForm.visible = false">取 消</el-button>
        <el-button type="primary" @click="addUser()">确 定</el-button>
      </div>
    </el-dialog>
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
export default {
  name: "CustomerMag",
  data() {
    return {
      title: "新增",
      EditUser: null,
      loading: false,
      users_data: [],
      table: {
        prop: "default",
        order: "ascending", //ascending or descending
        page_size: 5,
        current_page: 1
      },
      AddForm: {
        visible: false,
        account: "",
        name: "",
        id: "",
        password: "",
        adminid: "",
        loading: false,
        admins: []
      }
    };
  },
  methods: {
    sortChange({ order, prop }) {
      this.table.prop = prop;
      this.table.order = order;
      this.requestData();
    },
    sizeChange(page_size) {
      this.table.page_size = page_size;
      this.requestData();
    },
    currentChange(current_page) {
      this.table.current_page = current_page;
      this.requestData();
    },
    requestData() {
      this.loading = true;
      let { current_page, order, page_size, prop } = this.table;
      let key = this.$store.state.user.key;

      Util.cRequest(
        this,
        "/customer/list",
        { current_page, order, page_size, prop, key },
        data => {
          if (data && data.result && data.result.length > 0) {
            this.users_data = data.result;
            this.table.total = data.result[0] ? data.result[0].total : 0;
          } else {
            this.users_data = [];
            this.table.total = 0;
          }
        }
      );
    },
    addUser() {
      if (
        this.EditUser&&this.EditUser.account === this.AddForm.account &&
        this.EditUser.name === this.AddForm.name &&
        this.EditUser.adminid === this.AddForm.adminid &&
        !this.AddForm.password
      ) {
        Util.showTip(this, "warning", "未做任何修改!");
        return;
      }
      this.AddForm.loading = true;
      let { name, account, password, adminid, id } = this.AddForm;
      let key = this.$store.state.user.key;
      if (!Util.checkEmail(account)) {
        Util.showTip(this, "warning", "ERROR ACCOUNT!");
        this.AddForm.loading = false;
        return;
      }
      if (!Util.checkName(name)) {
        Util.showTip(this, "warning", "ERROR NAME!");
        this.AddForm.loading = false;
        return;
      }
      if (!password) {
        password = CONST.NONE;
      } else if (!Util.checkPassword(password)) {
        Util.showTip(this, "warning", "PASSWORD:[/^[w_-]{6,18}$/]!");
        this.AddForm.loading = false;
        return;
      } else {
        password = Encryption.pwdEncrypt(password);
      }
      console.log(adminid)
      if (!/^[0-9a-z\_]+$/i.test(adminid)) {
        Util.showTip(this, "warning", "请选择管理员！");
        this.AddForm.loading = false;
        return;
      }
        console.log(id,password)
      if (!/^[0-9a-z]+$/i.test(id)) {
        id = CONST.NONE;
      }
      if (password === CONST.NONE && id === CONST.NONE) {
        Util.showTip(this, "warning", "新增请填写密码！");
        this.AddForm.loading = false;
        return;
      }
      Util.cRequest(
        this,
        "/customer/edit",
        { key, name, account, password, adminid, id },
        data => {
          console.log(data)
          this.AddForm.loading = false;
          if (data.result && data.result.affectedRows > 1) {
            Util.showTip(this, "success", "操作成功");
          } else if (data.result && data.result.affectedRows == 1) {
            Util.showTip(this, "info", "帐号操作成功，管理员未操作");
          } else {
            Util.showTip(this, "warning", "操作失败");
          }
          this.requestData()
          this.EditUser = null;
          this.title = "新增帐号.";
          this.AddForm.adminid = "";
          this.AddForm.name = "";
          this.AddForm.account = "";
          this.AddForm.visible = false;
        }
      );
    },
    showAdd(row) {
      this.AddForm.visible = true;
      if (row) {
        console.log(row);
        this.EditUser = row;
        this.title = "修改账号：" + row.name;
        this.AddForm.adminid = row.adminid;
        this.AddForm.name = row.name;
        this.AddForm.account = row.account;
        this.AddForm.id = row.id;
      } else {
        this.EditUser = null;
        this.title = "新增帐号.";
        this.AddForm.adminid = "";
        this.AddForm.name = "";
        this.AddForm.account = "";
        this.AddForm.id = "";
      }
    },
    allAdmin() {
      let key = this.$store.state.user.key;
      Util.cRequest(this, "/users/allusers", { key }, data => {
        switch (data.service_code) {
          case CONST.USERS_ALL:
            console.log(data);
            this.AddForm.admins = data.result;
            break;
          default:
            this.AddForm.admins = [];
            Util.showTip(this, "warning", "GET ALL USERS UNKNOW ERROR!");
            break;
        }
      });
    }
  },
  mounted() {
    this.allAdmin();
  },
  watch: {}
};
</script>
