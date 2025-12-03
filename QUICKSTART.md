# 快速开始指南

本指南帮助开发者快速搭建和运行 MateMatch 论坛功能。

## 目录
- [环境要求](#环境要求)
- [快速启动](#快速启动)
- [配置说明](#配置说明)
- [开发调试](#开发调试)
- [常见问题](#常见问题)

## 环境要求

### 前端开发
- Node.js >= 14.0.0
- HBuilderX 或 uni-app CLI
- 微信开发者工具（用于小程序调试）

### 后端开发
- Node.js >= 14.0.0
- 阿里云账号（用于 Function Compute）
- MongoDB 数据库（本地或云端）

## 快速启动

### 1. 克隆项目
```bash
git clone https://github.com/Avel-Z/MateMatch.git
cd MateMatch
```

### 2. 安装云函数依赖
```bash
# 安装 queryPosts 依赖
cd cloud/functions/queryPosts
npm install

# 安装 getPost 依赖
cd ../getPost
npm install
```

### 3. 配置 MongoDB 数据库

#### 本地 MongoDB
```bash
# 启动 MongoDB
mongod --dbpath /path/to/data

# 创建数据库和集合
mongosh
> use matematch
> db.createCollection('posts')
> db.createCollection('users')
> db.createCollection('favorites')
```

#### 创建测试数据
```javascript
// 创建测试用户
db.users.insertOne({
  _id: ObjectId(),
  openid: "test_openid_001",
  nickname: "测试用户",
  avatarUrl: "https://via.placeholder.com/100",
  wechat_id: "test_wechat",
  show_wechat: true,
  created_at: new Date(),
  updated_at: new Date()
});

// 创建测试帖子
db.posts.insertOne({
  _id: ObjectId(),
  author_id: ObjectId("用户ID"),
  title: "求看展搭子",
  description: "本周末想去XX美术馆看展，有没有小伙伴一起？",
  event_time: "2025-12-08 14:00",
  created_at: new Date(),
  expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后过期
  location_text: "上海当代艺术博物馆",
  location_coords: {
    latitude: 31.230416,
    longitude: 121.473701
  },
  images: [],
  fav_count: 0,
  is_anonymous: false,
  show_contact: true,
  status: "open",
  category: "exhibition"
});
```

#### 创建索引（推荐）
```javascript
// 优化查询性能
db.posts.createIndex({ created_at: -1 });
db.posts.createIndex({ expires_at: 1 });
db.posts.createIndex({ category: 1 });
db.posts.createIndex({ author_id: 1 });
db.favorites.createIndex({ user_id: 1, post_id: 1 }, { unique: true });
```

### 4. 配置云函数环境变量

#### 本地测试
创建 `.env` 文件：
```bash
# cloud/functions/queryPosts/.env
MONGODB_URI=mongodb://localhost:27017
DB_NAME=matematch

# cloud/functions/getPost/.env
MONGODB_URI=mongodb://localhost:27017
DB_NAME=matematch
```

#### 阿里云部署
在阿里云 Function Compute 控制台配置环境变量。

### 5. 测试云函数（本地）

#### 安装本地测试工具
```bash
npm install -g @serverless-devs/s
```

#### 创建测试脚本
```javascript
// test-queryPosts.js
const handler = require('./cloud/functions/queryPosts/index').handler;

const event = {
  body: JSON.stringify({
    page: 1,
    pageSize: 10,
    category: '',
    userLocation: {
      latitude: 31.230416,
      longitude: 121.473701
    }
  })
};

handler(event, {}).then(result => {
  console.log('Response:', JSON.parse(result.body));
}).catch(err => {
  console.error('Error:', err);
});
```

运行测试：
```bash
node test-queryPosts.js
```

### 6. 配置前端

创建 `.env` 文件：
```bash
# 开发环境
VUE_APP_CLOUD_BASE_URL=http://localhost:9000

# 生产环境
# VUE_APP_CLOUD_BASE_URL=https://your-function-compute-url.aliyuncs.com
```

### 7. 运行前端

#### 使用 HBuilderX
1. 用 HBuilderX 打开项目
2. 右键 `manifest.json` > 配置小程序 AppID
3. 运行 > 运行到小程序模拟器 > 微信开发者工具

#### 使用 uni-app CLI
```bash
# 安装依赖
npm install

# 运行到 H5
npm run dev:h5

# 运行到微信小程序
npm run dev:mp-weixin
```

## 配置说明

### 前端配置

#### pages.json
```json
{
  "pages": [
    {
      "path": "pages/forum",
      "style": {
        "navigationBarTitleText": "论坛",
        "enablePullDownRefresh": true,
        "onReachBottomDistance": 50
      }
    },
    {
      "path": "pages/post-detail",
      "style": {
        "navigationBarTitleText": "帖子详情"
      }
    }
  ]
}
```

#### manifest.json
```json
{
  "mp-weixin": {
    "appid": "你的小程序AppID",
    "setting": {
      "urlCheck": false
    },
    "permission": {
      "scope.userLocation": {
        "desc": "你的位置信息将用于计算与活动地点的距离"
      }
    }
  }
}
```

### 云函数配置

#### template.yml (Serverless Devs)
```yaml
edition: 1.0.0
name: matematch
access: default

services:
  queryPosts:
    component: fc
    props:
      region: cn-shanghai
      service:
        name: matematch-service
      function:
        name: queryPosts
        runtime: nodejs14
        codeUri: ./cloud/functions/queryPosts
        handler: index.handler
        memorySize: 512
        timeout: 10
        environmentVariables:
          MONGODB_URI: ${env.MONGODB_URI}
          DB_NAME: matematch

  getPost:
    component: fc
    props:
      region: cn-shanghai
      service:
        name: matematch-service
      function:
        name: getPost
        runtime: nodejs14
        codeUri: ./cloud/functions/getPost
        handler: index.handler
        memorySize: 512
        timeout: 10
        environmentVariables:
          MONGODB_URI: ${env.MONGODB_URI}
          DB_NAME: matematch
```

## 开发调试

### 前端调试

#### 1. 控制台调试
```javascript
// 在需要调试的地方添加
console.log('帖子列表:', this.posts);
console.log('用户位置:', this.userLocation);
```

#### 2. 网络请求调试
微信开发者工具 > 调试 > Network 查看请求详情

#### 3. 模拟数据
```javascript
// 临时使用 mock 数据
const mockPosts = [
  {
    _id: '1',
    title: '测试帖子',
    // ...
  }
];
```

### 云函数调试

#### 1. 本地测试
```bash
# 创建测试脚本
node test-function.js
```

#### 2. 日志调试
```javascript
console.log('请求参数:', body);
console.log('查询结果:', posts);
console.error('错误信息:', error);
```

#### 3. 远程调试
阿里云控制台 > Function Compute > 函数详情 > 日志查询

### 数据库调试

#### MongoDB Compass
使用 MongoDB Compass 连接数据库，可视化查看和编辑数据。

#### mongosh 命令
```javascript
// 查看所有帖子
db.posts.find().pretty()

// 查看未过期帖子
db.posts.find({
  expires_at: { $gt: new Date() },
  status: { $ne: 'expired' }
}).pretty()

// 统计数量
db.posts.countDocuments()
```

## 常见问题

### Q1: 云函数调用失败
**A:** 检查以下几点：
- 云函数 URL 是否正确配置
- MongoDB 连接字符串是否正确
- 环境变量是否已设置
- 网络是否可以访问云函数

### Q2: 距离显示不准确
**A:** 确保：
- 用户已授权位置权限
- 帖子包含正确的 location_coords
- 经纬度格式正确（latitude, longitude）

### Q3: 图片无法显示
**A:** 检查：
- 图片 URL 是否有效
- 小程序是否配置了图片域名白名单
- 网络是否正常

### Q4: 分页加载不工作
**A:** 确认：
- onReachBottom 是否触发（检查 onReachBottomDistance 配置）
- hasMore 状态是否正确
- page 参数是否正确递增

### Q5: MongoDB 连接失败
**A:** 检查：
- MongoDB 服务是否启动
- 连接字符串格式是否正确
- 网络是否可达
- 用户名密码是否正确（如果有认证）

### Q6: 前端无法获取位置
**A:** 确保：
- manifest.json 中配置了位置权限
- 用户已同意授权
- 真机调试（模拟器可能无法获取位置）

## 部署上线

### 1. 部署云函数
```bash
# 使用 Serverless Devs
s deploy
```

### 2. 配置生产环境变量
在阿里云控制台配置 MongoDB 连接字符串等敏感信息。

### 3. 前端打包
```bash
# 小程序打包
npm run build:mp-weixin

# 上传到微信小程序后台
```

### 4. 配置域名白名单
在微信小程序后台配置：
- request 合法域名：云函数域名
- uploadFile 合法域名：文件上传域名
- downloadFile 合法域名：图片等资源域名

## 性能优化建议

1. **数据库优化**
   - 创建必要的索引
   - 使用 projection 减少返回字段
   - 合理设置分页大小

2. **云函数优化**
   - 复用数据库连接
   - 使用 Promise.all 并行查询
   - 设置合理的超时时间

3. **前端优化**
   - 图片懒加载
   - 列表虚拟滚动（大数据量时）
   - 缓存常用数据

4. **网络优化**
   - 使用 CDN 加速静态资源
   - 启用 HTTP/2
   - 压缩响应数据

## 获取帮助

- 查看 [README.md](README.md) 了解项目概况
- 查看 [ARCHITECTURE.md](ARCHITECTURE.md) 了解架构设计
- 查看 [IMPLEMENTATION.md](IMPLEMENTATION.md) 了解实现细节
- 查看各云函数的 README 了解 API 文档

## 下一步

- [ ] 实现评论功能
- [ ] 实现搜索功能
- [ ] 实现消息通知
- [ ] 实现用户主页
- [ ] 添加单元测试
- [ ] 添加 E2E 测试
