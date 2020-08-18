//用于rate页面
const tabs = ['早餐','午餐','晚餐','订单'];
let list = [];
// 结构
// list=[{
//   tab:'早餐',
//   list:[{}]
// }]
tabs.forEach(item=>{
  let temp = {};
  temp.tab = item;
  temp.list = [];
  list.push(temp);
})
console.log(list)
module.exports = {
  rateList:list
}