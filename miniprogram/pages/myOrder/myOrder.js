// miniprogram/pages/myOrder/myOrder.js
import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';
const app = getApp();
const newDay = app.globalData.newDay;
const firstTime = new Date(newDay.getFullYear(), newDay.getMonth(), newDay.getDate(), 0, 0, 0).getTime();
const finalTime = new Date(newDay.getFullYear(), newDay.getMonth(), newDay.getDate(), 16, 0, 0).getTime();
const minDay = new Date(newDay.getTime() - 14 * 24 * 60 * 60 * 1000);
const maxDay = new Date(newDay.getTime() + 1 * 24 * 60 * 60 * 1000);
// console.log(newDay);
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    activeTab: 0, //标签页
    date: '',
    calendarShow: false,
    defaultDate: newDay.getTime(),
    minDate: new Date(minDay.getFullYear(), minDay.getMonth(), minDay.getDate()).getTime(),
    maxDate: new Date(maxDay.getFullYear(), maxDay.getMonth(), maxDay.getDate()).getTime(),
    list: [],
    totalPrice: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //加载动画
    Toast.loading({
      duration: 0,
      mask: true,
      message: '加载中...'
    });
    let that = this;
    let start = new Date(newDay.getFullYear(), newDay.getMonth(), newDay.getDate());
    let end = new Date(newDay.getTime() + 1 * 24 * 60 * 60 * 1000);
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo == {} || userInfo == '' || userInfo == []) {
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
        // wx.navigateTo({
        //   url: '../check/check',
        // })
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
        userInfo: userInfo
      });
      that.onList(userInfo, start, end);
    }

    // let date = new Date();
    that.setData({
      date: `${this.formatDate(start)} - ${this.formatDate(end)}`
    });

  },
  //标签页
  // onTabsChange(event) {
  //   console.log(event)
  //   wx.showToast({
  //     title: `切换到标签 ${event.detail.name}`,
  //     icon: 'none'
  //   });
  // },
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
  // 2020/3/26 14:23
  fullFormatDate(date) {
    date = new Date(date);
    return `${date.getFullYear()}/${this.overTen(date.getMonth() + 1)}/${this.overTen(date.getDate())} ${this.overTen(date.getHours())}:${this.overTen(date.getMinutes())}`
  },
  onCalendarConfirm: function (date) {
    console.log(date)
    let that = this;
    const [start, end] = date.detail;
    let userInfo = that.data.userInfo;
    that.setData({
      calendarShow: false,
      date: `${this.formatDate(start)} - ${this.formatDate(end)}`
      // date: this.formatDate(event.detail)
    });
    that.onList(userInfo, start, end);
  },
  onList: async function (userInfo, start, end) {
    //加载动画
    Toast.loading({
      duration: 0,
      mask: true,
      message: '加载中...'
    });
    let that = this;

    wx.request({
      url: app.globalData.requestURL + '/Order/get', // 获取用户订单列表
      method: 'GET',
      data: {
        time: '2020-09-01 00:00:00', // 测试数据
        timeend: '2020-09-13 00:00:00',
        userId: userInfo.userId,
        // time: that.formatDateforSQL(start),
        // timeend: that.formatDateforSQL(end)
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res.data)
        let result = res.data;
        let totalPrice = 0;
        let list = [{}];//整理好的内容列表
        let tempDateList = [];//日期列表
        result.forEach(item => {
          let today = new Date().getTime();
          let tempDate = new Date(item.createdTime).getTime();
          let tempDate_format = that.formatDate(tempDate);

          if (tempDate >= firstTime && today < finalTime) {
            item.completed = 0;//已下单，可修改
          } else {
            item.completed = 1;//正在处理，不可修改
          }
          if (item.completedTime) {
            console.log(totalPrice)
            let completedDate = new Date(item.completedTime).getTime();
            totalPrice += item.totalPrice;
            item.completedTime_format = that.fullFormatDate(completedDate);
            item.completed = 2;//已完成，可评价，需要在后台系统控制
          }
          
          item.createdTime_format = that.fullFormatDate(tempDate);
          if (tempDateList.indexOf(tempDate_format) == -1) {
            tempDateList.push(tempDate_format)
          }
        });

        for (let i = 0; i < tempDateList.length; i++) {
          list[i] = {};
          list[i].formatDate = tempDateList[i];
          list[i].items = [];
          result.forEach(item => {
            let tempDate = new Date(item.createdTime).getTime();
            let tempDate_format = that.formatDate(tempDate);
            if (tempDate_format == tempDateList[i]) {
              list[i].items.push(item)
            }
          })
        }

        that.setData({
          list: list,
          totalPrice: totalPrice
        });
        Toast.clear();
      },
      fail(err) {
        Toast.clear()
        console.log(err)
        Toast.fail('系统错误');
      }
    })

    // await wx.cloud.callFunction({
    //   name: "order",
    //   data: {
    //     action: "getOrder",
    //     userId: userInfo.userId,
    //     start: start.getTime(),
    //     end: end.getTime()
    //   }
    // })
    //   .then(res => {
    //     console.log(res)
    //     let result = res.result;
    //     let totalPrice = 0;
    //     let list = [{}];//整理好的内容列表
    //     let tempDateList = [];//日期列表
    //     result.forEach(item => {
    //       let today = new Date().getTime();
    //       let tempDate = new Date(item.createdTime).getTime();
    //       let tempDate_format = that.formatDate(tempDate);
    //       if (tempDate >= firstTime && today < finalTime) {
    //         item.completed = 0;//已下单，可修改
    //       } else {
    //         item.completed = 1;//正在处理，不可修改
    //       }
    //       if (item.completedTime != undefined) {
    //         console.log(totalPrice)
    //         let completedDate = new Date(item.completedTime).getTime();
    //         totalPrice += item.totalPrice;
    //         item.completedTime_format = that.fullFormatDate(completedDate);
    //         item.completed = 2;//已完成，可评价，需要在后台系统控制
    //       }
    //       // item.createdTime = new Date(new Date(item.createdTime).getTime()+8*60*60*1000);//格林威治时间与北京时间的转换


    //       item.createdTime_format = that.fullFormatDate(tempDate);
    //       if (tempDateList.indexOf(tempDate_format) == -1) {
    //         tempDateList.push(tempDate_format)
    //       }
    //     });

    //     for (let i = 0; i < tempDateList.length; i++) {
    //       list[i] = {};
    //       list[i].formatDate = tempDateList[i];
    //       list[i].items = [];
    //       result.forEach(item => {
    //         let tempDate = new Date(item.createdTime).getTime();
    //         let tempDate_format = that.formatDate(tempDate);
    //         if (tempDate_format == tempDateList[i]) {
    //           list[i].items.push(item)
    //         }
    //       })
    //     }

    //     that.setData({
    //       list: list,
    //       totalPrice: totalPrice
    //     });
    //     Toast.clear();
    //   })
    //   .catch(err => {
    //     console.log(err);
    //     Toast.clear();
    //   })
  },

  //跳转评价页面
  toRate(e) {
    console.log(e)
    wx.navigateTo({
      url: '../rate/rate',
    })
  },
  //查看订单
  toShow: function (e) {
    console.log(e)
    let that = this;

    let idx1 = e.currentTarget.dataset.idx1;
    let detail = e.currentTarget.dataset.item;
    let orderList = detail.orderList;
    let formatDate = that.data.list[idx1].formatDate;
    let classes = [];
    console.log(orderList)
    // 整理class列表
    for (let i = 0; i < orderList.length; i++) {
      let className = orderList[i].className;
      if (classes.indexOf(className) == -1) {
        classes.push(className);
      }
    }
    //list初始化
    let list = [{}];
    for (let i = 0; i < classes.length; i++) {
      let className = classes[i];
      list[i] = {};
      list[i].className = className;
      list[i].items = [];
      list[i].id = i;
    }
    //将数据库里的数据整理进list
    for (let i = 0; i < orderList.length; i++) {
      let className = orderList[i].className;
      list.forEach(item => {
        if (item.className == className) {
          let temp = {
            className: '',
            _id: '',
            name: '',
            num: 0,
            imgSrc: '',
            price: 0,
            rate: 0,
            isStorage: true,
            isSpecial: true,
            isInside: false,
          };
          temp.className = orderList[i].className;
          temp._id = orderList[i]._id;
          temp.num = orderList[i].num;
          temp.name = orderList[i].name;
          temp.imgSrc = orderList[i].imgSrc;
          temp.price = orderList[i].price;
          temp.rate = orderList[i].rate;
          temp.isSpecial = orderList[i].isSpecial;
          temp.isStorage = orderList[i].isStorage;
          temp.isInside = orderList[i].isInside;
          item.items.push(temp)
        }
      })
    }
    wx.setStorageSync('list', list);
    wx.setStorageSync('totalNum', detail.totalNum);
    wx.setStorageSync('totalPrice', detail.totalPrice * 100);
    // console.log(list)
    wx.navigateTo({
      url: '../confirmOrder/confirmOrder?detail=' + formatDate,
    })
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