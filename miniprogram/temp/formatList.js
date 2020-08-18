//用于menu页面
const weekDays=['星期日','星期一','星期二','星期三','星期四','星期五','星期六']
const dish = ['早餐','午餐','晚餐'];
let list = [];
// 结构
// list=[{
//   title_w:'星期日',
//   list_w:[{
//     _id:'',
//     title_c:'早餐',
//     list_c:[{
//       className:'主食',
//       list_d:[{}]
//     }]
//   }]
// }]
weekDays.forEach(item_w=>{
  let temp_w = {};
  temp_w.title_w=item_w;
  temp_w.list_w = [];
  dish.forEach(item_c=>{
    let temp_c = {};
    temp_c.title_c = item_c;
    temp_c.list_c=[];
    temp_w.list_w.push(temp_c)
  });
  list.push(temp_w);
});
module.exports = {
  menuList:list
}