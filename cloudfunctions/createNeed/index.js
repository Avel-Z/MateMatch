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
  
  const {
    title,
    description,
    category,
    activityTime,
    locationName,
    location,
    peopleNeeded,
    isAA
  } = event
  
  // 参数验证
  if (!title || !category || !activityTime || !locationName || !location) {
    return {
      success: false,
      message: '缺少必要参数'
    }
  }
  
  try {
    // 获取用户信息
    const userResult = await db.collection('users').where({
      _openid: openid
    }).get()
    
    const userInfo = userResult.data[0] || {}
    
    // 创建需求
    const result = await db.collection('needs').add({
      data: {
        title: title,
        description: description || '',
        category: category,
        activityTime: new Date(activityTime),
        locationName: locationName,
        location: location,
        peopleNeeded: peopleNeeded || 1,
        isAA: isAA || false,
        status: 'active', // active, completed, cancelled
        publisherId: openid,
        publisherName: userInfo.nickName || '匿名用户',
        publisherAvatar: userInfo.avatarUrl || '',
        publisherTags: userInfo.trustTags || [],
        responseCount: 0,
        responses: [],
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    })
    
    // 更新用户发布数量
    await db.collection('users').where({
      _openid: openid
    }).update({
      data: {
        needsCount: db.command.inc(1),
        updateTime: db.serverDate()
      }
    })
    
    return {
      success: true,
      needId: result._id,
      message: '发布成功'
    }
  } catch (err) {
    console.error('创建需求失败:', err)
    return {
      success: false,
      message: '创建失败：' + err.message
    }
  }
}
