// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  const { toUserId, needId, content } = event
  
  if (!toUserId || !content) {
    return {
      success: false,
      message: '缺少必要参数'
    }
  }
  
  try {
    // 获取发送者信息
    const userResult = await db.collection('users').where({
      _openid: openid
    }).get()
    const userInfo = userResult.data[0] || {}
    
    // 确定chatId（确保唯一性）
    const chatId = needId ? 
      `${needId}_${[openid, toUserId].sort().join('_')}` : 
      [openid, toUserId].sort().join('_')
    
    // 创建消息
    const messageResult = await db.collection('messages').add({
      data: {
        chatId: chatId,
        needId: needId || '',
        senderId: openid,
        senderName: userInfo.nickName || '匿名用户',
        senderAvatar: userInfo.avatarUrl || '',
        receiverId: toUserId,
        content: content,
        isRead: false,
        createTime: db.serverDate()
      }
    })
    
    // 更新会话最后消息
    await db.collection('conversations').where({
      chatId: chatId
    }).update({
      data: {
        lastMessage: content.length > 30 ? content.substring(0, 30) + '...' : content,
        lastMessageTime: db.serverDate()
      }
    })
    
    return {
      success: true,
      messageId: messageResult._id,
      chatId: chatId
    }
  } catch (err) {
    console.error('发送消息失败:', err)
    return {
      success: false,
      message: '发送失败：' + err.message
    }
  }
}
