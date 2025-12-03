// utils/api.js
const util = require('./util.js')

/**
 * 获取所有需求列表
 */
const getNeeds = () => {
  try {
    let needs = wx.getStorageSync('needs') || []
    // 按创建时间倒序排列
    needs.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
    return needs
  } catch (e) {
    console.error('获取需求列表失败', e)
    return []
  }
}

/**
 * 根据ID获取需求详情
 */
const getNeedById = (id) => {
  try {
    const needs = wx.getStorageSync('needs') || []
    return needs.find(need => need.id === id)
  } catch (e) {
    console.error('获取需求详情失败', e)
    return null
  }
}

/**
 * 创建新需求
 */
const createNeed = (needData) => {
  try {
    const needs = wx.getStorageSync('needs') || []
    const userInfo = wx.getStorageSync('userInfo')
    
    if (!userInfo) {
      throw new Error('请先完善个人信息')
    }
    
    const newNeed = {
      id: util.generateId(),
      ...needData,
      publisherId: userInfo.id,
      publisherName: userInfo.nickname,
      publisherAvatar: userInfo.avatar,
      wechatId: userInfo.wechatId,
      createTime: util.formatTime(new Date()),
      status: 'active'
    }
    
    needs.unshift(newNeed)
    wx.setStorageSync('needs', needs)
    
    return { success: true, data: newNeed }
  } catch (e) {
    console.error('创建需求失败', e)
    return { success: false, message: e.message || '创建失败' }
  }
}

/**
 * 更新需求
 */
const updateNeed = (id, needData) => {
  try {
    const needs = wx.getStorageSync('needs') || []
    const index = needs.findIndex(need => need.id === id)
    
    if (index === -1) {
      throw new Error('需求不存在')
    }
    
    needs[index] = {
      ...needs[index],
      ...needData
    }
    
    wx.setStorageSync('needs', needs)
    return { success: true, data: needs[index] }
  } catch (e) {
    console.error('更新需求失败', e)
    return { success: false, message: e.message || '更新失败' }
  }
}

/**
 * 删除需求
 */
const deleteNeed = (id) => {
  try {
    let needs = wx.getStorageSync('needs') || []
    needs = needs.filter(need => need.id !== id)
    wx.setStorageSync('needs', needs)
    return { success: true }
  } catch (e) {
    console.error('删除需求失败', e)
    return { success: false, message: '删除失败' }
  }
}

/**
 * 获取用户发布的需求
 */
const getUserNeeds = (userId) => {
  try {
    const needs = wx.getStorageSync('needs') || []
    return needs.filter(need => need.publisherId === userId)
  } catch (e) {
    console.error('获取用户需求失败', e)
    return []
  }
}

/**
 * 保存用户信息
 */
const saveUserInfo = (userInfo) => {
  try {
    const user = {
      id: util.generateId(),
      ...userInfo,
      createTime: util.formatTime(new Date())
    }
    wx.setStorageSync('userInfo', user)
    return { success: true, data: user }
  } catch (e) {
    console.error('保存用户信息失败', e)
    return { success: false, message: '保存失败' }
  }
}

/**
 * 获取用户信息
 */
const getUserInfo = () => {
  try {
    return wx.getStorageSync('userInfo')
  } catch (e) {
    console.error('获取用户信息失败', e)
    return null
  }
}

/**
 * 更新用户信息
 */
const updateUserInfo = (userInfo) => {
  try {
    const currentUser = wx.getStorageSync('userInfo')
    const updatedUser = {
      ...currentUser,
      ...userInfo
    }
    wx.setStorageSync('userInfo', updatedUser)
    
    // 同步更新该用户发布的所有需求中的用户信息
    const needs = wx.getStorageSync('needs') || []
    const updatedNeeds = needs.map(need => {
      if (need.publisherId === currentUser.id) {
        return {
          ...need,
          publisherName: updatedUser.nickname,
          publisherAvatar: updatedUser.avatar,
          wechatId: updatedUser.wechatId
        }
      }
      return need
    })
    wx.setStorageSync('needs', updatedNeeds)
    
    return { success: true, data: updatedUser }
  } catch (e) {
    console.error('更新用户信息失败', e)
    return { success: false, message: '更新失败' }
  }
}

module.exports = {
  getNeeds,
  getNeedById,
  createNeed,
  updateNeed,
  deleteNeed,
  getUserNeeds,
  saveUserInfo,
  getUserInfo,
  updateUserInfo
}
