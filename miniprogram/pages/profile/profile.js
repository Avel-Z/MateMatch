// pages/profile/profile.js
const app = getApp()
const util = require('../../utils/util.js')
const api = require('../../utils/api.js')

Page({
  data: {
    userId: '',
    isCurrentUser: true,
    isLogin: false,
    userInfo: null,
    trustTags: [],
    myNeeds: [],
    myResponses: [],
    activeTab: 'needs',
    stats: {
      needsCount: 0,
      completedCount: 0,
      responsesCount: 0
    },
    isLoading: true
  },

  onLoad: function(options) {
    const userId = options.userId || ''
    this.setData({
      userId: userId,
      isCurrentUser: !userId || userId === app.globalData.openid
    })
  },

  onShow: function() {
    this.checkLoginAndLoad()
  },

  // 检查登录状态并加载数据
  checkLoginAndLoad: function() {
    const that = this
    
    if (app.globalData.openid) {
      that.setData({ isLogin: true })
      that.loadUserProfile()
      if (that.data.isCurrentUser) {
        that.loadMyNeeds()
      }
    } else {
      // 尝试登录
      app.login().then(res => {
        that.setData({ isLogin: true })
        that.loadUserProfile()
        if (that.data.isCurrentUser) {
          that.loadMyNeeds()
        }
      }).catch(err => {
        console.error('登录失败:', err)
        that.setData({ isLoading: false })
      })
    }
  },

  // 加载用户资料
  loadUserProfile: function() {
    const that = this
    
    api.getUserProfile(this.data.userId).then(res => {
      if (res.result && res.result.data) {
        const profile = res.result.data
        that.setData({
          userInfo: profile,
          trustTags: profile.trustTags || [],
          stats: {
            needsCount: profile.needsCount || 0,
            completedCount: profile.completedCount || 0,
            responsesCount: profile.responsesCount || 0
          },
          isLoading: false
        })
      }
    }).catch(err => {
      console.error('加载用户资料失败:', err)
      that.setData({ isLoading: false })
    })
  },

  // 加载我的需求
  loadMyNeeds: function() {
    const that = this
    
    wx.cloud.callFunction({
      name: 'getNearbyNeeds',
      data: {
        userId: app.globalData.openid,
        type: 'my'
      }
    }).then(res => {
      if (res.result && res.result.data) {
        const needs = res.result.data.map(need => {
          need.activityTimeFormatted = util.formatActivityTime(need.activityTime)
          return need
        })
        that.setData({ myNeeds: needs })
      }
    })
  },

  // 微信登录获取用户信息
  getUserProfile: function() {
    const that = this
    
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: function(res) {
        const userInfo = res.userInfo
        that.setData({ userInfo: userInfo })
        app.globalData.userInfo = userInfo
        
        // 保存到云端
        api.updateUserProfile({
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
          gender: userInfo.gender
        }).then(() => {
          util.showSuccess('登录成功')
          that.loadUserProfile()
          that.loadMyNeeds()
        })
      },
      fail: function(err) {
        console.error('获取用户信息失败:', err)
        util.showError('授权失败')
      }
    })
  },

  // 切换标签页
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
    
    if (tab === 'responses' && this.data.myResponses.length === 0) {
      this.loadMyResponses()
    }
  },

  // 加载我的响应
  loadMyResponses: function() {
    const that = this
    
    wx.cloud.callFunction({
      name: 'getNearbyNeeds',
      data: {
        userId: app.globalData.openid,
        type: 'responses'
      }
    }).then(res => {
      if (res.result && res.result.data) {
        that.setData({ myResponses: res.result.data })
      }
    })
  },

  // 查看需求详情
  viewNeedDetail: function(e) {
    const needId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/detail/detail?id=${needId}`
    })
  },

  // 编辑资料
  editProfile: function() {
    // 跳转到编辑页面或弹出编辑框
    wx.showActionSheet({
      itemList: ['修改昵称', '修改头像'],
      success: function(res) {
        if (res.tapIndex === 0) {
          // 修改昵称
          wx.showModal({
            title: '修改昵称',
            editable: true,
            placeholderText: '请输入新昵称',
            success: function(modalRes) {
              if (modalRes.confirm && modalRes.content) {
                api.updateUserProfile({ nickName: modalRes.content }).then(() => {
                  util.showSuccess('修改成功')
                })
              }
            }
          })
        } else if (res.tapIndex === 1) {
          // 修改头像
          wx.chooseImage({
            count: 1,
            success: function(imgRes) {
              // 上传头像逻辑
            }
          })
        }
      }
    })
  },

  // 关于我们
  showAbout: function() {
    wx.showModal({
      title: '关于搭子引力',
      content: '搭子引力 - 轻量级兴趣约伴平台\n\n不想为了一顿饭、一次看展专门去麻烦那些很熟的朋友?来这里发个"轻招募"，找到当下志同道合的"临时搭子"。\n\n版本：1.0.0',
      showCancel: false
    })
  },

  // 意见反馈
  feedback: function() {
    wx.openSetting({
      success: function(res) {
        console.log(res.authSetting)
      }
    })
  },

  // 分享
  onShareAppMessage: function() {
    return {
      title: '搭子引力 - 找个搭子一起玩',
      path: '/pages/index/index',
      imageUrl: ''
    }
  }
})
