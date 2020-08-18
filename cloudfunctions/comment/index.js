// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event);
  const { OPENID } = cloud.getWXContext();
  const action = event.action;
  switch (action) {
    //添加评价
    case 'addComment': {
      return addComment(event);
    };
    //获取某天用户评价
    case 'getDayComment': {
      return getDayComment(event);
    };
    default: {
      return;
    }
  }
}
//添加评论
// 输入：createdTime创建时间,userId用户Id,dishId菜编号,dishName菜名,rate打星,otherComment其他评价,usedTime
async function addComment(event) {
  const db = cloud.database();
  const comment = db.collection('Comment');
  let createdTime = new Date(event.createdTime);
  let userId = event.userId;
  let dishId = event.dishId;
  let dishName = event.dishName;
  let rate = event.rate;
  let otherComment = event.otherComment;
  let usedTime = new Date(event.usedTime);
  return await comment.add({
    data: {
      createdTime: createdTime,//创建时间
      userId: userId,//用户编号
      dishId: dishId,//菜品ID
      dishName: dishName,//菜名
      rate: rate,//打星
      otherComment: otherComment,//其他评价
      usedTime:usedTime//用餐时间
    }
  })
    .then(res => {
      console.log(res)
      if (res._id != undefined) {
        return { state: 1 }
      } else {
        return { state: -1 }
      }
    })
    .catch(err => {
      console.log(err);
      return { state: -1 }
    })
}
//获取某天某用户评价
//输入：userId用户ID,start开始时间,end结束时间
//返回列表
async function getDayComment(event) {
  const db = cloud.database();
  const $ = db.command.aggregate;
  const comment = db.collection('Comment');
  let userId = event.userId;
  let start = new Date(event.start);
  let end = new Date(event.end);
  let startTime = $.dateFromString({
    dateString: start.toJSON()
  });
  console.log(startTime)
  let endTime = $.dateFromString({
    dateString: end.toJSON()
  });
  console.log(endTime)
  return await comment.aggregate()
    .match({
      userId: userId,
    })
    .addFields({
      matched: $.and([$.gte(['$usedTime', startTime]), $.lte(['$usedTime',endTime])])
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