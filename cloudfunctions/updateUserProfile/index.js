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
  
  const { nickName, avatarUrl, gender } = event
  
  try {
    // 构建更新数据
    const updateData = {
      updateTime: db.serverDate()
    }
    
    if (nickName !== undefined) {
      updateData.nickName = nickName
    }
    if (avatarUrl !== undefined) {
      updateData.avatarUrl = avatarUrl
    }
    if (gender !== undefined) {
      updateData.gender = gender
    }
    
    // 检查用户是否存在
    const userResult = await db.collection('users').where({
      _openid: openid
    }).get()
    
    if (userResult.data.length === 0) {
      // 创建新用户
      await db.collection('users').add({
        data: {
          _openid: openid,
          nickName: nickName || '',
          avatarUrl: avatarUrl || '',
          gender: gender || 0,
          trustTags: [],
          needsCount: 0,
          completedCount: 0,
          responsesCount: 0,
          createTime: db.serverDate(),
          updateTime: db.serverDate()
        }
      })
    } else {
      // 更新用户资料
      await db.collection('users').where({
        _openid: openid
      }).update({
        data: updateData
      })
    }
    
    return {
      success: true,
      message: '更新成功'
    }
  } catch (err) {
    console.error('更新用户资料失败:', err)
    return {
      success: false,
      message: '更新失败：' + err.message
    }
  }
}
