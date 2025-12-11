const db = uniCloud.database();
const usersCollection = db.collection('users');
const crypto = require('crypto');

// 加密函数
const encryptPwd = (password) => {
  const salt = 'mate_match_2025';
  return crypto.createHash('md5').update(password + salt).digest('hex');
};

exports.main = async (event, context) => {
  try {
    const { action, username, password, nickname, user_id, wechat_id, updated_at } = event;

    // 1. 注册
    if (action === 'register') {
      if (!username || !password || !nickname) {
        return { code: 4001, msg: '账号/密码/昵称不能为空' };
      }
      const existUser = await usersCollection.where({ username: username.trim() }).get();
      if (existUser.data.length > 0) {
        return { code: 4002, msg: '账号已存在，请更换账号' };
      }
      const userId = `web_user_${Date.now()}_${username.slice(0, 6)}`;
      await usersCollection.add({
        _id: userId,
        username: username.trim(),
        password: encryptPwd(password),
        nickname: nickname.trim(),
        wechat_id: '', // 初始为空
        openid: `web_${username.trim()}`,
        created_at: Date.now(),
        updated_at: Date.now()
      });
      return { code: 0, msg: '注册成功', data: { user_id: userId } };
    }

    // 2. 登录
    if (action === 'login') {
      if (!username || !password) {
        return { code: 4001, msg: '账号密码不能为空' };
      }
      const userRes = await usersCollection.where({
        username: username.trim(),
        password: encryptPwd(password)
      }).get();
      if (userRes.data.length === 0) {
        return { code: 4003, msg: '账号或密码错误' };
      }
      const user = userRes.data[0];
      return { 
        code: 0, 
        msg: '登录成功', 
        data: { 
          user_id: user._id,
          user_info: {
            nickname: user.nickname,
            username: user.username,
            wechat_id: user.wechat_id || ''
          }
        } 
      };
    }

    // 3. 获取用户信息（兼容前端传入的 action: 'getUserInfo'）
    if (action === 'getUserInfo') {
      if (!user_id) {
        return { code: 4001, msg: '用户ID不能为空' };
      }
      const userRes = await usersCollection.where({ _id: user_id }).get();
      if (userRes.data.length === 0) {
        return { code: 4004, msg: '用户不存在' };
      }
      const user = userRes.data[0];
      return {
        code: 0,
        data: {
          _id: user._id,
          username: user.username,
          nickname: user.nickname,
          wechat_id: user.wechat_id || ''
        }
      };
    }

    // 4. 更新用户信息（兼容前端传入的 action: 'update' + 原 'updateUserInfo'）
    if (action === 'update' || action === 'updateUserInfo') {
      if (!user_id || !nickname) {
        return { code: 4001, msg: '用户ID/昵称不能为空' };
      }
      await usersCollection.doc(user_id).update({
        nickname: nickname,
        wechat_id: wechat_id || '',
        updated_at: updated_at || Date.now()
      });
      return { code: 0, msg: '更新成功' };
    }

    // 无效操作类型
    return { code: 4000, msg: '无效的操作类型' };
  } catch (err) {
    console.error('WEB登录/注册云函数错误：', err);
    // 超时友好提示
    return { code: 5001, msg: '服务器连接超时，请稍后重试' };
  }
};