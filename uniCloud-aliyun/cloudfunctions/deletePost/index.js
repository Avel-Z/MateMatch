'use strict';
/**
 * 删除帖子云函数
 */

const db = uniCloud.database();

exports.main = async (event, context) => {
  try {
    const { postId, userId } = event;

    // 参数校验
    if (!postId) {
      return {
        code: 4001,
        msg: '参数错误：postId 不能为空',
        data: null
      };
    }

    if (!userId) {
      return {
        code: 4001,
        msg: '参数错误：用户未登录',
        data: null
      };
    }

    const postsCollection = db.collection('posts');
    const favoritesCollection = db.collection('favorites');

    // 查询帖子
    const postResult = await postsCollection. doc(postId).get();

    if (!postResult.data || postResult.data.length === 0) {
      return {
        code: 4004,
        msg: '帖子不存在',
        data: null
      };
    }

    const post = postResult.data[0];

    // 验证是否为作者本人
    if (post.author_id !== userId) {
      return {
        code: 4003,
        msg: '无权限：只能删除自己的帖子',
        data:  null
      };
    }

    // 删除帖子
    await postsCollection.doc(postId).remove();

    // 删除相关收藏记录
    await favoritesCollection. where({ post_id: postId }).remove();

    return {
      code: 0,
      msg: '删除成功',
      data: null
    };
  } catch (error) {
    console.error('deletePost error:', error);
    return {
      code: 5001,
      msg: '服务器错误：' + error.message,
      data: null
    };
  }
};