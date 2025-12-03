/**
 * 获取帖子详情云函数
 * 返回帖子详情、作者信息和收藏状态
 */

const { MongoClient, ObjectId } = require('mongodb');

// MongoDB 连接配置（需要配置环境变量）
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'matematch';

let cachedClient = null;

/**
 * 获取 MongoDB 客户端
 */
async function getMongoClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

/**
 * 主函数处理器
 */
exports.handler = async (event, context) => {
  try {
    // 解析请求参数
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || event;
    
    const { postId, userId = null } = body;

    // 参数校验
    if (!postId) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          code: 4001,
          msg: '参数错误：postId 不能为空',
          data: null,
        }),
      };
    }

    // 连接数据库
    const client = await getMongoClient();
    const db = client.db(DB_NAME);
    const postsCollection = db.collection('posts');
    const usersCollection = db.collection('users');
    const favoritesCollection = db.collection('favorites');

    // 查询帖子详情
    let post;
    try {
      // 验证并转换 ObjectId
      if (ObjectId.isValid(postId)) {
        post = await postsCollection.findOne({ _id: new ObjectId(postId) });
      } else {
        // 如果不是有效的 ObjectId，直接作为字符串查询
        post = await postsCollection.findOne({ _id: postId });
      }
    } catch (err) {
      console.error('查询帖子失败:', err);
      post = null;
    }

    if (!post) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          code: 4004,
          msg: '帖子不存在',
          data: null,
        }),
      };
    }

    // 查询作者信息
    const author = await usersCollection.findOne(
      { _id: post.author_id },
      {
        projection: {
          nickname: 1,
          avatarUrl: 1,
          wechat_id: 1,
          show_wechat: 1,
        },
      }
    );

    // 构建作者数据（根据 show_wechat 决定是否返回微信号）
    const authorData = {
      _id: author?._id,
      nickname: author?.nickname,
      avatarUrl: author?.avatarUrl,
    };

    if (author?.show_wechat === true && author?.wechat_id) {
      authorData.wechat_id = author.wechat_id;
    }

    // 查询是否已收藏
    let isFavorited = false;
    if (userId) {
      try {
        const favorite = await favoritesCollection.findOne({
          user_id: userId,
          post_id: postId,
        });
        isFavorited = !!favorite;
      } catch (err) {
        console.warn('查询收藏状态失败:', err);
      }
    }

    // 构建返回数据
    const postData = {
      _id: post._id,
      title: post.title,
      description: post.description,
      event_time: post.event_time,
      location_text: post.location_text,
      location_coords: post.location_coords,
      images: post.images || [],
      fav_count: post.fav_count || 0,
      created_at: post.created_at,
      expires_at: post.expires_at,
      status: post.status,
      category: post.category,
    };

    // 返回成功响应
    return {
      statusCode: 200,
      body: JSON.stringify({
        code: 0,
        msg: 'success',
        data: {
          post: postData,
          author: authorData,
          is_favorited: isFavorited,
        },
      }),
    };
  } catch (error) {
    console.error('获取帖子详情失败:', error);
    return {
      statusCode: 200,
      body: JSON.stringify({
        code: 5001,
        msg: '服务器错误：' + error.message,
        data: null,
      }),
    };
  }
};
