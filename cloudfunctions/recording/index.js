// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event);
  const { OPENID } = cloud.getWXContext();
  const action = event.action;
  switch (action) {
    //添加就餐报备
    case 'addOutsideRecording': {
      return addOutsideRecording(event);
    };
    //获取报备信息
    case 'getOutsideRecording': {
      return getOutsideRecording(event);
    };
    //获取当天内部人员用餐记录
    case 'getTodayInsideRecording': {
      return getTodayInsideRecording(event);
    };
    //获取时间段内的某人的用餐记录
    case 'getRecording': {
      return getRecording(event);
    };
    //获取时间段内创建的某人的用餐记录
    case 'getRecordingByCreatedTime': {
      return getRecordingByCreatedTime(event);
    };

    //获取当天用餐人数以及报备的列表
    case 'getRecordingNum': {
      return getRecordingNum(event);
    };
    //判断是否是自动生成的记录
    case 'isAutoRecording': {
      return isAutoRecording(event);
    };
    //用户修改记录
    case 'updateRecordingById': {
      return updateRecordingById(event);
    };
    //修改外部人员用餐记录
    case 'updateOutsideRecordingById': {
      return updateOutsideRecordingById(event);
    };
    //删除一条记录
    case 'removeRecordingById': {
      return removeRecordingById(event);
    };
    default: {
      return;
    }
  }
}
//添加报备
// 输入：createdTime客户端创建时间，userId用户编号，menuId该餐编号，number用餐人数，state哪一餐，others是自己用餐还是报备
// 输出添加数据后的状态state:1添加成功，-1则添加失败,0则没找到对应的菜单
async function addOutsideRecording(event) {
  const db = cloud.database();
  const recording = db.collection('Recording');
  // const menu = db.collection('Menu');
  let createdTime = new Date(event.createdTime);//客户端创建时间
  let userId = event.userId;//用户编号
  let number = event.number;//用餐人数
  let menuId = event.menuId;//该餐编号
  let state = event.state;//早餐1，午餐2，晚餐3
  let others = event.others;//报备true/自己用餐false
  let time;
  // let time = await getTime(createdTime, state);
  if (state == 2) {
    time = new Date(createdTime.getFullYear(), createdTime.getMonth(), createdTime.getDate(), 12, 0, 0)
  } else if (state == 3) {
    time = new Date(createdTime.getFullYear(), createdTime.getMonth(), createdTime.getDate(), 18, 0, 0)
  } else {
    time = new Date(createdTime.getFullYear(), createdTime.getMonth(), createdTime.getDate(), 8, 0, 0)
  }
  console.log(time)

  return await recording.add({
    data: {
      createdTime: createdTime,
      time: time,
      userId: userId,
      menuId: menuId,
      number: number,
      state: state,
      others: others
    }
  })
    .then(res => {
      console.log(res)
      if (res._id != undefined) {
        return { state: 1 }
        // return 1;
      } else {
        return { state: -1 }
        // return -1;
      }

    })
    .catch(err => {
      console.log(err);
      return { state: -1 }
      // return -1;
    })
}
//获取报备信息
// 输入：start开始时间,end结束时间
async function getOutsideRecording(event) {
  const db = cloud.database();
  const $ = db.command.aggregate;
  const recording = db.collection('Recording');
  let start = new Date(event.start);
  let end = new Date(event.end);
  console.log(start);
  console.log(end)
  let startTime = $.dateFromString({
    dateString: start.toJSON()
  });
  let endTime = $.dateFromString({
    dateString: end.toJSON()
  });
  return await recording.aggregate()
    .match({
      others: true
    })
    .addFields({
      matched: $.and([$.gte(['$createdTime', startTime]), $.lte(['$createdTime', endTime])])
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
//获取某一天的某个人的就餐记录
//输入：当前时间now,用户编号userId
//返回当天的用餐记录数组
async function getTodayInsideRecording(event) {
  const db = cloud.database();
  const $ = db.command.aggregate;
  const recording = db.collection('Recording');
  let today = new Date();
  let now = new Date(event.now);
  let userId = event.userId;
  let start;
  let end;
  console.log(today.getTime());
  console.log(now.getTime());
  if (today.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {//如果是当天
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 0);
  }
  console.log(start);
  console.log(end)
  let startTime = $.dateFromString({
    dateString: start.toJSON()
  });
  let endTime = $.dateFromString({
    dateString: end.toJSON()
  });
  console.log(startTime);
  console.log(endTime)
  return await recording.aggregate()
    .match({
      userId: userId,
    })
    .addFields({
      matched: $.and([$.gte(['$time', startTime]), $.lte(['$time', endTime])])
    })
    .match({
      matched: !0
    })
    .lookup({
      from: 'Menu',
      localField: 'menuId',
      foreignField: '_id',
      as: 'menu',
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
//获取某个时间段内某人的用餐记录
// 输入start开始时间,end结束时间,userId用户编号
async function getRecording(event) {
  const db = cloud.database();
  const $ = db.command.aggregate;
  const recording = db.collection('Recording');
  let userId = event.userId;
  let start = new Date(event.start);
  let end = new Date(event.end);

  console.log(start);
  console.log(end)
  let startTime = $.dateFromString({
    dateString: start.toJSON()
  });
  let endTime = $.dateFromString({
    dateString: end.toJSON()
  });
  return await recording.aggregate()
    .match({
      userId: userId,
    })
    .addFields({
      matched: $.and([$.gte(['$time', startTime]), $.lte(['$time', endTime])])
    })
    .match({
      matched: !0
    })
    .lookup({
      from: 'Menu',
      localField: 'menuId',
      foreignField: '_id',
      as: 'menu',
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
//获取当天用餐人数以及报备的列表
//输入：start开始时间,end结束时间
async function getRecordingNum(event) {
  const db = cloud.database();
  const $ = db.command.aggregate;
  const recording = db.collection('Recording');
  let start = new Date(event.start);
  let end = new Date(event.end);
  console.log(start);
  console.log(end)
  let startTime = $.dateFromString({
    dateString: start.toJSON()
  });
  let endTime = $.dateFromString({
    dateString: end.toJSON()
  });
  return await recording.aggregate()
    .addFields({
      matched: $.and([$.gte(['$time', startTime]), $.lte(['$time', endTime])])
    })
    .match({
      matched: !0
    })
    .bucket({
      groupBy: '$state',
      boundaries: [1, 2, 3, 4],
      default: 'other',
      output: {
        count: $.sum('$number')
      }
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
//判断该记录是否是系统自动生成的
// 输入用户userId，开始时间start,结束时间end
async function isAutoRecording(event) {
  const db = cloud.database();
  const $ = db.command.aggregate;
  const recording = db.collection('Recording');
  let userId = event.userId;
  let start = new Date(event.start);
  let end = new Date(event.end);
  console.log(start);
  console.log(end)
  let startTime = $.dateFromString({
    dateString: start.toJSON()
  });
  let endTime = $.dateFromString({
    dateString: end.toJSON()
  });
  return await recording.aggregate()
    .match({
      userId: userId,
      isAuto: true
    })
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
//更新个人用餐内容，更新时间createdTime,是否是自动isAuto,用餐数量number
//输入：当前时间now,整理好的formateList
async function updateRecordingById(event) {
  const db = cloud.database();
  const recording = db.collection('Recording');
  let now = new Date(event.now);
  let state = 0;
  let formatList = event.formatList;
  const tasks = [];
  for (let i = 0; i < formatList.length; i++) {
    const promise = recording.doc(formatList[i]._id).update({
      data: {
        createdTime: now,
        number: (formatList[i].isTrue ? 1 : 0),
        isAuto: false
      }
    })

      .then(res => {
        console.log(res)
        state += res.stats.updated;
      })
      .catch(err => {
        console.log(err)
        state = -10;
      })
    tasks.push(promise)
  }
  await Promise.all(tasks);
  return state;
}
//更新外部人员用餐内容，更新时间createdTime,是否是自动isAuto,用餐数量number
//输入：修改时间createdTime,数据库_id,哪一餐state,哪一份菜单menuId,用餐时间time等
async function updateOutsideRecordingById(event) {
  const db = cloud.database();
  const recording = db.collection('Recording');
  let _id = event._id;
  let createdTime = new Date(event.createdTime);//客户端创建时间
  let userId = event.userId;//用户编号
  let number = event.number;//用餐人数
  let menuId = event.menuId;//该餐编号
  let state = event.state;//早餐1，午餐2，晚餐3
  let others = event.others;//报备true/自己用餐false
  let time;
  if (state == 2) {
    time = new Date(createdTime.getFullYear(), createdTime.getMonth(), createdTime.getDate(), 12, 0, 0)
  } else if (state == 3) {
    time = new Date(createdTime.getFullYear(), createdTime.getMonth(), createdTime.getDate(), 18, 0, 0)
  } else {
    time = new Date(createdTime.getFullYear(), createdTime.getMonth(), createdTime.getDate(), 8, 0, 0)
  }
  console.log(time)

  await recording.doc(_id).update({
    data: {
      createdTime: createdTime,
      userId:userId,
      number: number,
      state: state,
      menuId: menuId,
      time:time,
      others:others
    }
  })
    .then(res => {
      console.log(res)
      return res;
    })
    .catch(err => {
      console.log(err)
    })

}
//获取某个时间段内创建的某人的用餐记录
// 输入start开始时间,end结束时间,userId用户编号
async function getRecordingByCreatedTime(event) {
  const db = cloud.database();
  const $ = db.command.aggregate;
  const recording = db.collection('Recording');
  let userId = event.userId;
  let start = new Date(event.start);
  let end = new Date(event.end);

  console.log(start);
  console.log(end)
  let startTime = $.dateFromString({
    dateString: start.toJSON()
  });
  let endTime = $.dateFromString({
    dateString: end.toJSON()
  });
  return await recording.aggregate()
    .match({
      userId: userId,
    })
    .addFields({
      matched: $.and([$.gte(['$createdTime', startTime]), $.lte(['$createdTtime', endTime])])
    })
    .match({
      matched: !0
    })
    .lookup({
      from: 'Menu',
      localField: 'menuId',
      foreignField: '_id',
      as: 'menu',
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
//删除某一条记录
// 输入：_id
async function removeRecordingById(event) {
  const db = cloud.database();
  const recording = db.collection('Recording');
  let _id = event._id;
  return await recording.doc(_id).remove()
    .then(res => {
      console.log(res);
      return res;
    })
    .catch(err => {
      console.log(err)
    })
}
function getTime(createdTime, state) {
  return new Promise(function (resolve, reject) {
    let time;
    if (state == 2) {
      time = new Date(createdTime.getFullYear(), createdTime.getMonth(), createdTime.getDate(), 12, 0, 0)
    } else if (state == 3) {
      time = new Date(createdTime.getFullYear(), createdTime.getMonth(), createdTime.getDate(), 18, 0, 0)
    } else {
      time = new Date(createdTime.getFullYear(), createdTime.getMonth(), createdTime.getDate(), 8, 0, 0)
    }
    resolve(time)
  })
}
