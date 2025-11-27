// app.js
App({
  onLaunch: function() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'your-env-id',
        traceUser: true,
      })
    }

    this.globalData = {}
    
    // 获取用户登录状态
    this.checkLogin()
  },

  checkLogin: function() {
    const that = this
    wx.getStorage({
      key: 'userInfo',
      success: function(res) {
        that.globalData.userInfo = res.data
        that.globalData.isLogin = true
      },
      fail: function() {
        that.globalData.isLogin = false
      }
    })
  },

  // 用户登录
  login: function() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          this.globalData.openid = res.result.openid
          resolve(res.result)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  globalData: {
    userInfo: null,
    isLogin: false,
    openid: null
  }
})
