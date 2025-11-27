// pages/chat/chat.js
const app = getApp()
const util = require('../../utils/util.js')
const api = require('../../utils/api.js')

Page({
  data: {
    needId: '',
    userId: '',
    chatId: '',
    messages: [],
    inputMessage: '',
    userInfo: null,
    needInfo: null,
    isLoading: true,
    scrollToMessage: '',
    keyboardHeight: 0,
    currentUserAvatar: ''
  },

  onLoad: function(options) {
    this.setData({
      needId: options.needId || '',
      userId: options.userId || '',
      chatId: options.chatId || '',
      currentUserAvatar: app.globalData.userInfo ? app.globalData.userInfo.avatarUrl : ''
    })
    
    this.loadChatInfo()
    this.loadMessages()
    this.setupMessageListener()
  },

  onUnload: function() {
    // 取消消息监听
    if (this.messageWatcher) {
      this.messageWatcher.close()
    }
  },

  // 加载聊天相关信息
  loadChatInfo: function() {
    const that = this
    
    // 获取对方用户信息
    if (this.data.userId) {
      api.getUserProfile(this.data.userId).then(res => {
        if (res.result && res.result.data) {
          that.setData({
            userInfo: res.result.data
          })
          wx.setNavigationBarTitle({
            title: res.result.data.nickName || '聊天'
          })
        }
      })
    }
    
    // 获取关联的需求信息
    if (this.data.needId) {
      wx.cloud.callFunction({
        name: 'getNearbyNeeds',
        data: { needId: this.data.needId }
      }).then(res => {
        if (res.result && res.result.data) {
          that.setData({
            needInfo: res.result.data
          })
        }
      })
    }
  },

  // 加载历史消息
  loadMessages: function() {
    const that = this
    
    api.getMessages(this.data.chatId || `${this.data.needId}_${app.globalData.openid}_${this.data.userId}`).then(res => {
      if (res.result && res.result.data) {
        const messages = res.result.data.map(msg => {
          msg.isSelf = msg.senderId === app.globalData.openid
          msg.timeFormatted = util.formatRelativeTime(new Date(msg.createTime).getTime())
          return msg
        })
        
        that.setData({
          messages: messages,
          isLoading: false
        })
        
        // 滚动到最新消息
        that.scrollToBottom()
      }
    }).catch(err => {
      console.error('加载消息失败:', err)
      that.setData({ isLoading: false })
    })
  },

  // 设置实时消息监听
  setupMessageListener: function() {
    const that = this
    const db = wx.cloud.database()
    
    // 监听新消息
    this.messageWatcher = db.collection('messages')
      .where({
        $or: [
          { chatId: this.data.chatId || `${this.data.needId}_${app.globalData.openid}_${this.data.userId}` },
          { chatId: `${this.data.needId}_${this.data.userId}_${app.globalData.openid}` }
        ]
      })
      .orderBy('createTime', 'asc')
      .watch({
        onChange: function(snapshot) {
          if (snapshot.docChanges && snapshot.docChanges.length > 0) {
            const newMessages = snapshot.docs.map(msg => {
              msg.isSelf = msg.senderId === app.globalData.openid
              msg.timeFormatted = util.formatRelativeTime(new Date(msg.createTime).getTime())
              return msg
            })
            
            that.setData({
              messages: newMessages
            })
            
            that.scrollToBottom()
          }
        },
        onError: function(err) {
          console.error('消息监听错误:', err)
        }
      })
  },

  // 输入消息
  onMessageInput: function(e) {
    this.setData({
      inputMessage: e.detail.value
    })
  },

  // 发送消息
  sendMessage: function() {
    const content = this.data.inputMessage.trim()
    
    if (!content) {
      return
    }
    
    const that = this
    
    // 先添加到本地消息列表（乐观更新）
    const tempMessage = {
      _id: 'temp_' + Date.now(),
      senderId: app.globalData.openid,
      content: content,
      createTime: new Date(),
      isSelf: true,
      timeFormatted: '刚刚',
      sending: true
    }
    
    this.setData({
      messages: [...this.data.messages, tempMessage],
      inputMessage: ''
    })
    
    this.scrollToBottom()
    
    // 发送到服务器
    api.sendMessage(this.data.userId, this.data.needId, content).then(res => {
      if (res.result && res.result.success) {
        // 消息发送成功，实时监听会更新
      } else {
        // 发送失败，标记消息
        const messages = that.data.messages.map(msg => {
          if (msg._id === tempMessage._id) {
            msg.failed = true
            msg.sending = false
          }
          return msg
        })
        that.setData({ messages: messages })
        util.showError('发送失败')
      }
    }).catch(err => {
      console.error('发送消息失败:', err)
      const messages = that.data.messages.map(msg => {
        if (msg._id === tempMessage._id) {
          msg.failed = true
          msg.sending = false
        }
        return msg
      })
      that.setData({ messages: messages })
      util.showError('发送失败')
    })
  },

  // 滚动到底部
  scrollToBottom: function() {
    const that = this
    setTimeout(() => {
      that.setData({
        scrollToMessage: 'message-' + (that.data.messages.length - 1)
      })
    }, 100)
  },

  // 重发消息
  resendMessage: function(e) {
    const index = e.currentTarget.dataset.index
    const message = this.data.messages[index]
    
    if (message && message.failed) {
      // 移除失败的消息
      const messages = this.data.messages.filter((_, i) => i !== index)
      this.setData({
        messages: messages,
        inputMessage: message.content
      })
      
      // 重新发送
      this.sendMessage()
    }
  },

  // 查看需求详情
  viewNeedDetail: function() {
    if (this.data.needId) {
      wx.navigateTo({
        url: `/pages/detail/detail?id=${this.data.needId}`
      })
    }
  },

  // 查看对方主页
  viewUserProfile: function() {
    if (this.data.userId) {
      wx.navigateTo({
        url: `/pages/profile/profile?userId=${this.data.userId}`
      })
    }
  },

  // 键盘高度变化
  onKeyboardHeightChange: function(e) {
    this.setData({
      keyboardHeight: e.detail.height
    })
    this.scrollToBottom()
  }
})
