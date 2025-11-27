# MateMatch - 搭子引力

轻量级兴趣约伴平台 - 不想为了一顿饭、一次看展专门去麻烦那些很熟的朋友？来这里发个"轻招募"，找到当下志同道合的"临时搭子"。

## 项目简介

**搭子引力**是一个微信小程序，旨在帮助用户快速找到志同道合的活动伙伴。比社交软件更纯粹，比论坛更即时。

## 核心功能

### 1. 发布需求
- 发布活动邀请，如"今天下午去XX美术馆，求搭子"
- 支持多种活动分类：美食、运动、看展、电影、旅行、学习等
- 可设置活动时间、地点、人数及AA制选项

### 2. 地图浏览
- 首页以地图模式展示附近的"搭子"需求气泡
- 基于地理位置的需求发现
- 支持分类筛选

### 3. 快速响应
- 看到感兴趣的需求，可直接在小程序内发起临时聊天
- 实时消息推送
- 便捷的沟通体验

### 4. 安全与标签
- "已完成"状态标记
- 诚信标签系统（守时、靠谱等）
- 轻度信用体系积累

## 技术实现

### 前端
- 微信小程序原生开发
- 地图组件 `map` 的灵活运用
- 响应式布局设计

### 后端
- 微信云开发
- 云函数处理业务逻辑
- 云数据库存储数据

### 核心技术点
- `wx.getLocation` 获取用户位置
- `wx.chooseLocation` 选择活动地点
- 云数据库实时数据推送
- 地理位置索引查询

## 项目结构

```
MateMatch/
├── miniprogram/                # 小程序前端
│   ├── pages/                  # 页面
│   │   ├── index/              # 首页（地图浏览）
│   │   ├── post/               # 发布需求
│   │   ├── detail/             # 需求详情
│   │   ├── chat/               # 聊天页面
│   │   ├── chatList/           # 消息列表
│   │   └── profile/            # 个人中心
│   ├── components/             # 组件
│   ├── utils/                  # 工具函数
│   ├── images/                 # 图片资源
│   ├── app.js                  # 应用入口
│   ├── app.json                # 应用配置
│   └── app.wxss                # 全局样式
├── cloudfunctions/             # 云函数
│   ├── login/                  # 用户登录
│   ├── createNeed/             # 创建需求
│   ├── getNearbyNeeds/         # 获取附近需求
│   ├── respondToNeed/          # 响应需求
│   ├── updateNeedStatus/       # 更新需求状态
│   ├── getUserProfile/         # 获取用户资料
│   ├── updateUserProfile/      # 更新用户资料
│   ├── sendMessage/            # 发送消息
│   └── getMessages/            # 获取消息
└── project.config.json         # 项目配置
```

## 数据库设计

### users 集合
```javascript
{
  _openid: String,          // 微信openid
  nickName: String,         // 昵称
  avatarUrl: String,        // 头像
  trustTags: Array,         // 信用标签
  needsCount: Number,       // 发布数量
  completedCount: Number,   // 完成数量
  responsesCount: Number,   // 响应数量
  createTime: Date,
  updateTime: Date
}
```

### needs 集合
```javascript
{
  title: String,            // 标题
  description: String,      // 描述
  category: String,         // 分类
  activityTime: Date,       // 活动时间
  locationName: String,     // 地点名称
  location: GeoPoint,       // 地理位置
  peopleNeeded: Number,     // 需要人数
  isAA: Boolean,            // 是否AA
  status: String,           // 状态
  publisherId: String,      // 发布者ID
  responses: Array,         // 响应列表
  createTime: Date,
  updateTime: Date
}
```

### messages 集合
```javascript
{
  chatId: String,           // 会话ID
  senderId: String,         // 发送者ID
  receiverId: String,       // 接收者ID
  content: String,          // 消息内容
  isRead: Boolean,          // 是否已读
  createTime: Date
}
```

## 部署说明

1. 在微信开发者工具中导入项目
2. 在 `project.config.json` 中配置你的 AppID
3. 开通云开发并配置环境ID
4. 在 `app.js` 中更新云环境ID
5. 上传并部署所有云函数
6. 在云数据库中创建以下集合：`users`、`needs`、`messages`、`conversations`
7. 为 `needs` 集合的 `location` 字段创建地理位置索引
8. 添加所需的图片资源到 `images` 目录

## 图片资源

请在 `miniprogram/images/` 目录中添加以下图片：
- 底部导航图标：discover, post, message, profile（普通和选中状态）
- 功能图标：location, time, people, navigation, arrow-right, share, edit, about, feedback
- 地图标记：marker-food, marker-sport, marker-art, marker-movie, marker-travel, marker-study, marker-other, marker-default
- 其他：empty, chat-empty, default-avatar, location-error, location-pin

## 许可证

MIT License