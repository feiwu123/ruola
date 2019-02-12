import Vue from 'vue'
import Router from 'vue-router'
import Util from '../assets/Util'
import Login from '../components/Login'
import Home from '../components/Home'
import UserMag from '../components/UserMag'
import PowerList from '../components/PowerList'
import OperationList from '../components/OperationList'
import UserPower from '../components/UserPower'
import OperationPower from '../components/OperationPower'
import PrintLabelOfWc from '../components/PrintLabelOfWc'
import OperationLogs from '../components/OperationLogs'
const UploadMag = () => import('../components/UploadMag')
const CustomerLogin = () => import("../components/CustomerLogin")
const CustomerHome = () => import("../components/CustomerHome")
const OrderList = () => import("../components/OrderList")
const PrintLabelWidthSKU = () => import("../components/PrintLabelWidthSKU")
const SinglePrint = () => import("../components/SinglePrint")
const PwdUpdate = () => import("../components/PwdUpdate")
const OrderItemSearch = () => import("../components/OrderItemSearch")
const QrCode = () => import("../components/QrCode")
const ThermalTransfer = () => import("../components/ThermalTransferWidthSKU")
const FactoryOrders = () => import("../components/FactoryOrders")
const FactorySKU = () => import("../components/FactorySKU")
const First = () => import("../components/First")
const CustomerMag = () => import("../components/CustomerMag")
const QualityCheckWidthSKU = () => import("../components/QualityCheckWidthSKU")
const ImgDeal = () => import("../components/ImgDeal")
const CheckForShip = () => import("../components/CheckForShip")
const CreateOrderForShip = () => import("../components/CreateOrderForShip")
Vue.use(Router)

export default new Router({
  mode: "history",
  // base: '/RuoLa/',
  routes: [
    //home
    {
      path: '/',
      component: Login,
      beforeEnter: (to, from, next) => {
        if (Util.checkLoginState()) {
          next({
            path: "/home"
          });
        } else {
          next();
        }
      },
    },
    {
      path: '/login',
      component: Login,
      beforeEnter: (to, from, next) => {
        if (Util.checkLoginState()) {
          next({
            path: "/home"
          });
        } else {
          next();
        }
      },
    },
    {
      path: '/print',
      component: PrintLabelOfWc,
      beforeEnter: (to, from, next) => {
        if (!Util.checkLoginState()) {
          next({path:"/login"});
        } else {
          next();
        }
      },
    },
    {
      path: '/skuprint',
      component: PrintLabelWidthSKU,
      beforeEnter: (to, from, next) => {
        if (!Util.checkLoginState()) {
          next({path:"/login"});
        } else {
          next();
        }
      },
    },
    {
      path: '/thermaltransfer',
      component: ThermalTransfer,
      beforeEnter: (to, from, next) => {
        if (!Util.checkLoginState()) {
          next({path:"/login"});
        } else {
          next();
        }
      },
    },
    {
      path: '/checkforship',
      component: CheckForShip,
      beforeEnter: (to, from, next) => {
        if (!Util.checkLoginState()) {
          next({path:"/login"});
        } else {
          next();
        }
      },
    },
    {
      path: '/factorysku',
      component: FactorySKU,
      beforeEnter: (to, from, next) => {
        if(!Util.checkLoginState()) {
          next({path:"/login"});
        } else {
          next();
        }
      }
    },
    {
      path: '/quality',
      component: QualityCheckWidthSKU,
      beforeEnter: (to, from, next) => {
        if(!Util.checkLoginState()) {
          next({path:"/login"});
        } else {
          next();
        }
      }
    },
    {
      path: '/imgDeal',
      component: ImgDeal,
    },
    {
      path: '/singleprint',
      component: SinglePrint,
    },
    {
      path: '/home',
      component: Home,
      beforeEnter: (to, from, next) => {
        if (!Util.checkLoginState()) {
          next({path:"/login"});
          // next();
        } else {
          next();
        }
      },
      children: [
      //user & power
      {
        path: '/',
        component: First
      }, {
        path: '/usermag',
        component: UserMag
      }, {
        path: '/powerlist',
        component: PowerList
      },{
        path: '/operationlist',
        component: OperationList
      },{
        path: '/userpower',
        component: UserPower
      },{
        path: '/operationpower',
        component: OperationPower
      },{
        path: '/operationlogs',
        component: OperationLogs
      },
      //order
      {
        path: '/uploadmag',
        component: UploadMag
      },
      {
        path: '/orderlist',
        component: OrderList
      },
      {
        path: '/orderitemsearch',
        component: OrderItemSearch
      },
      {
        path: '/createorderinshipsystem',
        component: CreateOrderForShip
      },
      //setting
      {
        path: '/pwdupdate',
        component: PwdUpdate
      },
      //factory
      {
        path: '/factoryorders',
        component: FactoryOrders
      },
      //customer
      {
        path: '/customermag',
        component: CustomerMag
      }
    ]
    },
    {
      path: '/qrcode',
      component: QrCode,
    },
    {
      path: '/customerlogin',
      component: CustomerLogin,
      beforeEnter: (to, from, next) => {
        if(Util.checkCustomerLogin()) {
          next({path:"/customerhome"});
        } else {
          next();
        }
      }
    },
    {
      path: '/customerhome',
      component: CustomerHome,
      beforeEnter: (to, from, next) => {
        if(!Util.checkCustomerLogin()) {
          next({path:"/customerlogin"});
        } else {
          next();
        }
      }
    },
    
    //error redirect
    {
      path: "*",
      redirect: "/"
    }

  ]
})
