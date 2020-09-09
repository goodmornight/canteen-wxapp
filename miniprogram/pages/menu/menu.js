// miniprogram/pages/menu/menu.js
import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';
const app = getApp();

const menu = require('../../temp/formatList.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    // starValue: 3,//评价分数
    activeTab: new Date().getDay(), //标签页
    // activeColNames: ['1', '2', '3'],//‘全部’标签页内伸缩栏
    activeClassColNames: [], //标签页内伸缩栏
    menuList: menu.menuList,
    dishes: [], // 所有的菜品
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
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo == {} || userInfo == '' || userInfo == undefined || userInfo == []) {
      let userInfo_cloud;
      // 暂时用于获取用户的openid
      await wx.cloud.callFunction({
        name: 'test',
        data: {}
      }).then(res => {
        console.log(res.result);
        wx.setStorageSync('_openid', res.result.openid)
        that.setData({
          _openid: res.result.openid
        })
      }).catch(err => {
        console.log(err)
      })

      wx.request({
        url: app.globalData.requestURL + '/Users/getby_openid', // 通过openid查询用户数据
        method: 'GET',
        data: {
          _openid: that.data._openid,
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          console.log(res.data)
          if (res.data.length != 0) {
            userInfo_cloud = res.data[0];
            that.setData({
              userInfo: res.data[0]
            })
            wx.setStorageSync('userInfo', res.data[0])
          }
        },
        fail(err) {
          console.log(err)
          Toast.fail('系统错误');
        }
      })
      // let userInfo_cloud = await wx.cloud.callFunction({
      //   name: 'users',
      //   data: {
      //     action: 'getUserInfo'
      //   }
      // }).then(res => {
      //   console.log(res);
      //   return res.result;
      //   // let userInfo_cloud = res.result;
      //   // that.setData({
      //   //   userInfo:userInfo_cloud
      //   // })
      //   // wx.setStorageSync('userInfo', userInfo)
      // }).catch(err => {
      //   console.log(err)
      //   return {};
      //   // wx.setStorageSync('userInfo', {})
      // });
      if (userInfo_cloud == {} || userInfo_cloud == '' || userInfo_cloud == undefined) {
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
    if (userInfo_final != {} && userInfo_final != '' && userInfo_final != [] && userInfo_final != undefined) {
      // that.isAutoRecording();
      let menuList = that.data.menuList;
      // 获得所有的菜品列表
      wx.request({
        url: app.globalData.requestURL + '/Dishes/getall',
        method: 'GET',
        data: {},
        header: {
          'content-type': 'application/json'
        },
        success(res) {
          console.log(res.data)
          if (res.data.length != 0) {
            let dishes = res.data.filter(item => item.isInside == true)
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
      console.log(that.getWeek(new Date()))
      let {
        start,
        end
      } = that.getWeek(new Date());
      // 获得所有的菜品列表
      wx.request({
        url: app.globalData.requestURL + '/Menu/getbytime',
        method: 'GET',
        data: {
          time: start,
          timeend: end,
        },
        header: {
          'content-type': 'application/json'
        },
        success(res) {
          console.log(res.data)
          let requestList = res.data;
          requestList.forEach(item => {
            let time = new Date(item.time).getDay()
            let menuArr = item.menuList.split(',')
            // 代码需要优化，还没想好
            let reqDishes = [];
            that.data.dishes.forEach(dish => {
              menuArr.forEach(menuName => {
                if (dish.name == menuName) {
                  reqDishes.push(dish)
                }
              })
            })
            // let reqDishes = that.data.dishes.filter(dish=>{
              
            // })
            menuList[time].list_w[item.state - 1].list_c = reqDishes
          })
          console.log(menuList)
          that.setData({
            menuList: menuList
          })
          // if (res.data.length != 0) {
          //   let dishes = res.data.filter(item => item.isInside == true)
          //   console.log(dishes)
          //   that.setData({
          //     dishes: dishes
          //   })
          // } else {
          //   Toast.fail('系统错误');
          // }
        },
        fail(err) {
          console.log('请求不到dishes');
          Toast.fail('系统错误');
        }
      })
      // let list = await wx.cloud.callFunction({
      //     name: "menu",
      //     data: {
      //       action: "getWeekMenu",
      //       now: new Date()
      //     }
      //   })
      //   .then(res => {
      //     console.log(res);
      //     return res.result;
      //   })
      //   .catch(err => {
      //     console.log(err);
      //     return [];
      //   })
      // console.log(list);
      // console.log(menuList);
      // list.forEach(item => {
      //   let time = new Date(item.time);
      //   let id = item._id;
      //   let state = item.state - 1;
      //   let itemList = item.menuList;
      //   let weekDays = time.getDay();
      //   // let classList = that.getClassList(itemList);//餐类下的类名列表
      //   // if (classList.length != 0) {
      //   menuList[weekDays].list_w[state]._id = id;
      //   menuList[weekDays].list_w[state].list_c = that.getClassList(itemList);
      //   // }

      // });
      // that.setData({
      //   menuList: menuList
      // })

    }

  },
  getClassList(list) {
    //获得类名列表
    let classList = [];
    list.forEach(item => {
      if (classList.indexOf(item.className) == -1) {
        classList.push(item.className)
      }
    });
    //初始化list
    let formatList = [{}];
    for (let i = 0; i < classList.length; i++) {
      let className = classList[i];
      formatList[i] = {};
      formatList[i].className = className;
      formatList[i].list_d = [];
    }
    //归类
    list.forEach(item => {
      let idx = classList.indexOf(item.className);
      formatList[idx].list_d.push(item)
    })
    return formatList;
  },
  //判断当日的用户用餐记录是否是自动生成的，如果是自动生成的就跳转到设置个人报备页面
  isAutoRecording: async function () {
    let that = this;
    let userInfo = that.data.userInfo;
    // let list = that.data.menuList;
    let now = new Date();
    let weekDay = now.getDay();
    let today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0); //当天0点
    let today9PM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 0, 0); //当晚9点
    let start;
    let end;
    if (now.getTime() > today9PM.getTime()) { //当前时间在当天的9点以后
      let tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      start = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 0, 0, 0);
      end = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 21, 0, 0);
    } else { //当前时间在当晚的9点以前
      start = today;
      end = today9PM;
    }
    await wx.cloud.callFunction({
        name: "recording",
        data: {
          action: "isAutoRecording",
          userId: userInfo.userId,
          start: start,
          end: end
        }
      })
      .then(res => {
        console.log(res);
        let result = res.result;
        if (result.length != 0) {
          wx.reLaunch({
            url: '../confirmMenu/confirmMenu',
          })
        }
      })
      .catch(err => {
        console.log(err)
      })
  },
  //标签页
  onTabsChange(event) {
    console.log(event)
    wx.showToast({
      title: `切换到 ${event.detail.title}`,
      icon: 'none'
    });
  },
  //下面的日期伸缩栏
  // onColChange(event) {
  //   this.setData({
  //     activeColNames: event.detail
  //   });
  // },
  //‘全部’标签栏里的‘星期一’部分
  onClassColChange(event) {
    this.setData({
      activeClassColNames: event.detail
    });
  },
  // 获取这周时间
  getWeek(date) {
    let that = this;
    let now = new Date(date);
    now = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    console.log(now)
    let weekday_now = now.getDay(); //0是星期日

    let startDay = new Date(now.getTime() - weekday_now * 24 * 60 * 60 * 1000);
    let start = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate());
    let endDay = new Date(now.getTime() + (7 - weekday_now) * 24 * 60 * 60 * 1000);
    let end = new Date(endDay.getFullYear(), endDay.getMonth(), endDay.getDate());
    return {
      start: that.formatDateforSQL(start),
      end: that.formatDateforSQL(end),
    }
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