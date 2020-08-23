// miniprogram/pages/confirmMenu/confirmMenu.js
import Toast from '@vant/weapp/toast/toast';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    options: {},
    activeNames: ['1'],
    checkBox: ['1', '2', '3'],
    stateList: [],
    isBreakfast: true, //时间上是否允许
    isLunch: true,
    isDinner: true,
    ifBreakfast: false, //记录上是否允许
    ifLunch: false,
    ifDinner: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    console.log(app.globalData.requestURL)
    // wx.request({
    //   url: app.globalData.requestURL + '/Recording/insert',
    //   method: 'POST',
    //   data: {
    //     createdTime: "2020-08-23 02:52:05",
    //     time: "2020-08-23 02:52:05",
    //     userId: "002",
    //     number: 0,
    //     menuId: "string",
    //     state: 0,
    //     other: true,
    //     auto: true
    //   },
    //   header: {
    //     'content-type': 'application/json' // 默认值
    //   },
    //   success(res) {
    //     console.log(res)
    //   }
    // })
    //加载动画
    Toast.loading({
      duration: 0,
      mask: true,
      message: '加载中...'
    });
    let that = this;
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
        // let userInfo_cloud = res.result;
        // that.setData({
        //   userInfo:userInfo_cloud
        // })
        // wx.setStorageSync('userInfo', userInfo)
      }).catch(err => {
        console.log(err)
        return {};
        // wx.setStorageSync('userInfo', {})
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
    if (userInfo_final != {} || userInfo_final != '') {
      let now = new Date();
      that.setData({
        date: that.formatDate(now)
      })
      let today6 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0);
      let today10 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);
      let today15 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 0, 0);
      let today21 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 0, 0);
      if (now.getTime() > today6.getTime() && now.getTime() < today10.getTime()) {
        that.setData({
          isBreakfast: false,
          isLunch: true,
          isDinner: true
        })
      } else if (now.getTime() > today10.getTime() && now.getTime() < today15.getTime()) {
        that.setData({
          isBreakfast: false,
          isLunch: false,
          isDinner: true
        })
      } else if (now.getTime() > today15.getTime() && now.getTime() < today21.getTime()) {
        that.setData({
          isBreakfast: false,
          isLunch: false,
          isDinner: false
        })
      } else {
        that.setData({
          isBreakfast: true,
          isLunch: true,
          isDinner: true
        })
        if (now.getTime() > today21.getTime()) {
          let tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          that.setData({
            date: that.formatDate(tomorrow)
          })
        }
      }
      that.isAutoRecording();
    }
  },
  onChange(event) {
    this.setData({
      activeNames: event.detail
    });
  },
  onCheckBoxChange(event) {
    console.log(event)
    let that = this;
    this.setData({
      checkBox: event.detail
    });
  },
  //提交
  onSubmit: async function (e) {
    console.log(e)
    let that = this;
    let list = that.data.list;
    let value = e.detail.value; //选中内容
    let formatList = [];
    for (let i = 0; i < list.length; i++) {
      let state = list[i].state;
      let temp = {};
      temp._id = list[i]._id;
      temp.state = list[i].state;
      temp.isTrue = value[state];
      formatList.push(temp);
    }
    console.log(formatList);
    // await wx.cloud.callFunction({
    //     name: 'recording',
    //     data: {
    //       action: 'updateRecordingById',
    //       now: new Date(),
    //       formatList: formatList
    //     }
    //   }).then(async (res) => {
    //     console.log(res);
    //     if (res.result >= 0) {
    //       if (res.result > 0) {
    //         Toast.success('提交成功');
    //         let sendValue = {
    //           //预约产品，20字以内字符
    //           thing1: {
    //             value: '个人就餐报备'
    //           },
    //           //使用日期，年月日格式（支持+24小时制时间），支持填时间段，两个时间点之间用“~”符号连接
    //           date2: {
    //             value: that.formatDateStr(that.data.date)
    //           },
    //           //温馨提示，20个以内字符
    //           thing3: {
    //             value: '个人报备可当餐前两个小时修改,默认就餐'
    //           },
    //         }
    //         await wx.cloud.callFunction({
    //             name: 'message',
    //             data: {
    //               action: 'sendInsideOrderSuccess',
    //               sendValue: sendValue
    //             }
    //           }).then(res_after => {
    //             console.log(res_after);
    //           })
    //           .catch(err => {
    //             console.log(err)
    //           })
    //       } else {
    //         Toast('记录未变')
    //       }
    //       wx.reLaunch({
    //         url: '../index/index',
    //       })
    //     } else {
    //       Toast('提交失败')
    //     }
    //   })
    //   .catch(err => {
    //     console.log(err)
    //     Toast('系统错误')
    //   })
  },
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
          // action: "isAutoRecording",
          action: "getRecording",
          userId: userInfo.userId,
          start: start,
          end: end
        }
      })
      .then(res => {
        console.log(res);
        let list = res.result;
        that.setData({
          list: list
        })
        if (list.length != 0) {
          let checkBox = [];
          list.forEach(item => {
            if (item.state == 1) {
              that.setData({
                ifBreakfast: true
              })
            } else if (item.state == 2) {
              that.setData({
                ifLunch: true
              })
            } else if (item.state == 3) {
              that.setData({
                ifDinner: true
              })
            }
            checkBox.push(item.state + '');
          })
          that.setData({
            checkBox: checkBox
          })
        }
      })
      .catch(err => {
        console.log(err);
        that.setData({
          list: []
        })
        // return [];
      })
  },

  overTen(num) {
    if (num < 10) {
      return '0' + num;
    } else {
      return '' + num;
    }
  },
  // 2020/04/04（年/月/日）
  formatDate(date) {
    date = new Date(date);
    return `${date.getFullYear()}/${this.overTen(date.getMonth() + 1)}/${this.overTen(date.getDate())}`;
  },
  // 2020年04月04日（年/月/日）
  formatDateStr(date) {
    date = new Date(date);
    return `${date.getFullYear()}年${this.overTen(date.getMonth() + 1)}月${this.overTen(date.getDate())}日`;
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