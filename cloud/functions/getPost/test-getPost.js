/**
 * 本地测试云函数 - getPost
 * 使用方法：node test-getPost.js
 */

const handler = require('./index').handler;

// 测试用例
const testCases = [
  {
    name: '基本查询 - 不带用户ID',
    event: {
      body: JSON.stringify({
        postId: '507f1f77bcf86cd799439011' // 替换为实际的帖子ID
      })
    }
  },
  {
    name: '查询帖子 - 带用户ID',
    event: {
      body: JSON.stringify({
        postId: '507f1f77bcf86cd799439011', // 替换为实际的帖子ID
        userId: '507f191e810c19729de860ea'  // 替换为实际的用户ID
      })
    }
  },
  {
    name: '参数错误测试 - 缺少postId',
    event: {
      body: JSON.stringify({
        userId: '507f191e810c19729de860ea'
      })
    }
  },
  {
    name: '帖子不存在测试',
    event: {
      body: JSON.stringify({
        postId: 'nonexistent_post_id'
      })
    }
  }
];

// 执行测试
async function runTests() {
  console.log('开始测试 getPost 云函数...\n');

  for (const testCase of testCases) {
    console.log(`测试用例: ${testCase.name}`);
    console.log('请求参数:', JSON.parse(testCase.event.body));

    try {
      const result = await handler(testCase.event, {});
      const response = JSON.parse(result.body);

      console.log('响应状态码:', result.statusCode);
      console.log('响应代码:', response.code);
      console.log('响应消息:', response.msg);

      if (response.code === 0) {
        console.log('帖子标题:', response.data.post.title);
        console.log('作者昵称:', response.data.author.nickname);
        console.log('是否已收藏:', response.data.is_favorited);
        console.log('✅ 测试通过\n');
      } else if (response.code === 4004) {
        console.log('⚠️ 帖子不存在（预期结果）\n');
      } else if (response.code === 4001) {
        console.log('⚠️ 参数错误（预期结果）\n');
      } else {
        console.log('⚠️ 业务错误:', response.msg, '\n');
      }
    } catch (error) {
      console.log('❌ 测试失败:', error.message, '\n');
    }
  }

  console.log('测试完成');
  process.exit(0);
}

// 运行测试
runTests();
