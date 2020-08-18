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
    //添加订单
    case 'addOrder': {
      return addOrder(event);
    };
    //获得指定时间的订单信息
    case 'getOrder': {
      return getOrder(event);
    };
    //获取某天的订单信息
    case 'getTodayOrder': {
      return getTodayOrder(event);
    };
    //获取某天订单数量
    case 'getOrderNum': {
      return getOrderNum(event);
    };
    default: {
      return;
    }
  }
}
// 添加订单
// 输入：createdTime订单创建时间，userId用户编号,orderList订单内容，totalNum数量，totalPirce总价
async function addOrder(event) {
  const db = cloud.database();
  const $ = db.command.aggregate;
  const order = db.collection('Order');
  let createdTime = event.createdTime;
  let userId = event.userId;
  let orderList = event.orderList;
  let totalNum = event.totalNum;
  let totalPrice = event.totalPrice;

  return await order.add({
    data: {
      createdTime: new Date(createdTime),
      userId: userId,
      orderList: orderList,
      totalNum: totalNum,
      totalPrice: totalPrice
    }
  }).then(res => {
    console.log(res);
    return { state: true };
  })
    .catch(err => {
      console.log(err)
      return { state: false };
    })
}
//获取订单
// 输入userId用户编号,start开始时间,end结束时间
// 输出对应用户在对应时间段的订单
async function getOrder(event) {
  const db = cloud.database();
  const $ = db.command.aggregate;
  const _ = db.command;
  const order = db.collection('Order');
  let userId = event.userId;
  let start = event.start;
  let end = event.end;
  let startTime = new Date(start);
  console.log(startTime)
  let startDate = $.dateFromString({
    dateString: startTime.toJSON()
  })
  console.log(startDate)
  let endTime = new Date(end);
  console.log(endTime);
  let endDate = $.dateFromString({
    dateString: endTime.toJSON()
  })
  return await order.aggregate()
    .match({
      userId: userId,
    })
    .addFields({
      matched: $.and([$.gte(['$createdTime', startDate]), $.lte(['$createdTime', endDate])])
    })
    .match({
      matched: !0
    })
    .sort({
      createdTime: 1
    })
    .end()
    .then(res => {
      console.log(res);
      return res.list;
    })
    .catch(err => {
      console.log(err);
      return [];
    })
}
//获取某天的订单信息
// 输入：当前时间now，用户编号userId
async function getTodayOrder(event) {
  const db = cloud.database();
  const $ = db.command.aggregate;
  const order = db.collection('Order');
  let now = new Date(event.now);
  let userId = event.userId;
  let start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 0);
  let startTime = $.dateFromString({
    dateString: start.toJSON()
  });
  console.log(startTime)
  let endTime = $.dateFromString({
    dateString: end.toJSON()
  });
  console.log(endTime)
  return await order.aggregate()
    .match({
      userId: userId,
    })
    .addFields({
      matched: $.and([$.gte(['$createdTime', startTime]), $.lte(['$createdTime', endTime])])
    })
    .match({
      matched: !0
    })
    .sort({
      createdTime: 1
    })
    .end()
    .then(res => {
      console.log(res);
      return res.list;
    })
    .catch(err => {
      console.log(err);
      return [];
    })
}
//获取某天订单数量
// 输入：start开始时间，end结束时间
//返回
async function getOrderNum(event) {
  const db = cloud.database();
  const $ = db.command.aggregate;
  const order = db.collection('Order');
  let start = new Date(event.start);
  let end = new Date(event.end);
  let startTime = $.dateFromString({
    dateString: start.toJSON()
  });
  console.log(startTime)
  let endTime = $.dateFromString({
    dateString: end.toJSON()
  });
  console.log(endTime);
  const MAX_LIMIT = 100;
  // 先取出集合记录总数
  const total = await order.aggregate()
  .addFields({
    matched: $.and([$.gte(['$createdTime', startTime]), $.lte(['$createdTime', endTime])])
  })
  .match({
    matched: !0
  })
  .unwind({
    path: '$orderList',
    includeArrayIndex: 'index'
  })
  .addFields({
    className:'$orderList.className',
    dishName:'$orderList.name',
    dishNum:'$orderList.num'
  })
  .sort({
    createdTime: 1
  })
  .project({
    orderList:0
  })
  .count('count')
  .end()
  .then(res=>{
    return res.list[0].count
  })
  .catch(err=>{
    console.log(err)
    return 0;
  })
  console.log(total);
  
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100);
  
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = order.aggregate()
    .addFields({
      matched: $.and([$.gte(['$createdTime', startTime]), $.lte(['$createdTime', endTime])])
    })
    .match({
      matched: !0
    })
    .unwind({
      path: '$orderList',
      includeArrayIndex: 'index'
    })
    .addFields({
      className:'$orderList.className',
      dishName:'$orderList.name',
      dishNum:'$orderList.num'
    })
    .sort({
      createdTime: 1
    })
    .project({
      orderList:0
    })
    .skip(i * MAX_LIMIT)
    .limit(MAX_LIMIT)
    .end()
    tasks.push(promise)
  }
  // 等待所有
  
  return (await Promise.all(tasks)).reduce(async function(acc, cur){
      console.log(acc)
      console.log(cur)
      return {
        list: acc.list.concat(cur.list),
        errMsg: acc.errMsg,
      }
    })
  
  // return await order.aggregate()
  //   .addFields({
  //     matched: $.and([$.gte(['$createdTime', startTime]), $.lte(['$createdTime', endTime])])
  //   })
  //   .match({
  //     matched: !0
  //   })
  //   .unwind({
  //     path: '$orderList',
  //     includeArrayIndex: 'index'
  //   })
  //   .addFields({
  //     className:'$orderList.className',
  //     dishName:'$orderList.name',
  //     dishNum:'$orderList.num'
  //   })
  //   .sort({
  //     createdTime: 1
  //   })
  //   .project({
  //     orderList:0
  //   })
  //   .end()
  //   .then(res => {
  //     console.log(res);
  //     return res.list;
  //   })
  //   .catch(err => {
  //     console.log(err);
  //     return [];
  //   })
}