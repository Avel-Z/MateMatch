# queryPosts 云函数

## 功能描述
查询帖子列表，支持分页、分类筛选和距离计算。

## 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| page | number | 否 | 1 | 页码，从 1 开始 |
| pageSize | number | 否 | 10 | 每页数量，最大 100 |
| category | string | 否 | "" | 分类筛选（exhibition/dining/sports/other） |
| userLocation | object | 否 | null | 用户位置，用于计算距离 |
| userLocation.latitude | number | 否 | - | 用户纬度 |
| userLocation.longitude | number | 否 | - | 用户经度 |

## 请求示例

```json
{
  "page": 1,
  "pageSize": 10,
  "category": "exhibition",
  "userLocation": {
    "latitude": 31.230416,
    "longitude": 121.473701
  }
}
```

## 返回格式

### 成功响应 (code: 0)

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "求看展搭子",
        "description": "想去XX美术馆...",
        "event_time": "2025-12-03 14:00",
        "location_text": "XX美术馆",
        "images": ["https://example.com/image1.jpg"],
        "fav_count": 5,
        "created_at": "2025-12-01T10:00:00Z",
        "category": "exhibition",
        "author": {
          "nickname": "小明",
          "avatarUrl": "https://example.com/avatar.jpg"
        },
        "distance_m": 1500
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "hasMore": true
  }
}
```

### 错误响应

```json
{
  "code": 4001,
  "msg": "参数错误：page 和 pageSize 必须为正整数",
  "data": null
}
```

```json
{
  "code": 5001,
  "msg": "服务器错误：数据库连接失败",
  "data": null
}
```

## 业务逻辑

1. 过滤已过期帖子：`expires_at > new Date()` 且 `status !== 'expired'`
2. 按创建时间倒序排列
3. 支持分页处理
4. 若提供用户位置，计算每个帖子与用户的距离
5. 关联查询作者信息（nickname, avatarUrl）

## 环境变量

- `MONGODB_URI`: MongoDB 连接字符串
- `DB_NAME`: 数据库名称

## 依赖

- mongodb: ^4.0.0
