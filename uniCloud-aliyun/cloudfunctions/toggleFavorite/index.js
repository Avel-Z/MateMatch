// 收藏/取消收藏云函数（和你要求的名称一致）
const db = uniCloud.database();
const _ = db.command; // UniCloud 操作符
const favoritesCollection = db.collection('favorites'); // 收藏表
const needsCollection = db.collection('needs'); // 搭子需求表

exports.main = async (event, context) => {
  try {
    const { action, user_id, post_id, isFavorite, page = 1, pageSize = 10 } = event;

    // 1. 处理“获取收藏列表”
    if (action === 'getFavorites') {
      if (!user_id) {
        return { code: 4001, msg: 'userId不能为空' };
      }

      // 分页查询收藏记录
      const skip = (page - 1) * pageSize;
      const favList = await favoritesCollection
        .where({ user_id })
        .skip(skip)
        .limit(pageSize)
        .orderBy('created_at', 'desc')
        .get();

      // 关联搭子需求信息
      const list = await Promise.all(
        favList.data.map(async (fav) => {
          const needRes = await needsCollection.where({ _id: fav.post_id }).get();
          return { ...fav, post_info: needRes.data[0] || null };
        })
      );

      return { code: 0, msg: '获取成功', data: { list } };
    }

    // 2. 处理“收藏/取消收藏”
    if (!user_id || !post_id || typeof isFavorite !== 'boolean') {
      return { code: 4001, msg: '参数错误：user_id/post_id/isFavorite 必填' };
    }

    // 检查需求是否存在
    const needRes = await needsCollection.where({ _id: post_id }).get();
    if (needRes.data.length === 0) {
      return { code: 4004, msg: '搭子需求不存在' };
    }

    if (isFavorite) {
      // 收藏操作
      // 检查是否已收藏
      const existFav = await favoritesCollection.where({
        user_id,
        post_id
      }).get();

      if (existFav.data.length > 0) {
        return { code: 0, msg: '已收藏' };
      }

      // 新增收藏记录
      await favoritesCollection.add({
        user_id,
        post_id,
        created_at: Date.now()
      });

      // 更新需求收藏数
      await needsCollection.where({ _id: post_id }).update({
        fav_count: _.inc(1) // 自增1
      });

      return { code: 0, msg: '收藏成功' };
    } else {
      // 取消收藏操作
      const deleteRes = await favoritesCollection.where({
        user_id,
        post_id
      }).remove();

      if (deleteRes.deleted === 0) {
        return { code: 0, msg: '未收藏此需求' };
      }

      // 更新需求收藏数
      await needsCollection.where({ _id: post_id }).update({
        fav_count: _.inc(-1) // 自减1（最小为0）
      });

      return { code: 0, msg: '取消收藏成功' };
    }
  } catch (err) {
    console.error('收藏云函数错误：', err);
    return { code: 5001, msg: '服务器错误：' + err.message };
  }
};