/**
 * 查询帖子列表云函数
 * 支持分页、分类筛选、距离计算
 */

const { MongoClient } = require('mongodb');

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
 * 计算两个经纬度之间的距离（米）
 * 使用 Haversine 公式
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // 地球半径（米）
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  return Math.round(distance);
}

/**
 * 主函数处理器
 */
exports.handler = async (event, context) => {
  try {
    // 解析请求参数
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || event;
    
    const {
      page = 1,
      pageSize = 10,
      category = '',
      userLocation = null,
    } = body;

    // 参数校验
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          code: 4001,
          msg: '参数错误：page 和 pageSize 必须为正整数，pageSize 不超过 100',
          data: null,
        }),
      };
    }

    // 连接数据库
    const client = await getMongoClient();
    const db = client.db(DB_NAME);
    const postsCollection = db.collection('posts');
    const usersCollection = db.collection('users');

    // 构建查询条件
    const query = {
      expires_at: { $gt: new Date() },
      status: { $ne: 'expired' },
    };

    // 分类筛选
    if (category) {
      query.category = category;
    }

    // 计算分页
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    // 查询帖子列表
    const posts = await postsCollection
      .find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // 查询总数
    const total = await postsCollection.countDocuments(query);

    // 收集所有作者ID并批量查询作者信息（优化N+1查询问题）
    const authorIds = [...new Set(posts.map(post => post.author_id))];
    const authors = await usersCollection
      .find(
        { _id: { $in: authorIds } },
        { projection: { nickname: 1, avatarUrl: 1 } }
      )
      .toArray();
    
    // 创建作者信息映射（使用字符串作为key以确保一致性）
    const authorMap = new Map();
    authors.forEach(author => {
      authorMap.set(author._id.toString(), author);
    });

    // 关联作者信息并计算距离
    const enrichedPosts = posts.map((post) => {
      // 从映射中获取作者信息
      const author = authorMap.get(post.author_id.toString());

      // 计算距离
      let distance_m;
      if (
        userLocation &&
        userLocation.latitude &&
        userLocation.longitude &&
        post.location_coords &&
        post.location_coords.latitude &&
        post.location_coords.longitude
      ) {
        distance_m = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          post.location_coords.latitude,
          post.location_coords.longitude
        );
      }

      return {
        _id: post._id,
        title: post.title,
        description: post.description,
        event_time: post.event_time,
        location_text: post.location_text,
        images: post.images || [],
        fav_count: post.fav_count || 0,
        created_at: post.created_at,
        category: post.category,
        author: author
          ? {
              nickname: author.nickname,
              avatarUrl: author.avatarUrl,
            }
          : null,
        distance_m: distance_m,
      };
    });

    // 判断是否还有更多数据
    const hasMore = skip + posts.length < total;

    // 返回成功响应
    return {
      statusCode: 200,
      body: JSON.stringify({
        code: 0,
        msg: 'success',
        data: {
          list: enrichedPosts,
          total: total,
          page: page,
          pageSize: pageSize,
          hasMore: hasMore,
        },
      }),
    };
  } catch (error) {
    console.error('查询帖子列表失败:', error);
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
