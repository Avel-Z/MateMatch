/**
 * API 模块 - 封装数据操作接口
 * 使用本地存储模拟后端API
 */

import { formatTime, generateId } from '@/utils/util'
import type { Need, CreateNeedData } from '@/types/need'
import type { UserInfo, RegisterUserData } from '@/types/user'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

/**
 * 获取所有需求列表
 */
export const getNeeds = (): Need[] => {
  try {
    let needs = uni.getStorageSync('needs') || []
    // 按创建时间倒序排列
    needs.sort((a: Need, b: Need) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
    return needs
  } catch (e) {
    console.error('获取需求列表失败', e)
    return []
  }
}

/**
 * 根据ID获取需求详情
 */
export const getNeedById = (id: string): Need | null => {
  try {
    const needs = uni.getStorageSync('needs') || []
    return needs.find((need: Need) => need.id === id) || null
  } catch (e) {
    console.error('获取需求详情失败', e)
    return null
  }
}

/**
 * 创建新需求
 */
export const createNeed = (needData: CreateNeedData): ApiResponse<Need> => {
  try {
    const needs = uni.getStorageSync('needs') || []
    const userInfo = uni.getStorageSync('userInfo')
    
    if (!userInfo) {
      throw new Error('请先完善个人信息')
    }
    
    const newNeed: Need = {
      id: generateId(),
      ...needData,
      publisherId: userInfo.id,
      publisherName: userInfo.nickname,
      publisherAvatar: userInfo.avatar,
      wechatId: userInfo.wechatId,
      createTime: formatTime(new Date()),
      status: 'active'
    }
    
    needs.unshift(newNeed)
    uni.setStorageSync('needs', needs)
    
    return { success: true, data: newNeed }
  } catch (e: any) {
    console.error('创建需求失败', e)
    return { success: false, message: e.message || '创建失败' }
  }
}

/**
 * 更新需求
 */
export const updateNeed = (id: string, needData: Partial<CreateNeedData>): ApiResponse<Need> => {
  try {
    const needs = uni.getStorageSync('needs') || []
    const index = needs.findIndex((need: Need) => need.id === id)
    
    if (index === -1) {
      throw new Error('需求不存在')
    }
    
    needs[index] = {
      ...needs[index],
      ...needData
    }
    
    uni.setStorageSync('needs', needs)
    return { success: true, data: needs[index] }
  } catch (e: any) {
    console.error('更新需求失败', e)
    return { success: false, message: e.message || '更新失败' }
  }
}

/**
 * 删除需求
 */
export const deleteNeed = (id: string): ApiResponse => {
  try {
    let needs = uni.getStorageSync('needs') || []
    needs = needs.filter((need: Need) => need.id !== id)
    uni.setStorageSync('needs', needs)
    return { success: true }
  } catch (e) {
    console.error('删除需求失败', e)
    return { success: false, message: '删除失败' }
  }
}

/**
 * 获取用户发布的需求
 */
export const getUserNeeds = (userId: string): Need[] => {
  try {
    const needs = uni.getStorageSync('needs') || []
    return needs.filter((need: Need) => need.publisherId === userId)
  } catch (e) {
    console.error('获取用户需求失败', e)
    return []
  }
}

/**
 * 保存用户信息
 */
export const saveUserInfo = (userInfo: RegisterUserData): ApiResponse<UserInfo> => {
  try {
    const user: UserInfo = {
      id: generateId(),
      ...userInfo,
      createTime: formatTime(new Date())
    }
    uni.setStorageSync('userInfo', user)
    return { success: true, data: user }
  } catch (e) {
    console.error('保存用户信息失败', e)
    return { success: false, message: '保存失败' }
  }
}

/**
 * 获取用户信息
 */
export const getUserInfo = (): UserInfo | null => {
  try {
    return uni.getStorageSync('userInfo') || null
  } catch (e) {
    console.error('获取用户信息失败', e)
    return null
  }
}

/**
 * 更新用户信息
 */
export const updateUserInfo = (userInfo: Partial<RegisterUserData>): ApiResponse<UserInfo> => {
  try {
    const currentUser = uni.getStorageSync('userInfo')
    const updatedUser: UserInfo = {
      ...currentUser,
      ...userInfo
    }
    uni.setStorageSync('userInfo', updatedUser)
    
    // 同步更新该用户发布的所有需求中的用户信息
    const needs = uni.getStorageSync('needs') || []
    const updatedNeeds = needs.map((need: Need) => {
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
    uni.setStorageSync('needs', updatedNeeds)
    
    return { success: true, data: updatedUser }
  } catch (e) {
    console.error('更新用户信息失败', e)
    return { success: false, message: '更新失败' }
  }
}
