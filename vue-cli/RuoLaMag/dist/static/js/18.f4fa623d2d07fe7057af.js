webpackJsonp([18],{"2Bjg":function(e,t){},NptI:function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var s=r("mvHQ"),a=r.n(s),n=r("GxbW"),i=r("0881"),o=r("2CU/"),_=r("TVmP"),c=(o.a.encryptRsa,o.a.decryptRsa,o.a.pwdEncrypt,{name:"orderitemsearch",data:function(){return{order_no:"",order_sku:"",orders:[],activeName:0}},components:{"footer-c":_.a},methods:{searchFn:function(){var e=this,t=this.order_no,r=t.split("\n");for(var s in r)r.hasOwnProperty(s)&&(r[s]=r[s]?r[s].replace(/[^a-z0-9#\_\-]{1}/gi,""):"");var o=[];for(var _ in r)r.hasOwnProperty(_)&&(r[_]||o.push(_));for(var c in o)o.hasOwnProperty(c)&&(o[c]=o[c]-c,r.splice(o[c],1));var d=a()(r);if(t){var v=this.$store.state.user.key;n.a.cRequest(this,"/order/search/byno",{key:v,order_arr:d},function(t){switch(t.service_code){case i.a.ORDER_ITEM_INFO:t.result?t.result[0]?(e.orders=t.result,e.bdtRequest(d),e.wcRequest(d)):n.a.showTip(e,"warning","无单号信息!"):n.a.showTip(e,"warning","UNKNOW ERROR!");break;default:n.a.showTip(e,"warning","UNKNOW ERROR!")}})}},downloadExcel:function(){n.a.downloadExcelWithJson(this.orders,"RESULT_OF_SEARCH")},bdtRequest:function(e){},wcRequest:function(e){},searchWidthSKUFn:function(){var e=this,t=this.order_sku,r=t.split("\n");for(var s in r)r.hasOwnProperty(s)&&(r[s]=r[s]?r[s].replace(/[^a-z0-9#\_\-\s]{1}/gi,""):"");var o=[];for(var _ in r)r.hasOwnProperty(_)&&(r[_]||o.push(_));for(var c in o)o.hasOwnProperty(c)&&(o[c]=o[c]-c,r.splice(o[c],1));var d=a()(r);if(t){var v=this.$store.state.user.key;n.a.cRequest(this,"/order/search/bysku",{key:v,sku_arr:d},function(t){switch(t.service_code){case i.a.ORDER_ITEM_INFO:t.result?t.result[0]?(e.orders=t.result,e.bdtRequest(d),e.wcRequest(d)):n.a.showTip(e,"warning","无SKU相关订单信息!"):n.a.showTip(e,"warning","UNKNOW ERROR!");break;default:n.a.showTip(e,"warning","UNKNOW ERROR!")}})}}}}),d={render:function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("div",{staticClass:"pwdupdate-wrap"},[r("el-card",{staticClass:"form-wrap",staticStyle:{width:"400px"},attrs:{shadow:"hover"}},[r("el-input",{staticClass:"ipt",attrs:{placeholder:"Order No 多件请回车分割 (系统会自动删除‘a-zA-Z0-9_-#’以外的所有字符，且‘_’统一转为‘-’)","prefix-icon":"el-icon-search",type:"textarea",maxlength:"10000"},on:{keydown:function(t){return"button"in t||!e._k(t.keyCode,"enter",13,t.key,"Enter")?e.searchFn(t):null}},model:{value:e.order_no,callback:function(t){e.order_no=t},expression:"order_no"}}),e._v(" "),e.order_no?r("el-button",{staticClass:"btn",attrs:{plain:""},on:{click:e.searchFn}},[e._v("查询")]):e._e()],1),e._v(" "),r("el-card",{staticClass:"form-wrap",staticStyle:{width:"400px","margin-top":"20px"},attrs:{shadow:"hover"}},[r("el-input",{staticClass:"ipt",attrs:{placeholder:"SKU 多件请回车分割 (系统会自动删除‘a-zA-Z0-9_-#’以外的所有字符，且‘_’统一转为‘-’)","prefix-icon":"el-icon-search",type:"textarea",maxlength:"10000"},on:{keydown:function(t){return"button"in t||!e._k(t.keyCode,"enter",13,t.key,"Enter")?e.searchWidthSKUFn(t):null}},model:{value:e.order_sku,callback:function(t){e.order_sku=t},expression:"order_sku"}}),e._v(" "),e.order_sku?r("el-button",{staticClass:"btn",attrs:{plain:""},on:{click:e.searchWidthSKUFn}},[e._v("查询")]):e._e()],1),e._v(" "),e.orders[0]?r("el-card",{staticStyle:{"margin-top":"20px"},attrs:{shadow:"hover"}},[e.order_no?r("el-button",{staticClass:"btn",staticStyle:{"margin-bottom":"10px"},attrs:{plain:""},on:{click:e.downloadExcel}},[e._v("导出")]):e._e(),e._v(" "),r("el-collapse",{attrs:{accordion:""},model:{value:e.activeName,callback:function(t){e.activeName=t},expression:"activeName"}},e._l(e.orders,function(t,s){return r("el-collapse-item",{key:t.no,attrs:{title:t.no,name:s}},[r("div",[e._v("所属客户："+e._s(t.user_name))]),e._v(" "),r("div",[e._v("所属管理员："+e._s(t.manager_name))]),e._v(" "),r("div",[e._v("content: "+e._s(t.content))]),e._v(" "),r("div",[e._v("订单状态："+e._s(t.print_times?"已打包":"未打包"))]),e._v(" "),t.print_times?r("div",[e._v("面单打印管理员："+e._s(t.print_person))]):e._e(),e._v(" "),t.ship_check_person?r("div",[e._v("最后发货检查员："+e._s(t.ship_check_person))]):e._e(),e._v(" "),r("div",e._l(t.states,function(t,s){return r("span",{key:s},[e._v("["+e._s(t.SKU)+":"+e._s(t.state>0?"已生产":"未生产")+"]")])})),e._v(" "),t.print_time&&t.print_times?r("div",[e._v("订单打包时间:"+e._s(t.print_time))]):e._e(),e._v(" "),r("div",[e._v("订单最新更新时间："+e._s(t.time))]),e._v(" "),r("div",[e._v("订单日期："+e._s(t.date)+";订单描述:"+e._s(t._describe)+";")]),e._v(" "),r("div",[e._v("渠道："+e._s(t["SHIPPING WAY"]))]),e._v(" "),t.box?r("div",[e._v("\n          订单正处于播种流程：\n          "),r("div",[e._v("筐号："+e._s(t.box)+";")]),e._v(" "),r("div",[e._v("最后更新时间："+e._s(t.box_time)+";")]),e._v(" "),r("div",[e._v("筐内产品："+e._s(t.have))]),e._v(" "),t.BDT?r("div",[e._v("八达通："+e._s(t.BDT))]):e._e(),e._v(" "),t.WC?r("div",[e._v("伟成"+e._s(t.WC))]):e._e()]):e._e()])}))],1):e._e()],1)},staticRenderFns:[]};var v=r("VU/8")(c,d,!1,function(e){r("2Bjg")},"data-v-371cd156",null);t.default=v.exports}});