// miniprogram/pages/otherInsideOrder/otherInsideOrder.js
import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';
const eatPicker = ['早餐', '午餐', '晚餐'];
const menuTime = [8, 12, 18];
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    // eatList: [],//查询数据库里的当天已存菜谱
    eatList: [{
      value: '早餐'
    }, {
      value: '午餐'
    }, {
      value: '晚餐'
    }],
    eatIndex: 3,
    now: "",
    num: 0, //用餐人数
    userId: '', //输入的userId
    clickItem: '',
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
    that.setData({
      now: that.fullFormatDate(new Date())
    })
    let userInfo = wx.getStorageSync('userInfo');
    //判断是否身份验证
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
      let clickItem = wx.getStorageSync('otherInsideOrder');
      // //因为只有当天0-10点可以进入报备
      // await wx.cloud.callFunction({
      //   name: "menu",
      //   data: {
      //     action: "getTodayMenu",
      //     // today:"Fri Apr 17 2020 10:52:05 GMT+0800 (中国标准时间)"
      //     today: new Date()
      //   }
      // }).then(res => {
      //   console.log(res)
      //   let result = res.result;
      //   let eatList = [];
      //   if (result.length != 0) {
      //     result.forEach(item => {
      //       let temp = {};
      //       let time = new Date(item.time).getHours();
      //       temp._id = item._id;
      //       if (time == 8) {
      //         temp.value = '早餐'
      //       } else if (time == 12) {
      //         temp.value = '午餐'
      //       } else {
      //         temp.value = '晚餐'
      //       }
      //       eatList.push(temp);
      //     })

      //   }
      //   that.setData({
      //     eatList: eatList
      //   });
      //   // that.setData({
      //   //   eatList: [{
      //   //     _id:'',
      //   //     value:'早餐'
      //   //   },{
      //   //     _id:'',
      //   //     value:'午餐'
      //   //   },{
      //   //     _id:'',
      //   //     value:'晚餐'
      //   //   }]
      //   // });
      //   if (clickItem != {} && clickItem != '') {
      //     that.setData({
      //       clickItem: clickItem,
      //       num: clickItem.number,
      //       eatIndex: clickItem.state - 1
      //     })
      //   }
      // })
      //   .catch(err => {
      //     console.log(err)
      //   })

    }
  },
  //步进器变化
  // onStepChange(e) {
  //   console.log(e)
  //   let that = this;
  //   that.setData({
  //     num: e.detail
  //   })
  // },
  onFormSubmit: async function (e) {
    console.log(e)
    let that = this;
    let clickItem = wx.getStorageSync('otherInsideOrder');
    let userInfo = that.data.userInfo;
    let eatList = that.data.eatList;

    let detail = e.detail.value;
    let state = detail.state;
    let userId = detail.userId;
    let number = (detail.number.length == 0 ? 0 : parseInt(detail.number));

    if (userId == userInfo.userId && number != 0 && state != 3) {

      let menu = eatPicker.indexOf(eatList[state].value);
      let createdTime = new Date();
      let time = new Date(createdTime.getFullYear(), createdTime.getMonth(), createdTime.getDate(), menuTime[menu], 0, 0)
      that.setData({
        userId: userId,
        num: number
      });
      if (clickItem == {} || clickItem == '') {
        wx.request({
          url: app.globalData.requestURL + '/Recording/insert',
          method: 'POST',
          data: {
            createdTime: that.formatDateforSQL(createdTime),
            time: that.formatDateforSQL(time),
            userId: userId,
            number: number,
            menuId: "wxTest",
            state: state+1,
            other: true,
            auto: false
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success(res) {
            console.log(res)
            if (res.statusCode == 200) {
              Toast({
                type: 'success',
                message: '报备成功',
                onClose: () => {
                  wx.reLaunch({
                    url: '../index/index',
                  })
                }
              });
            }else{
              Toast.fail('系统错误');
            }
          },
          fail(err){
            console.log(err)
            Toast.fail('系统错误');
          }
        })

        // await wx.cloud.callFunction({
        //   name: "recording",
        //   data: {
        //     action: "addOutsideRecording",
        //     createdTime: new Date(),
        //     userId: userId,
        //     number: number,
        //     menuId: eatList[state]._id,
        //     state: menu + 1,
        //     others: true
        //   }
        // })
        //   .then(res => {
        //     console.log(res)
        //     if (res.result.state == 1) {
        //       Toast({
        //         type: 'success',
        //         message: '报备成功',
        //         onClose: () => {
        //           wx.reLaunch({
        //             url: '../index/index',
        //           })
        //         }
        //       });
        //     } else {
        //       Toast.fail('系统错误');
        //     }
        //   })
        //   .catch(err => {
        //     console.log(err);
        //     Toast.fail('系统错误');
        //   })
      } else {
        // 更新报备信息，未修改api
        await wx.cloud.callFunction({
            name: "recording",
            data: {
              action: "updateOutsideRecordingById",
              createdTime: new Date(),
              _id: clickItem._id,
              userId: userId,
              number: number,
              menuId: eatList[state]._id,
              state: menu + 1,
              others: true
            }
          })
          .then(res => {
            console.log(res)
            if (res.result.stats.updated == 1) {
              Toast({
                type: 'success',
                message: '修改成功',
                onClose: () => {
                  wx.reLaunch({
                    url: '../index/index',
                  })
                }
              });
            } else {
              Toast.fail('系统错误');
            }
          })
          .catch(err => {
            console.log(err);
            Toast.fail('系统错误');
          })
      }
    } else {
      if (userId.length == 0 || userId != userInfo.userId) {
        Toast('用户编号填写错误');
      } else if (number == 0) {
        Toast('用餐人数未填写');
      } else if (state == 3) {
        Toast('就餐类型未选择');
      } else {
        Toast('信息未填写完成');
      }
    }
  },
  //发送报备通知
  toSend: async function () {
    let that = this;
    let userId = that.data.userId;
    let num = that.data.num;
    let state = that.data.eatIndex;
    let clickItem = that.data.clickItem;

    if (userId == userInfo.userId && num != 0 && state != 3) {
      let sendValue = {
        //预约产品，20字以内字符
        thing1: {
          value: '外部人员就餐报备'
        },
        //使用日期，年月日格式（支持+24小时制时间），支持填时间段，两个时间点之间用“~”符号连接
        date2: {
          value: that.formatDateStr(that.data.now)
        },
        //温馨提示，20个以内字符
        thing3: {
          value: '在当天的0:00-10:00内可提交修改'
        },
      }
      await wx.cloud.callFunction({
          name: 'message',
          data: {
            action: 'sendInsideOrderSuccess',
            sendValue: sendValue
          }
        })
        .then(res_after => {
          console.log(res_after);
        })
        .catch(err => {
          console.log(err)
        })
    }
  },
  // // 用户编号输入
  // onUserIdInput(e){
  //   console.log(e)
  // },
  // // 用餐人数输入
  // onNumInput(e){
  //   console.log(e)
  // },
  //就餐类型选择
  eatPickerChange(e) {
    console.log(e);
    this.setData({
      eatIndex: parseInt(e.detail.value)
    })
  },
  // 2020/3/26 14:23
  fullFormatDate(date) {
    date = new Date(date);
    return `${date.getFullYear()}/${this.overTen(date.getMonth() + 1)}/${this.overTen(date.getDate())} ${this.overTen(date.getHours())}:${this.overTen(date.getMinutes())}`
  },
  overTen(num) {
    if (num < 10) {
      return '0' + num;
    } else {
      return '' + num;
    }
  },
  // 2020年04月04日
  formatDateStr(date) {
    date = new Date(date);
    return `${date.getFullYear()}年${this.overTen(date.getMonth() + 1)}月${this.overTen(date.getDate())}日`;
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