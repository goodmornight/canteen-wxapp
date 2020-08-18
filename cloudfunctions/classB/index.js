// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event);
  // const { OPENID } = cloud.getWXContext();
  const action = event.action;
  switch (action) {
    case 'getBsinA': {
      return getBsinA(event);
    };
    default: {
      return
    }
  }
}
//查找classA下对应的所有classB
//输入classA:classA唯一id
//成功返回项目下所有ClassB信息并联合classA的数据，失败返回空
async function getBsinA(event) {
  const db = cloud.database();
  const classB = db.collection('ClassB');
  const _ = db.command;
  const $ = _.aggregate;
  let classAId = event.classA;
  return await classB.aggregate()
  .match({
    classA: classAId
  })
  .lookup({
    from:"ClassA",
    // localField:"classA",
    // foreignField:"_id",
    // as:"classADetail"
    let:{
      classAId:"$classA"
    },
    pipeline:$.pipeline()
    .match(_.expr(
      $.eq(['$_id', '$$classAId'])
    ))
    .project({
      _id:0,
      classAName:"$name"
    })
    .done(),
    as:"classADetail"
  })
  .replaceRoot({
    newRoot: $.mergeObjects([ $.arrayElemAt(['$classADetail', 0]), '$$ROOT' ])
  })
  .project({
    classADetail: 0
  })
  .end()
  .then(res=>{
    console.log(res);
    return res.list;
  })
  .catch(err=>{
    console.log(err);
    return [];
  })
}
// async function getBsinA(event) {
//   const db = cloud.database();
//   const classB = db.collection('ClassB');
//   let classAId = event.classA;
//   return await classB.aggregate()
//   .match({
//     classA: classAId
//   })
//   .lookup({
//     from:"ClassA",
//     localField:"classA",
//     foreignField:"_id",
//     as:"classADetail"
//   })
//   .end()
//   .then(res=>{
//     console.log(res);
//     return res.list;
//   })
//   .catch(err=>{
//     console.log(err);
//     return [];
//   })

// }
// async function getBsinA(event) {
//   const db = cloud.database();
//   const classB = db.collection('ClassB');
//   let classAId = event.classA;
//   return await classB.where({
//     classA: classAId
//   }).get().then(res => {
//     console.log(res);
//     return res.data;
//   }).catch(err => {
//     console.log(err);
//     return [];
//   })
// }