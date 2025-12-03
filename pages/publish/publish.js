// pages/publish/publish.js
const api = require('../../utils/api.js')
const util = require('../../utils/util.js')

Page({
  data: {
    typeList: ['看展', '聚餐', '运动', '电影', '其他'],
    typeIndex: null,
    minDate: '',
    formData: {
      type: '',
      title: '',
      location: '',
      date: '',
      time: '',
      description: '',
      cost: ''
    }
  },

  onLoad() {
    // 设置最小日期为今天
    const today = new Date()
    this.setData({
      minDate: util.formatDate(today)
    })
  },

  onShow() {
    // 检查用户是否已登录
    const userInfo = api.getUserInfo()
    if (!userInfo) {
      wx.showModal({
        title: '提示',
        content: '请先完善个人信息后再发布需求',
        confirmText: '去完善',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/profile/profile'
            })
          }
        }
      })
    }
  },

  /**
   * 活动类型选择
   */
  onTypeChange(e) {
    const index = e.detail.value
    this.setData({
      typeIndex: index,
      'formData.type': this.data.typeList[index]
    })
  },

  /**
   * 标题输入
   */
  onTitleInput(e) {
    this.setData({
      'formData.title': e.detail.value
    })
  },

  /**
   * 地点输入
   */
  onLocationInput(e) {
    this.setData({
      'formData.location': e.detail.value
    })
  },

  /**
   * 日期选择
   */
  onDateChange(e) {
    this.setData({
      'formData.date': e.detail.value
    })
  },

  /**
   * 时间选择
   */
  onTimeChange(e) {
    this.setData({
      'formData.time': e.detail.value
    })
  },

  /**
   * 描述输入
   */
  onDescriptionInput(e) {
    this.setData({
      'formData.description': e.detail.value
    })
  },

  /**
   * 费用输入
   */
  onCostInput(e) {
    this.setData({
      'formData.cost': e.detail.value
    })
  },

  /**
   * 表单验证
   */
  validateForm() {
    const { type, title, location, date, time, description, cost } = this.data.formData
    
    if (!type) {
      util.showToast('请选择活动类型')
      return false
    }
    
    if (!title || title.trim() === '') {
      util.showToast('请输入活动标题')
      return false
    }
    
    if (!location || location.trim() === '') {
      util.showToast('请输入活动地点')
      return false
    }
    
    if (!date) {
      util.showToast('请选择活动日期')
      return false
    }
    
    if (!time) {
      util.showToast('请选择活动时间')
      return false
    }
    
    if (!description || description.trim() === '') {
      util.showToast('请输入详细描述')
      return false
    }
    
    if (!cost || cost.trim() === '') {
      util.showToast('请输入费用说明')
      return false
    }
    
    return true
  },

  /**
   * 提交表单
   */
  onSubmit() {
    // 验证表单
    if (!this.validateForm()) {
      return
    }
    
    // 检查用户信息
    const userInfo = api.getUserInfo()
    if (!userInfo) {
      wx.showModal({
        title: '提示',
        content: '请先完善个人信息后再发布需求',
        confirmText: '去完善',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/profile/profile'
            })
          }
        }
      })
      return
    }
    
    util.showLoading('发布中...')
    
    // 创建需求
    const result = api.createNeed(this.data.formData)
    
    util.hideLoading()
    
    if (result.success) {
      wx.showToast({
        title: '发布成功',
        icon: 'success'
      })
      
      // 重置表单
      this.setData({
        typeIndex: null,
        formData: {
          type: '',
          title: '',
          location: '',
          date: '',
          time: '',
          description: '',
          cost: ''
        }
      })
      
      // 跳转到首页
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }, 1500)
    } else {
      util.showToast(result.message)
    }
  }
})
