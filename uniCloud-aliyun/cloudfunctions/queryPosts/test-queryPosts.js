/**
 * 本地测试云函数 - queryPosts
 * 使用方法：node test-queryPosts.js
 */

const handler = require('./index').handler;

// 测试用例
const testCases = [
  {
    name: '基本查询 - 第一页',
    event: {
      body: JSON.stringify({
        page: 1,
        pageSize: 10
      })
    }
  },
  {
    name: '分类筛选 - 看展',
    event: {
      body: JSON.stringify({
        page: 1,
        pageSize: 10,
        category: 'exhibition'
      })
    }
  },
  {
    name: '带位置信息查询',
    event: {
      body: JSON.stringify({
        page: 1,
        pageSize: 10,
        userLocation: {
          latitude: 31.230416,
          longitude: 121.473701
        }
      })
    }
  },
  {
    name: '参数错误测试',
    event: {
      body: JSON.stringify({
        page: -1,
        pageSize: 200
      })
    }
  }
];

// 执行测试
async function runTests() {
  console.log('开始测试 queryPosts 云函数...\n');

  for (const testCase of testCases) {
    console.log(`测试用例: ${testCase.name}`);
    console.log('请求参数:', JSON.parse(testCase.event.body));

    try {
      const result = await handler(testCase.event, {});
      const response = JSON.parse(result.body);

      console.log('响应状态码:', result.statusCode);
      console.log('响应数据:', JSON.stringify(response, null, 2));

      if (response.code === 0) {
        console.log('✅ 测试通过\n');
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
