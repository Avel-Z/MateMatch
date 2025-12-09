/**
 * 创建或获取会话云函数
 * 如果会话已存在则返回已有会话，否则创建新会话
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
 * 生成会话ID
 */
function generateConversationId(userId1, userId2) {
  // 对两个用户ID排序，确保无论谁先发起对话，生成的ID都相同
  const [id1, id2] = [userId1, userId2].sort();
  return `${id1}_${id2}`;
}

/**
 * 主函数处理器
 */
exports.handler = async (event, context) => {
  try {
    // 解析请求参数
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || event;
    
    const { userId, targetUserId, postId = '', postTitle = '' } = body;

    // 参数校验
    if (!userId || !targetUserId) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          code: 4001,
          msg: '参数错误：userId 和 targetUserId 不能为空',
          data: null,
        }),
      };
    }

    // 不能与自己对话
    if (userId === targetUserId) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          code: 4002,
          msg: '不能与自己对话',
          data: null,
        }),
      };
    }

    // 连接数据库
    const client = await getMongoClient();
    const db = client.db(DB_NAME);
    const conversationsCollection = db.collection('conversations');
    const usersCollection = db.collection('users');

    // 生成会话ID
    const conversationId = generateConversationId(userId, targetUserId);

    // 查询会话是否已存在
    let conversation = await conversationsCollection.findOne({ _id: conversationId });

    if (conversation) {
      // 会话已存在，直接返回
      const otherUserId = conversation.participants.find(id => id !== userId);
      const otherUser = await usersCollection.findOne(
        { _id: otherUserId },
        { projection: { nickname: 1, avatarUrl: 1 } }
      );

      return {
        statusCode: 200,
        body: JSON.stringify({
          code: 0,
          msg: 'success',
          data: {
            _id: conversation._id,
            otherUser: {
              _id: otherUserId,
              nickname: otherUser?.nickname || '未知用户',
              avatarUrl: otherUser?.avatarUrl || '',
            },
            postId: conversation.postId,
            postTitle: conversation.postTitle,
            createdAt: conversation.createdAt,
          },
        }),
      };
    }

    // 会话不存在，创建新会话
    const newConversation = {
      _id: conversationId,
      participants: [userId, targetUserId],
      postId,
      postTitle,
      lastMessage: '',
      lastMessageTime: new Date(),
      createdAt: new Date(),
    };

    await conversationsCollection.insertOne(newConversation);

    // 查询对方用户信息
    const otherUser = await usersCollection.findOne(
      { _id: targetUserId },
      { projection: { nickname: 1, avatarUrl: 1 } }
    );

    // 返回成功响应
    return {
      statusCode: 200,
      body: JSON.stringify({
        code: 0,
        msg: 'success',
        data: {
          _id: newConversation._id,
          otherUser: {
            _id: targetUserId,
            nickname: otherUser?.nickname || '未知用户',
            avatarUrl: otherUser?.avatarUrl || '',
          },
          postId: newConversation.postId,
          postTitle: newConversation.postTitle,
          createdAt: newConversation.createdAt,
        },
      }),
    };
  } catch (error) {
    console.error('创建会话失败:', error);
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
