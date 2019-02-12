webpackJsonp([3],{"0R45":function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var s=a("0881"),o=a("GxbW"),i=a("2CU/"),r={name:"CustomerMag",data:function(){return{title:"新增",EditUser:null,loading:!1,users_data:[],table:{prop:"default",order:"ascending",page_size:5,current_page:1},AddForm:{visible:!1,account:"",name:"",id:"",password:"",adminid:"",loading:!1,admins:[]}}},methods:{sortChange:function(t){var e=t.order,a=t.prop;this.table.prop=a,this.table.order=e,this.requestData()},sizeChange:function(t){this.table.page_size=t,this.requestData()},currentChange:function(t){this.table.current_page=t,this.requestData()},requestData:function(){var t=this;this.loading=!0;var e=this.table,a=e.current_page,s=e.order,i=e.page_size,r=e.prop,n=this.$store.state.user.key;o.a.cRequest(this,"/customer/list",{current_page:a,order:s,page_size:i,prop:r,key:n},function(e){e&&e.result&&e.result.length>0?(t.users_data=e.result,t.table.total=e.result[0]?e.result[0].total:0):(t.users_data=[],t.table.total=0)})},addUser:function(){var t=this;if(!this.EditUser||this.EditUser.account!==this.AddForm.account||this.EditUser.name!==this.AddForm.name||this.EditUser.adminid!==this.AddForm.adminid||this.AddForm.password){this.AddForm.loading=!0;var e=this.AddForm,a=e.name,r=e.account,n=e.password,d=e.adminid,l=e.id,c=this.$store.state.user.key;if(!o.a.checkEmail(r))return o.a.showTip(this,"warning","ERROR ACCOUNT!"),void(this.AddForm.loading=!1);if(!o.a.checkName(a))return o.a.showTip(this,"warning","ERROR NAME!"),void(this.AddForm.loading=!1);if(n){if(!o.a.checkPassword(n))return o.a.showTip(this,"warning","PASSWORD:[/^[w_-]{6,18}$/]!"),void(this.AddForm.loading=!1);n=i.a.pwdEncrypt(n)}else n=s.a.NONE;if(console.log(d),!/^[0-9a-z\_]+$/i.test(d))return o.a.showTip(this,"warning","请选择管理员！"),void(this.AddForm.loading=!1);if(console.log(l,n),/^[0-9a-z]+$/i.test(l)||(l=s.a.NONE),n===s.a.NONE&&l===s.a.NONE)return o.a.showTip(this,"warning","新增请填写密码！"),void(this.AddForm.loading=!1);o.a.cRequest(this,"/customer/edit",{key:c,name:a,account:r,password:n,adminid:d,id:l},function(e){console.log(e),t.AddForm.loading=!1,e.result&&e.result.affectedRows>1?o.a.showTip(t,"success","操作成功"):e.result&&1==e.result.affectedRows?o.a.showTip(t,"info","帐号操作成功，管理员未操作"):o.a.showTip(t,"warning","操作失败"),t.requestData(),t.EditUser=null,t.title="新增帐号.",t.AddForm.adminid="",t.AddForm.name="",t.AddForm.account="",t.AddForm.visible=!1})}else o.a.showTip(this,"warning","未做任何修改!")},showAdd:function(t){this.AddForm.visible=!0,t?(console.log(t),this.EditUser=t,this.title="修改账号："+t.name,this.AddForm.adminid=t.adminid,this.AddForm.name=t.name,this.AddForm.account=t.account,this.AddForm.id=t.id):(this.EditUser=null,this.title="新增帐号.",this.AddForm.adminid="",this.AddForm.name="",this.AddForm.account="",this.AddForm.id="")},allAdmin:function(){var t=this,e=this.$store.state.user.key;o.a.cRequest(this,"/users/allusers",{key:e},function(e){switch(e.service_code){case s.a.USERS_ALL:console.log(e),t.AddForm.admins=e.result;break;default:t.AddForm.admins=[],o.a.showTip(t,"warning","GET ALL USERS UNKNOW ERROR!")}})}},mounted:function(){this.allAdmin()},watch:{}},n={render:function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"user-mag-wrap"},[a("el-card",{attrs:{shadow:"hover"}},[a("el-button",{on:{click:function(e){t.showAdd()}}},[t._v("新增")]),t._v(" "),a("el-table",{directives:[{name:"loading",rawName:"v-loading",value:t.loading,expression:"loading"}],staticStyle:{width:"100%"},attrs:{data:t.users_data,"default-sort":{prop:"name",order:"descending"}},on:{"sort-change":t.sortChange}},[a("el-table-column",{attrs:{sortable:"custom",fixed:"",prop:"name",label:"姓名",width:"120"}}),t._v(" "),a("el-table-column",{attrs:{sortable:"custom",prop:"account",label:"账号",width:"260"}}),t._v(" "),a("el-table-column",{attrs:{sortable:"custom",prop:"admin",label:"管理员姓名"}}),t._v(" "),a("el-table-column",{attrs:{fixed:"right",label:"操作",width:"120"},scopedSlots:t._u([{key:"default",fn:function(e){return[a("el-button",{attrs:{type:"text",size:"small"},nativeOn:{click:function(a){a.preventDefault(),t.showAdd(e.row)}}},[t._v("修改")])]}}])})],1),t._v(" "),a("el-pagination",{staticClass:"pagination",attrs:{"page-size":t.table.page_size,"page-sizes":[5,10,20,50,100],total:t.table.total,layout:"prev, pager, next, total, slot ,sizes"},on:{"size-change":t.sizeChange,"current-change":t.currentChange}})],1),t._v(" "),a("el-dialog",{attrs:{title:t.title,visible:t.AddForm.visible,width:"400px"},on:{"update:visible":function(e){t.$set(t.AddForm,"visible",e)}}},[a("el-form",{directives:[{name:"loading",rawName:"v-loading",value:t.AddForm.loading,expression:"AddForm.loading"}],attrs:{model:t.AddForm}},[a("el-form-item",[a("el-select",{staticStyle:{width:"100%"},attrs:{placeholder:"请选择管理员"},model:{value:t.AddForm.adminid,callback:function(e){t.$set(t.AddForm,"adminid",e)},expression:"AddForm.adminid"}},t._l(t.AddForm.admins,function(t){return a("el-option",{key:t.id,attrs:{label:t.name+":"+t.account,value:t.id,disabled:"1"!=t.state}})}))],1),t._v(" "),a("el-form-item",[a("el-input",{attrs:{"auto-complete":"off",placeholder:"客户姓名"},model:{value:t.AddForm.name,callback:function(e){t.$set(t.AddForm,"name",e)},expression:"AddForm.name"}})],1),t._v(" "),a("el-form-item",[a("el-input",{attrs:{"auto-complete":"off",placeholder:"客户账号（邮箱）"},model:{value:t.AddForm.account,callback:function(e){t.$set(t.AddForm,"account",e)},expression:"AddForm.account"}})],1),t._v(" "),a("el-form-item",[a("el-input",{attrs:{type:"password","auto-complete":"off",placeholder:"密码"},model:{value:t.AddForm.password,callback:function(e){t.$set(t.AddForm,"password",e)},expression:"AddForm.password"}})],1)],1),t._v(" "),a("div",{staticClass:"dialog-footer",attrs:{slot:"footer"},slot:"footer"},[a("el-button",{on:{click:function(e){t.AddForm.visible=!1}}},[t._v("取 消")]),t._v(" "),a("el-button",{attrs:{type:"primary"},on:{click:function(e){t.addUser()}}},[t._v("确 定")])],1)],1)],1)},staticRenderFns:[]};var d=a("VU/8")(r,n,!1,function(t){a("3ESE")},"data-v-2e8c5ad2",null).exports,l={name:"CustomerMag",data:function(){return{showBlock:"first"}},methods:{},mounted:function(){},watch:{},components:{"customer-list":d}},c={render:function(){var t=this.$createElement;return(this._self._c||t)("div",{staticClass:"customer-search"})},staticRenderFns:[]};var u={name:"CustomerMag",data:function(){return{showBlock:"first"}},methods:{},mounted:function(){},watch:{},components:{"customer-list":d,"customer-search":a("VU/8")(l,c,!1,function(t){a("CTPK")},"data-v-6d800014",null).exports}},m={render:function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"customer-mag"},[a("el-tabs",{attrs:{type:"card"},model:{value:t.showBlock,callback:function(e){t.showBlock=e},expression:"showBlock"}},[a("el-tab-pane",{attrs:{label:"客户列表",name:"first"}},[a("el-row",{staticClass:"content",attrs:{gutter:20}},[a("el-col",{attrs:{xs:24,sm:24,md:24,lg:12,xl:12}},[a("customer-list")],1)],1)],1),t._v(" "),a("el-tab-pane",{attrs:{label:"客户查询",name:"second"}},[a("customer-search")],1)],1)],1)},staticRenderFns:[]};var h=a("VU/8")(u,m,!1,function(t){a("guTJ")},"data-v-3321e5bf",null);e.default=h.exports},"3ESE":function(t,e){},CTPK:function(t,e){},guTJ:function(t,e){}});