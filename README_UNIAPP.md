# MateMatch - 轻招募搭子小程序 (UniApp + Vue 3 版本)

## 项目简介

这是一个使用 **UniApp + Vue 3** 重写的"轻招募搭子"小程序项目，用于发布和查找临时活动搭子（如看展、聚餐、运动等）。项目支持多端小程序平台（微信、支付宝、百度、头条等）。

## 技术栈

- **前端框架**: UniApp
- **开发语言**: Vue 3 (Composition API) + TypeScript
- **构建工具**: Vite
- **样式**: SCSS
- **数据存储**: 本地存储 (uni.getStorageSync / uni.setStorageSync)
- **云函数**: 阿里云 Function Compute (可选)

## 功能特性

### 1. 首页/论坛页 (pages/index)
- ✅ 论坛模式展示附近的"搭子"需求
- ✅ 气泡卡片形式展示每个需求
- ✅ 显示活动类型、时间、地点、简要描述、发布者头像
- ✅ 支持下拉刷新和上拉加载更多
- ✅ 点击卡片跳转到详情页

### 2. 详情页 (pages/detail)
- ✅ 展示需求的完整信息
- ✅ 显示发布者信息
- ✅ "获取微信号"按钮 - 点击后显示发布者注册时填写的微信号
- ✅ 一键复制微信号
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

## 项目结构

```
MateMatch/
├── src/
│   ├── api/
│   │   └── index.ts                # API 封装（本地存储）
│   ├── components/
│   │   └── PostCard.vue            # 帖子卡片组件（可选）
│   ├── pages/
│   │   ├── index/
│   │   │   └── index.vue           # 首页/论坛页
│   │   ├── detail/
│   │   │   └── detail.vue          # 需求详情页
│   │   ├── publish/
│   │   │   └── publish.vue         # 发布需求页
│   │   └── profile/
│   │       └── profile.vue         # 个人中心页
│   ├── static/
│   │   └── images/                 # 静态图片资源
│   ├── types/
│   │   ├── need.ts                 # 需求类型定义
│   │   └── user.ts                 # 用户类型定义
│   ├── utils/
│   │   ├── util.ts                 # 工具函数
│   │   ├── mock.ts                 # Mock 数据
│   │   ├── time.js                 # 时间格式化（已有）
│   │   └── distance.js             # 距离计算（已有）
│   ├── App.vue                     # 应用入口
│   ├── main.js                     # 主入口文件
│   ├── manifest.json               # 应用配置
│   ├── pages.json                  # 页面配置
│   └── uni.scss                    # 全局样式变量
├── cloud/
│   └── functions/                  # 云函数目录（可选）
│       ├── queryPosts/
│       ├── getPost/
│       └── toggleFavorite/
├── vite.config.js                  # Vite 配置
├── package.json
├── .gitignore
└── README.md
```

## 快速开始

### 1. 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- HBuilderX (推荐) 或 UniApp CLI

### 2. 安装依赖

```bash
npm install
```

### 3. 开发运行

#### 使用 HBuilderX
1. 打开 HBuilderX
2. 导入项目目录
3. 点击"运行" -> "运行到小程序模拟器" -> 选择目标平台

#### 使用 CLI
```bash
# 运行到微信小程序
npm run dev:mp-weixin

# 运行到支付宝小程序
npm run dev:mp-alipay

# 运行到百度小程序
npm run dev:mp-baidu

# 运行到头条小程序
npm run dev:mp-toutiao

# 运行到 H5
npm run dev:h5
```

### 4. 构建发布

```bash
# 构建微信小程序
npm run build:mp-weixin

# 构建支付宝小程序
npm run build:mp-alipay

# 构建百度小程序
npm run build:mp-baidu

# 构建头条小程序
npm run build:mp-toutiao

# 构建 H5
npm run build:h5
```

## 配置说明

### manifest.json

包含应用的基本配置，如 AppID、应用名称、版本号等，以及各平台的特定配置。

### pages.json

包含页面路由配置和 TabBar 配置。

### uni.scss

包含全局 SCSS 变量，如主题色、间距、字体大小等。

## 数据说明

项目使用本地存储模拟后端数据库：

- **needs**: 存储所有需求信息
- **userInfo**: 存储当前用户信息

初次启动会自动加载 mock 数据，包含 3 条示例需求。

## UI 设计

- **主色调**: #4CAF93 (清新的蓝绿色)
- **设计风格**: 卡片式设计，圆角阴影
- **图标**: 使用 Emoji 和图片图标
- **整体风格**: 年轻、活泼、友好

## 代码规范

- 使用 Vue 3 Composition API (`<script setup>`)
- 使用 TypeScript 进行类型约束
- 组件命名使用 PascalCase
- 文件命名使用 kebab-case
- 样式使用 SCSS 和作用域样式

## 云函数集成（可选）

本项目支持云函数集成，已有以下云函数实现：

- `queryPosts` - 查询帖子列表
- `getPost` - 获取帖子详情
- `toggleFavorite` - 切换收藏状态

详见 `cloud/functions` 目录和 `src/api/aliyunApi.js`。

## 多平台支持

UniApp 天然支持多端发布：

- ✅ 微信小程序
- ✅ 支付宝小程序
- ✅ 百度小程序
- ✅ 头条小程序
- ✅ H5
- ✅ App (iOS/Android)

## 注意事项

1. 本项目使用本地存储模拟数据持久化，适用于演示和学习
2. 生产环境建议接入真实后端服务或云开发
3. 微信号等敏感信息需要谨慎处理
4. 多平台发布时注意各平台的API差异

## 开发计划

- [x] 基础架构搭建
- [x] 首页/论坛页
- [x] 详情页
- [x] 发布页
- [x] 个人中心页
- [x] 使用 UniApp + Vue 3 重写
- [x] TypeScript 类型支持
- [ ] 云函数完整集成
- [ ] 地理位置功能
- [ ] 搜索和筛选功能
- [ ] 消息通知功能

## 从原生微信小程序迁移

本项目是从原生微信小程序重写而来，主要改进：

1. **跨平台支持**: 从单一微信平台到多端小程序平台
2. **技术栈升级**: 从原生小程序到 UniApp + Vue 3
3. **类型安全**: 使用 TypeScript
4. **开发体验**: Vue 3 Composition API，代码更简洁
5. **样式管理**: 统一的 SCSS 变量和全局样式

## License

MIT License

---

**MateMatch** - 找到你的临时搭子，让生活更有趣！
