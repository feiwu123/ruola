import store from './Store';

export default {
  setUserStorage,
  getUserStorage,
  removeUserStorage,
  checkLoginState,
  showTip,
  noLogonStatusCallBack,
  getHash,
  getUrlWidthRules,//order and img matching url
}



function setUserStorage(user) {
  localStorage.user = user;
  return localStorage.user;
}

function getUserStorage() {
  return localStorage.user;
}

function removeUserStorage() {
  localStorage.removeItem("user");
}

function checkLoginState(_app) {
  if(!store.state.user.name&&_app){
    showTip(_app, 'warning', 'PLEASE LOGIN FIRST!')
  }
  return store.state.user.name;
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
  _this.$store.commit("removeUser");
  _this.$router.push("/home");
  showTip(_this, "warning", "YOUR LOGON STATUS EXPIRED! PLEASE LOGIN AGAIN!");
}

function getHash() {
  return location.hash;
}


function getUrlWidthRules(reg, arr, sku) {
  console.log(reg,'string')
  console.log(arr,'string')
  if(!reg||!sku||!sku.trim()) return '';
  let regobj = new RegExp(reg, 'i');
  let arrobj = JSON.parse(arr);
  console.log(regobj,'obj')
  console.log(arrobj,'obj')
  let regskuarr = regobj.exec(sku.trim());//sku
  console.log(regskuarr);
  let resultarr = [];
  for (const key in arrobj) {
    const element = arrobj[key];
    console.log(element,"element")
    if (element.hasOwnProperty('level')) {
      const match = element['match'];
      if(match){
        console.log(element['level'],regskuarr[parseInt(key)+1].toUpperCase())
        resultarr[element['level']] = match[regskuarr[parseInt(key)+1].toLowerCase()];
      }else{
        resultarr[element['level']] = regskuarr[parseInt(key)+1].toUpperCase();
      }
    }
  }
  let re = '';
  for (let i=1;i<resultarr.length;i++) {
      re += resultarr[i]+'/';
  }
  re+=resultarr[0];
  console.log(re,'re')
  return re;
}