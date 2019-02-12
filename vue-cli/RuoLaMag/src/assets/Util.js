import store from './Store';
import Encryption from './Encryption';
import CONST from './CONST';
import XLSX from "xlsx";
import saveAs from "file-saver";

export default {
  setUserStorage,
  getUserStorage,
  removeUserStorage,
  checkLoginState,
  showTip,
  noLogonStatusCallBack,
  decryptResponse,
  encryptParam,
  cRequest,
  checkPassword,
  checkAccount,
  checkName,
  getUrlWidthRules,
  checkCustomerLogin,
  removeCustomerStorage,
  setCustomerStorage,
  checkEmail,
  downloadExcelWithJson,

  arrayUniq,
  downloadExcelMulti
}



function setUserStorage(user) {
  sessionStorage.user = user;
  return sessionStorage.user;
}

function getUserStorage() {
  return sessionStorage.user;
}

function removeUserStorage() {
  sessionStorage.removeItem("user");
}


function checkLoginState() {
  return store.state.user.name;
}
function checkCustomerLogin() {
  return store.state.customer.name;
}
function removeCustomerStorage() {
  sessionStorage.removeItem("customer");
}
function setCustomerStorage(customer) {
  sessionStorage.customer = customer;
  return sessionStorage.customer;
}
function checkPassword(password) {
  return /^[\w_-]{6,18}$/i.test(password);
}
function checkEmail(email) {
  return /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/i.test(email);
}
function checkAccount(account) {
  return /^[\w_-]{1,18}$/.test(account);
}
function checkName(name) {
  return /^([a-zA-Z0-9\u4e00-\u9fa5\·]{1,10})$/.test(name);
}
/**
 * tip from element-ui
 * @param {vue this} _this 
 * @param {"warning"/"success"...} type 
 * @param {String} message 
 */
function showTip(_this, type, message) {
  _this.$message({
    message,
    type
  });
}

function noLogonStatusCallBack(_this) {
  console.log("USER_LOGIN_STATUS_NONE");
  _this.$store.commit("removeUser");
  _this.$store.commit("removeCustomer");
  _this.$router.go(0);
  showTip(_this, "warning", "YOUR LOGON STATUS EXPIRED! PLEASE LOGIN AGAIN!");
}

/**
 * decrypt response
 * @param {response} res 
 */
function decryptResponse(res) {
  let {
    data: {
      result,
      service_msg,
      service_code
    }
  } = res;
  result = JSON.parse(Encryption.decryptRsa(result));
  service_msg = Encryption.decryptRsa(service_msg);
  service_code = Encryption.decryptRsa(service_code);
  return {
    result,
    service_msg,
    service_code
  }
}
/**
 * encrypt param
 * @param {object} param
 * @returns {object} param
 */
function encryptParam(param) {
  for (let key in param) {
    if (param.hasOwnProperty(key)) {
      param[key] = Encryption.encryptRsa(param[key] + "");
    }
  }
  return param;
}

function cRequest(_this, url, _param, callBack){
  this.loading = true;
  let param = encryptParam({
    ..._param
  });
  _this.$http
  .post(CONST.HOST+url, param, CONST.SESSION_CONFIG_CROS)
  .then(res => {
    let data = decryptResponse(res);
    switch (data.service_code) {
      case CONST.USER_LOGIN_STATUS_NONE:
        noLogonStatusCallBack(_this);
        break;
      case CONST.NO_PERMISSION:
        _this.users_data = [];
        showTip(_this, "warning", "NO PERMISSION!");
        break;
      default:
        callBack(data);
        break;
    }
    _this.loading = false;
  })
  .catch((error) => {
    console.warn(error)
    showTip(_this, "warning", "UNKNOW ERROR!");
    _this.loading = false;
  });
}


function getUrlWidthRules(reg, arr, sku) {
  if(!reg||!sku||!sku.trim()) return '';
  let regobj = new RegExp(reg, 'i');
  let arrobj = JSON.parse(arr);
  let regskuarr = regobj.exec(sku.replace(/\s/g, ""));//sku
  if(!regskuarr){
    return "other/";
  }
  let resultarr = [];
  let type = "jpeg";
  for (const key in arrobj) {
    const element = arrobj[key];
    if (element.hasOwnProperty('level')) {
      const match = element['match'];
      const w_reg = element['w_reg'];
      if(match){
        resultarr[element['level']] = match[regskuarr[parseInt(key)+1].toLowerCase()];
      }else if(w_reg) {
        try {
          const regobj = new RegExp(w_reg,'i');
          let _exec = regobj.exec(regskuarr[parseInt(key)+1]);
          if(_exec&&_exec.length==1){
            resultarr[element['level']] = _exec[0];
          }else if(_exec&&_exec.length>1){
            resultarr[element['level']] = _exec[1]
              for (let i=2;i<_exec.length;i++) {
                resultarr[element['level']]+=_exec[i];
              }
          }else{
            resultarr[element['level']] = "total";
          }
        } catch (error) {
          resultarr[element['level']] = 'unknow'   
        }
      }else{
        resultarr[element['level']] = regskuarr[parseInt(key)+1].toUpperCase();
      }
      if(element.level==0&&element.type) {
        type = element.type;
      }
    }
  }
  let re = '';
  for (let i=1;i<resultarr.length;i++) {
      re += resultarr[i]+'/';
  }
  re+=resultarr[0]+'.'+type;
  re = re.replace(/-|_/g,"");
  return re;
}


function downloadExcelWithJson(json_obj,name) {
  var workbook = XLSX.utils.book_new();
  var ws = XLSX.utils.json_to_sheet(json_obj);
  XLSX.utils.book_append_sheet(workbook, ws, "mysheet");
  var wopts = { bookType: "xlsx", bookSST: false, type: "array" };
  let wbout = XLSX.write(workbook, wopts);
  saveAs(
    new Blob([wbout], { type: "application/octet-stream" }),
    name+".xlsx"
  );
}
function downloadExcelMulti(obj,name) {
  var workbook = XLSX.utils.book_new();
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const element = obj[key];
      if(element.length>0){
        let ws = XLSX.utils.json_to_sheet(element);
        XLSX.utils.book_append_sheet(workbook, ws, key);
      }
    }
  }
  var wopts = { bookType: "xlsx", bookSST: false, type: "array" };
  let wbout = XLSX.write(workbook, wopts);
  saveAs(
    new Blob([wbout], { type: "application/octet-stream" }),
    name+".xlsx"
  );
}

/**
 * 数组去重
 * @param {*} array 
 */
function arrayUniq(array){
  var temp = [];
  for(var i = 0; i < array.length; i++){
      if(temp.indexOf(array[i]) == -1){
          temp.push(array[i]);
      }
  }
  return temp;
}


function toProductionArrayWidthQuantity(data){
    let already = [];
    let re = [];
    const reg = /[_|-|-]{1}([a-z23456]+)$/i;
    let total = 0;
    for (let i = 0; i < data.length; i++) {
      let element = data[i];
      let sku = element["SKU"];
      if (sku) sku = sku.replace(/\s/g, "");
      if (!sku) {
        continue;
      } else if (!reg.exec(sku)) {
        already.push("[error]" + sku);
        re.push({
          code: "[error]" + sku,
          other: 1,
          xs: 0,
          s: 0,
          m: 0,
          l: 0,
          xl: 0,
          "2xl": 0,
          "3xl": 0,
          "4xl": 0,
          "5xl": 0,
          "6xl": 0,
          "adult":0,
          "youth":0
        });
        continue;
      }
      let code = sku.replace(/\s/g, "").replace(reg, "");
      let q = 1;
      total += q;
      let _index = already.indexOf(code);
      let size = "";
      try {
        size = reg.exec(sku)[1].toLowerCase();
      } catch (error) {
        continue;
      }
      let match = {
        xs: "xs",
        s: "s",
        m: "m",
        l: "l",
        xl: "xl",
        xxl: "2xl",
        "2xl": "2xl",
        xxxl: "3xl",
        "3xl": "3xl",
        xxxxl: "4xl",
        "4xl": "4xl",
        xxxxxl: "5xl",
        "5xl": "5xl",
        xxxxxxl: "6xl",
        "6xl": "6xl",
        "adult": "adult",
        "youth": "youth"
      };
      if (_index > -1) {
        re[_index][match[size]] += q;
      } else {
        already.push(code);
        re.push({
          code,
          other: 0,
          xs: 0,
          s: 0,
          m: 0,
          l: 0,
          xl: 0,
          "2xl": 0,
          "3xl": 0,
          "4xl": 0,
          "5xl": 0,
          "6xl": 0,
          "adult":0,
          "youth":0
        });
        re[re.length - 1][match[size]] += q;
      }
    }
    re.sort((a, b) => (a.code > b.code ? -1 : 1));
    if(re[0]){
      re[0].total = total;
    }
    return re;
}