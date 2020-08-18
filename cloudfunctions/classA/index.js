// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event);
  // const { OPENID } = cloud.getWXContext();
  const action = event.action;
  switch (action) {
    case 'getPPP': {
      return getPPP(event);
    };
    default: {
      return
    }
  }
}
//查找初始密码
//输入classA:classA唯一id
//成功返回项目信息，失败返回空
async function getPPP(event) {
  const db = cloud.database();
  const classA = db.collection('ClassA');
  let classAId = event.classA;
  return await classA.where({
    _id: classAId
  }).get().then(res => {
    console.log(res);
    if(res.data.length!=0){
      return res.data[0];
    }else{
      return res.data;
    }
    
  }).catch(err => {
    console.log(err);
    return;
  })
}
