// miniprogram/pages/otherInsideOrderList/otherInsideOrderList.js
import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';
const app = getApp();
const todaynow = new Date();
const today0 = new Date(todaynow.getFullYear(), todaynow.getMonth(), todaynow.getDate(), 0, 0, 0);
const today6 = new Date(todaynow.getFullYear(), todaynow.getMonth(), todaynow.getDate(), 6, 0, 0);
const today10 = new Date(todaynow.getFullYear(), todaynow.getMonth(), todaynow.getDate(), 10, 0, 0);
const today16 = new Date(todaynow.getFullYear(), todaynow.getMonth(), todaynow.getDate(), 16, 0, 0);
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    list: [],//从数据库获取的数据
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
    let now = new Date();
    let deadline = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 0, 0);
    if (now.getTime() > deadline.getTime()) {
      let tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      now = tomorrow;
    }
    that.setData({
      date: that.formatDate(now)
    })
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
    userInfo = that.data.userInfo;
    if (userInfo != {} || userInfo != '') {
      //确认用户已经绑定身份
      let end = new Date();
      let start;
      //当前时间大于当天21点
      if (end.getTime() > deadline.getTime()) {
        start = deadline;
      } else {
        //当前时间小于当天21点
        // let today = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 0, 0, 0)
        let yesterday = new Date(end.getTime() - 24 * 60 * 60 * 1000);
        let yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 21, 0, 0);
        start = yesterdayStart;
      }

      let list = await wx.cloud.callFunction({
        name: 'recording',
        data: {
          action: 'getRecordingByCreatedTime',
          start: start,
          end: end,
          userId: userInfo.userId
        }
      })
        .then(res => {
          console.log(res)
          return res.result
        })
        .catch(err => {
          console.log(err);
          return [];
        });
      console.log(list);
      list.forEach(item => {
        item.formatTime = that.formatTime(item.createdTime);
        if (item.others) {//是外部人员
          if (todaynow.getTime() > today0.getTime() && todaynow.getTime() < today10.getTime()) {
            item.isLink = true;
          } else {
            item.isLink = false;
          }
        } else {
          let state = item.state;
          if (state == 1) {
            if (todaynow.getTime() < today6.getTime()) {
              item.isLink = true;
            } else {
              item.isLink = false;
            }
          } else if (state == 2) {
            if (todaynow.getTime() < today10.getTime()) {
              item.isLink = true;
            } else {
              item.isLink = false;
            }
          } else {
            if (todaynow.getTime() < today16.getTime()) {
              item.isLink = true;
            } else {
              item.isLink = false;
            }
          }
        }
      })
      that.setData({
        list: list
      })
    }

  },
  //滑动Cell
  onCellCase:async function(e) {
    let that = this;
    console.log(e);
    let list = that.data.list;
    const { position, instance } = e.detail;
    let clickItem = e.currentTarget.dataset.item;
    let idx = e.currentTarget.dataset.idx;
    switch (position) {
      case 'right':
        that.onCellClick(clickItem);
        break;
      case 'cell':
        instance.close();
        break;
      case 'left':
        Dialog.confirm({
          message: '确定删除吗？'
        }).then(async() => {
          list.splice(idx,1);
          that.setData({
            list:list
          })
          await wx.cloud.callFunction({
            name:'recording',
            data:{
              action:'removeRecordingById',
              _id:clickItem._id
            }
          })
          .then(res=>{
            console.log(res)
            if(res.result.stats.removed==1){
              Toast('删除成功');
            }
          })
          .catch(err=>{
            Toast('删除失败');
          })
        });
        break;
    }
  },
  //点击对应列表
  onCellClick(clickItem) {
    let that = this;
    
    if (clickItem.others) {//外部人员
      if(clickItem.isLink){
        wx.setStorageSync('otherInsideOrder', clickItem);
        wx.navigateTo({
          url: '../otherInsideOrder/otherInsideOrder',
        })
      }else{
        Toast('不可修改')
      }
    } else {//内部人员
      if (clickItem.isLink) {
        wx.navigateTo({
          url: '../confirmMenu/confirmMenu',
        })
      } else {
        Toast('不可修改')
      }
    }
  },
  //添加其他报备，跳转updateOrder
  toOthers() {
    wx.navigateTo({
      url: '../updateOrder/updateOrder',
    })
  },
  //小于10的数字加0在前面
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
  //13:00
  formatTime(date) {
    let that = this;
    date = new Date(date);
    return `${that.overTen(date.getHours())}:${this.overTen(date.getMinutes())}`;
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    Toast.clear()
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