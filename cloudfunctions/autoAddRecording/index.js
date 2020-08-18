// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database();
  const _ = db.command;
  const recording = db.collection('Recording');
  let now = new Date();
  // let now21 = new Date(now.getFullYear(),now.getMonth(),now.getDate(),21,0,0);
  // if(now.getTime()>now21.getTime)
  // let tomorrow = now;
  let tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  console.log(now);
  console.log(tomorrow)
  let sendValue = {
    //预约产品，20字以内字符
    thing1: {
      value: '个人就餐报备成功'
    },

    //使用日期，年月日格式（支持+24小时制时间），支持填时间段，两个时间点之间用“~”符号连接
    date2: {
      value: formatDateStr(tomorrow)
    },
    //温馨提示，20个以内字符
    thing3: {
      value: '个人报备可当餐前2个小时修改,默认就餐'
    },
  };
  let menuList = await cloud.callFunction({
    name: "menu",
    data: {
      action:"getDayMenu",
      // action: "getTodayMenu",
      day: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 0, 0, 0)
    }
  })
    .then(res => {
      console.log(res)
      return res.result;
    })
    .catch(err => {
      console.log(err)
      return;
    })
  let users = await cloud.callFunction({
    name: "users",
    data: {
      action: "getAllUsers"
    }
  })
    .then(res => {
      console.log(res);
      // return res.result.data;
      let userList = res.result.data;
      userList = userList.filter(function (cur) {
        return (cur._openid != undefined && cur._openid != '')
      })
      console.log(userList)
      //过滤一下
      return userList;
    })
    .catch(err => {
      console.log(err)
      return;
    })
  console.log(users);
  if (menuList.length != 0 && users.length != 0) {
    // if (users.length != 0) {
    for (let i = 0; i < users.length; i++) {
      for (let j = 0; j < menuList.length; j++) {
        let time = new Date(menuList[j].time);
        await recording.add({
          data: {
            createdTime: now,
            time: time,
            userId: users[i].userId,
            menuId: menuList[j]._id,
            number: 1,
            state: j + 1,
            others: false,
            isAuto: true
          }
        })
          .then(res => {
            console.log(res)

          })
          .catch(err => {
            console.log(err)
          })
      }
      //发送订阅信息
      await cloud.callFunction({
        name: 'message',
        data: {
          action: 'sendMenu',
          _openid: users[i]._openid,
          sendValue: sendValue
        }
      })
        .then(res_after => {
          console.log(res_after);
        })
        .catch(err => {
          console.log(err)
        })
    }

  } else {
    if (menuList.length == 0) {
      console.log('menuList为空')
    }
    if (users.length == 0) {
      console.log('users为空')
    }

  }
}
function overTen(num) {
  if (num < 10) {
    return '0' + num;
  } else {
    return '' + num;
  }
}

// 2020年04月04日（年/月/日）
function formatDateStr(date) {
  date = new Date(date);
  return `${date.getFullYear()}年${overTen(date.getMonth() + 1)}月${overTen(date.getDate())}日`;
}