// 用户信息管理云函数
const db = uniCloud.database();
const usersCollection = db.collection('users'); // 数据库表名：users

exports.main = async (event, context) => {
  try {
    const { action, user_id, nickname, wechat_id, updated_at } = event;

    // 基础参数校验
    if (!user_id || !action) {
      return { code: 4001, msg: '缺少user_id或action' };
    }

    // 处理不同动作
    switch (action) {
      case 'getUserInfo':
        // 查询用户信息
        const userRes = await usersCollection.where({ _id: user_id }).get();
        if (userRes.data.length === 0) {
          return { code: 2, msg: '用户不存在' };
        }
        return { code: 0, data: userRes.data[0] };

      case 'update':
        // 更新用户信息
        await usersCollection.where({ _id: user_id }).update({
          nickname,
          wechat_id,
          updated_at
        });
        return { code: 0, msg: '更新成功' };

      default:
        return { code: 4001, msg: '不支持的action' };
    }
  } catch (err) {
    console.error('用户信息云函数错误：', err);
    return { code: 5001, msg: '服务器错误' };
  }
};