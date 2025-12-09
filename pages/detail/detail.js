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
  },

  /**
   * 发起对话
   */
  startChat() {
    const userInfo = wx.getStorageSync('userInfo')
    
    // 检查是否已登录
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

    // 不能与自己对话
    if (userInfo.id === this.data.need.publisherId) {
      wx.showToast({
        title: '不能与自己对话',
        icon: 'none'
      })
      return
    }

    const util = require('../../utils/util.js')
    
    // 生成会话ID（两个用户ID排序后拼接）
    const ids = [userInfo.id, this.data.need.publisherId].sort()
    const conversationId = `${ids[0]}_${ids[1]}`

    // 检查会话是否已存在
    let conversations = wx.getStorageSync('conversations') || []
    let conversation = conversations.find(c => c._id === conversationId)

    if (!conversation) {
      // 创建新会话
      conversation = {
        _id: conversationId,
        participants: [userInfo.id, this.data.need.publisherId],
        postId: this.data.need.id,
        postTitle: this.data.need.title,
        lastMessage: '',
        lastMessageTime: new Date(),
        otherUserId: this.data.need.publisherId,
        otherUserName: this.data.need.publisherName,
        otherUserAvatar: this.data.need.publisherAvatar,
        createdAt: new Date()
      }
      
      conversations.push(conversation)
      wx.setStorageSync('conversations', conversations)
    }

    // 跳转到聊天页面
    wx.navigateTo({
      url: `/pages/chat/chat?conversationId=${conversationId}&otherUserId=${this.data.need.publisherId}&otherUserName=${this.data.need.publisherName}&otherUserAvatar=${this.data.need.publisherAvatar}`
    })
  }
})
