# 聊天功能说明文档

## 概述

本文档说明了 MateMatch 小程序中新增的聊天功能实现。用户可以通过私信方式与帖子发布者进行沟通交流。

## 功能特性

### 1. 私信对话
- 用户可以从帖子详情页发起与发布者的对话
- 支持文字消息的发送和接收
- 消息以聊天气泡形式展示（类似微信）
- 自己的消息显示在右侧（绿色气泡）
- 对方的消息显示在左侧（白色气泡）

### 2. 消息列表
- 显示所有对话列表
- 展示对方头像、昵称、最后一条消息
- 显示未读消息数量提示
- 按最后消息时间倒序排列

### 3. 实时更新
- 发送消息后立即显示在对话中
- 消息列表实时更新
- 会话列表自动更新最后消息

## 文件结构

```
MateMatch/
├── cloud/functions/               # 云函数
│   ├── sendMessage/               # 发送消息
│   ├── getMessages/               # 获取消息列表
│   ├── getConversations/          # 获取会话列表
│   └── createConversation/        # 创建/获取会话
├── pages/
│   ├── chat/                      # 聊天页面
│   │   ├── chat.js
│   │   ├── chat.wxml
│   │   ├── chat.wxss
│   │   └── chat.json
│   ├── messages/                  # 消息列表页面
│   │   ├── messages.js
│   │   ├── messages.wxml
│   │   ├── messages.wxss
│   │   └── messages.json
│   └── detail/                    # 帖子详情页（已修改）
│       ├── detail.js              # 添加了 startChat() 方法
│       └── detail.wxml            # 添加了"发起对话"按钮
└── utils/
    └── api.js                     # 添加了会话和消息管理函数
```

## 核心功能实现

### 1. 云函数

#### sendMessage - 发送消息
```javascript
参数：
- conversationId: 会话ID
- senderId: 发送者ID
- senderName: 发送者昵称
- senderAvatar: 发送者头像
- content: 消息内容

返回：
- 消息记录
- 自动更新会话的最后消息
```

#### getMessages - 获取消息列表
```javascript
参数：
- conversationId: 会话ID
- page: 页码（默认1）
- pageSize: 每页数量（默认20）
- userId: 当前用户ID（可选，用于标记已读）

返回：
- 消息列表（按时间升序）
- 分页信息
```

#### getConversations - 获取会话列表
```javascript
参数：
- userId: 当前用户ID

返回：
- 会话列表（包含对方信息、最后消息、未读数）
- 按最后消息时间倒序
```

#### createConversation - 创建/获取会话
```javascript
参数：
- userId: 当前用户ID
- targetUserId: 对方用户ID
- postId: 关联的帖子ID（可选）
- postTitle: 帖子标题（可选）

返回：
- 会话信息
- 如果会话已存在则返回已有会话
```

### 2. 数据存储

#### 本地存储（localStorage）
当前实现使用本地存储模拟数据库：

**conversations** - 会话记录
```javascript
{
  _id: string,                     // 会话ID（两个用户ID排序后拼接）
  participants: [userId1, userId2], // 参与者ID数组
  postId: string,                   // 关联的帖子ID
  postTitle: string,                // 帖子标题
  lastMessage: string,              // 最后一条消息内容
  lastMessageTime: Date,            // 最后消息时间
  otherUserId: string,              // 对方用户ID
  otherUserName: string,            // 对方用户昵称
  otherUserAvatar: string,          // 对方用户头像
  createdAt: Date                   // 创建时间
}
```

**messages** - 消息记录
```javascript
{
  _id: string,                      // 消息ID
  conversationId: string,           // 会话ID
  senderId: string,                 // 发送者ID
  senderName: string,               // 发送者昵称
  senderAvatar: string,             // 发送者头像
  content: string,                  // 消息内容
  createdAt: Date,                  // 创建时间
  read: boolean                     // 是否已读
}
```

#### 云数据库（MongoDB）
云函数中实现了 MongoDB 数据存储逻辑，可在实际部署时使用：

- `conversations` 集合存储会话记录
- `messages` 集合存储消息记录

### 3. 页面交互流程

#### 发起对话流程
1. 用户在帖子详情页点击"发起对话"按钮
2. 检查是否已登录，未登录则跳转到个人资料页
3. 检查是否与自己对话（不允许）
4. 生成或获取会话ID
5. 跳转到聊天页面

#### 发送消息流程
1. 用户在输入框输入消息
2. 点击"发送"按钮或按回车键
3. 验证消息内容不为空
4. 创建消息记录并保存
5. 更新会话的最后消息
6. 刷新消息列表
7. 滚动到底部显示最新消息

#### 查看消息列表流程
1. 用户点击底部导航栏的"消息"标签
2. 加载当前用户的所有会话
3. 计算每个会话的未读消息数
4. 显示会话列表
5. 点击某个会话进入聊天页面

## UI/UX 设计

### 主题色
- 主色调：`#4CAF93`（绿色）
- 自己的消息气泡：`#4CAF93`
- 对方的消息气泡：`#FFFFFF`（白色）

### 布局
- **聊天页面**：顶部显示对方昵称，中间消息列表，底部输入框
- **消息列表**：每个会话显示头像、昵称、最后消息、时间和未读数
- **消息气泡**：圆角矩形，带阴影，支持自动换行

### 交互
- 点击输入框中的发送按钮或按回车键发送消息
- 下拉刷新加载更多历史消息
- 消息自动滚动到底部
- 未读消息显示红色圆点标记

## 时间格式化

消息时间显示规则：
- 小于1分钟：显示"刚刚"
- 小于1小时：显示"X分钟前"
- 今天：显示时间（如"14:30"）
- 昨天：显示"昨天 时间"
- 其他：显示日期（如"2024-01-15"）

## API 工具函数

在 `utils/api.js` 中新增以下函数：

```javascript
// 获取会话列表
getConversations(userId)

// 创建或获取会话
createConversation(userId, targetUserId, postId, postTitle)

// 获取消息列表
getMessages(conversationId)

// 发送消息
sendMessage(conversationId, senderId, senderName, senderAvatar, content)
```

## 部署说明

### 1. 云函数部署
```bash
# 进入云函数目录
cd cloud/functions/sendMessage
npm install

cd ../getMessages
npm install

cd ../getConversations
npm install

cd ../createConversation
npm install
```

### 2. 数据库配置
需要在云函数中配置 MongoDB 连接：
- 设置环境变量 `MONGODB_URI`
- 设置环境变量 `DB_NAME`

### 3. 图标资源
需要为消息页面准备合适的图标：
- `images/message.png` - 消息图标（未选中）
- `images/message-active.png` - 消息图标（选中）

## 测试建议

1. **基础功能测试**
   - 测试发起对话功能
   - 测试发送和接收消息
   - 测试消息列表显示

2. **边界情况测试**
   - 测试未登录状态
   - 测试与自己对话（应阻止）
   - 测试空消息发送（应阻止）
   - 测试长消息显示

3. **性能测试**
   - 测试大量消息的加载
   - 测试消息列表的滚动性能

## 后续优化建议

1. **功能增强**
   - 支持图片消息
   - 支持语音消息
   - 消息撤回功能
   - 消息已读状态同步

2. **性能优化**
   - 实现消息分页加载
   - 添加消息缓存机制
   - 优化消息列表渲染

3. **用户体验**
   - 添加消息发送状态提示
   - 添加网络异常处理
   - 支持消息搜索功能
   - 添加消息提示音

## 注意事项

1. 当前实现使用本地存储模拟数据库，实际生产环境应使用云数据库
2. 消息未实现实时推送，需要手动刷新才能看到新消息
3. 未实现消息加密，敏感信息需要加密传输
4. 需要根据实际业务需求调整云函数的权限配置

## 维护和支持

如有问题或建议，请联系开发团队。
