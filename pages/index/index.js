// pages/index/index.js
const api = require('../../utils/api.js')
const mock = require('../../utils/mock.js')

Page({
  data: {
    needList: [],
    refreshing: false,
    hasMore: false
  },

  onLoad() {
    // 初始化mock数据
    mock.initMockData()
    this.loadNeeds()
  },

  onShow() {
    // 每次显示页面时刷新列表
    this.loadNeeds()
  },

  /**
   * 加载需求列表
   */
  loadNeeds() {
    const needs = api.getNeeds()
    this.setData({
      needList: needs,
      hasMore: false // 本地存储不需要分页
    })
  },

  /**
   * 下拉刷新
   */
  onRefresh() {
    this.setData({ refreshing: true })
    
    // 模拟刷新延迟
    setTimeout(() => {
      this.loadNeeds()
      this.setData({ refreshing: false })
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      })
    }, 500)
  },

  /**
   * 上拉加载更多
   */
  onLoadMore() {
    // 本地存储不需要分页，这里只是占位
    if (!this.data.hasMore) {
      return
    }
  },

  /**
   * 跳转到详情页
   */
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    })
  }
})
