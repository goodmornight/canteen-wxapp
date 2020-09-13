// miniprogram/pages/eatNum/eatNum.js
import Toast from '@vant/weapp/toast/toast';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    activeNames: [],
    totalList: [{
      title: "早餐",
      num: 0,
      others: 0,
      list: []
    }, {
      title: "午餐",
      num: 0,
      others: 0,
      list: []
    }, {
      title: "晚餐",
      num: 0,
      others: 0,
      list: []
    }],
    deadline: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let that = this;
    //加载动画
    Toast.loading({
      duration: 0,
      mask: true,
      message: '加载中...'
    });
    let now = new Date();
    that.setData({
      deadline: that.fullFormatDate(now)
    })
    that.getTotalList();
  },
  onChange(event) {
    this.setData({
      activeNames: event.detail
    });
  },
  getTotalList: async function () {
    let that = this;
    let totalList = [{
      title: "早餐",
      num: 0,
      others: 0,
      list: []
    }, {
      title: "午餐",
      num: 0,
      others: 0,
      list: []
    }, {
      title: "晚餐",
      num: 0,
      others: 0,
      list: []
    }];
    let now = new Date();
    let yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    let tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    let start;
    let end;
    // if(now.getHours()<21){
    //   start = new Date(yesterday.getFullYear(),yesterday.getMonth(),yesterday.getDate(),21,0,0);
    // }else{
    //   start = new Date(now.getFullYear(),now.getMonth(),now.getDate(),21,0,0);
    // }
    if (now.getHours() < 21) {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 0, 0);
    } else {
      start = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 0, 0, 0);
      end = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 21, 0, 0);
    }
    console.log(that.formatDateforSQL(start))
    wx.request({
      url: app.globalData.requestURL + '/Recording/getnumberlist', // 获取用餐人数
      method: 'GET',
      data: {
        // time: '2020-09-01 00:00:00',
        // timeend: '2020-09-13 00:00:00'
        time: that.formatDateforSQL(start),
        timeend: that.formatDateforSQL(end)
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res.data)
        totalList[0].num = res.data[0]
        totalList[1].num = res.data[1]
        totalList[2].num = res.data[2]
        that.setData({
          totalList: totalList
        })

        wx.request({
          url: app.globalData.requestURL + '/Recording/getother', // 获取外部用餐列表
          method: 'GET',
          data: {
            // time: '2020-09-01 00:00:00', 测试数据
            // timeend: '2020-09-13 00:00:00'
            time: that.formatDateforSQL(start),
            timeend: that.formatDateforSQL(end)
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success(res) {
            console.log(res.data)
            let otherRecordingList = res.data;
            otherRecordingList.forEach(other=>{
              let idx = other.state-1;
              totalList[idx].others += other.number;
              totalList[idx].list.push(other)
            })
            that.setData({
              totalList:totalList
            })
            Toast.clear()
          },
          fail(err) {
            Toast.clear()
            console.log(err)
            Toast.fail('系统错误');
          }
        })

      },
      fail(err) {
        Toast.clear()
        console.log(err)
        Toast.fail('系统错误');
      }
    })

    // let totalNum = await wx.cloud.callFunction({
    //   name:'recording',
    //   data:{
    //     action:'getRecordingNum',
    //     start:start,
    //     end:end
    //   }
    // })
    // .then(res=>{
    //   console.log(res);
    //   return res.result;
    // })
    // .catch(err=>{
    //   console.log(err);
    //   return [];
    // });

    // let othersList;
    // if(totalNum.length!=0){
    //   othersList = await wx.cloud.callFunction({
    //     name:'recording',
    //     data:{
    //       action:'getOutsideRecording',
    //       start:start,
    //       end:now
    //     }
    //   })
    //   .then(res=>{
    //     console.log(res);
    //     return res.result;
    //   })
    //   .catch(err=>{
    //     console.log(err);
    //     return [];
    //   });
    //   for(let i=0;i<totalNum.length;i++){
    //     if(totalNum[i]._id==1){
    //       totalList[0].num = totalNum[i].count;
    //     }else if(totalNum[i]._id==2){
    //       totalList[1].num = totalNum[i].count;
    //     }else if(totalNum[i]._id==3){
    //       totalList[2].num = totalNum[i].count;
    //     }
    //   }
    //   if(othersList.length!=0){
    //     othersList.forEach(item=>{
    //       let index = item.state-1;
    //       totalList[index].others+=item.number;
    //       totalList[index].list.push(item)
    //     })
    //   }
    //   that.setData({
    //     totalList:totalList
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
  // 2020/3/26 14:23
  fullFormatDate(date) {
    date = new Date(date);
    return `${date.getFullYear()}/${this.overTen(date.getMonth() + 1)}/${this.overTen(date.getDate())} ${this.overTen(date.getHours())}:${this.overTen(date.getMinutes())}`
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