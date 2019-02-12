<template>
  <div class="menu-wrap" :class="{w200px:isCollapse}">
    <el-scrollbar
      style="height:100%;"
      wrapStyle
      wrapClass
      viewClass
      viewStyle
      :noresize="false"
      tag="section"
    >
      <div>
        <el-switch class="btn" v-model="isCollapse" active-color="#333" inactive-color="#eee"></el-switch>
        <transition name="slide-fade">
          <div class="menu-tip" v-if="menu_tip_show">
            <img src="../assets/img/arrow.png">
            <span class="menu-tip-word">点击展开</span>
          </div>
        </transition>
        <el-menu
          :default-active="$route.path==='/home'?'/first':$route.path"
          class="aside-menu"
          :router="true"
          :unique-opened="true"
          :collapse="!isCollapse"
        >
          <el-menu-item index="/first">
            <i class="el-icon-SY"></i>
            <span slot="title">首页</span>
          </el-menu-item>
          <el-submenu index="8">
            <template slot="title">
              <i class="el-icon-LC"></i>
              <span>流程管理</span>
            </template>
            <el-menu-item index="/thermaltransfer">热转印</el-menu-item>
            <!-- <el-menu-item index="/quality">质检打码</el-menu-item> -->
            <!-- <el-menu-item index="/print">订单扫码</el-menu-item> -->
            <el-menu-item index="/skuprint">SKU扫码</el-menu-item>
            <el-menu-item index="/checkforship">发货核对</el-menu-item>
          </el-submenu>

          <el-submenu index="4">
            <template slot="title">
              <i class="el-icon-DD"></i>
              <span>订单管理</span>
            </template>
            <el-menu-item index="/orderlist">订单状态及播种情况</el-menu-item>
            <el-menu-item index="/uploadmag">订单上传及图片上传</el-menu-item>
            <el-menu-item index="/createorderinshipsystem">预报</el-menu-item>
            <el-menu-item index="/orderitemsearch">订单查询</el-menu-item>
          </el-submenu>
          <el-submenu index="9">
            <template slot="title">
              <i class="el-icon-GC"></i>
              <span>工厂管理</span>
            </template>
            <el-menu-item index="/factoryorders">订单系统</el-menu-item>
            <el-menu-item index="/factorysku">扫码系统</el-menu-item>
            <el-menu-item index="/imgdeal">图片处理数据录入</el-menu-item>
          </el-submenu>
          <el-submenu index="5">
            <template slot="title">
              <i class="el-icon-KH"></i>
              <span>客户</span>
            </template>
            <el-menu-item index="/customermag">客户管理</el-menu-item>
          </el-submenu>
          <el-submenu index="6">
            <template slot="title">
              <i class="el-icon-TJ"></i>
              <span>统计</span>
            </template>
            <el-menu-item index="6-1">订单统计</el-menu-item>
            <el-menu-item index="6-2">客户统计</el-menu-item>
            <el-menu-item index="6-3">产品统计</el-menu-item>
          </el-submenu>
          <el-submenu index="3">
            <template slot="title">
              <i class="el-icon-CP"></i>
              <span>产品管理</span>
            </template>
            <el-menu-item index="3-1">产品列表</el-menu-item>
            <el-menu-item index="3-2">产品上传</el-menu-item>
          </el-submenu>
          <el-submenu index="1">
            <template slot="title">
              <i class="el-icon-ZH"></i>
              <span>管理员账号管理</span>
            </template>
            <el-menu-item index="/usermag">管理员列表</el-menu-item>
            <el-menu-item index="/userpower">权限分配</el-menu-item>
            <el-menu-item index="/operationpower">操作权限</el-menu-item>
            <el-menu-item index="/operationlogs">操作记录</el-menu-item>
          </el-submenu>
          <el-submenu index="2">
            <template slot="title">
              <i class="el-icon-XT"></i>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/powerlist">权限列表</el-menu-item>
            <el-menu-item index="/operationlist">操作列表</el-menu-item>
          </el-submenu>
          <el-submenu index="7">
            <template slot="title">
              <i class="el-icon-SZ"></i>
              <span>账号设置</span>
            </template>
            <el-menu-item index="/pwdupdate">密码修改</el-menu-item>
          </el-submenu>
        </el-menu>
      </div>
    </el-scrollbar>
  </div>
</template>

<style lang="scss" scoped>
.menu-wrap {
  height: 100%;
  position: relative;

  .slide-fade-enter-active {
    transition: all 0.3s ease;
  }
  .slide-fade-leave-active {
    transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
  }
  .slide-fade-enter, .slide-fade-leave-to
    /* .slide-fade-leave-active for below version 2.1.8 */ {
    // transform: translateX(10px);
    opacity: 0;
  }
}

.aside-menu {
  height: 100%;
}

.btn {
  position: fixed;
  bottom: 10px;
  left: 10px;
  z-index: 100;
}
.menu-tip {
  position: fixed;
  bottom: 30px;
  left: 28px;
  z-index: 100;
}
.menu-tip-word {
  position: absolute;
  top: -24px;
  right: -40px;
  color: rgb(91, 155, 232);
}
</style>
<style lang="scss">
.menu-wrap {
  .aside-menu:not(.el-menu--collapse) {
    width: 200px;
    min-height: 400px;
  }
  .el-scrollbar__wrap {
    overflow-x: hidden;
    height: 100%;
  }
  .el-scrollbar__view {
    height: 100%;
    & > div {
      height: 100%;
    }
  }
  // .el-menu-item.is-active {
  //     background-color: #999;
  //     color: #fff;
  // }
}
</style>

<script>
export default {
  name: "AsideNav",
  data() {
    return {
      isCollapse: false,
      menu_tip_show: true
    };
  },
  mounted() {
    setTimeout(() => {
      this.menu_tip_show = false;
    }, 1000);
  }
};
</script>
