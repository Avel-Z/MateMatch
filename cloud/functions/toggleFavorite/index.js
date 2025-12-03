/**
 * 切换收藏状态云函数
 * 用户可以收藏或取消收藏帖子
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
    
    const { postId, userId, isFavorite } = body;

    // 参数校验
    if (!postId || !userId) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          code: 4001,
          msg: '参数错误：postId 和 userId 不能为空',
          data: null,
        }),
      };
    }

    if (typeof isFavorite !== 'boolean') {
      return {
        statusCode: 200,
        body: JSON.stringify({
          code: 4001,
          msg: '参数错误：isFavorite 必须是布尔值',
          data: null,
        }),
      };
    }

    // 连接数据库
    const client = await getMongoClient();
    const db = client.db(DB_NAME);
    const postsCollection = db.collection('posts');
    const favoritesCollection = db.collection('favorites');

    // 检查帖子是否存在
    let post;
    try {
      post = await postsCollection.findOne(
        ObjectId.isValid(postId) ? { _id: new ObjectId(postId) } : { _id: postId }
      );
    } catch (err) {
      post = await postsCollection.findOne({ _id: postId });
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

    if (isFavorite) {
      // 收藏操作
      try {
        // 插入收藏记录
        await favoritesCollection.insertOne({
          user_id: userId,
          post_id: postId,
          created_at: new Date(),
        });

        // 更新帖子收藏数
        await postsCollection.updateOne(
          ObjectId.isValid(postId) ? { _id: new ObjectId(postId) } : { _id: postId },
          { $inc: { fav_count: 1 } }
        );

        return {
          statusCode: 200,
          body: JSON.stringify({
            code: 0,
            msg: '收藏成功',
            data: {
              isFavorite: true,
              fav_count: (post.fav_count || 0) + 1,
            },
          }),
        };
      } catch (error) {
        // 如果是重复收藏（MongoDB duplicate key error code: 11000），返回已收藏
        if (error.code === 11000) {
          return {
            statusCode: 200,
            body: JSON.stringify({
              code: 0,
              msg: '已经收藏过了',
              data: {
                isFavorite: true,
                fav_count: post.fav_count || 0,
              },
            }),
          };
        }
        throw error;
      }
    } else {
      // 取消收藏操作
      const deleteResult = await favoritesCollection.deleteOne({
        user_id: userId,
        post_id: postId,
      });

      if (deleteResult.deletedCount > 0) {
        // 更新帖子收藏数
        await postsCollection.updateOne(
          ObjectId.isValid(postId) ? { _id: new ObjectId(postId) } : { _id: postId },
          { $inc: { fav_count: -1 } }
        );

        return {
          statusCode: 200,
          body: JSON.stringify({
            code: 0,
            msg: '取消收藏成功',
            data: {
              isFavorite: false,
              fav_count: Math.max((post.fav_count || 0) - 1, 0),
            },
          }),
        };
      } else {
        return {
          statusCode: 200,
          body: JSON.stringify({
            code: 0,
            msg: '未收藏过此帖子',
            data: {
              isFavorite: false,
              fav_count: post.fav_count || 0,
            },
          }),
        };
      }
    }
  } catch (error) {
    console.error('切换收藏状态失败:', error);
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
