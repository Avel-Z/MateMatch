// utils/util.js

/**
 * 格式化时间
 * @param {Date} date 
 * @returns {string}
 */
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

/**
 * 格式化相对时间（如：刚刚、5分钟前）
 * @param {Date|number} timestamp 
 * @returns {string}
 */
const formatRelativeTime = (timestamp) => {
  const now = Date.now()
  const diff = now - (timestamp instanceof Date ? timestamp.getTime() : timestamp)
  
  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  } else if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}天前`
  } else {
    const date = new Date(timestamp)
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
}

/**
 * 格式化活动时间显示
 * @param {string|Date} dateTime 
 * @returns {string}
 */
const formatActivityTime = (dateTime) => {
  const date = new Date(dateTime)
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const isToday = date.toDateString() === now.toDateString()
  const isTomorrow = date.toDateString() === tomorrow.toDateString()
  
  const timeStr = `${formatNumber(date.getHours())}:${formatNumber(date.getMinutes())}`
  
  if (isToday) {
    return `今天 ${timeStr}`
  } else if (isTomorrow) {
    return `明天 ${timeStr}`
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日 ${timeStr}`
  }
}

/**
 * 计算两点之间的距离（单位：米）
 * @param {number} lat1 
 * @param {number} lng1 
 * @param {number} lat2 
 * @param {number} lng2 
 * @returns {number}
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000 // 地球半径（米）
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * 格式化距离显示
 * @param {number} distance 距离（米）
 * @returns {string}
 */
const formatDistance = (distance) => {
  if (distance < 1000) {
    return `${Math.round(distance)}m`
  } else {
    return `${(distance / 1000).toFixed(1)}km`
  }
}

/**
 * 生成唯一ID
 * @returns {string}
 */
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

/**
 * 显示加载提示
 * @param {string} title 
 */
const showLoading = (title = '加载中...') => {
  wx.showLoading({
    title: title,
    mask: true
  })
}

/**
 * 隐藏加载提示
 */
const hideLoading = () => {
  wx.hideLoading()
}

/**
 * 显示成功提示
 * @param {string} title 
 */
const showSuccess = (title) => {
  wx.showToast({
    title: title,
    icon: 'success',
    duration: 2000
  })
}

/**
 * 显示错误提示
 * @param {string} title 
 */
const showError = (title) => {
  wx.showToast({
    title: title,
    icon: 'none',
    duration: 2000
  })
}

module.exports = {
  formatTime,
  formatRelativeTime,
  formatActivityTime,
  calculateDistance,
  formatDistance,
  generateId,
  showLoading,
  hideLoading,
  showSuccess,
  showError
}
