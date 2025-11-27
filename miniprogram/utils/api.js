// utils/api.js
// API调用封装

/**
 * 创建搭子需求
 * @param {Object} needData 需求数据
 * @returns {Promise}
 */
const createNeed = (needData) => {
  return wx.cloud.callFunction({
    name: 'createNeed',
    data: needData
  })
}

/**
 * 获取附近的搭子需求
 * @param {number} latitude 纬度
 * @param {number} longitude 经度
 * @param {number} radius 半径（米）
 * @param {string} category 分类筛选（可选）
 * @returns {Promise}
 */
const getNearbyNeeds = (latitude, longitude, radius = 5000, category = '') => {
  return wx.cloud.callFunction({
    name: 'getNearbyNeeds',
    data: {
      latitude,
      longitude,
      radius,
      category
    }
  })
}

/**
 * 响应搭子需求
 * @param {string} needId 需求ID
 * @param {string} message 响应消息
 * @returns {Promise}
 */
const respondToNeed = (needId, message) => {
  return wx.cloud.callFunction({
    name: 'respondToNeed',
    data: {
      needId,
      message
    }
  })
}

/**
 * 更新需求状态
 * @param {string} needId 需求ID
 * @param {string} status 状态（active/completed/cancelled）
 * @returns {Promise}
 */
const updateNeedStatus = (needId, status) => {
  return wx.cloud.callFunction({
    name: 'updateNeedStatus',
    data: {
      needId,
      status
    }
  })
}

/**
 * 获取用户信息
 * @param {string} userId 用户ID（可选，不传则获取当前用户）
 * @returns {Promise}
 */
const getUserProfile = (userId = '') => {
  return wx.cloud.callFunction({
    name: 'getUserProfile',
    data: {
      userId
    }
  })
}

/**
 * 更新用户信息
 * @param {Object} profileData 用户信息
 * @returns {Promise}
 */
const updateUserProfile = (profileData) => {
  return wx.cloud.callFunction({
    name: 'updateUserProfile',
    data: profileData
  })
}

/**
 * 发送消息
 * @param {string} toUserId 接收者用户ID
 * @param {string} needId 关联的需求ID
 * @param {string} content 消息内容
 * @returns {Promise}
 */
const sendMessage = (toUserId, needId, content) => {
  return wx.cloud.callFunction({
    name: 'sendMessage',
    data: {
      toUserId,
      needId,
      content
    }
  })
}

/**
 * 获取消息列表
 * @param {string} chatId 聊天ID（可选，不传则获取会话列表）
 * @param {number} limit 数量限制
 * @returns {Promise}
 */
const getMessages = (chatId = '', limit = 50) => {
  return wx.cloud.callFunction({
    name: 'getMessages',
    data: {
      chatId,
      limit
    }
  })
}

module.exports = {
  createNeed,
  getNearbyNeeds,
  respondToNeed,
  updateNeedStatus,
  getUserProfile,
  updateUserProfile,
  sendMessage,
  getMessages
}
