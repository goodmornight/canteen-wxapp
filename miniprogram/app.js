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
      requestURL: 'https://dingcan.meetingcn.cn/dingcan'
    }
    let today = wx.getStorageSync('today');
    wx.setStorageSync('otherInsideOrder', '');
    let newDay = new Date();
    this.globalData.newDay = newDay;
    console.log(today);
    if (today == '') {
      wx.setStorageSync('today', newDay);//保存进入小程序时间
      wx.setStorageSync('isNewDay', true);//判断是否是新的一天
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

  }
})