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
  
  const { userId } = event
  
  // 获取目标用户ID，如果没有传入则获取当前用户
  const targetUserId = userId || openid
  
  try {
    const result = await db.collection('users').where({
      _openid: targetUserId
    }).get()
    
    if (result.data.length === 0) {
      return {
        success: false,
        message: '用户不存在',
        data: null
      }
    }
    
    const user = result.data[0]
    
    // 隐藏敏感信息
    delete user._openid
    delete user.unionid
    
    return {
      success: true,
      data: user
    }
  } catch (err) {
    console.error('获取用户资料失败:', err)
    return {
      success: false,
      message: '获取失败：' + err.message,
      data: null
    }
  }
}
