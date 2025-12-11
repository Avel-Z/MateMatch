const db = uniCloud.database();
const usersCollection = db.collection('users');

exports.main = async (event, context) => {
	try {
    const { action, code, user_id, nickname, wechat_id, updated_at } = event;

    // 小程序微信登录逻辑（读取环境变量+真实openid）
    if (action === 'wxLogin') {
          if (!code) return { code: 1, msg: 'code不能为空' };
          
          // ========== 恢复读取环境变量（删除硬编码）==========
          const WX_APPID = process.env.WEIXIN_APPID;
          const WX_SECRET = process.env.WEIXIN_SECRET;
          // =================================================
          
          // 校验环境变量
          if (!WX_APPID || !WX_SECRET) {
            console.error('环境变量未配置：', { WX_APPID, WX_SECRET });
            return { code: 1, msg: '未配置微信AppID/Secret，请检查package.json' };
          }
      
      // 2. 调用微信官方接口获取真实openid（正式号）
      const wxRes = await uniCloud.httpclient.request(
        `https://api.weixin.qq.com/sns/jscode2session?appid=${WX_APPID}&secret=${WX_SECRET}&js_code=${code}&grant_type=authorization_code`,
        { method: 'GET', dataType: 'json' }
      );
      
      // 打印微信接口返回（调试用）
      console.log('微信接口返回：', wxRes);
      
      // 检查微信接口返回结果
      if (wxRes.data.errcode) {
        console.error('微信登录错误：', wxRes.data);
        return { code: 1, msg: `微信登录失败：${wxRes.data.errmsg}（错误码：${wxRes.data.errcode}）` };
      }
      const realOpenid = wxRes.data.openid; // 微信用户唯一标识（正式号）
      
      // 3. 根据真实openid查询用户（一个微信号对应一个账号）
      const userRes = await usersCollection.where({ openid: realOpenid }).get();
      
      if (userRes.data.length > 0) {
        // 已有用户：直接返回信息（不新增数据）
        const user = userRes.data[0];
        return {
          code: 0,
          data: {
            user_id: user._id,
            user_info: {
              nickname: user.nickname,
              wechat_id: user.wechat_id,
              openid: realOpenid
            }
          }
        };
      } else {
        // 新用户：仅创建一次（用openid保证唯一）
        const userId = `wx_${realOpenid.slice(-8)}`; // 用openid后8位生成唯一user_id
        const newUser = {
          _id: userId,
          openid: realOpenid, // 存储真实openid
          nickname: '微信用户' + Math.floor(Math.random() * 1000),
          wechat_id: '',
          created_at: Date.now(),
          updated_at: Date.now()
        };
        console.log('新增用户数据：', newUser);
        await usersCollection.add(newUser);
        return {
          code: 0,
          data: {
            user_id: userId,
            user_info: { nickname: newUser.nickname, wechat_id: '', openid: realOpenid }
          }
        };
      }
    }

    // 原有用户信息查询逻辑
    if (action === 'getUserInfo') {
      if (!user_id) return { code: 1, msg: 'user_id不能为空' };
      const userRes = await usersCollection.where({ _id: user_id }).get();
      return userRes.data.length ? { code: 0, data: userRes.data[0] } : { code: 1, msg: '用户不存在' };
    }

    // 原有用户信息更新逻辑
    if (action === 'update') {
      if (!user_id) return { code: 1, msg: 'user_id不能为空' };
      if (!nickname) return { code: 1, msg: '昵称不能为空' };
      
      console.log('更新用户数据：', { user_id, nickname, wechat_id, updated_at });
      await usersCollection.doc(user_id).update({ nickname, wechat_id: wechat_id || '', updated_at });
      return { code: 0, msg: '更新成功' };
    }

    return { code: 1, msg: '不支持的action' };
  } catch (err) {
    console.error('auth云函数执行错误：', err);
    return { code: 1, msg: '服务器错误：' + err.message };
  }
};