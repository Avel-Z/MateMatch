# MateMatch - 轻招募搭子小程序

## 项目简介
这是一个"轻招募"搭子小程序项目，用于发布和查找临时活动搭子。本项目实现了论坛页面功能，包括帖子列表展示和详情页查看。

## 功能特性

### 论坛列表页 (`/src/pages/forum.vue`)
- ✅ 分页加载帖子列表
- ✅ 下拉刷新功能
- ✅ 上拉加载更多
- ✅ 分类筛选（看展/吃饭/运动/其他）
- ✅ 距离计算和显示
- ✅ 加载状态和空状态展示
- ✅ 收藏功能

### 帖子详情页 (`/src/pages/post-detail.vue`)
- ✅ 完整帖子内容展示
- ✅ 作者信息展示
- ✅ 活动时间和地点信息
- ✅ 图片预览功能
- ✅ 收藏功能
- ✅ 微信号展示和复制（需作者授权）

### 组件
- **PostCard** (`/src/components/PostCard.vue`) - 帖子卡片组件
  - 显示作者信息、标题、时间、地点、距离、收藏数
  - 支持点击跳转详情
  - 支持收藏操作

### 工具函数
- **distance.js** - 距离计算和格式化
  - `calculateDistance()` - 计算两点间距离（Haversine 公式）
  - `formatDistance()` - 格式化距离显示
  
- **time.js** - 时间格式化
  - `formatEventTime()` - 格式化活动时间
  - `formatRelativeTime()` - 相对时间显示（如"3小时前"）

### API 封装
- **aliyunApi.js** - 统一的云函数调用接口
  - `api.queryPosts()` - 查询帖子列表
  - `api.getPost()` - 获取帖子详情
  - `api.toggleFavorite()` - 切换收藏状态

## 云函数

### queryPosts - 查询帖子列表
- 支持分页查询
- 支持分类筛选
- 支持距离计算
- 自动过滤已过期帖子
- 关联查询作者信息

详见：[cloud/functions/queryPosts/README.md](cloud/functions/queryPosts/README.md)

### getPost - 获取帖子详情
- 查询完整帖子信息
- 关联作者信息
- 判断收藏状态
- 条件返回微信号

详见：[cloud/functions/getPost/README.md](cloud/functions/getPost/README.md)

## 技术栈
- **前端**: uni-app (Vue)
- **后端**: 阿里云 Function Compute (Node.js)
- **数据库**: MongoDB

## 项目结构
```
MateMatch/
├── src/
│   ├── api/
│   │   └── aliyunApi.js          # API 封装
│   ├── components/
│   │   └── PostCard.vue           # 帖子卡片组件
│   ├── pages/
│   │   ├── forum.vue              # 论坛列表页
│   │   └── post-detail.vue        # 帖子详情页
│   └── utils/
│       ├── distance.js            # 距离计算工具
│       └── time.js                # 时间格式化工具
├── cloud/
│   └── functions/
│       ├── queryPosts/            # 查询帖子列表云函数
│       │   ├── index.js
│       │   ├── package.json
│       │   └── README.md
│       └── getPost/               # 获取帖子详情云函数
│           ├── index.js
│           ├── package.json
│           └── README.md
├── package.json
└── README.md
```

## 数据库设计

### posts 集合
```javascript
{
  _id: ObjectId,
  author_id: ObjectId,
  title: String,
  description: String,
  event_time: String,
  created_at: Date,
  expires_at: Date,
  location_text: String,
  location_coords: {
    latitude: Number,
    longitude: Number
  },
  images: [String],
  fav_count: Number,
  is_anonymous: Boolean,
  show_contact: Boolean,
  status: String,  // 'open' | 'closed' | 'expired'
  category: String // 'exhibition' | 'dining' | 'sports' | 'other'
}
```

### users 集合
```javascript
{
  _id: ObjectId,
  openid: String,
  nickname: String,
  avatarUrl: String,
  wechat_id: String,
  show_wechat: Boolean,
  created_at: Date,
  updated_at: Date
}
```

### favorites 集合
```javascript
{
  _id: ObjectId,
  user_id: String,
  post_id: String,
  created_at: Date
}
```

## API 响应格式

所有接口统一返回格式：
```javascript
{
  code: Number,    // 0: 成功, 4001: 参数错误, 4004: 未找到, 5001: 服务器错误
  msg: String,     // 响应消息
  data: Any        // 响应数据
}
```

## 环境配置

### 前端环境变量
创建 `.env` 文件配置云函数基础 URL：
```
VUE_APP_CLOUD_BASE_URL=https://your-cloud-function-url
```

### 云函数环境变量
- `MONGODB_URI`: MongoDB 连接字符串
- `DB_NAME`: 数据库名称（默认: matematch）

## 使用说明

### 前端开发
1. 使用 HBuilderX 或 uni-app CLI 打开项目
2. 配置云函数 URL
3. 运行到微信开发者工具或浏览器

### 云函数部署
1. 进入云函数目录
2. 安装依赖：`npm install`
3. 部署到阿里云 Function Compute
4. 配置环境变量

## 代码规范
- 文件命名：小写短横线（kebab-case）
- 变量命名：驼峰命名（camelCase）
- 数据库字段：下划线命名（snake_case）
- 代码注释：必要的注释说明 API 调用和期望返回

## License
MIT