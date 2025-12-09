// pages/messages/messages.js
const util = require('../../utils/util.js')

Page({
  data: {
    conversations: [],
    loading: false,
    currentUserId: ''
  },

  onLoad() {
    // 获取当前用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        currentUserId: userInfo.id
      })
      this.loadConversations()
    }
  },

  onShow() {
    // 每次显示页面时刷新会话列表
    if (this.data.currentUserId) {
      this.loadConversations()
    }
  },

  /**
   * 加载会话列表
   */
  loadConversations() {
    if (this.data.loading) {
      return
    }

    this.setData({ loading: true })

    // 模拟云函数调用
    // 实际应用中应调用云函数：wx.cloud.callFunction()
    setTimeout(() => {
      const conversations = this.getConversationsFromStorage()
      
      this.setData({
        conversations,
        loading: false
      })
    }, 500)
  },

  /**
   * 从本地存储获取会话列表（模拟云函数）
   */
  getConversationsFromStorage() {
    try {
      const allConversations = wx.getStorageSync('conversations') || []
      const allMessages = wx.getStorageSync('messages') || []
      
      // 筛选当前用户参与的会话
      const userConversations = allConversations
        .filter(conv => conv.participants.includes(this.data.currentUserId))
        .map(conv => {
          // 获取对方ID
          const otherUserId = conv.participants.find(id => id !== this.data.currentUserId)
          
          // 计算未读消息数
          const unreadCount = allMessages.filter(msg => 
            msg.conversationId === conv._id && 
            msg.senderId === otherUserId && 
            !msg.read
          ).length

          return {
            ...conv,
            otherUserId,
            unreadCount
          }
        })
        .sort((a, b) => {
          // 按最后消息时间倒序排列
          return new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
        })

      return userConversations
    } catch (e) {
      console.error('获取会话列表失败', e)
      return []
    }
  },

  /**
   * 进入对话
   */
  enterChat(e) {
    const conversation = e.currentTarget.dataset.conversation
    
    wx.navigateTo({
      url: `/pages/chat/chat?conversationId=${conversation._id}&otherUserId=${conversation.otherUserId}&otherUserName=${conversation.otherUserName}&otherUserAvatar=${conversation.otherUserAvatar}`
    })
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadConversations()
    wx.stopPullDownRefresh()
  },

  /**
   * 格式化时间显示
   */
  formatTime(date) {
    const msgDate = new Date(date)
    const now = new Date()
    const diff = now - msgDate

    // 小于1分钟显示"刚刚"
    if (diff < 60000) {
      return '刚刚'
    }

    // 小于1小时显示分钟
    if (diff < 3600000) {
      return Math.floor(diff / 60000) + '分钟前'
    }

    // 今天显示时间
    if (msgDate.toDateString() === now.toDateString()) {
      return util.formatTimeOnly(msgDate)
    }

    // 昨天显示"昨天"
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (msgDate.toDateString() === yesterday.toDateString()) {
      return '昨天'
    }

    // 其他显示日期
    return util.formatDate(msgDate)
  }
})
