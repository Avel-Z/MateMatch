// pages/post/post.js
const app = getApp()
const util = require('../../utils/util.js')
const api = require('../../utils/api.js')

Page({
  data: {
    title: '',
    description: '',
    category: '',
    categories: ['美食', '运动', '看展', '电影', '旅行', '学习', '其他'],
    activityDate: '',
    activityTime: '',
    locationName: '',
    latitude: null,
    longitude: null,
    peopleNeeded: 1,
    isAA: false,
    isSubmitting: false,
    minDate: '',
    maxDate: ''
  },

  onLoad: function() {
    // 设置日期范围
    const today = new Date()
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 3)
    
    this.setData({
      minDate: this.formatDateForPicker(today),
      maxDate: this.formatDateForPicker(maxDate)
    })
  },

  formatDateForPicker: function(date) {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  // 输入标题
  onTitleInput: function(e) {
    this.setData({
      title: e.detail.value
    })
  },

  // 输入描述
  onDescriptionInput: function(e) {
    this.setData({
      description: e.detail.value
    })
  },

  // 选择分类
  onCategoryChange: function(e) {
    this.setData({
      category: this.data.categories[e.detail.value]
    })
  },

  // 选择日期
  onDateChange: function(e) {
    this.setData({
      activityDate: e.detail.value
    })
  },

  // 选择时间
  onTimeChange: function(e) {
    this.setData({
      activityTime: e.detail.value
    })
  },

  // 选择地点
  chooseLocation: function() {
    const that = this
    wx.chooseLocation({
      success: function(res) {
        that.setData({
          locationName: res.name || res.address,
          latitude: res.latitude,
          longitude: res.longitude
        })
      },
      fail: function(err) {
        console.error('选择位置失败:', err)
        if (err.errMsg.indexOf('auth deny') > -1) {
          wx.showModal({
            title: '位置权限',
            content: '需要位置权限来选择活动地点',
            confirmText: '去设置',
            success: function(res) {
              if (res.confirm) {
                wx.openSetting()
              }
            }
          })
        }
      }
    })
  },

  // 修改人数
  changePeopleCount: function(e) {
    const type = e.currentTarget.dataset.type
    let count = this.data.peopleNeeded
    
    if (type === 'add' && count < 10) {
      count++
    } else if (type === 'minus' && count > 1) {
      count--
    }
    
    this.setData({
      peopleNeeded: count
    })
  },

  // 切换AA制
  toggleAA: function() {
    this.setData({
      isAA: !this.data.isAA
    })
  },

  // 验证表单
  validateForm: function() {
    const { title, category, activityDate, activityTime, locationName } = this.data
    
    if (!title.trim()) {
      util.showError('请输入需求标题')
      return false
    }
    if (!category) {
      util.showError('请选择活动分类')
      return false
    }
    if (!activityDate) {
      util.showError('请选择活动日期')
      return false
    }
    if (!activityTime) {
      util.showError('请选择活动时间')
      return false
    }
    if (!locationName) {
      util.showError('请选择活动地点')
      return false
    }
    
    return true
  },

  // 提交表单
  submitNeed: function() {
    if (!this.validateForm()) {
      return
    }
    
    if (this.data.isSubmitting) {
      return
    }
    
    this.setData({ isSubmitting: true })
    util.showLoading('发布中...')
    
    const needData = {
      title: this.data.title.trim(),
      description: this.data.description.trim(),
      category: this.data.category,
      activityTime: `${this.data.activityDate} ${this.data.activityTime}`,
      locationName: this.data.locationName,
      location: {
        type: 'Point',
        coordinates: [this.data.longitude, this.data.latitude]
      },
      peopleNeeded: this.data.peopleNeeded,
      isAA: this.data.isAA
    }
    
    api.createNeed(needData).then(res => {
      util.hideLoading()
      this.setData({ isSubmitting: false })
      
      if (res.result && res.result.success) {
        util.showSuccess('发布成功')
        // 清空表单
        this.resetForm()
        // 跳转到首页
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          })
        }, 1500)
      } else {
        util.showError(res.result?.message || '发布失败')
      }
    }).catch(err => {
      util.hideLoading()
      this.setData({ isSubmitting: false })
      console.error('发布失败:', err)
      util.showError('发布失败，请重试')
    })
  },

  // 重置表单
  resetForm: function() {
    this.setData({
      title: '',
      description: '',
      category: '',
      activityDate: '',
      activityTime: '',
      locationName: '',
      latitude: null,
      longitude: null,
      peopleNeeded: 1,
      isAA: false
    })
  }
})
