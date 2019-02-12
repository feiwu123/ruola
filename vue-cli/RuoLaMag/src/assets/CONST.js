const CONST = {}
const ip = 'http://169.254.80.80:3001'
// const ip = 'http://47.92.155.232:3001'
// const ip = 'http://47.92.155.232'
// let ip = window.location.origin;
const HOST = ip + '/service';
// const HOST = '/service';
CONST.HOST = HOST;
CONST.SOURCE_HOST = ip + ''
CONST.UPLOADS_IMGS_HOSTS = ip + '/uploads/imgs/'
CONST.SESSION_CONFIG_CROS = {
  withCredentials: true
};
// CONST.SESSION_CONFIG_CROS = {};
CONST.REGFOREMAIL = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/i;
CONST.REGFORPASSWORD = /^[a-zA-Z]{1}([a-zA-Z0-9]|[._]){5,18}$/i;
CONST.REGFORACCOUNT = /^[a-zA-Z]{1}([a-zA-Z0-9]|[._]){4,18}$/i;
CONST.REG_FOR_GET_SKU_NO = /^\[SKU_([\s0-9a-z\-_\.#]+)\]\[NO_([\s0-9a-z\-_#]+)\]$/i;
CONST.NONE = "NONE";
CONST.PRODUCTION_TYPE={
  //
  "KID":"KID",
  "FZHOODIE":"JMDMWY",//加棉带帽卫衣
  "SWEATSHIRT":"WY",//卫衣
  "BJACKET":"JMJK",
  "ZIPHOODIE":"TD",
  "HOODIE":"DMWY",
  "ADULT":"TZ",
  "YOUTH":"TZ",
  "7YOGA":"7YJK",//七分瑜伽裤
  "YOGA":"YJK",//瑜伽裤
  "LSM":"DMWY",
  "LMS":"DMWY",
  "QRT":"TZ",//毯子
  "ZIP":"TD",//贴袋
  "STK":"STK",//沙滩裤
  "WJK":"WJK",//冬季夹克
  "SZJ":"WXDMWY",//无袖带帽卫衣
  "LGS":"DDK",//打底裤
  "TX":"TX",//t-shirt
  "WY":"WY",
  "BX":"BX",//背心
  "THR":"BZ",//被子
  "TD":"TD",
  "KS":"KS",//开衫
  "WK":"WK",//卫裤
  "JK":"JK",//夹克
}
export default {
  ip,
  RSA: "100",
  //user
  USER_LOGIN: "101",
  USER_LOGIN_SUCCESS: "1012",
  USER_LOGIN_ERROR_PASSWORD: "1014",
  USER_LOGIN_INACTIVE: "1015",
  USER_CHECK_LOGIN: "102",
  USER_LOGIN_STATUS_NONE: "1024",
  USER_LOGIN_STATUS_NORMAL: "1022",
  //user permission
  NO_PERMISSION: "88",
  //user list
  USERS_ALL: "_103",
  USER_LIST: "103",
  USER_LIST_DESCRIBE: "查看管理员账号",
  USER_CHANGE_SATAE: "104",
  USER_CHANGE_SATAE_DESCRIBE: "更改用户状态",
  USER_CHANGE_SATAE_FAILED: "1044",
  //permissions
  PERMISSIONS_ALL: "_105",
  PERMISSIONS: "105",
  PERMISSIONS_DESCRIBE: '查看权限列表',
  PERMISSION_ADD: "106",
  PERMISSION_ADD_DESCRIBE: "添加权限",
  PERMISSION_ADD_FAILED: "1064",
  PERMISSION_UPDATE: "107",
  PERMISSION_UPDATE_DESCRIBE: "修改权限描述",
  PERMISSION_DELETE: "108",
  PERMISSION_DELETE_DESCRIBE: "删除权限",
  PERMISSION_DELETE_FAILED: "1084",
  //operations
  OPERATIONS_ALL: "_109",
  OPERATIONS: "109",
  OPERATIONS_DESCRIBE: "查看操作列表",
  OPERATION_ADD: "110",
  OPEARTION_ADD_DESCRIBE: "添加操作",
  OPERATION_ADD_FAILED: "1104",
  OPERATION_UPDATE: "111",
  OPERATION_UPDATE_DESCRIBE: "修改操作描述",
  OPERATION_DELETE: "112",
  OPERATION_DELETE_DESCRIBE: "删除操作",
  OPERATION_DELETE_FAILED: "1124",
  //userpower
  USERPOWERS: "113",
  USERPOWERS_DESCRIBE: "查看用户权限",
  USERPOWER_ADD: "114",
  USERPOWER_ADD_DESCRIBE: "分配用户权限",
  USERPOWER_ADD_FAILED: "115",
  USERPOWER_UPDATE: "116",
  USERPOWER_UPDATE_DESCRIBE: "修改用户权限",
  USERPOWER_DELETE: "117",
  USERPOWER_DELETE_DESCRIBE: "删除已分配的用户权限",
  USERPOWER_DELETE_FAILED: "1174",
  //operationpower
  OPERATIONPOWERS: "118",
  OPERATIONPOWERS_DESCRIBE: "查看操作所需权限",
  OPERATIONPOWER_ADD: "119",
  OPERATIONPOWER_ADD_DESCRIBE: "关联操作所需权限",
  OPERATIONPOWER_ADD_FAILED: "120",
  OPERATIONPOWER_UPDATE: "121",
  OPERATIONPOWER_UPDATE_DESCRIBE: "修改操作所需权限",
  OPERATIONPOWER_DELETE: "122",
  OPERATIONPOWER_DELETE_DESCRIBE: "删除关联的操作所需权限",
  OPERATIONPOWER_DELETE_FAILED: "1224",
  //operation logs
  OPERATION_LOGS: "123",
  OPERATION_LOGS_DESCRIBE: "查看操作记录",

  //add user
  USER_ADD: "124",
  USER_ADD_DESCRIBE: "添加管理员",
  USER_ADD_FAILED: "1244",
  
  PASSWORD_UPDATE: "125",

  CUSTOMER_QUERY: "201",
  CUSTOMER_BIND_LIST: "202",
  CUSTOMER_BIND: "203",
  CUSTOMER_HAVE_BIND_LIST: "204",

  //CUSTOMER LOGIN SERVICE
  CUSTOMER_LOGIN: "205",
  CUSTOMER_ORDER_INFO_SINGLE: "206",
  CUSTOMER_ORDER_LIST: "207",
  CUSTOMER_RULE_GET: "208",
  CUSTOMER_DATE_ORDER_LIST: "209",
  CUSTOMER_DATE_ORDER_ITEMS: "210",
  CUSTOMER_DATE_ORDER_ITEMS_ALL: "211",

  ORDER_UPDATE_RULE: "301",
  ORDER_GET_RULE: "302",
  ORDER_LIST: "303",
  ORDER_EXCEL_UPLOAD: "304",
  ORDER_RESULT: "305",
  ORDER_ITEM_INFO: "306",
  ORDER_OUT_REGULARLY_PRODUCTION: "307",

  WC_UP: "401",
  WC_UP_RESULT: "402",
  WC_LABEL_GET: "403",
  WC_LABEL_GET_GOODS_ERROR: "40301",
  WC_LABEL_GET_NO_GOODS: "40302",
  WC_LABEL_GET_SINGLE: "40303",
  WC_LABEL_GET_FULL: "40304",
  WC_LABEL_GET_FULL_ERROR: "40305",
  WC_LABEL_GET_WC_ERROR: "40306",
  WC_LABEL_GET_NOT_FULL: "40307",
  WC_LABEL_GET_NOT_FULL_ERROR: "40308",
  WC_LABEL_GET_ERROR: "40309",
  WC_LABEL_GET_NO_SENT: "40310",

  WC_LABEL_GET_DIRECTLY: "404",
  WC_LABEL_PRINT_RECORD: "405",
  WC_LABEL_PRINT_RECORD_CLEAR_SEED_SORTING_ERROR: "40501",
  WC_LABEL_PRINT_RECORD_ADD_ERROR: "40502",
  WC_LABEL_PRINT_RECORD_SEED_SORTING_PUT_ERROR: "40503",
  WC_UP_SINGLE_GET_ORDER_ITEM: "406",
  WC_UP_SINGLE: "407",
  CREATE_BARCODE: "408",
  CREATE_QRCODE: "409",
  BOX_ALL: "410",
  BOX_CLEAR: "411",
  PRINT_DID: "412",
  PRINT_DID_NOT: "413",
  UPDATE_NO: "414",
  UPDATE_CONTENT: "415",
  ORDER_DELETE: "416",

  SEED_SORTING_WIDTH_SKU : "501",
  SEED_SORTING_WIDTH_SKU_NOT_NEED : "50104",
  PUT_BOX: "50110",
  PUT_BOX_ERROR: "50114",
  SINGLE_PRINT: "50121",
  CLEAR_BOX: "50131",
  CLEAR_BOX_ERROR: "50134",

  BOX_ALL_INFO: "502",
  BOX_FIVE_DAYS_INFO: "503",
  BOX_TEN_DAYS_INFO:"504",
  SORT_TODAY: "505",

  BDT_ORDER_INFO: "601",


  //流程
  NEW_SKU: "701",


  //factory
  FACTORY_ORDER_IN: "801",
  ...CONST
}