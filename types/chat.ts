/**
 * 聊天类型定义
 */

/**
 * 消息接口
 */
export interface Message {
  id: string
  conversationId: string
  senderId: string
  receiverId: string
  content: string
  type: 'text' | 'image'  // 消息类型，先支持文字
  timestamp: string
  isRead: boolean
}

/**
 * 会话接口
 */
export interface Conversation {
  id: string
  participantIds: string[]  // 会话双方的用户ID
  needId: string            // 关联的需求ID
  needTitle: string         // 需求标题（用于显示）
  lastMessage: string       // 最后一条消息内容
  lastMessageTime: string   // 最后消息时间
  unreadCount: number       // 未读消息数
  createdAt: string
  // 参与者信息映射 { userId: { name, avatar } }
  participantInfo?: Record<string, { name: string; avatar: string }>
}

/**
 * 发送消息数据
 */
export interface SendMessageData {
  conversationId: string
  receiverId: string
  content: string
  type?: 'text' | 'image'
}

/**
 * 创建会话数据
 */
export interface CreateConversationData {
  targetUserId: string
  needId: string
  needTitle: string
}
