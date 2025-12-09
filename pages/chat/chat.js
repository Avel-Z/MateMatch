// pages/chat/chat.js
const util = require('../../utils/util.js')

Page({
  data: {
    conversationId: '',
    otherUser: {},
    messages: [],
    inputText: '',
    page: 1,
    pageSize: 20,
    hasMore: true,
    loading: false,
    currentUserId: '',
    scrollIntoView: '',
  },

  onLoad(options) {
    const { conversationId, otherUserId, otherUserName, otherUserAvatar } = options
    
    if (!conversationId) {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return
    }

    // 获取当前用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      wx.showToast({
        title: '请先完善个人信息',
        icon: 'none'
      })
      setTimeout(() => {
        wx.switchTab({ url: '/pages/profile/profile' })
      }, 1500)
      return
    }

    // 解码 URL 参数
    const decodedOtherUserName = decodeURIComponent(otherUserName || '对方')
    const decodedOtherUserAvatar = decodeURIComponent(otherUserAvatar || '/images/avatar-default.png')

    this.setData({
      conversationId,
      currentUserId: userInfo.id,
      otherUser: {
        _id: otherUserId,
        nickname: decodedOtherUserName,
        avatarUrl: decodedOtherUserAvatar
      }
    })

    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: decodedOtherUserName
    })

    this.loadMessages()
  },

  /**
   * 加载消息列表
   */
  loadMessages(isLoadMore = false) {
    if (this.data.loading || (!isLoadMore && !this.data.hasMore && this.data.messages.length > 0)) {
      return
    }

    this.setData({ loading: true })

    // 模拟云函数调用
    // 实际应用中应调用云函数：wx.cloud.callFunction()
    setTimeout(() => {
      const messages = this.getMessagesFromStorage()
      
      this.setData({
        messages,
        loading: false,
        hasMore: false
      })

      // 滚动到底部
      if (!isLoadMore) {
        this.scrollToBottom()
      }
    }, 500)
  },

  /**
   * 从本地存储获取消息（模拟云函数）
   */
  getMessagesFromStorage() {
    try {
      const allMessages = wx.getStorageSync('messages') || []
      return allMessages.filter(msg => msg.conversationId === this.data.conversationId)
    } catch (e) {
      console.error('获取消息失败', e)
      return []
    }
  },

  /**
   * 发送消息
   */
  sendMessage() {
    const content = this.data.inputText.trim()
    
    if (!content) {
      wx.showToast({
        title: '请输入消息内容',
        icon: 'none'
      })
      return
    }

    const userInfo = wx.getStorageSync('userInfo')
    const message = {
      _id: util.generateId(),
      conversationId: this.data.conversationId,
      senderId: this.data.currentUserId,
      senderName: userInfo.nickname,
      senderAvatar: userInfo.avatar,
      content,
      createdAt: new Date(),
      read: false
    }

    // 保存到本地存储（模拟云函数）
    try {
      const allMessages = wx.getStorageSync('messages') || []
      allMessages.push(message)
      wx.setStorageSync('messages', allMessages)

      // 更新会话的最后消息
      this.updateConversationLastMessage(content)

      // 更新消息列表
      this.setData({
        messages: [...this.data.messages, message],
        inputText: ''
      })

      // 滚动到底部
      this.scrollToBottom()
    } catch (e) {
      console.error('发送消息失败', e)
      wx.showToast({
        title: '发送失败',
        icon: 'none'
      })
    }
  },

  /**
   * 更新会话的最后消息
   */
  updateConversationLastMessage(content) {
    try {
      const conversations = wx.getStorageSync('conversations') || []
      const index = conversations.findIndex(c => c._id === this.data.conversationId)
      
      if (index !== -1) {
        conversations[index].lastMessage = content
        conversations[index].lastMessageTime = new Date()
        wx.setStorageSync('conversations', conversations)
      }
    } catch (e) {
      console.error('更新会话失败', e)
    }
  },

  /**
   * 输入框内容变化
   */
  onInputChange(e) {
    this.setData({
      inputText: e.detail.value
    })
  },

  /**
   * 滚动到底部
   */
  scrollToBottom() {
    this.setData({
      scrollIntoView: 'msg-' + (this.data.messages.length - 1)
    })
  },

  /**
   * 下拉刷新加载更多
   */
  onPullDownRefresh() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({
        page: this.data.page + 1
      })
      this.loadMessages(true)
    }
    wx.stopPullDownRefresh()
  },

  /**
   * 格式化时间显示
   */
  formatMessageTime(date) {
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
      return '昨天 ' + util.formatTimeOnly(msgDate)
    }

    // 其他显示日期
    return util.formatDate(msgDate)
  }
})
