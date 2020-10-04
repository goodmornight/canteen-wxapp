// miniprogram/pages/check/check.js
import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';
const md5 = require('md5');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentData: 0, //0是两个按钮选择修改密码还是解除绑定，1是绑定身份，2是修改密码
    checkBox: [],
    number: '', //编号
    pwd: '', //密码
    userInfo: {}, //用户信息
    picker_show: false, //picker是否显示
    tempCols: {}, //根据classA和下面的classB整理生成
    classCols: {}, //多个项目、组织选择
    picker_loading: true,
    newPwd: '',
    againPwd: ''
    //isSee:false,//密码是否可见
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //加载动画
    Toast.loading({
      duration: 0,
      mask: true,
      message: '加载中...'
    });

    let that = this;
    let userInfo = wx.getStorageSync('userInfo');
    console.log(userInfo)
    // 判断是否有userInfo信息缓存，无则跳转信息绑定，有则跳转修改密码/解除绑定页面
    if (userInfo == {} || userInfo == '') {
      console.log('userInfo不存在')
      console.log
      that.setData({
        userInfo: userInfo,
        currentData: 1
      })
    } else {
      console.log('userInfo存在')
      that.setData({
        userInfo: userInfo,
        currentData: 0
      })
    }
  },
  onCheckBoxChange(event) {
    let that = this;
    this.setData({
      checkBox: event.detail
    });
    // let number = this.data.number;
    // let pwd = this.data.pwd;
    // let checkBox = this.data.checkBox;
    // if(number!=''&&pwd!=''&&checkBox.length==2){
    //   that.setData({
    //     ifSubmit:false
    //   })
    // }else{
    //   that.setData({
    //     ifSubmit:true
    //   })
    // }
  },
  //密码是否可见
  // toSee(){
  //   let isSee = this.data.isSee;
  //   this.setData({
  //     isSee:!isSee
  //   })
  // },
  //修改密码按钮
  toChangePwd() {
    console.log('toChangePwd');
    let that = this;
    that.setData({
      currentData: 2
    })
  },
  //解除绑定按钮
  toUnTie: async function () {
    console.log('==============toUnTie解除绑定=================');
    //加载动画
    Toast.loading({
      duration: 0,
      mask: true,
      message: '加载中...'
    });

    let that = this;
    let userInfo = that.data.userInfo;

    wx.request({
      url: app.globalData.requestURL + '/Users/update',
      method: 'PUT',
      data: {
        "_openid": '',
        "userId": userInfo.userId,
        "ppp": userInfo.ppp,
        "avatar": '',
        "rank": userInfo.rank,
        "classA": userInfo.classA,
        "classB": userInfo.classB,
        "ispc": userInfo.isPC
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res)
        if (res.statusCode == 200) {
          wx.removeStorageSync('userInfo')
          Toast({
            type: 'success',
            message: '解除成功',
            onClose: () => {
              wx.reLaunch({
                url: '../index/index',
              })
            }
          });
        } else {
          Toast.clear();
          Dialog.confirm({
            title: '解除绑定失败',
            message: '请点击下方【联系管理员】进行反馈。',
            confirmButtonText: "联系管理员",
            confirmButtonOpenType: "contact"
          })
        }
      },
      fail(err) {
        console.log(err)
        Toast.clear();
        Dialog.confirm({
          title: '解除绑定失败',
          message: '请点击下方【联系管理员】进行反馈。',
          confirmButtonText: "联系管理员",
          confirmButtonOpenType: "contact"
        })
      }
    })

    // await wx.cloud.callFunction({
    //     name: "users",
    //     data: {
    //       action: "clearOpenid",
    //       userId: userInfo.userId
    //     }
    //   })
    //   .then(res => {
    //     console.log(res)
    //     let result = res.result;
    //     if (result != {}) {
    //       let stats = result.stats;
    //       if (stats == 1) {
    //         Toast.clear();
    //         Toast({
    //           type: 'success',
    //           message: '解除成功',
    //           onClose: () => {
    //             wx.reLaunch({
    //               url: '../index/index',
    //             })
    //           }
    //         });
    //         // Toast.success('解除成功');
    //         // wx.reLaunch({
    //         //   url: '../index/index',
    //         // })
    //       } else {
    //         Toast.clear();
    //         Dialog.confirm({
    //           title: '解除绑定失败',
    //           message: '请点击下方【联系管理员】进行反馈。',
    //           confirmButtonText: "联系管理员",
    //           confirmButtonOpenType: "contact"
    //         }).then(() => {
    //           // on confirm
    //         }).catch(() => {
    //           // on cancel
    //           wx.reLaunch({
    //             url: '../index/index',
    //           })
    //         });
    //       }
    //     } else {
    //       Toast.clear();
    //       Dialog.confirm({
    //         title: '解除绑定失败',
    //         message: '请点击下方【联系管理员】进行反馈。',
    //         confirmButtonText: "联系管理员",
    //         confirmButtonOpenType: "contact"
    //       }).then(() => {
    //         // on confirm
    //       }).catch(() => {
    //         // on cancel
    //         wx.reLaunch({
    //           url: '../index/index',
    //         })
    //       });
    //     }
    //   })
    //   .catch(err => {
    //     console.log(err);
    //     Toast.fail('系统错误')
    //   })
    // wx.setStorageSync('userInfo', {});
  },
  //忘记密码按钮
  forgetPwd() {
    console.log('forgetPwd');
    Dialog.confirm({
      title: '忘记密码',
      message: '请点击下方【联系管理员】进行反馈。',
      confirmButtonText: "联系管理员",
      confirmButtonOpenType: "contact"
    }).then(() => {
      // on confirm
    }).catch(() => {
      // on cancel
      // wx.reLaunch({
      //   url: '../index/index',
      // })
    });
  },
  //编号输入
  onNumInput(e) {
    // console.log(e)
    let that = this;
    that.setData({
      number: e.detail.value
    })
  },
  onPwdInput(e) {
    // console.log(e)
    let that = this;
    that.setData({
      pwd: e.detail.value
    })
  },
  //绑定身份表单提交
  checkIdSubmit: async function (e) {
    let that = this;
    console.log('checkIdSubmit');
    console.log(e);
    let _openid = wx.getStorageInfoSync('_openid')
    let detail = e.detail.value;
    let protocol = detail.protocol;
    let privacy = detail.privacy;
    let num = detail.num;
    let pwd = detail.pwd;
    console.log(num)
    console.log(pwd)
    if (protocol && privacy && num.length != 0 && pwd.length != 0) {
      //加载动画
      Toast.loading({
        duration: 0,
        mask: true,
        message: '加载中...'
      });
      let _openid = wx.getStorageSync('_openid');
      console.log({
        "_openid": _openid,
          "userId": num,
          "ppp": pwd
      })
      // 绑定账号，如果返回2表示绑定成功，返回1表示账号密码有误，返回0表示账号已被绑定
      wx.request({
        url: app.globalData.requestURL + '/Users/update_openid',
        method: 'PUT',
        data: {
          "_openid": _openid,
          "userId": num,
          "ppp": md5(pwd)
        },
        dataType:'',
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          console.log(res)
          Toast.clear()
          if (res.data.code == 2) {
            console.log(res.data.code)
            Toast({
              type: 'success',
              message: '身份绑定成功',
              onClose: () => {
                wx.reLaunch({
                  url: '../index/index',
                })
              }
            });
          } else if (res.data.code == 1) {
            console.log(res.data.code)
            Toast.fail('账号密码错误')
          } else if (res.data.code == 0) {
            console.log(res.data.code)
            Dialog.confirm({
              title: '该账号已被绑定',
              message: '如有问题，请点击下方【联系管理员】进行反馈。',
              confirmButtonText: "联系管理员",
              confirmButtonOpenType: "contact"
            })
          } else {
            Dialog.confirm({
              title: '系统错误',
              message: '如有问题，请点击下方【联系管理员】进行反馈。',
              confirmButtonText: "联系管理员",
              confirmButtonOpenType: "contact"
            })
          }
        },
        fail(err) {
          console.log(err)
          Toast.clear();
          Dialog.confirm({
            title: '身份绑定失败',
            message: '如有问题，请点击下方【联系管理员】进行反馈。',
            confirmButtonText: "联系管理员",
            confirmButtonOpenType: "contact"
          })
        }
      })

      // await wx.cloud.callFunction({
      //   name: 'users',
      //   data: {
      //     action: 'isTrueUser',
      //     num: num,
      //     pwd: pwd
      //   }
      // })
      // .then(res => {
      //   console.log(res);
      //   let result = res.result;
      //   if (result.stats == 1) {
      //     let userInfo = result.userInfo;
      //     that.setData({
      //       userInfo: userInfo
      //     })
      //     wx.setStorageSync('userInfo', userInfo);
      //     Toast.success('身份验证成功');
      //     if (userInfo.rank < 3) {
      //       // 非超级管理员
      //       Toast.clear();

      //       let isOriginalPwd = result.isOriginalPwd;
      //       if (isOriginalPwd) {
      //         Dialog.confirm({
      //           title: '修改密码提示',
      //           message: '您的密码是初始化密码，建议修改',
      //           confirmButtonText: "修改"
      //         }).then(() => {
      //           // on confirm
      //           that.setData({
      //             currentData: 2
      //           });
      //         }).catch(async function () {
      //           await wx.cloud.callFunction({
      //             name: 'classB',
      //             data: {
      //               action: 'getBsinA',
      //               classA: userInfo.classA
      //             }
      //           }).then(res_classB => {
      //             wx.setStorageSync('classsB', res_classB.result[0]);
      //             wx.reLaunch({
      //               url: '../index/index',
      //             })
      //           })
      //         });
      //       } else {
      //         wx.reLaunch({
      //           url: '../index/index',
      //         })
      //       }
      //     } else {
      //       //超级管理员的密码在数据库里设置，无法通过小程序修改
      //       Toast.clear();
      //       wx.reLaunch({
      //         url: '../index/index',
      //       })
      //     }
      //   } else if (result.stats == 0) {
      //     Toast.clear();
      //     Toast('编号或密码错误');
      //   } else if (result.stats == -1) {
      //     Dialog.confirm({
      //       title: '身份绑定错误',
      //       message: '该编号已被绑定，如有问题，请点击下方【联系管理员】进行反馈。',
      //       confirmButtonText: "联系管理员",
      //       confirmButtonOpenType: "contact"
      //     })
      //   } else {
      //     Toast.clear();

      //     Toast('系统错误');
      //   }

      // }).catch(err => {
      //   Toast.clear();

      //   console.log(err);
      //   Toast('系统错误');
      // })
    } else {
      if (num.length == 0) {
        Toast('请输入编号');
      } else if (pwd.length == 0) {
        Toast('请输入密码');
      } else {
        if (!protocol) {
          Toast('《用户服务协议》未同意');
        } else if (!privacy) {
          Toast('《隐私政策》未同意');
        }
      }
    }
  },
  onPickerChange(e) {
    console.log(e)
    let tempCols = this.data.tempCols;
    const {
      picker,
      value,
      index
    } = e.detail;
    picker.setColumnValues(1, tempCols[value[0]]);
  },
  onPickerConfirm(e) {
    console.log(e);
    const {
      picker,
      value,
      index
    } = e.detail;
    Toast(`当前值：${value}, 当前索引：${index}`);
  },
  onPickerCancel(e) {
    let that = this;
    that.setData({
      picker_show: false,
      picker_loading: true
    })
  },
  //新密码第一次输入
  onNewPwdInput(e) {
    console.log(e)
    let that = this;
    that.setData({
      newPwd: e.detail.value
    })
    if (e.detail.value.length < 6) {
      Toast('建议密码大于6位')
    }
  },
  //密码再次输入
  onAgainPwdInput(e) {
    console.log(e)
    let that = this;
    that.setData({
      newPwd: e.detail.value
    })
  },
  //修改密码表单
  changePwdFormSubmit: async function (e) {
    console.log(e);
    let that = this;
    let userInfo = that.data.userInfo;
    let detail = e.detail.value;
    let newPwd = detail.newPwd; //第一次输入新密码
    let againPwd = detail.againPwd; //第二次输入密码
    console.log('==================changePwdFormSubmit修改密码======================')
    if (newPwd != '' && againPwd != '') {
      if (newPwd == againPwd) {
        //加载动画
        Toast.loading({
          duration: 0,
          mask: true,
          message: '加载中...'
        });
        //两次密码相同,修改密码
        wx.request({
          url: app.globalData.requestURL + '/Users/update',
          method: 'PUT',
          data: {
            "_openid": userInfo._openid,
            "userId": userInfo.userId,
            "ppp": md5(againPwd),
            "avatar": userInfo.avatar,
            "rank": userInfo.rank,
            "classA": userInfo.classA,
            "classB": userInfo.classB,
            "ispc": userInfo.isPC
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success(res) {
            console.log(res)
            if (res.statusCode == 200) {
              Toast({
                type: 'success',
                message: '密码修改成功',
                onClose: () => {
                  wx.reLaunch({
                    url: '../index/index',
                  })
                }
              });
            } else {
              Toast.clear();
              Dialog.confirm({
                title: '密码修改失败',
                message: '密码修改失败，如有问题，请点击下方【联系管理员】进行反馈。',
                confirmButtonText: "联系管理员",
                confirmButtonOpenType: "contact"
              })
            }
          },
          fail(err) {
            console.log(err)
            Toast.clear();
            Dialog.confirm({
              title: '密码修改失败',
              message: '密码修改失败，如有问题，请点击下方【联系管理员】进行反馈。',
              confirmButtonText: "联系管理员",
              confirmButtonOpenType: "contact"
            })
          }
        })
        // await wx.cloud.callFunction({
        //   name: "users",
        //   data: {
        //     action: "updatePPP",
        //     userId: userInfo.userId,
        //     openid: userInfo._openid,
        //     newPPP: newPwd
        //   }
        // })
        //   .then(res => {
        //     Toast.clear();
        //     if (res.result.stats == 1) {
        //       Toast({
        //         type: 'success',
        //         message: '密码修改成功',
        //         onClose: () => {
        //           wx.reLaunch({
        //             url: '../index/index',
        //           })
        //         }
        //       });
        //     } else {
        //       Dialog.confirm({
        //         title: '密码修改失败',
        //         message: '密码修改失败，如有问题，请点击下方【联系管理员】进行反馈。',
        //         confirmButtonText: "联系管理员",
        //         confirmButtonOpenType: "contact"
        //       })
        //     }
        //   })
        //   .catch(err => {
        //     Toast.clear();
        //     console.log(err)
        //     Toast.fail('系统错误')
        //   })
      } else {
        //两次密码不相同
        Toast('两次输入密码不同');
      }
    } else {
      //输入密码为空
      Toast('输入密码为空');
    }

  },
  toBack() {
    console.log('toBack')
    wx.reLaunch({
      url: '../index/index',
    })
  },
  //取消swiper的滑动操作
  stopTouchMove(event) {
    return false;
  },
  toProtocol() {
    wx.navigateTo({
      url: '../protocol/protocol',
    })
  },
  toPrivacy() {
    wx.navigateTo({
      url: '../privacy/privacy',
    })
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