/**
 * MongoDB 测试数据初始化脚本
 * 
 * 使用方法：
 * 1. 确保 MongoDB 已启动
 * 2. 安装依赖: npm install mongodb
 * 3. 配置 .env 文件
 * 4. 运行: node setup-database.js
 */

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'matematch';

async function setupDatabase() {
  console.log('开始初始化数据库...\n');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ 成功连接到 MongoDB');

    const db = client.db(DB_NAME);

    // 创建集合
    console.log('\n创建集合...');
    const collections = ['posts', 'users', 'favorites'];
    for (const collectionName of collections) {
      const exists = await db.listCollections({ name: collectionName }).hasNext();
      if (!exists) {
        await db.createCollection(collectionName);
        console.log(`✅ 创建集合: ${collectionName}`);
      } else {
        console.log(`⚠️  集合已存在: ${collectionName}`);
      }
    }

    // 创建测试用户
    console.log('\n创建测试用户...');
    const usersCollection = db.collection('users');
    
    const testUsers = [
      {
        _id: new ObjectId(),
        openid: 'test_openid_001',
        nickname: '小明',
        avatarUrl: 'https://via.placeholder.com/100/FF6B6B/FFFFFF?text=小明',
        wechat_id: 'xiaoming_wechat',
        show_wechat: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        _id: new ObjectId(),
        openid: 'test_openid_002',
        nickname: '小红',
        avatarUrl: 'https://via.placeholder.com/100/4ECDC4/FFFFFF?text=小红',
        wechat_id: 'xiaohong_wechat',
        show_wechat: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        _id: new ObjectId(),
        openid: 'test_openid_003',
        nickname: '小李',
        avatarUrl: 'https://via.placeholder.com/100/95E1D3/FFFFFF?text=小李',
        wechat_id: 'xiaoli_wechat',
        show_wechat: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    const insertedUsers = await usersCollection.insertMany(testUsers);
    console.log(`✅ 创建 ${insertedUsers.insertedCount} 个测试用户`);
    const userIds = Object.values(insertedUsers.insertedIds);

    // 创建测试帖子
    console.log('\n创建测试帖子...');
    const postsCollection = db.collection('posts');

    const now = new Date();
    const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7天后

    const testPosts = [
      {
        author_id: userIds[0],
        title: '求看展搭子 - 上海当代艺术博物馆',
        description: '本周末想去上海当代艺术博物馆看新展览，有没有对艺术感兴趣的小伙伴一起？门票50元/人。',
        event_time: '2025-12-08 14:00',
        created_at: now,
        expires_at: futureDate,
        location_text: '上海当代艺术博物馆',
        location_coords: {
          latitude: 31.230416,
          longitude: 121.473701
        },
        images: [],
        fav_count: 5,
        is_anonymous: false,
        show_contact: true,
        status: 'open',
        category: 'exhibition'
      },
      {
        author_id: userIds[1],
        title: '周末火锅约起来',
        description: '海底捞新开了家店，想约几个朋友一起去吃火锅，AA制，欢迎加入！',
        event_time: '2025-12-07 18:30',
        created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        expires_at: futureDate,
        location_text: '海底捞火锅(人民广场店)',
        location_coords: {
          latitude: 31.231763,
          longitude: 121.475295
        },
        images: [],
        fav_count: 12,
        is_anonymous: false,
        show_contact: true,
        status: 'open',
        category: 'dining'
      },
      {
        author_id: userIds[2],
        title: '羽毛球搭子招募',
        description: '每周三晚上8点打羽毛球，水平不限，主要是锻炼身体交朋友，场地费AA。',
        event_time: '2025-12-06 20:00',
        created_at: new Date(now.getTime() - 5 * 60 * 60 * 1000),
        expires_at: futureDate,
        location_text: '世纪公园羽毛球馆',
        location_coords: {
          latitude: 31.220126,
          longitude: 121.551892
        },
        images: [],
        fav_count: 8,
        is_anonymous: false,
        show_contact: true,
        status: 'open',
        category: 'sports'
      },
      {
        author_id: userIds[0],
        title: '周末爬山健身',
        description: '打算这周六去佘山爬山，早上7点出发，带好水和干粮，一起享受大自然！',
        event_time: '2025-12-09 07:00',
        created_at: new Date(now.getTime() - 10 * 60 * 60 * 1000),
        expires_at: futureDate,
        location_text: '佘山国家森林公园',
        location_coords: {
          latitude: 31.096914,
          longitude: 121.179399
        },
        images: [],
        fav_count: 15,
        is_anonymous: false,
        show_contact: true,
        status: 'open',
        category: 'sports'
      },
      {
        author_id: userIds[1],
        title: '咖啡馆看书交流',
        description: '找个安静的咖啡馆看书聊天，喜欢文学和哲学的朋友可以一起来。',
        event_time: '2025-12-10 15:00',
        created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        expires_at: futureDate,
        location_text: 'Manner Coffee (南京西路店)',
        location_coords: {
          latitude: 31.232742,
          longitude: 121.467625
        },
        images: [],
        fav_count: 3,
        is_anonymous: false,
        show_contact: true,
        status: 'open',
        category: 'other'
      }
    ];

    const insertedPosts = await postsCollection.insertMany(testPosts);
    console.log(`✅ 创建 ${insertedPosts.insertedCount} 个测试帖子`);

    // 创建索引
    console.log('\n创建索引...');
    await postsCollection.createIndex({ created_at: -1 });
    await postsCollection.createIndex({ expires_at: 1 });
    await postsCollection.createIndex({ category: 1 });
    await postsCollection.createIndex({ author_id: 1 });
    console.log('✅ 创建 posts 集合索引');

    const favoritesCollection = db.collection('favorites');
    await favoritesCollection.createIndex({ user_id: 1, post_id: 1 }, { unique: true });
    console.log('✅ 创建 favorites 集合索引');

    console.log('\n✨ 数据库初始化完成！');
    console.log('\n测试用户信息：');
    testUsers.forEach(user => {
      console.log(`  - ${user.nickname} (ID: ${user._id})`);
    });

  } catch (error) {
    console.error('❌ 初始化失败:', error);
  } finally {
    await client.close();
    console.log('\n已断开数据库连接');
  }
}

// 运行初始化
setupDatabase();
