webpackJsonp([11],{"2gSg":function(t,e){},CVJ5:function(t,e){},Ppmo:function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n=a("GxbW"),o=a("0881"),l=a("2CU/"),s=a("TVmP"),i=(l.a.encryptRsa,l.a.decryptRsa,l.a.pwdEncrypt,{name:"login",data:function(){return{mag_name:"SKU扫码系统",login_tip:"LABEL PRINT WIDTH SKU",no:{placeholder:"SKU",value:""},label_url:"",loading:!1,can_enter:!0,now_show:{no:"",sku:"",content:"",label:"",box_content:"",total:0,quantity:0},all_box:{show:!1,loading:!1,table:{data:[],prop:"label",order:"ascending",page_size:10,current_page:1}}}},components:{"footer-c":s.a},methods:{getLabel:function(t,e){var a=this;if(!this.loading&&this.can_enter&&this.no.value){this.can_enter=!1,this.loading=!0,this.label_url="";var l=this.no.value,s=this.$store.state.user.key,i=o.a.REG_FOR_GET_SKU_NO.exec(l);i&&i[1]&&i[2]?this.$confirm("请不要使用SKU系统扫订单号！","不是扫码人员，请不要使用系统，谢谢！",{confirmButtonText:"确认"}).then(function(){a.can_enter=!0,a.loading=!1}).catch(function(t){n.a.showTip(a,"warning","你拒绝了？？？ 拜拜。"),setTimeout(function(){window.location.href="about:blank"},3e3)}):(l=this.no.value.replace(/\s/g,""),n.a.cRequest(this,"/sort/up/sku",{key:s,no:"",sku:l},function(e){if(console.log(e.result[0]),e.result&&e.result[0]){a.now_show.no=e.result[0].no,a.now_show.label=e.result[0].label,a.now_show.content=e.result[0].content,a.now_show.box_content=e.result[0].have,a.now_show.sku=e.result[0].sku;var l=0;if(e.result[0].content)for(var s in e.result[0].content)l+=e.result[0].content[s].Quantity-0;else l=1;a.now_show.total=l,a.now_show.quantity=e.result[0].have?e.result[0].have.length:a.now_show.total}else a.now_show.sku="",a.now_show.no="",a.now_show.label="",a.now_show.content="",a.now_show.box_content="",a.now_show.total=0,a.now_show.quantity=0;switch(a.loading=!1,t.target.focus(),e.service_code){case o.a.SEED_SORTING_WIDTH_SKU_NOT_NEED:a.can_enter=!0,n.a.showTip(a,"warning","暂不需要该商品！");break;case o.a.PUT_BOX:a.$confirm("请投入"+a.now_show.label+"！","单号"+a.now_show.no+" 产品SKU"+a.now_show.sku,{confirmButtonText:"确认"}).then(function(){a.can_enter=!0}).catch(function(t){a.can_enter=!0}),a.no.value="";break;case o.a.PUT_BOX_ERROR:a.can_enter=!0,n.a.showTip(a,"warning","投筐错误，请确认该筐状态并修正状态！");break;case o.a.SINGLE_PRINT:a.$confirm("请打包！","单号"+a.now_show.no+" 产品SKU"+a.now_show.sku,{confirmButtonText:"确认"}).then(function(){a.can_enter=!0}).catch(function(t){a.can_enter=!0}),a.label_url=e.result[0].lable_file,a.no.value="";break;case o.a.CLEAR_BOX:a.$confirm(a.now_show.label+"筐满，请打包！","单号"+a.now_show.no+" 产品SKU"+a.now_show.sku,{confirmButtonText:"确认"}).then(function(){a.can_enter=!0}).catch(function(t){a.can_enter=!0}),a.label_url=e.result[0].lable_file,a.no.value="";break;case o.a.CLEAR_BOX_ERROR:a.can_enter=!0,n.a.showTip(a,"warning","投筐错误，请确认该筐状态并修正状态！"),a.label_url=e.result[0].lable_file,a.no.value="";break;default:a.can_enter=!0,n.a.showTip(a,"warning","不好意思，意料之外的错误！")}}))}},printLabel:function(){window.open(this.label_url,"_blank")},checkAllBox:function(){this.all_box.show=!0,this.requestData()},clearBox:function(t){var e=this,a=this.$store.state.user.key,l=t.label;n.a.cRequest(this,"/order/seedsorting/box/clear",{label:l,key:a},function(t){switch(t.service_code){case o.a.BOX_CLEAR:n.a.showTip(e,"success","OK!"),e.requestData();break;default:n.a.showTip(e,"warning","UNKNOW ERROR!")}})},sortChange:function(t){var e=t.order,a=t.prop;this.all_box.table.prop=a,this.all_box.table.order=e,this.requestData()},sizeChange:function(t){this.all_box.table.page_size=t,this.requestData()},currentChange:function(t){this.all_box.table.current_page=t,this.requestData()},requestData:function(){var t=this;this.all_box.loading=!0;var e=this.all_box.table,a=e.current_page,l=e.order,s=e.page_size,i=e.prop,r=this.$store.state.user.key;n.a.cRequest(this,"/order/seedsorting/box/list",{current_page:a,order:l,page_size:s,prop:i,key:r},function(e){switch(t.all_box.loading=!1,e.service_code){case o.a.BOX_ALL:for(var a in t.all_box.table.data)if(t.all_box.table.data.hasOwnProperty(a)&&t.all_box.table.data[a]){var l=t.all_box.table.data[a],s=l.content,i=JSON.parse(s);l.content_num=i?i.length:0}t.all_box.table.data=e.result,t.all_box.table.total=1500;break;default:t.all_box.table.data=[],n.a.showTip(t,"warning","UNKNOW ERROR!")}})}},mounted:function(){}}),r={render:function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"login-wrap label-print",on:{keyup:function(e){if(!("button"in e)&&t._k(e.keyCode,"enter",13,e.key,"Enter"))return null;t.getLabel(e)}}},[a("el-card",{staticClass:"form-wrap"},[a("h1",{staticClass:"mag-name"},[t._v(t._s(t.mag_name))]),t._v(" "),a("p",{staticClass:"login-tip"},[t._v(t._s(t.login_tip)+" AND YOU CAN "),a("a",{attrs:{href:"/singleprint",target:"singleprint"}},[t._v("GET LABEL")])]),t._v(" "),a("el-input",{directives:[{name:"loading",rawName:"v-loading",value:t.loading,expression:"loading"}],staticClass:"ipt",attrs:{placeholder:t.no.placeholder,type:"text"},on:{blur:function(t){t.target.focus()}},model:{value:t.no.value,callback:function(e){t.$set(t.no,"value",e)},expression:"no.value"}}),t._v(" "),t.label_url?a("el-button",{on:{click:t.printLabel}},[t._v("PRINT")]):t._e(),t._v(" "),a("el-button",{staticStyle:{float:"right"},on:{click:t.checkAllBox}},[t._v("ALL BOX")])],1),t._v(" "),a("footer-c",{staticClass:"footer",staticStyle:{position:"absolute",bottom:"0"}}),t._v(" "),t.label_url?a("div",{staticClass:"pdf"},[a("embed",{attrs:{type:"application/pdf",src:t.label_url,width:"500",height:"800"}})]):t._e(),t._v(" "),a("el-card",{directives:[{name:"show",rawName:"v-show",value:t.now_show.no,expression:"now_show.no"}],staticClass:"now-show"},[a("div",{staticClass:"clearfix"},[a("p",{staticStyle:{float:"left"}},[t._v("操作："),a("span",{staticStyle:{"font-size":"28px"}},[t._v(t._s(t.now_show.total>t.now_show.quantity?"投入":"打包"))])]),t._v(" "),a("p",{staticStyle:{float:"left","margin-left":"12px"}},[t._v("NO："),a("span",{staticStyle:{"font-size":"28px"}},[t._v(t._s(t.now_show.no))])]),t._v(" "),a("p",{staticStyle:{float:"left","margin-left":"12px"}},[t._v("SKU："),a("span",{staticStyle:{"font-size":"28px"}},[t._v(t._s(t.now_show.sku))])]),t._v(" "),a("p",{staticStyle:{float:"left","margin-left":"12px"}},[t._v("筐号："),a("span",{staticStyle:{"font-size":"28px"}},[t._v(t._s(t.now_show.label))])]),t._v(" "),a("p",{staticStyle:{float:"left","margin-left":"12px"}},[t._v("订单数量(目前筐内/总数)："),a("span",{staticStyle:{"font-size":"28px",color:"green","margin-right":"5px"}},[t._v(t._s(t.now_show.quantity))]),t._v("/"),a("span",{staticStyle:{"font-size":"28px",color:"red","margin-left":"5px"}},[t._v(t._s(t.now_show.total))])])]),t._v(" "),a("p",{staticStyle:{"margin-top":"16px"}},[t._v("订单需要："+t._s(t.now_show.content))]),t._v(" "),a("p",{staticStyle:{"margin-top":"16px"}},[t._v(t._s(t.now_show.label)+"筐内（完成操作以后）："+t._s(t.now_show.box_content))])]),t._v(" "),a("el-dialog",{attrs:{title:"播种筐信息",visible:t.all_box.show},on:{"update:visible":function(e){t.$set(t.all_box,"show",e)}}},[a("el-table",{directives:[{name:"loading",rawName:"v-loading",value:t.loading,expression:"loading"}],staticStyle:{width:"100%"},attrs:{data:t.all_box.table.data},on:{"sort-change":t.sortChange}},[a("el-table-column",{attrs:{sortable:"custom",fixed:"",prop:"label",label:"筐号",width:"80"}}),t._v(" "),a("el-table-column",{attrs:{prop:"no",label:"包裹号",width:"120"}}),t._v(" "),a("el-table-column",{attrs:{prop:"have",label:"目前框内"}}),t._v(" "),a("el-table-column",{attrs:{prop:"quantity",label:"目前数量",width:"60"}}),t._v(" "),a("el-table-column",{attrs:{prop:"content",label:"需求"}}),t._v(" "),a("el-table-column",{attrs:{prop:"content_num",label:"需求数量",width:"60"}}),t._v(" "),a("el-table-column",{attrs:{fixed:"right",label:"操作",width:"120"},scopedSlots:t._u([{key:"default",fn:function(e){return[a("el-button",{attrs:{type:"text",size:"small"},nativeOn:{click:function(a){a.preventDefault(),t.clearBox(e.row)}}},[t._v("\n                  清空\n                  ")])]}}])})],1),t._v(" "),a("el-pagination",{staticClass:"pagination",attrs:{"page-size":t.all_box.table.page_size,"page-sizes":[10,20,50,100],total:t.all_box.table.total,layout:"prev, pager, next, total, slot ,sizes"},on:{"size-change":t.sizeChange,"current-change":t.currentChange}})],1)],1)},staticRenderFns:[]};var c=a("VU/8")(i,r,!1,function(t){a("2gSg"),a("CVJ5")},"data-v-01902847",null);e.default=c.exports}});