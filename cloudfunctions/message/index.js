// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
//预约成功模版ID：BIXI9rat6l3Wi2JIDkWjmOX60aBmg2BJcNvSIOJ0TqY
//下单成功模版ID：q4RztTIlCmks6ZPiJTJ_jxgcxU4NcZnjK4Wvzqi_byI
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const OPENID = wxContext.OPENID;
  const action = event.action;
  switch (action) {
    //下单成功，发送
    case 'sendOrderSuccess': {
      return sendOrderSuccess(OPENID,event);
    };
    //就餐报备成功
    case 'sendInsideOrderSuccess': {
      return sendInsideOrderSuccess(OPENID,event);
    };
    case 'sendMenu': {
      return sendMenu(event);
    };
    default: {
      return;
    }
  }
}
//下单成功
//输入：sendValue发送内容
async function sendOrderSuccess(OPENID,event){
  let sendValue = event.sendValue;
  // let sendValue ={
  //   //订单内容，20字以内字符
  //   thing9:{
  //     value:''
  //   },
  //   //订单金额，1个币种符号+10位以内纯数字，可带小数，结尾可带“元”
  //   amount8:{
  //     value:''
  //   },
  //   //下单时间，年月日格式（支持+24小时制时间），支持填时间段，两个时间点之间用“~”符号连接
  //   date7:{
  //     value:''
  //   },
  //   //温馨提示，20个以内字符
  //   thing5:{
  //     value:''
  //   },
  // }
  await cloud.openapi.subscribeMessage.send({
    touser: OPENID,
    page: 'pages/index/index',
    lang: 'zh_CN',
    data: sendValue,
    templateId: 'q4RztTIlCmks6ZPiJTJ_jxgcxU4NcZnjK4Wvzqi_byI',
    // miniprogramState: 'formal'//正式版
    // miniprogramState: 'trial'//体验版
    miniprogramState: 'developer' //开发版后期别忘了把这块修改
  })
  .then(async(res)=>{
    console.log(res)
  })
  .catch((err)=>{
    console.log(err)
  })
}
//报备成功
//输入：sendValue发送内容
async function sendInsideOrderSuccess(OPENID,event){
  let sendValue = event.sendValue;
  // let sendValue ={
  //   //预约产品，20字以内字符
  //   thing1:{
  //     value:''
  //   },

  //   //使用日期，年月日格式（支持+24小时制时间），支持填时间段，两个时间点之间用“~”符号连接
  //   date2:{
  //     value:''
  //   },
  //   //温馨提示，20个以内字符
  //   thing3:{
  //     value:''
  //   },
  // }
  await cloud.openapi.subscribeMessage.send({
    touser: OPENID,
    page: 'pages/updateOrder/updateOrder',
    lang: 'zh_CN',
    data: sendValue,
    templateId: 'BIXI9rat6l3Wi2JIDkWjmOX60aBmg2BJcNvSIOJ0TqY',
    // miniprogramState: 'formal'//正式版
    // miniprogramState: 'trial'//体验版
    miniprogramState: 'developer' //开发版后期别忘了把这块修改
  })
  .then(async(res)=>{
    console.log(res)
  })
  .catch((err)=>{
    console.log(err)
  })
}
//自动报备成功
//输入：sendValue发送内容,用户_openid
async function sendMenu(event){
  let openid = event._openid;
  let sendValue = event.sendValue;
  // let sendValue ={
  //   //预约产品，20字以内字符
  //   thing1:{
  //     value:''
  //   },

  //   //使用日期，年月日格式（支持+24小时制时间），支持填时间段，两个时间点之间用“~”符号连接
  //   date2:{
  //     value:''
  //   },
  //   //温馨提示，20个以内字符
  //   thing3:{
  //     value:''
  //   },
  // }
  await cloud.openapi.subscribeMessage.send({
    touser: openid,
    page: 'pages/menu/menu',
    lang: 'zh_CN',
    data: sendValue,
    templateId: 'BIXI9rat6l3Wi2JIDkWjmOX60aBmg2BJcNvSIOJ0TqY',
    // miniprogramState: 'formal'//正式版
    // miniprogramState: 'trial'//体验版
    miniprogramState: 'developer' //开发版后期别忘了把这块修改
  })
  .then(async(res)=>{
    console.log(res)
  })
  .catch((err)=>{
    console.log(err)
  })
}