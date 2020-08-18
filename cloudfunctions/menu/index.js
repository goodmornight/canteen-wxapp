// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event);
  const { OPENID } = cloud.getWXContext();
  const action = event.action;
  switch (action) {
    //添加菜单
    case 'addMenu': {
      return addMenu(event);
    };
    //获得当天的菜单
    case 'getTodayMenu': {
      return getTodayMenu(event);
    };
    //获得对应天的菜单
    case 'getDayMenu': {
      return getDayMenu(event);
    };
    //获取某一周的菜单
    case 'getWeekMenu': {
      return getWeekMenu(event);
    };
    
    //根据menuId获取菜单内容
    // case 'getMenuByMenuId': {
    //   return getMenuByMenuId(event);
    // };
    default: {
      return;
    }
  }
}
//用于测试添加菜谱
async function addMenu(event) {
  const db = cloud.database();
  const menu = db.collection('Menu');
  let state=event.state;
  let curTime = event.curTime;
  let now = new Date();
  let time = now;
  // let time = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  let dishes = await cloud.callFunction({
    name: "dishes",
    data: {
      action: "getInsideDishes"
    }
  })
    .then(res => {
      console.log(res)
      return res.result.data
    })
    .catch(err => {
      console.log(err);
      return [{}]
    })
  // let dishes_inside = dishes.filter((item) => {
  //   return (item.isInside == true);
  // });
  await menu.add({
    data: {
      createdTime: new Date(),
      time: new Date(time.getFullYear(), time.getMonth(), time.getDate(), curTime, 0, 0),
      createdMember: '001',
      state: state,
      menuList: dishes
    }
  })
    .then(res => {
      console.log(res)
    })
    .catch(err => {
      console.log(err)
    })
}
//查询对应天是否有菜单设置（暂时设为当天）
async function getDayMenu(event) {
  const db = cloud.database();
  const menu = db.collection('Menu');
  const $ = db.command.aggregate;

  let day = new Date(event.day);
  // let tomorrow = new Date(today.getTime()+24*60*60*1000);
  console.log(day);

  let start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0);
  let startTime = $.dateFromString({
    dateString: start.toJSON()
  })
  console.log(startTime)
  let end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 0);
  console.log(end)
  let endTime = $.dateFromString({
    dateString: end.toJSON()
  })
  console.log(endTime)
  return await menu.aggregate()
    .addFields({
      matched: $.and([$.gte(['$time', startTime]), $.lte(['$time', endTime])])
    })
    .match({
      matched: !0
    })
    .sort({
      time: 1
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
//获取当天的菜单
//输入:当前时间today
async function getTodayMenu(event) {
  const db = cloud.database();
  const menu = db.collection('Menu');
  const $ = db.command.aggregate;

  let today = new Date(event.today);
  console.log(today);
  // 因为只有当天0-10点可以进入报备，所以默认查找的是当天的菜单
  let start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(), 0, 0);
  let startTime = $.dateFromString({
    dateString: start.toJSON()
  })
  console.log(startTime)
  let end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 0);
  console.log(end)
  let endTime = $.dateFromString({
    dateString: end.toJSON()
  })
  console.log(endTime)
  return await menu.aggregate()
    // .match({
    //   createdMember: '001'
    // })
    .addFields({
      matched: $.and([$.gte(['$time', startTime]), $.lte(['$time', endTime])])
    })
    .match({
      matched: !0
    })
    .sort({
      time: 1
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
async function getWeekMenu(event) {
  const db = cloud.database();
  const menu = db.collection('Menu');
  const $ = db.command.aggregate;
  // let now = new Date();
  let now = new Date(event.now);
  now = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  console.log(now)
  let weekday_now = now.getDay();//0是星期日

  let startDay = new Date(now.getTime() - weekday_now * 24 * 60 * 60 * 1000);
  let start = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate());
  console.log(start)
  let startTime = $.dateFromString({
    dateString: start.toJSON()
  })
  let endDay = new Date(now.getTime() + (7 - weekday_now) * 24 * 60 * 60 * 1000);
  let end = new Date(endDay.getFullYear(), endDay.getMonth(), endDay.getDate());
  console.log(end)
  let endTime = $.dateFromString({
    dateString: end.toJSON()
  })
  return await menu.aggregate()
    .addFields({
      matched: $.and([$.gte(['$time', startTime]), $.lte(['$time', endTime])])
    })
    .match({
      matched: !0
    })
    .sort({
      time: 1
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
//根据menuId获取菜单内容
// async function getMenuByMenuId(event) {
//   const db = cloud.database();
//   const menu = db.collection('Menu');
//   let menuId = event.menuId;

// }