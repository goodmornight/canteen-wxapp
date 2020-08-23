//index.js
import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';
const app = getApp();
const db = wx.cloud.database();
const users = db.collection('users');
const eatNum_btn = {
  title: '用餐人数',
  others: '',
  imgSrc: '../../images/icons/eatNum.svg',
  bindtap: 'toEatNum'
};
const orderList_btn = {
  title: '外卖订单',
  others: '',
  imgSrc: '../../images/icons/orderList.svg',
  bindtap: 'toOrderList'
};
const menu_btn = {
  title: '今日食谱',
  others: '',
  imgSrc: '../../images/icons/menu.svg',
  bindtap: 'toMenu'
};
const otherInsideOrder_btn = {
  title: '就餐报备',
  others: '',
  imgSrc: '../../images/icons/otherInsideOrder.svg',
  bindtap: 'toOtherInsideOrder'
};
const takeAway_btn = {
  title: '特色外卖',
  others: '0:00-16:00',
  imgSrc: '../../images/icons/takeAway.svg',
  bindtap: 'toTakeAway'
}
const myOrder_btn = {
  title: '我的订单',
  others: '',
  imgSrc: '../../images/icons/myOrder.svg',
  bindtap: 'toMyOrder'
};
const rate_btn = {
  title: '评价意见',
  others: '',
  imgSrc: '../../images/icons/rate.svg',
  bindtap: 'toRate'
};
const mySetting_btn = {
  title: '我的设置',
  others: '',
  imgSrc: '../../images/icons/mySetting.svg',
  bindtap: 'toMySetting'
};

Page({
  data: {
    isNewDay: false,
    userInfo: {},
    recordingList: [0, 0, 0],
    eatNum: eatNum_btn,//用餐人数
    orderList: orderList_btn,//外卖订单
    menu: menu_btn,//今日食谱
    otherInsideOrder: otherInsideOrder_btn,//就餐报备
    takeAway: takeAway_btn,//特色外卖
    myOrder: myOrder_btn,//我的订单
    rate: rate_btn,//评价意见
    mySetting: mySetting_btn,//我的设置
  },

  onLoad: async function () {
    //加载动画
    Toast.loading({
      duration: 0,
      mask: true,
      message: '加载中...'
    });

    let that = this;
    let isNewDay = wx.getStorageSync('isNewDay');
    that.setData({
      isNewDay: isNewDay
    })
    that.getRecordingNum();

    wx.request({
      url: app.globalData.requestURL, //仅为示例，并非真实的接口地址
      data: {
        x: '',
        y: ''
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success (res) {
        console.log(res.data)
      }
    })

    await wx.cloud.callFunction({
      name: 'users',
      data: {
        action: 'getUserInfo'
      }
    }).then(res => {
      console.log(res);
      let userInfo = res.result;
      that.setData({
        userInfo: userInfo
      })
      wx.setStorageSync('userInfo', userInfo)
    }).catch(err => {
      console.log(err)
      wx.setStorageSync('userInfo', {})
    })
  },
  //跳转用餐人数
  toEatNum() {
    console.log('toEatNum')
    wx.navigateTo({
      url: '../eatNum/eatNum',
    })
  },
  //跳转外卖订单
  toOrderList() {
    console.log('toOrderList')
    wx.navigateTo({
      url: '../orderList/orderList',
    })
  },
  //跳转食谱
  toMenu() {
    console.log('toMenu');
    wx.requestSubscribeMessage({
      tmplIds: ['BIXI9rat6l3Wi2JIDkWjmOX60aBmg2BJcNvSIOJ0TqY', 'q4RztTIlCmks6ZPiJTJ_jxgcxU4NcZnjK4Wvzqi_byI'],
      success(res) {
        console.log(res)
      },
      fail(err) {
        console.log(err)
      }
    })
    wx.navigateTo({
      url: '../menu/menu',
    })
  },
  //就餐报备
  toOtherInsideOrder: async function () {
    let that = this;
    console.log('toOtherInsideOrder');
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo == {} || userInfo == '') {
      wx.navigateTo({
        url: '../updateOrder/updateOrder',
      })
    } else {
      let now = new Date();
      let deadline = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 0, 0);
      let start;
      let end = now;
      //当前时间大于当天21点
      if (now.getTime() > deadline.getTime()) {
        start = deadline;
      } else {
        //当前时间小于当天21点
        let today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
        let yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        let yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 21, 0, 0);
        start = yesterdayStart;
      }
      wx.requestSubscribeMessage({
        tmplIds: ['BIXI9rat6l3Wi2JIDkWjmOX60aBmg2BJcNvSIOJ0TqY', 'q4RztTIlCmks6ZPiJTJ_jxgcxU4NcZnjK4Wvzqi_byI'],
        success(res) {
          console.log(res)
        },
        fail(err) {
          console.log(err)
        }
      })
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
      if (list.length == 0) {
        wx.navigateTo({
          url: '../updateOrder/updateOrder',
        })
      } else {
        wx.navigateTo({
          url: '../otherInsideOrderList/otherInsideOrderList',
        })
      }
    }

  },
  //特色外卖
  toTakeAway() {
    console.log('toTakeAway');
    let now = new Date();
    let deadline = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0, 0);
    //当前时间大于当天16点
    if (now.getTime() > deadline.getTime()) {
      Toast("抱歉，当前时间已超过16:00，您无法购买特色外卖。")
    } else {
      wx.requestSubscribeMessage({
        tmplIds: ['BIXI9rat6l3Wi2JIDkWjmOX60aBmg2BJcNvSIOJ0TqY', 'q4RztTIlCmks6ZPiJTJ_jxgcxU4NcZnjK4Wvzqi_byI'],
        success(res) {
          console.log(res)
        },
        fail(err) {
          console.log(err)
        }
      })
      //当前时间小于当天16点
      wx.navigateTo({
        url: '../takeAway/takeAway',
      })
    }

  },
  //我的订单
  toMyOrder() {
    console.log('toMyOrder');

    wx.requestSubscribeMessage({
      tmplIds: ['BIXI9rat6l3Wi2JIDkWjmOX60aBmg2BJcNvSIOJ0TqY', 'q4RztTIlCmks6ZPiJTJ_jxgcxU4NcZnjK4Wvzqi_byI'],
      success(res) {
        console.log(res)
      },
      fail(err) {
        console.log(err)
      }
    })
    wx.navigateTo({
      url: '../myOrder/myOrder',
    })
  },
  //评价意见
  toRate() {
    console.log('toRate');
    wx.requestSubscribeMessage({
      tmplIds: ['BIXI9rat6l3Wi2JIDkWjmOX60aBmg2BJcNvSIOJ0TqY', 'q4RztTIlCmks6ZPiJTJ_jxgcxU4NcZnjK4Wvzqi_byI'],
      success(res) {
        console.log(res)
      },
      fail(err) {
        console.log(err)
      }
    })
    wx.navigateTo({
      url: '../rate/rate',
    })
  },
  //跳转我的设置
  toMySetting() {
    wx.requestSubscribeMessage({
      tmplIds: ['BIXI9rat6l3Wi2JIDkWjmOX60aBmg2BJcNvSIOJ0TqY', 'q4RztTIlCmks6ZPiJTJ_jxgcxU4NcZnjK4Wvzqi_byI'],
      success(res) {
        console.log(res)
      },
      fail(err) {
        console.log(err)
      }
    })
    wx.navigateTo({
      url: '../check/check',
    })
  },
  // 获取当天用餐人数以及报备的列表
  getRecordingNum: async function () {
    let that = this;
    let recordingList = [0, 0, 0];
    let now = new Date();
    let tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    let start;
    let end;
    if (now.getHours() < 21) {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 0, 0);
    } else {
      start = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 0, 0, 0);
      end = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 21, 0, 0);
    }
    let totalNum = await wx.cloud.callFunction({
      name: 'recording',
      data: {
        action: 'getRecordingNum',
        start: start,
        end: end
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
    if (totalNum.length != 0) {
      for (let i = 0; i < totalNum.length; i++) {
        if(totalNum[i]._id==1){
          recordingList[0] = totalNum[i].count;
        }else if(totalNum[i]._id==2){
          recordingList[1] = totalNum[i].count;
        }else if(totalNum[i]._id==3){
          recordingList[2] = totalNum[i].count;
        }
        // recordingList[i] = totalNum[i].count;
      }
      that.setData({
        recordingList: recordingList
      })
    }
  },
  onReady() {
    Toast.clear();
  },

})
