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
  const unionid = wxContext.UNIONID
  
  try {
    // 检查用户是否存在
    const userResult = await db.collection('users').where({
      _openid: openid
    }).get()
    
    if (userResult.data.length === 0) {
      // 新用户，创建用户记录
      await db.collection('users').add({
        data: {
          _openid: openid,
          unionid: unionid || '',
          nickName: '',
          avatarUrl: '',
          gender: 0,
          trustTags: [],
          needsCount: 0,
          completedCount: 0,
          responsesCount: 0,
          createTime: db.serverDate(),
          updateTime: db.serverDate()
        }
      })
    }
    
    return {
      success: true,
      openid: openid,
      unionid: unionid
    }
  } catch (err) {
    console.error('登录失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
