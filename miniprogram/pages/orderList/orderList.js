// miniprogram/pages/orderList/orderList.js
import Toast from '@vant/weapp/toast/toast';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    dishes: [],
    totalList: [],
    date: '', //这个订单的时间
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    //加载动画
    // Toast.loading({
    //   duration:0,
    //   mask: true,
    //   message: '加载中...'
    // });
    that.getTotalDishes();
    that.getTotalList();
  },
  getTotalDishes: function () {
    let that = this;
    // 获得所有的菜品列表
    wx.request({
      url: app.globalData.requestURL + '/Dishes/getall',
      method: 'GET',
      data: {},
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        if (res.data.length != 0) {
          let dishes = res.data.filter(item => item.isInside == false)
          console.log(dishes)
          that.setData({
            dishes: dishes
          })
        } else {
          Toast.fail('系统错误');
        }
      },
      fail(err) {
        console.log('请求不到dishes');
        Toast.fail('系统错误');
      }
    })
  },
  getTotalList: function () {
    let that = this;
    let totalList = [];
    let className = [];
    let now = new Date();
    let today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    let now16 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0, 0);
    let start;
    let end;
    let list;
    let final = [];
    // 当天0-16点下单，下的是明天的单
    //如果当前时间已经过了16点，显示明天的订餐数，如果当前时间在16点以前，显示今天订餐数
    if (now.getTime() > now16.getTime()) {
      start = today;
      // end = now;
      end = now16;
      that.setData({
        date: that.formatDate(today)
      })
    } else {
      let yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0);
      end = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 16, 0, 0);
      that.setData({
        date: that.formatDate(yesterday)
      })
    }
    wx.request({
      url: app.globalData.requestURL + '/Order/get', // 获取用餐人数
      method: 'GET',
      data: {
        // createdTime: that.formatDateforSQL(start),
        // createdTimeend: that.formatDateforSQL(end)
        createdTime: '2020-09-02 02:35:26',
        createdTimeend: '2020-09-04 02:35:26'
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res.data)
        list = res.data;
        if (list.length != 0) {
          list.forEach(item => {
            let orderList = item.orderList.split(';')
            orderList.forEach(order_item => {
              let order = order_item.split(',');
              let dishDetail = that.data.dishes.filter(detail => order[0] == detail._id)
              console.log(dishDetail)
              final.push({
                ...dishDetail[0],
                num: parseInt(order[1])
              })
            })
          })
        }
        console.log(final)
      },
      fail(err) {
        console.log(err)
        Toast.fail('系统错误');
      }
    })
    // let list = await wx.cloud.callFunction({
    //   name: 'order',
    //   data: {
    //     action: 'getOrderNum',
    //     start: start,
    //     end: end,
    //   }
    // })
    //   .then(res => {
    //     console.log(res)
    //     return res.result.list;
    //   })
    //   .catch(err => {
    //     console.log(err);
    //     return [];
    //   })
    // console.log(list);
    // if (list.length != 0) {
    //   list.forEach(item => {
    //     if (className.indexOf(item.className) == -1) {
    //       className.push(item.className);
    //       let temp = {};
    //       temp.className = item.className;
    //       temp.list = [];
    //       let itemList = temp.list;
    //       let temp_item = {};
    //       temp_item.name = item.dishName;
    //       temp_item.num = item.dishNum;
    //       itemList.push(temp_item);
    //       totalList.push(temp);
    //     } else {
    //       let idx1 = className.indexOf(item.className);
    //       let itemList = totalList[idx1].list;
    //       if (itemList.length != 0) {
    //         let j=0;
    //         for (let i = 0; i < itemList.length; i++) {
    //           if (itemList[i].name == item.dishName) {
    //             itemList[i].num += item.dishNum;
    //           }else{
    //             j++;
    //           }
    //         }
    //         if (j == itemList.length) {
    //           let temp = {};
    //           temp.name = item.dishName;
    //           temp.num = item.dishNum;
    //           itemList.push(temp)
    //         }

    //       } else {
    //         let temp = {};
    //         temp.name = item.dishName;
    //         temp.num = item.dishNum;
    //         itemList.push(temp)
    //       }
    //     }

    //   })
    //   that.setData({
    //     totalList: totalList
    //   })
    // }
  },
  overTen(num) {
    if (num < 10) {
      return '0' + num;
    } else {
      return '' + num;
    }
  },
  // 04/04（月/日）
  formatDate(date) {
    date = new Date(date);
    return `${this.overTen(date.getMonth() + 1)}/${this.overTen(date.getDate())}`;
  },
  // 2020-04-04 00:00:00
  formatDateforSQL(date) {
    date = new Date(date);
    return `${date.getFullYear()}-${this.overTen(date.getMonth() + 1)}-${this.overTen(date.getDate())} ${this.overTen(date.getHours())}:${this.overTen(date.getMinutes())}:${this.overTen(date.getSeconds())}`;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    Toast.clear();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})