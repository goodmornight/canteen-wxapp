// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const action = event.action;
  switch (action) {
    //获取所有外卖菜品
    case 'getOutsideDishes': {
      return getOutsideDishes();
    };
    //获取所有食堂菜品
    case 'getInsideDishes': {
      return getInsideDishes();
    };
    default: {
      return {};
    }
  }
}
//获得所有外卖菜品
async function getOutsideDishes() {
  const db = cloud.database();
  const dishes = db.collection('Dishes');
  const MAX_LIMIT = 100;
  // 先取出集合记录总数
  const countResult = await dishes.count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = [];
  for (let i = 0; i < batchTimes; i++) {
    const promise = dishes.where({
      isInside: false,
      isStorage:true
    }).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  // 等待所有
  return (await Promise.all(tasks)).reduce((acc, cur) => {
    console.log(acc.data.concat(cur.data))
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  })
}
//获得所有食堂菜品
async function getInsideDishes() {
  const db = cloud.database();
  const dishes = db.collection('Dishes');
  const MAX_LIMIT = 100;
  // 先取出集合记录总数
  const countResult = await dishes.count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = [];
  for (let i = 0; i < batchTimes; i++) {
    const promise = dishes.where({
      isInside: true
    }).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  // 等待所有
  return (await Promise.all(tasks)).reduce((acc, cur) => {
    console.log(acc.data.concat(cur.data))
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  })
}