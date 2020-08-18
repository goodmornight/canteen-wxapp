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
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    activeTab: 0,
    calendarShow: false,//显示日历
    date: '',
    defaultDate: new Date().getTime(),
    minDate: new Date(minDay.getFullYear(), minDay.getMonth(), minDay.getDate()).getTime(),
    maxDate: new Date(maxDay.getFullYear(), maxDay.getMonth(), maxDay.getDate()).getTime(),
    bottomShow: false,//测试，用于显示输入框
    rateList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    //加载动画
    Toast.loading({
      duration: 0,
      mask: true,
      message: '加载中...'
    });
    let that = this;
    let rateList = that.data.rateList;
    let date = that.formatDate(newDay);
    that.setData({
      date: date
    });
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo == {} || userInfo == '') {
      let userInfo_cloud = await wx.cloud.callFunction({
        name: 'users',
        data: {
          action: 'getUserInfo'
        }
      }).then(res => {
        console.log(res);
        return res.result;

      }).catch(err => {
        console.log(err)
        return {};
      });
      if (userInfo_cloud == {} || userInfo_cloud == '') {
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
        that.setData({
          userInfo: userInfo_cloud
        })
        wx.setStorageSync('userInfo', userInfo_cloud)
      }
    } else {
      that.setData({
        userInfo: userInfo
      })
    }
    let userInfo_final = that.data.userInfo;
    if (userInfo_final != {} || userInfo_final != '') {
      Toast.loading({
        duration: 0,
        mask: true,
        message: '加载中...'
      });
      let date = new Date();
      that.getRateList(date, userInfo_final);
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
    }
  },
  onStarChange(e) {
    console.log(e)
    let that = this;
    let rateList = that.data.rateList;
    let idx1 = e.currentTarget.dataset.idx1;//大的列表的定位
    let idx2 = e.currentTarget.dataset.idx2;//小的列表的定位
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
    let usedTime = rateList[idx1].usedTime;
    await wx.cloud.callFunction({
      name: 'comment',
      data: {
        action: 'addComment',
        createdTime: new Date(),//创建时间
        userId: userInfo.userId,//用户编号
        dishId: listItem._id,//菜品ID
        dishName: listItem.name,//菜名
        rate: rate,//打星
        otherComment: textRate,//其他评价
        usedTime: usedTime//用餐时间
      }
    })
      .then(res => {
        console.log(res);
        if (res.result.state == 1) {
          Toast('提交成功');
          rateList[idx1].list.splice(idx2, 1);
          that.setData({
            rateList: rateList
          })
        } else {
          Toast.fail('提交失败')
        }
      })
      .catch(err => {
        console.log(err);
        Toast.fail('系统错误')
      })
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
    this.setData({ calendarShow: true });
  },
  onCalendarClose() {
    this.setData({ calendarShow: false });
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
    let rateList = [{ tab: '早餐', list: [] }, { tab: '午餐', list: [] }, { tab: '晚餐', list: [] }, { tab: '订单', list: [] }];
    let orderIdList = [];//用于避免菜品重复
    let recordIdList = [];//用于避免重复
    let list = await wx.cloud.callFunction({
      name: "rate",
      data: {
        action: "getRecordingAndOrder",
        now: date,
        userId: userInfo.userId
      }
    })
      .then(res => {
        console.log(res);
        return res.result;
      })
      .catch(err => {
        console.log(err);
        return [];
      })
    if (list.length != 0) {
      let rateIdDetail = await wx.cloud.callFunction({
        name: "comment",
        data: {
          action: "getDayComment",
          start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0),
          end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59),
          userId: userInfo.userId
        }
      })
        .then(res => {
          console.log(res);
          return res.result;
        })
        .catch(err => {
          console.log(err);
          return [];
        });
      rateIdDetail.forEach(item => {
        if (orderIdList.indexOf(item) == -1) {
          orderIdList.push(item.dishId)
          recordIdList.push(item.dishId)
        }
      })
    }
    let orderList = list.orderList;
    let recordList = list.recordList;

    if (orderList != null || orderList.length != 0) {
      orderList.forEach(item => {
        rateList[3].usedTime = new Date(item.createdTime);
        let orderDetail = item.orderList;
        orderDetail.forEach(item_detail => {
          if (orderIdList.indexOf(item_detail._id) == -1) {
            orderIdList.push(item_detail._id);
            if (item_detail.isAssessed == undefined || item_detail.isAssessed == '') {
              item_detail.isAssessed = false;
              item_detail.rate = 0;
            }
            if (!item_detail.isAssessed) {
              rateList[3].list.push(item_detail)
            }
          }

        })
      })
    }
    if (recordList != null || recordList.length != 0) {

      recordList.forEach(item => {
        rateList[item.state - 1].usedTime = new Date(item.time);
        let recordListDetail = item.menu[0].menuList;
        recordListDetail.forEach(item_detail => {

          if (recordIdList.indexOf(item_detail._id) == -1) {
            recordIdList.push(item_detail._id);
            if (item_detail.isAssessed == undefined || item_detail.isAssessed == '') {
              item_detail.isAssessed = false;
              item_detail.rate = 0;
            }
            if (!item_detail.isAssessed) {
              rateList[item.state - 1].list.push(item_detail)
            }
          }

        })

      })
    }
    that.setData({
      rateList: rateList
    })
    Toast.clear();
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