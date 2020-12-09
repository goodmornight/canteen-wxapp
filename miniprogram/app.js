//app.js
App({
  onLaunch: function () {

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'test-186nu',
        traceUser: true,
      })
    }
    this.globalData = {
      requestURL: 'https://dingcan.meetingcn.cn/dingcan',
      fileURL: 'https://dingcan.meetingcn.cn/',
      tmpArr: ['BIXI9rat6l3Wi2JIDkWjmOX60aBmg2BJcNvSIOJ0TqY', 'q4RztTIlCmks6ZPiJTJ_jxgcxU4NcZnjK4Wvzqi_byI', '1z9S1AjMjpnc4p0KlOE5dxdash-qJaAKV-CsE_Xdt-k'],
      autoTmpArr: ['1z9S1AjMjpnc4p0KlOE5dxdash-qJaAKV-CsE_Xdt-k', 'aQ0JZhTClnUGK6ngDFvEVD64NN35396pJaOCovZxpDc']
    }
    let today = wx.getStorageSync('today');
    wx.setStorageSync('otherInsideOrder', '');
    let newDay = new Date();
    this.globalData.newDay = newDay;
    wx.request({
      url: this.globalData.requestURL + '/Users/birthday_userIdlist', // 通过日期查询用户生日
      method: 'GET',
      data: {
        year: newDay.getFullYear(),
        month: newDay.getMonth() + 1,
        date: newDay.getDate()
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res.data)
        if (res.data.length != 0) {
          wx.setStorageSync('todayBirthUserList', res.data);
        }
      },
      fail(err) {
        console.log(err)
      }
    })
    if (today == '') {
      wx.setStorageSync('today', newDay); //保存进入小程序时间
      wx.setStorageSync('isNewDay', true); //判断是否是新的一天
    } else {
      if (today.getDate() == newDay.getDate()) {
        wx.setStorageSync('isNewDay', false);
      } else {
        wx.setStorageSync('today', newDay);
        wx.setStorageSync('isNewDay', true);
      }
    }
    wx.getSystemInfo({
      success: e => {
        console.log(e)
        this.globalData.StatusBar = e.statusBarHeight;
        let capsule = wx.getMenuButtonBoundingClientRect();
        if (capsule) {
          this.globalData.Custom = capsule;
          this.globalData.CustomBar = capsule.bottom + capsule.top - e.statusBarHeight;
        } else {
          this.globalData.CustomBar = e.statusBarHeight + 50;
        }
      }
    })

    wx.request({
      url: this.globalData.requestURL + '/Dishes/getall',
      method: 'GET',
      data: {},
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        // console.log(res.data)
        if (res.data.length != 0) {
          wx.setStorageSync('allDishes', res.data);
        } else {
          wx.setStorageSync('allDishes', []);
        }
      },
      fail(err) {
        console.log('请求不到dishes');
        wx.setStorageSync('allDishes', []);
      }
    })

  }
})