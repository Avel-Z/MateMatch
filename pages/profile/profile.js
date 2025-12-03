// pages/profile/profile.js
const api = require('../../utils/api.js')
const util = require('../../utils/util.js')

Page({
  data: {
    isLoggedIn: false,
    userInfo: null,
    myNeeds: [],
    formData: {
      nickname: '',
      wechatId: '',
      avatar: '/images/avatar-default.png'
    },
    showEdit: false,
    editFormData: {
      nickname: '',
      wechatId: ''
    }
  },

  onLoad() {
    this.checkLoginStatus()
  },

  onShow() {
    this.checkLoginStatus()
    if (this.data.isLoggedIn) {
      this.loadMyNeeds()
    }
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    const userInfo = api.getUserInfo()
    if (userInfo) {
      this.setData({
        isLoggedIn: true,
        userInfo
      })
    } else {
      this.setData({
        isLoggedIn: false
      })
    }
  },

  /**
   * 加载我的发布
   */
  loadMyNeeds() {
    if (!this.data.userInfo) return
    
    const myNeeds = api.getUserNeeds(this.data.userInfo.id)
    this.setData({ myNeeds })
  },

  /**
   * 昵称输入
   */
  onNicknameInput(e) {
    this.setData({
      'formData.nickname': e.detail.value
    })
  },

  /**
   * 微信号输入
   */
  onWechatIdInput(e) {
    this.setData({
      'formData.wechatId': e.detail.value
    })
  },

  /**
   * 注册
   */
  onRegister() {
    const { nickname, wechatId } = this.data.formData
    
    if (!nickname || nickname.trim() === '') {
      util.showToast('请输入昵称')
      return
    }
    
    if (!wechatId || wechatId.trim() === '') {
      util.showToast('请输入微信号')
      return
    }
    
    util.showLoading('注册中...')
    
    const result = api.saveUserInfo(this.data.formData)
    
    util.hideLoading()
    
    if (result.success) {
      wx.showToast({
        title: '注册成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        this.checkLoginStatus()
      }, 1500)
    } else {
      util.showToast(result.message)
    }
  },

  /**
   * 显示编辑弹窗
   */
  showEditDialog() {
    this.setData({
      showEdit: true,
      editFormData: {
        nickname: this.data.userInfo.nickname,
        wechatId: this.data.userInfo.wechatId
      }
    })
  },

  /**
   * 隐藏编辑弹窗
   */
  hideEditDialog() {
    this.setData({
      showEdit: false
    })
  },

  /**
   * 阻止冒泡
   */
  stopPropagation() {
    // 阻止点击事件冒泡
  },

  /**
   * 编辑昵称输入
   */
  onEditNicknameInput(e) {
    this.setData({
      'editFormData.nickname': e.detail.value
    })
  },

  /**
   * 编辑微信号输入
   */
  onEditWechatIdInput(e) {
    this.setData({
      'editFormData.wechatId': e.detail.value
    })
  },

  /**
   * 保存编辑
   */
  onSaveEdit() {
    const { nickname, wechatId } = this.data.editFormData
    
    if (!nickname || nickname.trim() === '') {
      util.showToast('请输入昵称')
      return
    }
    
    if (!wechatId || wechatId.trim() === '') {
      util.showToast('请输入微信号')
      return
    }
    
    util.showLoading('保存中...')
    
    const result = api.updateUserInfo(this.data.editFormData)
    
    util.hideLoading()
    
    if (result.success) {
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
      
      this.setData({
        showEdit: false
      })
      
      setTimeout(() => {
        this.checkLoginStatus()
        this.loadMyNeeds()
      }, 500)
    } else {
      util.showToast(result.message)
    }
  },

  /**
   * 编辑需求
   */
  editNeed(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '编辑功能开发中，敬请期待！',
      showCancel: false
    })
  },

  /**
   * 删除需求
   */
  deleteNeed(e) {
    const id = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这条需求吗？',
      success: (res) => {
        if (res.confirm) {
          const result = api.deleteNeed(id)
          
          if (result.success) {
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            })
            
            this.loadMyNeeds()
          } else {
            util.showToast(result.message)
          }
        }
      }
    })
  }
})
