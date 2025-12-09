/**
 * 获取消息列表云函数
 * 获取指定会话的消息历史，支持分页
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
 * 主函数处理器
 */
exports.handler = async (event, context) => {
  try {
    // 解析请求参数
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || event;
    
    const { 
      conversationId, 
      page = 1, 
      pageSize = 20,
      userId = null 
    } = body;

    // 参数校验
    if (!conversationId) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          code: 4001,
          msg: '参数错误：conversationId 不能为空',
          data: null,
        }),
      };
    }

    // 连接数据库
    const client = await getMongoClient();
    const db = client.db(DB_NAME);
    const messagesCollection = db.collection('messages');

    // 计算分页参数
    const skip = (page - 1) * pageSize;

    // 查询消息列表（按时间倒序）
    const messages = await messagesCollection
      .find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    // 获取总数
    const total = await messagesCollection.countDocuments({ conversationId });

    // 如果提供了 userId，标记消息为已读
    if (userId) {
      await messagesCollection.updateMany(
        {
          conversationId,
          senderId: { $ne: userId },
          read: false,
        },
        {
          $set: { read: true },
        }
      );
    }

    // 返回成功响应（消息需要反转顺序，使最新的在最下面）
    return {
      statusCode: 200,
      body: JSON.stringify({
        code: 0,
        msg: 'success',
        data: {
          messages: messages.reverse(),
          page,
          pageSize,
          total,
          hasMore: skip + messages.length < total,
        },
      }),
    };
  } catch (error) {
    console.error('获取消息列表失败:', error);
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
