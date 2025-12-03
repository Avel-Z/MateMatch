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
MateMatch 是一个"轻招募搭子"微信小程序，帮助用户找到临时的志同道合伙伴（如一起看展、AA聚餐等），无需麻烦熟人朋友。

## 功能特性

### 1. 首页/论坛页 (pages/index)
- ✅ 以论坛模式展示附近的"搭子"需求
- ✅ 使用气泡卡片形式展示每个需求
- ✅ 显示活动类型、时间、地点、简要描述、发布者头像
- ✅ 支持下拉刷新和上拉加载更多
- ✅ 点击卡片跳转到详情页

### 2. 详情页 (pages/detail)
- ✅ 展示需求的完整信息
- ✅ 显示发布者信息
- ✅ "获取微信号"按钮 - 点击后显示发布者注册时填写的微信号
- ✅ 返回列表功能

### 3. 发布页 (pages/publish)
- ✅ 活动类型选择（看展/聚餐/运动/电影/其他）
- ✅ 活动地点输入
- ✅ 活动时间选择（日期+时间）
- ✅ 详细描述（文本框）
- ✅ 费用说明（如AA、免费等）
- ✅ 表单验证
- ✅ 发布成功后跳转到首页

### 4. 个人中心页 (pages/profile)
- ✅ 用户注册/登录功能
- ✅ 填写个人信息：昵称、头像、微信号（必填，用于他人联系）
- ✅ 查看我发布的需求列表
- ✅ 编辑个人信息
- ✅ 删除我的需求

## 技术栈

- **框架**: 微信小程序原生开发
- **数据存储**: 本地存储 (wx.setStorageSync) 模拟数据持久化
- **数据模拟**: 本地 mock 数据（utils/mock.js）
- **UI设计**: 清新的蓝绿色系，卡片式设计

## 项目结构

```
MateMatch/
├── app.js                  # 小程序入口文件
├── app.json                # 全局配置文件
├── app.wxss                # 全局样式文件
├── project.config.json     # 项目配置文件
├── sitemap.json           # 站点地图配置
├── pages/
│   ├── index/             # 首页/论坛列表
│   │   ├── index.wxml     # 页面结构
│   │   ├── index.wxss     # 页面样式
│   │   ├── index.js       # 页面逻辑
│   │   └── index.json     # 页面配置
│   ├── detail/            # 需求详情页
│   ├── publish/           # 发布需求页
│   └── profile/           # 个人中心页
├── utils/
│   ├── mock.js            # 模拟数据
│   ├── util.js            # 工具函数
│   └── api.js             # API封装
├── images/                # 图片资源
│   ├── home.png           # 首页图标
│   ├── publish.png        # 发布图标
│   ├── profile.png        # 个人中心图标
│   └── avatar-default.png # 默认头像
└── README.md              # 项目说明文档
```

## 快速开始

### 1. 安装微信开发者工具

从 [微信官方网站](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) 下载并安装微信开发者工具。

### 2. 导入项目

1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择本项目目录
4. 输入 AppID（可使用测试号）
5. 点击"导入"

### 3. 运行项目

项目导入后会自动编译运行，可以在模拟器中查看效果。

## 使用说明

### 首次使用

1. 打开小程序后，点击底部 TabBar 的"我的"
2. 完善个人信息（昵称、微信号）
3. 返回首页，查看现有需求或发布新需求

### 发布需求

1. 点击底部 TabBar 的"发布"
2. 填写活动信息（类型、标题、地点、时间、描述、费用）
3. 点击"发布需求"
4. 发布成功后自动跳转到首页

### 查看和联系

1. 在首页浏览需求列表
2. 点击感兴趣的卡片查看详情
3. 点击"获取微信号"按钮查看发布者微信号
4. 复制微信号添加好友

### 管理我的发布

1. 进入"我的"页面
2. 查看"我的发布"列表
3. 可以编辑或删除自己发布的需求

## 数据说明

项目使用本地存储模拟后端数据库：

- **needs**: 存储所有需求信息
- **userInfo**: 存储当前用户信息

初次启动会自动加载 mock 数据，包含 3 条示例需求。

## UI 设计

- **主色调**: #4CAF93 (清新的蓝绿色)
- **设计风格**: 卡片式设计，圆角阴影
- **图标**: 使用 Emoji 作为临时图标
- **整体风格**: 年轻、活泼、友好

## 开发计划

- [x] 基础架构搭建
- [x] 首页/论坛页
- [x] 详情页
- [x] 发布页
- [x] 个人中心页
- [ ] 需求编辑功能完善
- [ ] 地理位置功能
- [ ] 搜索和筛选功能
- [ ] 消息通知功能

## 注意事项

1. 本项目仅用于演示和学习，使用本地存储模拟数据持久化
2. 实际部署需要接入真实后端服务
3. 图标为临时占位图，建议替换为专业设计的图标
4. 微信号等敏感信息需要谨慎处理

## License

MIT License
