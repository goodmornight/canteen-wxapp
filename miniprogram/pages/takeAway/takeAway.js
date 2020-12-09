// miniprogram/pages/takeAway/takeAway.js
import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';
const app = getApp()
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    fileURL:app.globalData.fileURL,
    TabCur: 0,
    MainCur: 0,
    VerticalNavTop: 0,
    userInfo: {},
    dishes: [],
    list: [],
    load: true,
    imgUrl: '../../../../images/food.svg',
    classes: [], //选择菜的种类
    orderList: [], //选择的菜
    totalPrice: 0, //购物车总价
    popup_show: false, //下弹框显示

  },
  onLoad: async function () {
    let that = this;
    Toast.loading({
      duration: 0,
      mask: true,
      message: '加载中...'
    });
    let userInfo = wx.getStorageSync('userInfo');
    console.log(userInfo)
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

      wx.request({
        url: app.globalData.requestURL + '/Dishes/getall',
        method: 'GET',
        data: {},
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          console.log(res.data)
          if (res.data.length != 0) {
            let dishes = res.data.filter(item => item.isInside == false)
            console.log(dishes)

            let classes = [];
            for (let i = 0; i < dishes.length; i++) {
              let className = dishes[i].className;
              if (classes.indexOf(className) == -1) {
                classes.push(className);
              }
            }

            let list = [{}];
            for (let i = 0; i < classes.length; i++) {
              let className = classes[i];
              list[i] = {};
              list[i].className = className;
              list[i].items = [];
              list[i].id = i;
            }
            for (let i = 0; i < dishes.length; i++) {
              let className = dishes[i].className;
              console.log(className)
              list.forEach(item => {
                console.log(list)
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
                  temp.className = dishes[i].className;
                  temp._id = dishes[i]._id;
                  temp.name = dishes[i].name;
                  temp.imgSrc = dishes[i].imgSrc;
                  temp.price = dishes[i].price;
                  temp.rate = dishes[i].rate;
                  temp.isSpecial = dishes[i].isSpecial;
                  temp.isStorage = dishes[i].isStorage;
                  temp.isInside = dishes[i].isInside;
                  console.log(temp)
                  item.items.push(temp)
                }
              })
            }
            that.setData({
              classes: classes,
              list: list,
              listCur: list[0]
            });
          }
        }
      })

      // let dishes = await wx.cloud.callFunction({
      //   name: "dishes",
      //   data: {
      //     action: "getOutsideDishes"
      //   }
      // }).then(res => {
      //   console.log(res)
      //   let data = res.result.data;
      //   return data;
      // }).catch(err => {
      //   console.log(err);
      //   return {};
      // });
      // let classes = [];
      // for (let i = 0; i < dishes.length; i++) {
      //   let className = dishes[i].className;
      //   if (classes.indexOf(className) == -1) {
      //     classes.push(className);
      //   }
      // }
      // //list初始化
      // let list = [{}];
      // for (let i = 0; i < classes.length; i++) {
      //   let className = classes[i];
      //   list[i] = {};
      //   list[i].className = className;
      //   list[i].items = [];
      //   list[i].id = i;
      // }
      // //将数据库里的数据整理进list
      // for (let i = 0; i < dishes.length; i++) {
      //   let className = dishes[i].className;
      //   list.forEach(item => {
      //     if (item.className == className) {
      //       let temp = {
      //         className: '',
      //         _id: '',
      //         name: '',
      //         num: 0,
      //         imgSrc: '',
      //         price: 0,
      //         rate: 0,
      //         isStorage: true,
      //         isSpecial: true,
      //         isInside: false,
      //       };
      //       temp.className = dishes[i].className;
      //       temp._id = dishes[i]._id;
      //       temp.name = dishes[i].name;
      //       temp.imgSrc = dishes[i].imgSrc;
      //       temp.price = dishes[i].price;
      //       temp.rate = dishes[i].rate;
      //       temp.isSpecial = dishes[i].isSpecial;
      //       temp.isStorage = dishes[i].isStorage;
      //       temp.isInside = dishes[i].isInside;
      //       item.items.push(temp)
      //     }
      //   })
      // }
      // that.setData({
      //   classes: classes,
      //   list: list,
      //   listCur: list[0]
      // });
    }
  },
  onReady() {
    Toast.clear();
  },
  tabSelect(e) {
    let that = this;

    that.setData({
      TabCur: e.currentTarget.dataset.id,
      MainCur: e.currentTarget.dataset.id,
      VerticalNavTop: (e.currentTarget.dataset.id - 1) * 50
    })
  },
  VerticalMain(e) {
    let that = this;
    let list = this.data.list;
    let tabHeight = 0;
    if (this.data.load) {
      for (let i = 0; i < list.length; i++) {
        let view = wx.createSelectorQuery().select("#main-" + list[i].id);
        view.fields({
          size: true
        }, data => {
          list[i].top = tabHeight;
          tabHeight = tabHeight + data.height;
          list[i].bottom = tabHeight;
        }).exec();
      }
      that.setData({
        load: false,
        list: list
      })
    }
    let scrollTop = e.detail.scrollTop + 150;
    for (let i = 0; i < list.length; i++) {
      if (scrollTop > list[i].top && scrollTop < list[i].bottom) {
        that.setData({
          VerticalNavTop: (list[i].id - 1) * 50,
          TabCur: list[i].id
        })
        return false
      }
    }
  },
  //步进器变化
  onStepChange(e) {
    let that = this;
    let num = e.detail; //当前菜的数量
    let idx1 = e.currentTarget.dataset.idx1; //种类index
    let idx2 = e.currentTarget.dataset.idx2; //菜index
    let item = e.currentTarget.dataset.item; //当前菜的细节
    let orderList = []; //订单内容
    let totalNum = 0; //总数
    let totalPrice = 0; //总价钱
    let list = that.data.list; //所有菜品
    list[idx1].items[idx2].num = num;
    that.setData({
      list: list
    });
    //过滤num=0的菜品
    list.forEach(item_class => {

      let temp = item_class.items.filter(function (item) {
        return item.num != 0;
      });
      if (temp.length != 0) {
        orderList = orderList.concat(temp)
      }
    })
    if (orderList.length == 0) {
      that.setData({
        popup_show: false
      })
    }
    // 计算总共需要花费的钱
    orderList.forEach(each => {
      totalNum += each.num;
      totalPrice += (each.num * each.price * 100);
    })
    that.setData({
      orderList: orderList,
      totalPrice: totalPrice,
      totalNum: totalNum
    });
  },
  onCart() {
    console.log('onCart');
    let that = this;
    let list = that.data.list;
    let orderList = that.data.orderList;
    let popup_show = that.data.popup_show;
    if (orderList.length != 0) {
      that.setData({
        popup_show: !popup_show
      })
    } else {
      Toast('您的购物车还是空的');
    }

  },
  //下弹出层的显示
  onPopupClose() {
    this.setData({
      popup_show: false
    })
  },
  //选择菜品完成
  onSubmit() {
    let that = this;
    let list = that.data.list;
    let totalPrice = that.data.totalPrice;
    let totalNum = that.data.totalNum;
    if (totalPrice != 0) {
      //列表，总价，总数存于缓存
      wx.setStorageSync('list', list);
      wx.setStorageSync('totalPrice', totalPrice);
      wx.setStorageSync('totalNum', totalNum);
      wx.navigateTo({
        url: '../confirmOrder/confirmOrder',
      })
    } else {
      Toast('订单为空');
    }
  },
  /**
   * 页面的初始数据
   */
  // data: {
  //   activeKey: 0

  // },

  /**
   * 生命周期函数--监听页面加载
   */
  // onLoad: function (options) {

  // },

  // onChange(event) {
  //   wx.showToast({
  //     icon: 'none',
  //     title: `切换至第${event.detail}项`
  //   });
  // },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  // onReady: function () {

  // },

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