// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
//用于操作数据表中Users的函数
//需要传入参数：
// action：操作函数名称
exports.main = async (event, context) => {
  console.log(event);

  const { OPENID } = cloud.getWXContext();
  console.log(OPENID)
  const action = event.action;
  switch (action) {
    //获取所有用户
    case 'getAllUsers': {
      return getAllUsers();
    };
    //获得用户信息
    case 'getUserInfo': {
      return getUserInfo(OPENID);
    };
    //判断是否为用户
    case 'isTrueUser': {
      return isTrueUser(OPENID, event);
    };
    //解除绑定，清除openid
    case 'clearOpenid': {
      return clearOpenid(event);
    };
    //修改密码
    case 'updatePPP': {
      return updatePPP(event);
    };
    default: {
      return
    }
  }
}
async function getAllUsers() {
  const db = cloud.database();
  const _ = db.command;
  const users = db.collection('Users');
  const MAX_LIMIT = 100;
  const countResult = await users.where({
    rank:_.lt(3)
  }).count();
  const total = countResult.total;//users中用户人数,除了超级管理员
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100);
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = users.where({
      rank:_.lt(3)
    }).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  // 等待所有
  return (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  })
}
//查找是否存在该用户
async function getUserInfo(OPENID) {
  const db = cloud.database();
  const users = db.collection('Users');

  return await users
    .aggregate()
    .match({
      _openid: OPENID
    })
    .project({
      ppp: 0
    })
    .end()
    // .where({
    //   _openid: OPENID
    // }).get()
    .then(res => {
      console.log(res);
      if (res.list.length != 0) {
        return res.list[0];
      } else {
        return res.list;
      }

    }).catch(err => {
      console.log(err);
      return [];
    })
}
//查看用户身份和密码是否正确，
// 输入值num用户编号，pwd用户密码，
// 返回值为-1为系统错误，返回值为0为不存在该用户更新失败，返回值为1存在该用户并更新成功
async function isTrueUser(OPENID, event) {
  const db = cloud.database();
  const users = db.collection('Users');
  let userId = event.num;
  let ppp = event.pwd;
  let user = await users.where({
    userId: userId,
    ppp: ppp
  }).get()
    .then(res => {
      console.log(res)
      return res.data;
    })
    .catch(err => {
      console.log(err);
      return [];
    });
  if (user.length > 0 && (user[0]._openid == undefined || user[0]._openid == "")) {
    // console.log(user[0]._openid)
    console.log('初始化用户');
    return await users.where({
      userId: userId,
      ppp: ppp
    }).update({
      data: {
        _openid: OPENID
      }
    }).then(async function (res) {
      console.log(res);
      let stats = res.stats.updated;
      if (stats > 0) {
        let userInfo = await getUserInfo(OPENID).then(res_userInfo => {
          return res_userInfo;
        }).catch(err => {
          return {}
        })
        console.log(userInfo)
        if (userInfo != {}) {
          if (userInfo.rank < 3) {
            // 非超级管理员
            const classA_from_user = userInfo.classA;
            const classA = await cloud.callFunction({
              name: 'classA',
              data: {
                action: "getPPP",
                classA: classA_from_user
              }
            }).then(res_classA => {
              console.log(res_classA)
              return res_classA.result;
            }).catch(err => {
              console.log(err);
              return {};
            });
            //获得classA的数据后，判断用户密码是否是初始密码
            if (classA != {}) {
              if (classA.ppp == ppp) {
                return {
                  stats: stats,
                  isOriginalPwd: true,//是否是初始密码
                  userInfo: userInfo
                };
              } else {
                return {
                  stats: stats,
                  isOriginalPwd: false,//是否是初始密码
                  userInfo: userInfo
                };
              }
            } else {
              //classA云函数调用错误时
              return {
                stats: stats,
                isOriginalPwd: false,//是否是初始密码
                userInfo: userInfo
              };
            }
          } else {
            console.log(userInfo.rank)
            // 超级管理员
            return {
              stats: stats,
              userInfo: userInfo
            };
          }
        } else {
          let stats = -2;
          return { stats: stats };
        }

      } else {
        return { stats: stats };
      }
    }).catch(err => {
      console.log(err);
      let stats = -2;
      return { stats: stats };
    })
  } else {
    // console.log(user[0]._openid)
    console.log("已存在用户")
    let stats = -1;
    return { stats: stats };
  }
}
//清除该用户的openid
//输入用户的编号userId
//返回更新状态
async function clearOpenid(event) {
  const db = cloud.database();
  const users = db.collection('Users');
  let userId = event.userId;
  return await users.where({
    userId: userId
  }).update({
    data: {
      _openid: ""
    }
  }).then(res => {
    console.log(res);
    return { stats: res.stats.updated };
  }).catch(err => {
    console.log(err);
    return {};
  })
}
//修改用户密码
//修改ppp字段
//输入
// {
//   action:'updatePPP',
//   userId:'',
//   openid:'',
//   newPPP:''
// }
//返回更新状态
async function updatePPP(event) {
  const db = cloud.database();
  const users = db.collection('Users');
  let userId = event.userId;
  let openid = event.openid;
  let newPPP = event.newPPP;
  return await users.where({
    userId: userId,
    _openid: openid
  }).update({
    data: {
      ppp: newPPP
    }
  }).then(res => {
    return {
      stats: res.stats.updated
    }
  })
    // .then(async function(res){
    //   if(res.stats.updated==1){
    //     return await users.aggregate()
    //     .match({
    //       userId: userId
    //     })
    //     .project({
    //       ppp:0
    //     })
    //     .end()
    //     .then(res_agg => {
    //       console.log(res_agg);
    //       return res.stats;   
    //     }).catch(err => {
    //       console.log(err);
    //       return {
    //         stats:1
    //       };
    //     })
    //   }else{
    //     return {
    //       stats:res.stats.updated
    //     }
    //   }
    // })
    .catch(err => {
      console.log(err);
      return {
        stats: -1
      };
    })

}

