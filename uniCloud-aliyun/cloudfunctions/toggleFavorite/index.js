'use strict';
/**
 * 收藏/取消收藏帖子云函数
 */

const db = uniCloud. database();
const dbCmd = db.command;

exports.main = async (event, context) => {
  try {
    const { postId, userId, isFavorite } = event;

    // 参数校验
    if (!postId || !userId) {
      return {
        code: 4001,
        msg: '参数错误：postId 和 userId 不能为空',
        data: null
      };
    }

    if (typeof isFavorite !== 'boolean') {
      return {
        code: 4001,
        msg: '参数错误：isFavorite 必须为布尔值',
        data: null
      };
    }

    const postsCollection = db.collection('posts');
    const favoritesCollection = db.collection('favorites');

    // 检查帖子是否存在
    const postResult = await postsCollection.doc(postId).get();
    if (!postResult.data || postResult.data.length === 0) {
      return {
        code: 4004,
        msg: '帖子不存在',
        data: null
      };
    }

    // 查询当前收藏状态
    const existingFavorite = await favoritesCollection
      .where({ user_id: userId, post_id: postId })
      .limit(1)
      .get();

    const alreadyFavorited = existingFavorite.data && existingFavorite.data.length > 0;
    let newFavCount = postResult.data[0].fav_count || 0;
    let resultMsg = '';

    if (isFavorite) {
      // 收藏操作
      if (alreadyFavorited) {
        return {
          code: 0,
          msg: '已经收藏过了',
          data: { isFavorite: true, fav_count: newFavCount }
        };
      }

      // 添加收藏记录
      await favoritesCollection.add({
        user_id: userId,
        post_id: postId,
        created_at: new Date()
      });

      // 更新帖子收藏数 +1
      await postsCollection.doc(postId).update({
        fav_count: dbCmd.inc(1)
      });

      newFavCount += 1;
      resultMsg = '收藏成功';
    } else {
      // 取消收藏操作
      if (!alreadyFavorited) {
        return {
          code: 0,
          msg: '尚未收藏',
          data: { isFavorite:  false, fav_count: newFavCount }
        };
      }

      // 删除收藏记录
      await favoritesCollection
        .where({ user_id: userId, post_id: postId })
        .remove();

      // 更新帖子收藏数 -1
      await postsCollection.doc(postId).update({
        fav_count: dbCmd.inc(-1)
      });

      newFavCount = Math.max(0, newFavCount - 1);
      resultMsg = '取消收藏成功';
    }

    return {
      code: 0,
      msg: resultMsg,
      data: { isFavorite, fav_count: newFavCount }
    };
  } catch (error) {
    console.error('toggleFavorite error:', error);
    return {
      code: 5001,
      msg: '服务器错误：' + error.message,
      data: null
    };
  }
};