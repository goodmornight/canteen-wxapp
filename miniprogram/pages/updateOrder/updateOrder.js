// miniprogram/pages/updateOrder/updateOrder.js
import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    tmpArr: app.globalData.tmpArr
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    // //加载动画
    // Toast.loading({
    //   duration:0,
    //   mask: true,
    //   message: '加载中...'
    // });
    let that = this;
    let userInfo = wx.getStorageSync('userInfo');
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
      })
    }
  },
  toMe() {
    let that = this
    wx.requestSubscribeMessage({
      //[每日食谱提醒，下单成功]
      tmplIds: that.data.tmpArr,
      success: async function (res_mes) {
        console.log(res_mes);
      },
      fail(err) {
        console.log(err)
      }
    })
    wx.navigateTo({
      url: '../confirmMenu/confirmMenu',
    })
  },
  toOther() {
    let that = this;
    console.log('toOtherInsideOrder');
    let now = new Date();
    let deadline = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);
    //当前时间大于当天10点
    if (now.getTime() > deadline.getTime()) {
      Toast("抱歉，当前时间已超过10:00，您无法提交报备。")
    } else {
      wx.requestSubscribeMessage({
        //[每日食谱提醒，下单成功]
        tmplIds: that.data.tmpArr,
        success: async function (res_mes) {
          console.log(res_mes);
        },
        fail(err) {
          console.log(err)
        }
      })
      //当前时间小于当天10点
      wx.navigateTo({
        url: '../otherInsideOrder/otherInsideOrder',
      })
    }
    // wx.requestSubscribeMessage({
    //   //[每日食谱提醒，下单成功]
    //   tmplIds: ['BIXI9rat6l3Wi2JIDkWjmOX60aBmg2BJcNvSIOJ0TqY', 'q4RztTIlCmks6ZPiJTJ_jxgcxU4NcZnjK4Wvzqi_byI'],
    //   success: async function (res_mes) {
    //     console.log(res_mes);
    //   },
    //   fail(err) {
    //     console.log(err)
    //   }
    // })
    // //当前时间小于当天10点
    // wx.navigateTo({
    //   url: '../otherInsideOrder/otherInsideOrder',
    // })
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