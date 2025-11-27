// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  const { chatId, limit = 50 } = event
  
  try {
    // 获取特定会话的消息
    if (chatId) {
      const result = await db.collection('messages')
        .where({
          chatId: chatId
        })
        .orderBy('createTime', 'asc')
        .limit(limit)
        .get()
      
      // 标记消息为已读
      await db.collection('messages')
        .where({
          chatId: chatId,
          receiverId: openid,
          isRead: false
        })
        .update({
          data: {
            isRead: true
          }
        })
      
      return {
        success: true,
        data: result.data
      }
    }
    
    // 获取会话列表
    const conversations = await db.collection('conversations')
      .where({
        participants: openid
      })
      .orderBy('lastMessageTime', 'desc')
      .limit(50)
      .get()
    
    // 处理会话数据，获取未读消息数
    const conversationsData = await Promise.all(
      conversations.data.map(async (conv) => {
        // 获取未读消息数
        const unreadResult = await db.collection('messages')
          .where({
            chatId: conv.chatId,
            receiverId: openid,
            isRead: false
          })
          .count()
        
        // 确定对方用户信息
        const isUser1 = conv.user1 === openid
        
        return {
          ...conv,
          targetUserId: isUser1 ? conv.user2 : conv.user1,
          targetUserName: isUser1 ? conv.user2Name : conv.user1Name,
          targetUserAvatar: isUser1 ? conv.user2Avatar : conv.user1Avatar,
          unreadCount: unreadResult.total
        }
      })
    )
    
    return {
      success: true,
      data: conversationsData
    }
  } catch (err) {
    console.error('获取消息失败:', err)
    return {
      success: false,
      data: [],
      message: err.message
    }
  }
}
