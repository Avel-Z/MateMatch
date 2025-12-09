/**
 * 获取会话列表云函数
 * 获取当前用户的所有会话，包含对方信息、最后消息、未读数
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
    
    const { userId } = body;

    // 参数校验
    if (!userId) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          code: 4001,
          msg: '参数错误：userId 不能为空',
          data: null,
        }),
      };
    }

    // 连接数据库
    const client = await getMongoClient();
    const db = client.db(DB_NAME);
    const conversationsCollection = db.collection('conversations');
    const usersCollection = db.collection('users');
    const messagesCollection = db.collection('messages');

    // 查询当前用户参与的所有会话
    const conversations = await conversationsCollection
      .find({ participants: userId })
      .sort({ lastMessageTime: -1 })
      .toArray();

    // 为每个会话获取对方信息和未读消息数
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        // 获取对方的 userId
        const otherUserId = conv.participants.find(id => id !== userId);

        // 查询对方用户信息
        const otherUser = await usersCollection.findOne(
          { _id: otherUserId },
          { projection: { nickname: 1, avatarUrl: 1 } }
        );

        // 查询未读消息数
        const unreadCount = await messagesCollection.countDocuments({
          conversationId: conv._id,
          senderId: otherUserId,
          read: false,
        });

        return {
          _id: conv._id,
          otherUser: {
            _id: otherUserId,
            nickname: otherUser?.nickname || '未知用户',
            avatarUrl: otherUser?.avatarUrl || '',
          },
          postId: conv.postId,
          postTitle: conv.postTitle,
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime,
          unreadCount,
          createdAt: conv.createdAt,
        };
      })
    );

    // 返回成功响应
    return {
      statusCode: 200,
      body: JSON.stringify({
        code: 0,
        msg: 'success',
        data: conversationsWithDetails,
      }),
    };
  } catch (error) {
    console.error('获取会话列表失败:', error);
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
