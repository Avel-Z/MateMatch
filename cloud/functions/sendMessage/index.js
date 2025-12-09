/**
 * 发送消息云函数
 * 存储消息并更新会话的最后消息信息
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
    
    const { conversationId, senderId, senderName, senderAvatar, content } = body;

    // 参数校验
    if (!conversationId || !senderId || !content) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          code: 4001,
          msg: '参数错误：conversationId、senderId 和 content 不能为空',
          data: null,
        }),
      };
    }

    // 连接数据库
    const client = await getMongoClient();
    const db = client.db(DB_NAME);
    const messagesCollection = db.collection('messages');
    const conversationsCollection = db.collection('conversations');

    // 创建消息记录
    const message = {
      conversationId,
      senderId,
      senderName: senderName || '未知用户',
      senderAvatar: senderAvatar || '',
      content,
      createdAt: new Date(),
      read: false,
    };

    // 插入消息
    const result = await messagesCollection.insertOne(message);

    // 更新会话的最后消息信息
    await conversationsCollection.updateOne(
      { _id: conversationId },
      {
        $set: {
          lastMessage: content,
          lastMessageTime: message.createdAt,
        },
      }
    );

    // 返回成功响应
    return {
      statusCode: 200,
      body: JSON.stringify({
        code: 0,
        msg: 'success',
        data: {
          _id: result.insertedId,
          ...message,
        },
      }),
    };
  } catch (error) {
    console.error('发送消息失败:', error);
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
