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
  
  const {
    latitude,
    longitude,
    radius = 5000,
    category,
    needId,
    userId,
    type
  } = event
  
  try {
    // 获取单个需求详情
    if (needId) {
      const result = await db.collection('needs').doc(needId).get()
      return {
        success: true,
        data: result.data
      }
    }
    
    // 获取用户自己的需求
    if (type === 'my' && userId) {
      const result = await db.collection('needs')
        .where({
          publisherId: userId
        })
        .orderBy('createTime', 'desc')
        .limit(50)
        .get()
      
      return {
        success: true,
        data: result.data
      }
    }
    
    // 获取用户响应过的需求
    if (type === 'responses' && userId) {
      const result = await db.collection('needs')
        .where({
          'responses.userId': userId
        })
        .orderBy('createTime', 'desc')
        .limit(50)
        .get()
      
      return {
        success: true,
        data: result.data
      }
    }
    
    // 构建查询条件
    let query = {
      status: 'active',
      activityTime: _.gte(new Date())
    }
    
    // 分类筛选
    if (category) {
      query.category = category
    }
    
    // 地理位置查询（需要在数据库中创建地理位置索引）
    if (latitude && longitude) {
      query.location = _.geoNear({
        geometry: db.Geo.Point(longitude, latitude),
        maxDistance: radius,
        minDistance: 0
      })
    }
    
    const result = await db.collection('needs')
      .where(query)
      .orderBy('createTime', 'desc')
      .limit(100)
      .get()
    
    // 格式化数据
    const needs = result.data.map(need => {
      return {
        ...need,
        activityTimeFormatted: formatActivityTime(need.activityTime)
      }
    })
    
    return {
      success: true,
      data: needs
    }
  } catch (err) {
    console.error('获取需求失败:', err)
    return {
      success: false,
      data: [],
      message: err.message
    }
  }
}

// 格式化活动时间
function formatActivityTime(dateTime) {
  const date = new Date(dateTime)
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const isToday = date.toDateString() === now.toDateString()
  const isTomorrow = date.toDateString() === tomorrow.toDateString()
  
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const timeStr = `${hours}:${minutes}`
  
  if (isToday) {
    return `今天 ${timeStr}`
  } else if (isTomorrow) {
    return `明天 ${timeStr}`
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日 ${timeStr}`
  }
}
