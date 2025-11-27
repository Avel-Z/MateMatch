// pages/index/index.js
const app = getApp()
const util = require('../../utils/util.js')
const api = require('../../utils/api.js')

Page({
  data: {
    latitude: 39.908823,
    longitude: 116.397470,
    scale: 14,
    markers: [],
    needs: [],
    selectedNeed: null,
    showNeedCard: false,
    categories: ['全部', '美食', '运动', '看展', '电影', '旅行', '学习', '其他'],
    selectedCategory: '全部',
    isLoading: true,
    locationError: false
  },

  onLoad: function() {
    this.getLocation()
  },

  onShow: function() {
    if (this.data.latitude && this.data.longitude) {
      this.loadNearbyNeeds()
    }
  },

  // 获取用户位置
  getLocation: function() {
    const that = this
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          locationError: false
        })
        that.loadNearbyNeeds()
      },
      fail: function(err) {
        console.error('获取位置失败:', err)
        that.setData({
          isLoading: false,
          locationError: true
        })
        wx.showModal({
          title: '位置权限',
          content: '需要您的位置权限来展示附近的搭子需求',
          confirmText: '去设置',
          success: function(res) {
            if (res.confirm) {
              wx.openSetting()
            }
          }
        })
      }
    })
  },

  // 加载附近的需求
  loadNearbyNeeds: function() {
    const that = this
    that.setData({ isLoading: true })
    
    const category = this.data.selectedCategory === '全部' ? '' : this.data.selectedCategory
    
    api.getNearbyNeeds(
      this.data.latitude,
      this.data.longitude,
      5000,
      category
    ).then(res => {
      if (res.result && res.result.data) {
        const needs = res.result.data
        const markers = that.createMarkers(needs)
        that.setData({
          needs: needs,
          markers: markers,
          isLoading: false
        })
      }
    }).catch(err => {
      console.error('加载需求失败:', err)
      that.setData({ isLoading: false })
      util.showError('加载失败，请重试')
    })
  },

  // 创建地图标记
  createMarkers: function(needs) {
    return needs.map((need, index) => {
      return {
        id: index,
        needId: need._id,
        latitude: need.location.coordinates[1],
        longitude: need.location.coordinates[0],
        width: 50,
        height: 50,
        iconPath: this.getCategoryIcon(need.category),
        callout: {
          content: need.title,
          padding: 10,
          borderRadius: 8,
          bgColor: '#ffffff',
          color: '#333333',
          fontSize: 14,
          display: 'BYCLICK'
        }
      }
    })
  },

  // 获取分类图标
  getCategoryIcon: function(category) {
    const icons = {
      '美食': '/images/marker-food.png',
      '运动': '/images/marker-sport.png',
      '看展': '/images/marker-art.png',
      '电影': '/images/marker-movie.png',
      '旅行': '/images/marker-travel.png',
      '学习': '/images/marker-study.png',
      '其他': '/images/marker-other.png'
    }
    return icons[category] || '/images/marker-default.png'
  },

  // 点击标记
  onMarkerTap: function(e) {
    const markerId = e.markerId
    const need = this.data.needs[markerId]
    if (need) {
      this.setData({
        selectedNeed: need,
        showNeedCard: true
      })
    }
  },

  // 关闭需求卡片
  closeNeedCard: function() {
    this.setData({
      showNeedCard: false,
      selectedNeed: null
    })
  },

  // 查看需求详情
  viewNeedDetail: function() {
    if (this.data.selectedNeed) {
      wx.navigateTo({
        url: `/pages/detail/detail?id=${this.data.selectedNeed._id}`
      })
    }
  },

  // 切换分类
  onCategoryChange: function(e) {
    const category = this.data.categories[e.detail.value]
    this.setData({
      selectedCategory: category
    })
    this.loadNearbyNeeds()
  },

  // 选择分类标签
  selectCategory: function(e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      selectedCategory: category
    })
    this.loadNearbyNeeds()
  },

  // 刷新位置
  refreshLocation: function() {
    this.getLocation()
  },

  // 地图视野变化
  onRegionChange: function(e) {
    // 可以在这里实现拖动地图后加载新区域的数据
  },

  // 跳转到发布页面
  goToPost: function() {
    wx.switchTab({
      url: '/pages/post/post'
    })
  }
})
