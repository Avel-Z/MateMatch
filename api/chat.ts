/**
 * 聊天 API 模块 - 封装聊天相关数据操作
 * 使用本地存储模拟后端API
 */

import { formatTime, generateId } from '@/utils/util'
import { getUserInfo } from '@/api/index'
import type { Message, Conversation, SendMessageData, CreateConversationData } from '@/types/chat'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

/**
 * 获取用户的所有会话列表
 */
export const getConversations = (userId: string): Conversation[] => {
  try {
    const conversations = uni.getStorageSync('conversations') || []
    // 筛选出包含该用户的会话
    const userConversations = conversations.filter((conv: Conversation) => 
      conv.participantIds.includes(userId)
    )
    // 计算每个会话的未读消息数
    const messages = uni.getStorageSync('messages') || []
    userConversations.forEach((conv: Conversation) => {
      const unreadMessages = messages.filter((msg: Message) => 
        msg.conversationId === conv.id && 
        msg.receiverId === userId && 
        !msg.isRead
      )
      conv.unreadCount = unreadMessages.length
    })
    // 按最后消息时间倒序排列
    userConversations.sort((a: Conversation, b: Conversation) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    )
    return userConversations
  } catch (e) {
    console.error('获取会话列表失败', e)
    return []
  }
}

/**
 * 获取单个会话详情
 */
export const getConversationById = (conversationId: string): Conversation | null => {
  try {
    const conversations = uni.getStorageSync('conversations') || []
    return conversations.find((conv: Conversation) => conv.id === conversationId) || null
  } catch (e) {
    console.error('获取会话详情失败', e)
    return null
  }
}

/**
 * 获取指定会话的消息记录
 */
export const getMessages = (conversationId: string): Message[] => {
  try {
    const messages = uni.getStorageSync('messages') || []
    return messages
      .filter((msg: Message) => msg.conversationId === conversationId)
      .sort((a: Message, b: Message) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
  } catch (e) {
    console.error('获取消息记录失败', e)
    return []
  }
}

/**
 * 发送消息
 */
export const sendMessage = (data: SendMessageData): ApiResponse<Message> => {
  try {
    const userInfo = getUserInfo()
    if (!userInfo) {
      throw new Error('请先登录')
    }
    
    const messages = uni.getStorageSync('messages') || []
    const newMessage: Message = {
      id: generateId(),
      conversationId: data.conversationId,
      senderId: userInfo.id,
      receiverId: data.receiverId,
      content: data.content,
      type: data.type || 'text',
      timestamp: formatTime(new Date()),
      isRead: false
    }
    
    messages.push(newMessage)
    uni.setStorageSync('messages', messages)
    
    // 更新会话的最后消息
    const conversations = uni.getStorageSync('conversations') || []
    const convIndex = conversations.findIndex((conv: Conversation) => conv.id === data.conversationId)
    if (convIndex !== -1) {
      conversations[convIndex].lastMessage = data.content
      conversations[convIndex].lastMessageTime = newMessage.timestamp
      uni.setStorageSync('conversations', conversations)
    }
    
    return { success: true, data: newMessage }
  } catch (e: any) {
    console.error('发送消息失败', e)
    return { success: false, message: e.message || '发送失败' }
  }
}

/**
 * 标记会话消息已读
 */
export const markAsRead = (conversationId: string, userId: string): ApiResponse => {
  try {
    const messages = uni.getStorageSync('messages') || []
    let updated = false
    
    messages.forEach((msg: Message) => {
      if (msg.conversationId === conversationId && msg.receiverId === userId && !msg.isRead) {
        msg.isRead = true
        updated = true
      }
    })
    
    if (updated) {
      uni.setStorageSync('messages', messages)
    }
    
    return { success: true }
  } catch (e) {
    console.error('标记已读失败', e)
    return { success: false, message: '标记失败' }
  }
}

/**
 * 创建新会话或获取已存在的会话
 */
export const createOrGetConversation = (data: CreateConversationData): ApiResponse<Conversation> => {
  try {
    const userInfo = getUserInfo()
    if (!userInfo) {
      throw new Error('请先登录')
    }
    
    const conversations = uni.getStorageSync('conversations') || []
    
    // 生成会话ID（使用排序后的用户ID组合，确保唯一性）
    const participantIds = [userInfo.id, data.targetUserId].sort()
    const conversationId = `${participantIds[0]}_${participantIds[1]}_${data.needId}`
    
    // 查找是否已存在该会话
    let conversation = conversations.find((conv: Conversation) => conv.id === conversationId)
    
    if (conversation) {
      return { success: true, data: conversation }
    }
    
    // 获取目标用户信息（从需求中获取发布者信息）
    const needs = uni.getStorageSync('needs') || []
    const need = needs.find((n: any) => n.id === data.needId)
    
    // 构建参与者信息映射
    const participantInfo: Record<string, { name: string; avatar: string }> = {
      [userInfo.id]: {
        name: userInfo.nickname,
        avatar: userInfo.avatar
      }
    }
    
    // 如果找到需求，添加目标用户信息
    if (need) {
      participantInfo[data.targetUserId] = {
        name: need.publisherName,
        avatar: need.publisherAvatar
      }
    }
    
    // 创建新会话
    const newConversation: Conversation = {
      id: conversationId,
      participantIds: participantIds,
      needId: data.needId,
      needTitle: data.needTitle,
      lastMessage: '',
      lastMessageTime: formatTime(new Date()),
      unreadCount: 0,
      createdAt: formatTime(new Date()),
      participantInfo: participantInfo
    }
    
    conversations.push(newConversation)
    uni.setStorageSync('conversations', conversations)
    
    return { success: true, data: newConversation }
  } catch (e: any) {
    console.error('创建会话失败', e)
    return { success: false, message: e.message || '创建失败' }
  }
}

/**
 * 获取用户总未读消息数
 */
export const getTotalUnreadCount = (userId: string): number => {
  try {
    const messages = uni.getStorageSync('messages') || []
    return messages.filter((msg: Message) => 
      msg.receiverId === userId && !msg.isRead
    ).length
  } catch (e) {
    console.error('获取未读消息数失败', e)
    return 0
  }
}
