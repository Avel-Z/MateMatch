// Web端账号密码登录云函数
const db = uniCloud.database();
const usersCollection = db.collection('users'); // 数据库表名：users

exports.main = async (event, context) => {
  try {
    const { username, password } = event;
    if (!username || !password) {
      return { code: 4001, msg: '账号密码不能为空' };
    }

    // 模拟Web登录（实际项目需加密密码）
    const userId = `web_user_${username}`;
    
    // 检查用户是否存在，不存在则创建
    const userRes = await usersCollection.where({ _id: userId }).get();
    if (userRes.data.length === 0) {
      await usersCollection.add({
        _id: userId,
        nickname: username,
        wechat_id: '',
        created_at: Date.now()
      });
    }

    return { code: 0, data: { user_id: userId }, msg: '登录成功' };
  } catch (err) {
    console.error('Web登录云函数错误：', err);
    return { code: 5001, msg: '登录失败' };
  }
};