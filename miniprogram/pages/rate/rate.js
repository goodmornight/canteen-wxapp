// miniprogram/pages/rate/rate.js
import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';
// const rate = require('../../temp/rateList.js');
const app = getApp();
const newDay = new Date();
// const firstTime = new Date(newDay.getFullYear(), newDay.getMonth(), newDay.getDate(), 0, 0, 0).getTime();
// const finalTime = new Date(newDay.getFullYear(), newDay.getMonth(), newDay.getDate(), 16, 0, 0).getTime();
const minDay = new Date(newDay.getTime() - 14 * 24 * 60 * 60 * 1000);
const maxDay = new Date(newDay.getTime());
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: wx.getStorageSync('userInfo'),
    allDishes: wx.getStorageSync('allDishes'),
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    fileURL: app.globalData.fileURL,
    activeTab: 0,
    calendarShow: false, //显示日历
    date: '',
    defaultDate: new Date().getTime(),
    minDate: new Date(minDay.getFullYear(), minDay.getMonth(), minDay.getDate()).getTime(),
    maxDate: new Date(maxDay.getFullYear(), maxDay.getMonth(), maxDay.getDate()).getTime(),
    bottomShow: false, //测试，用于显示输入框
    rateList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    //加载动画
    // Toast.loading({
    //   duration: 0,
    //   mask: true,
    //   message: '加载中...'
    // });

    let that = this;
    let rateList = that.data.rateList;
    let date = that.formatDate(newDay);
    that.setData({
      date: date
    });
    let userInfo = that.data.userInfo;
    if (userInfo == {} || userInfo == '') {
      Dialog.confirm({
        title: '身份验证',
        message: '为了更好的使用该小程序的其他功能，请您先进行身份验证',
        confirmButtonText: "身份验证",
        zIndex: 102,
        overlayStyle: {
          zIndex: 101
        }
      }).then(() => {
        // on confirm
        wx.reLaunch({
          url: '../check/check',
        })
      }).catch(() => {
        // on cancel
        wx.reLaunch({
          url: '../index/index',
        })
      });
    } else {
      let date = new Date();
      that.getRateList(date, userInfo);
    }
    //   if (userInfo) {
    //     Dialog.confirm({
    //       title: '身份验证',
    //       message: '为了更好的使用该小程序的其他功能，请您先进行身份验证',
    //       confirmButtonText: "身份验证",
    //       zIndex: 102,
    //       overlayStyle: {
    //         zIndex: 101
    //       }
    //     }).then(() => {
    //       // on confirm
    //       wx.reLaunch({
    //         url: '../check/check',
    //       })
    //     }).catch(() => {
    //       // on cancel
    //       wx.reLaunch({
    //         url: '../index/index',
    //       })
    //     });
    //   } else {
    //     that.setData({
    //       userInfo: userInfo_cloud
    //     })
    //     wx.setStorageSync('userInfo', userInfo_cloud)
    //   }
    // } else {
    //   that.setData({
    //     userInfo: userInfo
    //   })
    // }
    // let userInfo_final = that.data.userInfo;
    // if (userInfo_final != {} || userInfo_final != '') {
    //   Toast.loading({
    //     duration: 0,
    //     mask: true,
    //     message: '加载中...'
    //   });
    // let date = new Date();
    // that.getRateList(date, userInfo_final);
    // //身份信息已绑定，并且有缓存
    // let list = await wx.cloud.callFunction({
    //   name: "rate",
    //   data: {
    //     action: "getRecordingAndOrder",
    //     now: new Date(),
    //     userId: userInfo_final.userId
    //   }
    // })
    //   .then(res => {
    //     console.log(res);
    //     return res.result;
    //   })
    //   .catch(err => {
    //     console.log(err);
    //     return [];
    //   })
    // let orderList = list.orderList;
    // let recordList = list.recordList;
    // if (orderList != null || orderList.length != 0) {
    //   orderList.forEach(item => {
    //     let orderDetail = item.orderList;
    //     orderDetail.forEach(item_detail => {

    //       if (item_detail.isAssessed == undefined || item_detail.isAssessed == '') {
    //         item_detail.isAssessed = false;
    //       }

    //       if (!item_detail.isAssessed) {
    //         rateList[3].list.push(item_detail)
    //       }

    //     })
    //   })
    // }
    // if (recordList != null || recordList.length != 0) {
    //   recordList.forEach(item => {
    //     let recordListDetail = item.menu[0].menuList;
    //     recordListDetail.forEach(item_detail => {
    //       if (item_detail.isAssessed == undefined) {
    //         item_detail.isAssessed = false;
    //       }
    //       if (!item_detail.isAssessed) {
    //         rateList[item.state - 1].list.push(item_detail)
    //       }
    //     })

    //   })
    // }
    // that.setData({
    //   rateList: rateList
    // })
    // }
  },
  onStarChange(e) {
    console.log(e)
    let that = this;
    let rateList = that.data.rateList;
    let idx1 = e.currentTarget.dataset.idx1; //大的列表的定位
    let idx2 = e.currentTarget.dataset.idx2; //小的列表的定位
    let star = e.detail;
    rateList[idx1].list[idx2].rate = star;
    rateList[idx1].list[idx2].isAssessed = true;
    that.setData({
      rateList: rateList
    })
  },
  toRateSubmit: async function (e) {
    console.log(e);
    let that = this;
    let rateList = that.data.rateList;
    let userInfo = that.data.userInfo;
    let idx1 = e.detail.target.dataset.idx1;
    let idx2 = e.detail.target.dataset.idx2;
    let listItem = rateList[idx1].list[idx2];
    let rate = e.detail.value.rate;
    let textRate = e.detail.value.textRate;
    let usedTime = rateList[idx1].list[idx2].usedTime;
    console.log({
      createdTime: new Date(), //创建时间
      userId: userInfo.userId, //用户编号
      dishId: listItem._id, //菜品ID
      dishName: listItem.name, //菜名
      rate: rate, //打星
      otherComment: textRate, //其他评价
      usedTime: usedTime //用餐时间
    })
    wx.request({
      url: app.globalData.requestURL + '/Comment/insert',
      method: 'POST',
      data: {
        createdTime: that.formatDateforSQL(new Date()), //创建时间
        userId: userInfo.userId, //用户编号
        dishId: listItem._id, //菜品ID
        dishName: listItem.name, //菜名
        rate: rate, //打星
        otherComment: textRate, //其他评价
        usedTime: that.formatDateforSQL(usedTime) //用餐时间
      },
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        console.log(res)
        if (res.errMsg == 'request:ok') {
          Toast('提交成功');
          rateList[idx1].list.splice(idx2, 1);
          that.setData({
            rateList: rateList
          })
        } else {
          Toast.fail('提交失败')
        }
      },
      fail(err) {
        console.log(err)
      }
    })

    // await wx.cloud.callFunction({
    //     name: 'comment',
    //     data: {
    //       action: 'addComment',
    //       createdTime: new Date(), //创建时间
    //       userId: userInfo.userId, //用户编号
    //       dishId: listItem._id, //菜品ID
    //       dishName: listItem.name, //菜名
    //       rate: rate, //打星
    //       otherComment: textRate, //其他评价
    //       usedTime: usedTime //用餐时间
    //     }
    //   })
    //   .then(res => {
    //     console.log(res);
    //     if (res.result.state == 1) {
    //       Toast('提交成功');
    //       rateList[idx1].list.splice(idx2, 1);
    //       that.setData({
    //         rateList: rateList
    //       })
    //     } else {
    //       Toast.fail('提交失败')
    //     }
    //   })
    //   .catch(err => {
    //     console.log(err);
    //     Toast.fail('系统错误')
    //   })
  },
  //显示评论框
  toTextShow(e) {
    console.log(e)
    let that = this;
    let idx1 = e.currentTarget.dataset.idx1;
    let idx2 = e.currentTarget.dataset.idx2;
    let rateList = that.data.rateList;
    rateList[idx1].list[idx2].isAssessed = true;
    that.setData({
      rateList: rateList
    })
  },
  //选择日期后确认
  onCalendarConfirm(event) {
    let that = this;
    //加载动画
    Toast.loading({
      duration: 0,
      mask: true,
      message: '加载中...'
    });
    let userInfo = wx.getStorageSync('userInfo');
    let date = new Date(event.detail);
    that.getRateList(date, userInfo);

    that.setData({
      calendarShow: false,
      date: that.formatDate(event.detail)
    });
  },
  onCalendarShow() {
    console.log('onshow')
    this.setData({
      calendarShow: true
    });
  },
  onCalendarClose() {
    this.setData({
      calendarShow: false
    });
  },
  formatDate(date) {
    date = new Date(date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  },
  //标签页
  onTabsChange(event) {
    console.log(event)
    wx.showToast({
      title: `切换到 ${event.detail.title}`,
      icon: 'none'
    });
  },
  // 从服务器获取要评价的列表
  getRateList: async function (date, userInfo) {
    let that = this;
    let allDishes = that.data.allDishes;
    let rateList = [{
      tab: '早餐',
      list: []
    }, {
      tab: '午餐',
      list: []
    }, {
      tab: '晚餐',
      list: []
    }, {
      tab: '订单',
      list: []
    }];

    let orderIdList = []; //用于避免菜品重复

    let start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    let end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
    let orderDate = new Date(date.getTime() - 24 * 60 * 60 * 1000);
    let start_order = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate(), 0, 0, 0)
    let end_order = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate(), 16, 0, 0)

    let orderList = [];
    console.log(start)
    console.log(end)
    wx.request({
      url: app.globalData.requestURL + '/Comment/getbyusedTime', // 获取用户订单列表
      method: 'GET',
      data: {
        // createdTime: '2020-08-25 21:59:06', // 测试数据
        // createdTimeend: '2020-08-26 21:59:06',
        usedTime: that.formatDateforSQL(start),
        usedTimeend: that.formatDateforSQL(end)
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res_comGET) {
        console.log(res_comGET.data)
        if (res_comGET.data) {

          // 获取用户订单列表
          wx.request({
            url: app.globalData.requestURL + '/Order/get',
            method: 'GET',
            data: {
              // createdTime: '2020-09-17 00:00:00', // 测试数据
              // createdTimeend: '2020-09-20 00:00:00',
              userId: userInfo.userId,
              createdTime: that.formatDateforSQL(start),
              createdTimeend: that.formatDateforSQL(end)
              // createdTime: that.formatDateforSQL(start_order),
              // createdTimeend: that.formatDateforSQL(end_order)
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success(res_orderGET) {
              console.log(res_orderGET.data)
              if (res_orderGET.data) {
                res_orderGET.data.forEach(item => {
                  let orderArr = item.orderList.split(';')
                  let tempArr = orderArr.map(arr => arr + ',' + item.createdTime)
                  orderList.push(...tempArr)
                })
                console.log(orderList)
                orderList.forEach(item => {
                  let id = parseInt(/^\d+/.exec(item)[0]);
                  let time = /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])\s([01][0-9]|[2][0-3]):[0-5][0-9]/.exec(item)[0]
                  let isExit = orderIdList.find(dish => dish == id) || res_comGET.data.find(dish => dish.dishId == id)
                  if (!isExit) {
                    orderIdList.push(id)
                    rateList[3].list.push({
                      ...allDishes.filter(item => item._id == id)[0],
                      rate: 0,
                      usedTime: new Date(time)
                    })
                  }
                })
                console.log(rateList)
                // 获取recording列表
                wx.request({
                  url: app.globalData.requestURL + '/Menu/getbytime',
                  method: 'GET',
                  data: {
                    // time: '2020-09-17 00:00:00', // 测试数据
                    // timeend: '2020-09-20 00:00:00',
                    time: that.formatDateforSQL(start),
                    timeend: that.formatDateforSQL(end),
                  },
                  header: {
                    'content-type': 'application/json'
                  },
                  success(res_menuGET) {
                    console.log(res_menuGET.data)
                    if (res_menuGET.data) {
                      let breakfast = new Set();
                      let lunch = new Set();
                      let dinner = new Set();
                      res_menuGET.data.forEach(item => {
                        if (!res_comGET.data.find(dish => dish.dishName == item.menuList)) {
                          if (item.state == 1) {
                            breakfast.add(item.menuList + ',' + item.time)
                          } else if (item.state == 2) {
                            lunch.add(item.menuList + ',' + item.time)
                          } else {
                            dinner.add(item.menuList + ',' + item.time)
                          }
                        }
                      })
                      for (let b of breakfast) {
                        let dish = b.split(',')[0];
                        let time = b.split(',')[1];
                        rateList[0].list.push({
                          ...allDishes.filter(item => item.name == dish)[0],
                          rate: 0,
                          usedTime: new Date(time)
                        })
                      }
                      for (let l of lunch) {
                        let dish = l.split(',')[0];
                        let time = l.split(',')[1];
                        rateList[0].list.push({
                          ...allDishes.filter(item => item.name == dish)[0],
                          rate: 0,
                          usedTime: new Date(time)
                        })
                      }
                      for (let d of dinner) {
                        let dish = d.split(',')[0];
                        let time = d.split(',')[1];
                        rateList[0].list.push({
                          ...allDishes.filter(item => item.name == dish)[0],
                          rate: 0,
                          usedTime: new Date(time)
                        })
                      }
                      console.log(rateList)
                      that.setData({
                        rateList: rateList
                      })
                      Toast.clear();
                    }
                  },
                  fail(err) {
                    console.log(err)
                    Toast.fail('系统错误')
                    Toast.clear();
                  }
                })
              }
            },
            fail(err) {
              console.log(err)
              Toast.fail('系统错误')
              Toast.clear();
            }
          })

        }
      },
      fail(err) {
        console.log(err)
        Toast.fail('系统错误')
        Toast.clear();
      }
    })


    // let list = await wx.cloud.callFunction({
    //   name: "rate",
    //   data: {
    //     action: "getRecordingAndOrder",
    //     now: date,
    //     userId: userInfo.userId
    //   }
    // })
    //   .then(res => {
    //     console.log(res);
    //     return res.result;
    //   })
    //   .catch(err => {
    //     console.log(err);
    //     return [];
    //   })
    // if (list.length != 0) {
    //   let rateIdDetail = await wx.cloud.callFunction({
    //     name: "comment",
    //     data: {
    //       action: "getDayComment",
    //       start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0),
    //       end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59),
    //       userId: userInfo.userId
    //     }
    //   })
    //     .then(res => {
    //       console.log(res);
    //       return res.result;
    //     })
    //     .catch(err => {
    //       console.log(err);
    //       return [];
    //     });
    //   rateIdDetail.forEach(item => {
    //     if (orderIdList.indexOf(item) == -1) {
    //       orderIdList.push(item.dishId)
    //       recordIdList.push(item.dishId)
    //     }
    //   })
    // }
    // let orderList = list.orderList;
    // let recordList = list.recordList;

    // if (orderList != null || orderList.length != 0) {
    //   orderList.forEach(item => {
    //     rateList[3].usedTime = new Date(item.createdTime);
    //     let orderDetail = item.orderList;
    //     orderDetail.forEach(item_detail => {
    //       if (orderIdList.indexOf(item_detail._id) == -1) {
    //         orderIdList.push(item_detail._id);
    //         if (item_detail.isAssessed == undefined || item_detail.isAssessed == '') {
    //           item_detail.isAssessed = false;
    //           item_detail.rate = 0;
    //         }
    //         if (!item_detail.isAssessed) {
    //           rateList[3].list.push(item_detail)
    //         }
    //       }

    //     })
    //   })
    // }
    // if (recordList != null || recordList.length != 0) {

    //   recordList.forEach(item => {
    //     rateList[item.state - 1].usedTime = new Date(item.time);
    //     let recordListDetail = item.menu[0].menuList;
    //     recordListDetail.forEach(item_detail => {

    //       if (recordIdList.indexOf(item_detail._id) == -1) {
    //         recordIdList.push(item_detail._id);
    //         if (item_detail.isAssessed == undefined || item_detail.isAssessed == '') {
    //           item_detail.isAssessed = false;
    //           item_detail.rate = 0;
    //         }
    //         if (!item_detail.isAssessed) {
    //           rateList[item.state - 1].list.push(item_detail)
    //         }
    //       }

    //     })

    //   })
    // }
    // that.setData({
    //   rateList: rateList
    // })
    // Toast.clear();
  },
  // 正则表达式解析菜品和数量
  getDishDetail(string) {
    let that = this;
    let id = parseInt(/^\d+/.exec(string)[0]);
    // let num = parseInt(/\d+$/.exec(string)[0]);
    let allDish = that.data.allDishes;
    return {
      ...allDish.filter(item => item._id == id)[0],
      // num: num
    } || null
  },
  // 2020-04-04 00:00:00
  formatDateforSQL(date) {
    date = new Date(date);
    return `${date.getFullYear()}-${this.overTen(date.getMonth() + 1)}-${this.overTen(date.getDate())} ${this.overTen(date.getHours())}:${this.overTen(date.getMinutes())}:${this.overTen(date.getSeconds())}`;
  },
  overTen(num) {
    if (num < 10) {
      return '0' + num;
    } else {
      return '' + num;
    }
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