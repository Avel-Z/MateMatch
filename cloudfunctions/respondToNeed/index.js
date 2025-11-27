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
  
  const { needId, message } = event
  
  if (!needId) {
    return {
      success: false,
      message: '缺少需求ID'
    }
  }
  
  try {
    // 获取需求信息
    const needResult = await db.collection('needs').doc(needId).get()
    const need = needResult.data
    
    if (!need) {
      return {
        success: false,
        message: '需求不存在'
      }
    }
    
    if (need.publisherId === openid) {
      return {
        success: false,
        message: '不能响应自己的需求'
      }
    }
    
    if (need.status !== 'active') {
      return {
        success: false,
        message: '该需求已结束'
      }
    }
    
    // 检查是否已经响应过
    const existingResponse = (need.responses || []).find(r => r.userId === openid)
    if (existingResponse) {
      return {
        success: false,
        message: '你已经响应过了'
      }
    }
    
    // 获取响应者信息
    const userResult = await db.collection('users').where({
      _openid: openid
    }).get()
    const userInfo = userResult.data[0] || {}
    
    // 添加响应记录
    await db.collection('needs').doc(needId).update({
      data: {
        responses: _.push({
          userId: openid,
          userName: userInfo.nickName || '匿名用户',
          userAvatar: userInfo.avatarUrl || '',
          message: message || '',
          createTime: db.serverDate()
        }),
        responseCount: _.inc(1),
        updateTime: db.serverDate()
      }
    })
    
    // 创建聊天会话
    const chatId = `${needId}_${openid}_${need.publisherId}`
    
    // 检查会话是否存在
    const chatResult = await db.collection('conversations').where({
      chatId: chatId
    }).get()
    
    if (chatResult.data.length === 0) {
      // 创建新会话
      await db.collection('conversations').add({
        data: {
          chatId: chatId,
          needId: needId,
          needTitle: need.title,
          needCategory: need.category,
          participants: [openid, need.publisherId],
          user1: openid,
          user1Name: userInfo.nickName || '匿名用户',
          user1Avatar: userInfo.avatarUrl || '',
          user2: need.publisherId,
          user2Name: need.publisherName,
          user2Avatar: need.publisherAvatar,
          lastMessage: message || '发起了对话',
          lastMessageTime: db.serverDate(),
          createTime: db.serverDate()
        }
      })
    }
    
    // 发送第一条消息
    if (message) {
      await db.collection('messages').add({
        data: {
          chatId: chatId,
          needId: needId,
          senderId: openid,
          senderName: userInfo.nickName || '匿名用户',
          senderAvatar: userInfo.avatarUrl || '',
          receiverId: need.publisherId,
          content: message,
          isRead: false,
          createTime: db.serverDate()
        }
      })
    }
    
    // 更新用户响应数量
    await db.collection('users').where({
      _openid: openid
    }).update({
      data: {
        responsesCount: _.inc(1),
        updateTime: db.serverDate()
      }
    })
    
    return {
      success: true,
      chatId: chatId,
      message: '响应成功'
    }
  } catch (err) {
    console.error('响应需求失败:', err)
    return {
      success: false,
      message: '响应失败：' + err.message
    }
  }
}
