// pages/detail/detail.js
const api = require('../../utils/api.js')

Page({
  data: {
    need: {},
    wechatIdVisible: false
  },

  onLoad(options) {
    const id = options.id
    if (id) {
      this.loadNeedDetail(id)
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  /**
   * 加载需求详情
   */
  loadNeedDetail(id) {
    const need = api.getNeedById(id)
    if (need) {
      this.setData({ need })
    } else {
      wx.showToast({
        title: '需求不存在',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  /**
   * 显示微信号
   */
  showWechatId() {
    this.setData({
      wechatIdVisible: true
    })
  },

  /**
   * 复制微信号
   */
  copyWechatId(e) {
    const wechatId = e.currentTarget.dataset.id
    wx.setClipboardData({
      data: wechatId,
      success: () => {
        wx.showToast({
          title: '微信号已复制',
          icon: 'success'
        })
      }
    })
  }
})
