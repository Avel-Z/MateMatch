const db = uniCloud.database();
const usersCollection = db.collection('users');

exports.main = async (event, context) => {
  try {
    const { code } = event;
    // 移除 currentAppid 的获取（不再需要）
    let openid = '';

    // 1. 微信环境下获取openid（唯一标识）
    if (context.PLATFORM === 'mp-weixin' && code) {
      // 你的微信appid和secret（保持不变）
      const weixinAppid = 'wx419e44d1ea30f35d'; 
      const weixinSecret = '510994007591e377037f45ffaf0e0bcf'; 

      const weixinRes = await uniCloud.httpclient.request(
        `https://api.weixin.qq.com/sns/jscode2session?appid=${weixinAppid}&secret=${weixinSecret}&js_code=${code}&grant_type=authorization_code`,
        { method: 'GET' }
      );
      const weixinData = JSON.parse(weixinRes.data.toString());

      if (!weixinData.openid) {
        throw new Error('登录失败：' + (weixinData.errmsg || '未知错误'));
      }
      openid = weixinData.openid;
    } else {
      // Web端测试用（保持不变）
      openid = 'web_test_openid_001';
    }

    // 2. 根据openid查询用户（只按openid查询，去掉appid条件）
    const userRes = await usersCollection.where({ openid }).get(); // 移除 appid: currentAppid 过滤
    let user_id = '';

    if (userRes.data.length > 0) {
      // 已存在用户：直接返回现有user_id
      user_id = userRes.data[0]._id;
    } else {
      // 新用户：创建账号（去掉appid字段）
      user_id = 'user_' + openid.slice(0, 16);
      await usersCollection.add({
        _id: user_id,
        openid, // 保留openid（用于小程序用户标识）
        // 移除 appid: currentAppid 这一行
        nickname: '微信用户' + Math.floor(Math.random() * 1000),
        wechat_id: '',
        created_at: Date.now(),
        updated_at: Date.now()
      });
    }

    return {
      code: 0,
      msg: '登录成功',
      data: { user_id }
    };
  } catch (err) {
    return {
      code: 1,
      msg: err.message || '登录失败',
      data: null
    };
  }
};