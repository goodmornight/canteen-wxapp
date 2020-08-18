// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// process.env.TZ ='Asia/Shanghai'
// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event);
  const { OPENID } = cloud.getWXContext();
  const action = event.action;
  switch (action) {
    //获取用餐记录
    case 'getRecordingAndOrder': {
      return getRecordingAndOrder(event);
    };

    default: {
      return;
    }
  }
}
//获取用餐记录
//输入：时间
async function getRecordingAndOrder(event) {
  const db = cloud.database();
  const recording = db.collection('Recording');
  let now = event.now;
  console.log(now)
  let userId = event.userId;
  let orderList = await cloud.callFunction({
    name:'order',
    data:{
      action:'getTodayOrder',
      now:now,
      userId:userId
    }
  })
  .then(res=>{
    console.log(res)
    return res.result
  })
  .catch(err=>{
    console.log(err);
    return [];
  })
  console.log(orderList);
  let recordList = await cloud.callFunction({
    name:'recording',
    data:{
      action:'getTodayInsideRecording',
      now:now,
      userId:userId
    }
  })
  .then(res=>{
    console.log(res)
    return res.result
  })
  .catch(err=>{
    console.log(err);
    return [];
  });
  console.log(recordList);
  return {
    orderList:orderList,
    recordList:recordList
  }
}