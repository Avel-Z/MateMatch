// app.js
App({
  onLaunch() {
    // 初始化本地存储
    this.initStorage();
  },

  initStorage() {
    // 初始化需求列表
    if (!wx.getStorageSync('needs')) {
      wx.setStorageSync('needs', []);
    }
    // 初始化用户信息
    if (!wx.getStorageSync('userInfo')) {
      wx.setStorageSync('userInfo', null);
    }
  },

  globalData: {
    userInfo: null
  }
})
