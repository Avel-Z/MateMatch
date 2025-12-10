# getPost 云函数

## 功能描述
获取帖子详情，包括帖子内容、作者信息和收藏状态。

## 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| postId | string | 是 | 帖子ID |
| userId | string | 否 | 用户ID，用于判断是否已收藏 |

## 请求示例

```json
{
  "postId": "507f1f77bcf86cd799439011",
  "userId": "507f191e810c19729de860ea"
}
```

## 返回格式

### 成功响应 (code: 0)

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "post": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "求看展搭子",
      "description": "想去XX美术馆，有没有小伙伴一起",
      "event_time": "2025-12-03 14:00",
      "location_text": "XX美术馆",
      "location_coords": {
        "latitude": 31.230416,
        "longitude": 121.473701
      },
      "images": [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg"
      ],
      "fav_count": 5,
      "created_at": "2025-12-01T10:00:00Z",
      "expires_at": "2025-12-03T18:00:00Z",
      "status": "open",
      "category": "exhibition"
    },
    "author": {
      "_id": "507f191e810c19729de860ea",
      "nickname": "小明",
      "avatarUrl": "https://example.com/avatar.jpg",
      "wechat_id": "wxid_xxx"
    },
    "is_favorited": false
  }
}
```

**注意**：`wechat_id` 字段仅在作者设置 `show_wechat: true` 时返回。

### 错误响应

#### 参数错误 (code: 4001)

```json
{
  "code": 4001,
  "msg": "参数错误：postId 不能为空",
  "data": null
}
```

#### 帖子不存在 (code: 4004)

```json
{
  "code": 4004,
  "msg": "帖子不存在",
  "data": null
}
```

#### 服务器错误 (code: 5001)

```json
{
  "code": 5001,
  "msg": "服务器错误：数据库连接失败",
  "data": null
}
```

## 业务逻辑

1. 根据 postId 查询帖子详情
2. 关联查询作者信息（nickname, avatarUrl, wechat_id）
3. 若作者设置 `show_wechat: true`，返回 `wechat_id`
4. 若传了 `userId`，查询 favorites 集合判断是否已收藏

## 数据库集合

### posts
- _id: 帖子ID
- author_id: 作者ID
- title: 标题
- description: 描述
- event_time: 活动时间
- location_text: 地点文本
- location_coords: 地点坐标
- images: 图片数组
- fav_count: 收藏数
- created_at: 创建时间
- expires_at: 过期时间
- status: 状态（open/closed/expired）
- category: 分类

### users
- _id: 用户ID
- nickname: 昵称
- avatarUrl: 头像URL
- wechat_id: 微信号
- show_wechat: 是否显示微信号（boolean）

### favorites
- _id: 收藏记录ID
- user_id: 用户ID
- post_id: 帖子ID
- created_at: 收藏时间

## 环境变量

- `MONGODB_URI`: MongoDB 连接字符串
- `DB_NAME`: 数据库名称

## 依赖

- mongodb: ^4.0.0
