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
  
  const { needId, status } = event
  
  if (!needId || !status) {
    return {
      success: false,
      message: '缺少必要参数'
    }
  }
  
  // 验证状态值
  const validStatuses = ['active', 'completed', 'cancelled']
  if (!validStatuses.includes(status)) {
    return {
      success: false,
      message: '无效的状态值'
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
    
    // 只有发布者可以更新状态
    if (need.publisherId !== openid) {
      return {
        success: false,
        message: '无权操作'
      }
    }
    
    // 更新状态
    await db.collection('needs').doc(needId).update({
      data: {
        status: status,
        updateTime: db.serverDate()
      }
    })
    
    // 如果是完成状态，更新用户完成数量和信用标签
    if (status === 'completed') {
      // 更新发布者完成数量
      await db.collection('users').where({
        _openid: openid
      }).update({
        data: {
          completedCount: _.inc(1),
          updateTime: db.serverDate()
        }
      })
      
      // 可以根据完成次数添加信用标签
      const userResult = await db.collection('users').where({
        _openid: openid
      }).get()
      
      const user = userResult.data[0]
      if (user) {
        const completedCount = (user.completedCount || 0) + 1
        let newTags = user.trustTags || []
        
        // 根据完成次数添加标签
        if (completedCount >= 1 && !newTags.includes('新手搭子')) {
          newTags.push('新手搭子')
        }
        if (completedCount >= 5 && !newTags.includes('靠谱')) {
          newTags = newTags.filter(t => t !== '新手搭子')
          newTags.push('靠谱')
        }
        if (completedCount >= 10 && !newTags.includes('守时')) {
          newTags.push('守时')
        }
        if (completedCount >= 20 && !newTags.includes('活跃搭子')) {
          newTags.push('活跃搭子')
        }
        
        await db.collection('users').where({
          _openid: openid
        }).update({
          data: {
            trustTags: newTags
          }
        })
      }
    }
    
    return {
      success: true,
      message: '更新成功'
    }
  } catch (err) {
    console.error('更新状态失败:', err)
    return {
      success: false,
      message: '更新失败：' + err.message
    }
  }
}
