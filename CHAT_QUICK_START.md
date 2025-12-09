# 聊天功能快速使用指南

## 用户使用流程

### 1. 发起对话

1. 浏览首页帖子列表
2. 点击感兴趣的帖子进入详情页
3. 在帖子详情页底部找到"发起对话"按钮（绿色主按钮）
4. 点击按钮进入与发布者的对话页面

**注意事项：**
- 必须先完善个人信息才能发起对话
- 不能与自己发起对话
- 首次对话会自动创建会话

### 2. 发送消息

1. 在聊天页面底部输入框输入消息
2. 点击"发送"按钮或按回车键发送
3. 消息立即显示在对话中
4. 自己的消息显示在右侧（绿色气泡）
5. 对方的消息显示在左侧（白色气泡）

### 3. 查看消息列表

1. 点击底部导航栏的"消息"标签
2. 查看所有对话列表
3. 每个对话显示：
   - 对方头像和昵称
   - 最后一条消息内容
   - 消息时间
   - 未读消息数量（红色圆点）
4. 点击任意对话进入聊天页面

### 4. 管理对话

- **查看历史消息**：在聊天页面向上滑动查看更早的消息
- **返回消息列表**：点击左上角返回按钮
- **切换对话**：在消息列表中点击其他对话

## 开发者使用指南

### 调用 API 函数

```javascript
const api = require('../../utils/api.js')

// 1. 创建或获取会话
const result = api.createConversation(
  userId,           // 当前用户ID
  targetUserId,     // 对方用户ID
  postId,          // 关联帖子ID（可选）
  postTitle        // 帖子标题（可选）
)

// 2. 发送消息
const message = api.sendMessage(
  conversationId,   // 会话ID
  senderId,        // 发送者ID
  senderName,      // 发送者昵称
  senderAvatar,    // 发送者头像
  content          // 消息内容
)

// 3. 获取消息列表
const messages = api.getMessages(conversationId)

// 4. 获取会话列表
const conversations = api.getConversations(userId)
```

### 页面跳转

```javascript
// 跳转到聊天页面
wx.navigateTo({
  url: `/pages/chat/chat?conversationId=${conversationId}&otherUserId=${encodeURIComponent(userId)}&otherUserName=${encodeURIComponent(name)}&otherUserAvatar=${encodeURIComponent(avatar)}`
})

// 跳转到消息列表（使用 switchTab 因为它在 tabBar 中）
wx.switchTab({
  url: '/pages/messages/messages'
})
```

### 本地存储结构

```javascript
// 会话列表
wx.getStorageSync('conversations')  // 返回 Array<Conversation>

// 消息列表
wx.getStorageSync('messages')       // 返回 Array<Message>

// 用户信息
wx.getStorageSync('userInfo')       // 返回 UserInfo
```

## 云函数调用（生产环境）

### 1. 发送消息

```javascript
wx.cloud.callFunction({
  name: 'sendMessage',
  data: {
    conversationId: 'conv_id',
    senderId: 'user_id',
    senderName: '张三',
    senderAvatar: 'avatar_url',
    content: '你好'
  },
  success: res => {
    console.log('发送成功', res.result)
  }
})
```

### 2. 获取消息列表

```javascript
wx.cloud.callFunction({
  name: 'getMessages',
  data: {
    conversationId: 'conv_id',
    page: 1,
    pageSize: 20,
    userId: 'current_user_id'
  },
  success: res => {
    console.log('消息列表', res.result.data.messages)
  }
})
```

### 3. 获取会话列表

```javascript
wx.cloud.callFunction({
  name: 'getConversations',
  data: {
    userId: 'current_user_id'
  },
  success: res => {
    console.log('会话列表', res.result.data)
  }
})
```

### 4. 创建会话

```javascript
wx.cloud.callFunction({
  name: 'createConversation',
  data: {
    userId: 'current_user_id',
    targetUserId: 'target_user_id',
    postId: 'post_id',
    postTitle: '帖子标题'
  },
  success: res => {
    console.log('会话信息', res.result.data)
  }
})
```

## 界面截图说明

### 聊天页面布局
```
┌─────────────────────────────┐
│   [<] 对方昵称               │  <- 导航栏
├─────────────────────────────┤
│                             │
│  ┌─────┐ ┌──────────┐      │  <- 对方消息（左侧白色）
│  │头像 │ │消息内容  │      │
│  └─────┘ └──────────┘      │
│          时间               │
│                             │
│      ┌──────────┐ ┌─────┐  │  <- 自己消息（右侧绿色）
│      │消息内容  │ │头像 │  │
│      └──────────┘ └─────┘  │
│      时间                   │
│                             │
├─────────────────────────────┤
│ [输入消息...    ] [发送]   │  <- 输入框
└─────────────────────────────┘
```

### 消息列表页面布局
```
┌─────────────────────────────┐
│         消息                │  <- 导航栏
├─────────────────────────────┤
│ ┌─────┐  张三          5分钟前│
│ │头像 │  你好，在吗？    [2]  │  <- 对话项
│ └─────┘  [帖子标题]          │
├─────────────────────────────┤
│ ┌─────┐  李四         昨天   │
│ │头像 │  好的，谢谢          │
│ └─────┘  [帖子标题]          │
├─────────────────────────────┤
│                             │
└─────────────────────────────┘
```

## 常见问题

### Q1: 为什么看不到"发起对话"按钮？
**A:** 请确认：
1. 是否在帖子详情页（不是首页）
2. 个人信息是否已完善
3. 页面是否正确加载

### Q2: 发送消息后对方看不到？
**A:** 当前版本使用本地存储，每个用户的数据独立。生产环境部署云函数后，消息会通过云数据库同步。

### Q3: 消息列表为空？
**A:** 请先从帖子详情页发起对话并发送至少一条消息。

### Q4: 如何切换到云数据库版本？
**A:** 
1. 配置云数据库连接（MONGODB_URI, DB_NAME）
2. 部署云函数到微信云开发
3. 修改页面代码，将本地存储调用改为云函数调用
4. 参考 CHAT_FEATURE_DOCUMENTATION.md 中的部署说明

### Q5: 时间显示不正确？
**A:** 时间格式化基于设备本地时间，确保设备时间设置正确。

## 技术支持

如遇到问题，请查阅：
1. `CHAT_FEATURE_DOCUMENTATION.md` - 完整技术文档
2. `IMPLEMENTATION_SUMMARY.md` - 实现总结
3. 云函数源码注释

或联系开发团队获取帮助。
