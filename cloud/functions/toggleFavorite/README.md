# toggleFavorite 云函数

## 功能描述
切换帖子收藏状态，支持收藏和取消收藏操作。

## 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| postId | string | 是 | 帖子ID |
| userId | string | 是 | 用户ID |
| isFavorite | boolean | 是 | 是否收藏（true: 收藏, false: 取消收藏） |

## 请求示例

### 收藏帖子
```json
{
  "postId": "507f1f77bcf86cd799439011",
  "userId": "507f191e810c19729de860ea",
  "isFavorite": true
}
```

### 取消收藏
```json
{
  "postId": "507f1f77bcf86cd799439011",
  "userId": "507f191e810c19729de860ea",
  "isFavorite": false
}
```

## 返回格式

### 成功响应 (code: 0)

#### 收藏成功
```json
{
  "code": 0,
  "msg": "收藏成功",
  "data": {
    "isFavorite": true,
    "fav_count": 6
  }
}
```

#### 取消收藏成功
```json
{
  "code": 0,
  "msg": "取消收藏成功",
  "data": {
    "isFavorite": false,
    "fav_count": 5
  }
}
```

#### 重复收藏
```json
{
  "code": 0,
  "msg": "已经收藏过了",
  "data": {
    "isFavorite": true,
    "fav_count": 5
  }
}
```

### 错误响应

#### 参数错误 (code: 4001)
```json
{
  "code": 4001,
  "msg": "参数错误：postId 和 userId 不能为空",
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

### 收藏操作
1. 验证帖子是否存在
2. 在 favorites 集合插入收藏记录
3. 更新 posts 集合的 fav_count 字段（+1）
4. 如果重复收藏，返回已收藏提示

### 取消收藏操作
1. 验证帖子是否存在
2. 从 favorites 集合删除收藏记录
3. 更新 posts 集合的 fav_count 字段（-1）
4. 如果未收藏，返回未收藏提示

## 数据库操作

### favorites 集合
```javascript
{
  _id: ObjectId,
  user_id: String,     // 用户ID
  post_id: String,     // 帖子ID
  created_at: Date     // 收藏时间
}
```

**索引**：`{ user_id: 1, post_id: 1 }` (unique)

### posts 集合更新
```javascript
// 收藏时
{ $inc: { fav_count: 1 } }

// 取消收藏时
{ $inc: { fav_count: -1 } }
```

## 错误处理

1. **参数校验**：确保 postId、userId 和 isFavorite 都已提供
2. **帖子存在性**：检查帖子是否存在
3. **重复收藏**：通过唯一索引防止重复收藏
4. **原子操作**：使用 MongoDB 原子操作确保数据一致性

## 环境变量

- `MONGODB_URI`: MongoDB 连接字符串
- `DB_NAME`: 数据库名称

## 依赖

- mongodb: ^4.0.0

## 注意事项

1. favorites 集合需要创建唯一索引 `{ user_id: 1, post_id: 1 }` 防止重复收藏
2. fav_count 字段会随着收藏/取消收藏自动更新
3. 取消收藏时确保 fav_count 不会小于 0
