// pages/detail/detail.js
const app = getApp()
const util = require('../../utils/util.js')
const api = require('../../utils/api.js')

Page({
  data: {
    needId: '',
    need: null,
    isLoading: true,
    isOwner: false,
    hasResponded: false,
    respondMessage: ''
  },

  onLoad: function(options) {
    if (options.id) {
      this.setData({ needId: options.id })
      this.loadNeedDetail()
    }
  },

  // 加载需求详情
  loadNeedDetail: function() {
    const that = this
    util.showLoading('加载中...')
    
    wx.cloud.callFunction({
      name: 'getNearbyNeeds',
      data: {
        needId: this.data.needId
      }
    }).then(res => {
      util.hideLoading()
      if (res.result && res.result.data) {
        const need = res.result.data
        // 格式化时间
        need.activityTimeFormatted = util.formatActivityTime(need.activityTime)
        need.createTimeFormatted = util.formatRelativeTime(new Date(need.createTime).getTime())
        
        that.setData({
          need: need,
          isLoading: false,
          isOwner: need.publisherId === app.globalData.openid
        })
      }
    }).catch(err => {
      util.hideLoading()
      console.error('加载详情失败:', err)
      that.setData({ isLoading: false })
      util.showError('加载失败')
    })
  },

  // 输入响应消息
  onRespondMessageInput: function(e) {
    this.setData({
      respondMessage: e.detail.value
    })
  },

  // 响应需求（发起聊天）
  respondToNeed: function() {
    const that = this
    
    if (!this.data.need) {
      return
    }
    
    // 检查登录状态
    if (!app.globalData.openid) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再响应需求',
        confirmText: '去登录',
        success: function(res) {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/profile/profile'
            })
          }
        }
      })
      return
    }
    
    // 不能响应自己的需求
    if (this.data.isOwner) {
      util.showError('不能响应自己的需求')
      return
    }
    
    util.showLoading('发送中...')
    
    api.respondToNeed(this.data.needId, this.data.respondMessage || '你好，我对这个活动很感兴趣！').then(res => {
      util.hideLoading()
      if (res.result && res.result.success) {
        util.showSuccess('响应成功')
        that.setData({ hasResponded: true })
        
        // 跳转到聊天页面
        setTimeout(() => {
          wx.navigateTo({
            url: `/pages/chat/chat?needId=${that.data.needId}&userId=${that.data.need.publisherId}`
          })
        }, 1000)
      } else {
        util.showError(res.result?.message || '响应失败')
      }
    }).catch(err => {
      util.hideLoading()
      console.error('响应失败:', err)
      util.showError('响应失败，请重试')
    })
  },

  // 发起聊天（直接跳转）
  startChat: function() {
    if (!this.data.need) {
      return
    }
    
    wx.navigateTo({
      url: `/pages/chat/chat?needId=${this.data.needId}&userId=${this.data.need.publisherId}`
    })
  },

  // 查看发布者主页
  viewPublisher: function() {
    if (this.data.need && this.data.need.publisherId) {
      wx.navigateTo({
        url: `/pages/profile/profile?userId=${this.data.need.publisherId}`
      })
    }
  },

  // 分享
  onShareAppMessage: function() {
    const need = this.data.need
    return {
      title: need ? need.title : '来搭子引力找个伴',
      path: `/pages/detail/detail?id=${this.data.needId}`,
      imageUrl: ''
    }
  },

  // 更新需求状态（仅发布者可用）
  updateStatus: function(e) {
    const status = e.currentTarget.dataset.status
    const that = this
    
    wx.showModal({
      title: '确认',
      content: status === 'completed' ? '确认标记为已完成？' : '确认取消此需求？',
      success: function(res) {
        if (res.confirm) {
          util.showLoading('更新中...')
          api.updateNeedStatus(that.data.needId, status).then(res => {
            util.hideLoading()
            if (res.result && res.result.success) {
              util.showSuccess('更新成功')
              that.loadNeedDetail()
            } else {
              util.showError('更新失败')
            }
          }).catch(err => {
            util.hideLoading()
            console.error('更新状态失败:', err)
            util.showError('更新失败')
          })
        }
      }
    })
  },

  // 打开地图导航
  openNavigation: function() {
    if (!this.data.need || !this.data.need.location) {
      return
    }
    
    const location = this.data.need.location
    wx.openLocation({
      latitude: location.coordinates[1],
      longitude: location.coordinates[0],
      name: this.data.need.locationName,
      scale: 18
    })
  }
})
