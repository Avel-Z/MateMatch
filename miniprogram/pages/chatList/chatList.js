// pages/chatList/chatList.js
const app = getApp()
const util = require('../../utils/util.js')
const api = require('../../utils/api.js')

Page({
  data: {
    conversations: [],
    isLoading: true
  },

  onLoad: function() {
    
  },

  onShow: function() {
    this.loadConversations()
  },

  // 加载会话列表
  loadConversations: function() {
    const that = this
    
    if (!app.globalData.openid) {
      that.setData({ isLoading: false })
      return
    }
    
    api.getMessages().then(res => {
      if (res.result && res.result.data) {
        const conversations = res.result.data.map(conv => {
          conv.lastMessageTimeFormatted = util.formatRelativeTime(new Date(conv.lastMessageTime).getTime())
          return conv
        })
        
        that.setData({
          conversations: conversations,
          isLoading: false
        })
      }
    }).catch(err => {
      console.error('加载会话失败:', err)
      that.setData({ isLoading: false })
    })
  },

  // 进入聊天
  enterChat: function(e) {
    const conv = e.currentTarget.dataset.conv
    wx.navigateTo({
      url: `/pages/chat/chat?chatId=${conv._id}&userId=${conv.targetUserId}&needId=${conv.needId}`
    })
  },

  // 删除会话
  deleteConversation: function(e) {
    const index = e.currentTarget.dataset.index
    const that = this
    
    wx.showModal({
      title: '确认删除',
      content: '删除后聊天记录将被清空',
      success: function(res) {
        if (res.confirm) {
          // 调用删除接口
          const conversations = that.data.conversations.filter((_, i) => i !== index)
          that.setData({ conversations: conversations })
          util.showSuccess('已删除')
        }
      }
    })
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadConversations()
    wx.stopPullDownRefresh()
  }
})
