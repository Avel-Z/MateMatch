'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	
	//返回数据给客户端
	return event
};
'use strict';
/**
 * 获取用户发布的帖子云函数
 */

const db = uniCloud.database();

exports.main = async (event, context) => {
  try {
    const {
      userId,
      page = 1,
      pageSize = 10,
      type = 'published'  // published:  我发布的, favorited: 我收藏的
    } = event;

    // 参数校验
    if (!userId) {
      return {
        code: 4001,
        msg: '参数错误：userId 不能为空',
        data: null
      };
    }

    const limitedPageSize = Math.min(pageSize, 100);
    const skip = (page - 1) * limitedPageSize;

    const postsCollection = db.collection('posts');
    const favoritesCollection = db.collection('favorites');

    let posts = [];
    let total = 0;

    if (type === 'published') {
      // 获取用户发布的帖子
      const countResult = await postsCollection
        .where({ author_id: userId })
        .count();
      total = countResult.total;

      const postsResult = await postsCollection
        .where({ author_id: userId })
        .orderBy('created_at', 'desc')
        .skip(skip)
        .limit(limitedPageSize)
        .get();

      posts = postsResult.data;
    } else if (type === 'favorited') {
      // 获取用户收藏的帖子
      const countResult = await favoritesCollection
        .where({ user_id: userId })
        .count();
      total = countResult.total;

      const favResult = await favoritesCollection
        .where({ user_id: userId })
        .orderBy('created_at', 'desc')
        .skip(skip)
        .limit(limitedPageSize)
        .get();

      const postIds = favResult.data.map(f => f.post_id);

      if (postIds.length > 0) {
        const postsResult = await postsCollection
          . where({ _id: db.command.in(postIds) })
          .get();
        posts = postsResult.data;
      }
    }

    // 格式化返回数据
    const list = posts.map(post => ({
      _id: post._id,
      title: post.title,
      description: post.description,
      event_time: post.event_time,
      location_text: post.location_text,
      images: post.images || [],
      fav_count: post.fav_count || 0,
      created_at: post.created_at,
      status: post.status,
      category: post.category
    }));

    return {
      code: 0,
      msg: 'success',
      data: {
        list,
        total,
        page,
        pageSize: limitedPageSize,
        hasMore: skip + posts.length < total
      }
    };
  } catch (error) {
    console.error('getUserPosts error:', error);
    return {
      code:  5001,
      msg:  '服务器错误：' + error.message,
      data: null
    };
  }
};