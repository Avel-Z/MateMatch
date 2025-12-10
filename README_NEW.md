# MateMatch - 轻招募搭子小程序 (UniApp + Vue 3 版本)

## 项目简介

这是一个使用 **UniApp + Vue 3 Composition API** 重写的"轻招募搭子"小程序项目，用于发布和查找临时活动搭子（如看展、聚餐、运动等）。项目支持多端小程序平台（微信、支付宝、百度、头条等）。

## 技术栈

- **前端框架**: UniApp
- **开发语言**: Vue 3 (Composition API) + TypeScript
- **构建工具**: Vite
- **样式**: SCSS（使用 rpx 单位）
- **数据存储**: 本地存储 (uni.getStorageSync / uni.setStorageSync)
- **云开发**: 阿里云 uniCloud（可选）

## 功能特性

### 1. 首页/论坛页 (pages/index/index.vue)
- ✅ 论坛模式展示附近的"搭子"需求
- ✅ 气泡卡片形式展示每个需求
- ✅ 显示活动类型、时间、地点、简要描述、发布者头像
- ✅ 支持下拉刷新和上拉加载更多
- ✅ 点击卡片跳转到详情页

### 2. 详情页 (pages/detail/detail.vue)
- ✅ 展示需求的完整信息
- ✅ 显示发布者信息
- ✅ "获取微信号"按钮 - 点击后显示发布者注册时填写的微信号
- ✅ 一键复制微信号
- ✅ 返回列表功能

### 3. 发布页 (pages/publish/publish.vue)
- ✅ 活动类型选择（看展/聚餐/运动/电影/其他）
- ✅ 活动地点输入
- ✅ 活动时间选择（日期+时间）
- ✅ 详细描述（文本框）
- ✅ 费用说明（如AA、免费等）
- ✅ 表单验证
- ✅ 发布成功后跳转到首页

### 4. 个人中心页 (pages/profile/profile.vue)
- ✅ 用户注册/登录功能
- ✅ 填写个人信息：昵称、头像、微信号（必填，用于他人联系）
- ✅ 查看我发布的需求列表
- ✅ 编辑个人信息
- ✅ 删除我的需求

## 项目结构（HBuilderX 标准结构）

```
MateMatch/
├── uniCloud-aliyun/          # 阿里云云开发目录
│   ├── cloudfunctions/       # 云函数目录
│   │   ├── getPost/          # 获取帖子详情
│   │   ├── queryPosts/       # 查询帖子列表
│   │   └── toggleFavorite/   # 收藏功能
│   └── database/             # 云数据库配置
│       └── db_init.json      # 数据库初始化文件
├── pages/                    # 页面目录（每个页面一个文件夹）
│   ├── index/
│   │   └── index.vue         # 首页/论坛页
│   ├── detail/
│   │   └── detail.vue        # 需求详情页
│   ├── publish/
│   │   └── publish.vue       # 发布需求页
│   └── profile/
│       └── profile.vue       # 个人中心页
├── components/               # 公共组件目录
│   └── PostCard.vue          # 帖子卡片组件
├── static/                   # 静态资源目录
│   └── images/               # 图标和图片
│       ├── home.png
│       ├── home-active.png
│       ├── publish.png
│       ├── publish-active.png
│       ├── profile.png
│       ├── profile-active.png
│       └── avatar-default.png
├── api/                      # API 封装
│   ├── index.ts              # 本地存储 API
│   ├── aliyunApi.js          # HTTP 云函数调用
│   └── cloudApi.js           # uniCloud 云函数调用
├── utils/                    # 工具函数
│   ├── util.ts               # 通用工具函数
│   ├── mock.ts               # Mock 数据
│   ├── time.js               # 时间格式化
│   └── distance.js           # 距离计算
├── types/                    # TypeScript 类型定义
│   ├── need.ts               # 需求类型
│   └── user.ts               # 用户类型
├── App.vue                   # 应用入口组件
├── main.js                   # 主入口文件
├── manifest.json             # 应用配置（appid、平台配置等）
├── pages.json                # 页面路由配置
├── uni.scss                  # 全局样式变量
├── vite.config.js            # Vite 配置
├── package.json              # 项目依赖
├── tsconfig.json             # TypeScript 配置
└── README.md                 # 本文档
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

包含页面路由配置和 TabBar 配置：
- 每个页面路径必须以 `pages/` 开头
- TabBar 图标路径指向 `static/images/`

### uni.scss

包含全局 SCSS 变量，如主题色、间距、字体大小等：
- 主题色：`$uni-color-primary: #4CAF93`
- 单位：使用 rpx 实现多端适配

## 数据说明

### 本地存储模式

项目使用本地存储模拟后端数据库：

- **needs**: 存储所有需求信息
- **userInfo**: 存储当前用户信息

初次启动会自动加载 mock 数据，包含 3 条示例需求。

### 云开发模式（可选）

如果使用 uniCloud 云开发，需要：

1. 在 HBuilderX 中创建 uniCloud 服务空间
2. 关联项目到服务空间
3. 上传云函数到 `uniCloud-aliyun/cloudfunctions/`
4. 初始化数据库结构（参考 `db_init.json`）
5. 在代码中使用 `cloudApi.js` 替代本地 API

#### 云函数列表

- **queryPosts**: 查询帖子列表（支持分页、筛选、距离计算）
- **getPost**: 获取帖子详情
- **toggleFavorite**: 切换收藏状态

#### 数据库集合

- **posts**: 帖子/需求集合
- **users**: 用户集合
- **favorites**: 收藏关系集合

## UI 设计

- **主色调**: #4CAF93 (清新的蓝绿色)
- **设计风格**: 卡片式设计，圆角阴影
- **图标**: 使用 Emoji 和图片图标
- **整体风格**: 年轻、活泼、友好
- **单位**: 全部使用 rpx 实现多端适配

## 代码规范

### Vue 3 规范
- 使用 Vue 3 Composition API (`<script setup>`)
- 使用 TypeScript 进行类型约束
- 页面和组件使用 `<script setup lang="ts">` 语法

### 样式规范
- 样式使用 `<style lang="scss" scoped>`
- 单位使用 `rpx` 以适配多端
- 引入全局样式变量：`@import '@/uni.scss'`

### 命名规范
- 组件命名使用 PascalCase
- 文件命名使用 kebab-case
- 变量命名使用 camelCase
- 数据库字段使用 snake_case

### 注释规范
- 关键函数添加 JSDoc 注释
- 复杂逻辑添加行内注释
- 使用中文注释说明业务逻辑

## 多平台支持

UniApp 天然支持多端发布：

- ✅ 微信小程序
- ✅ 支付宝小程序
- ✅ 百度小程序
- ✅ 头条小程序
- ✅ H5
- ✅ App (iOS/Android)

## 从原生微信小程序迁移

本项目是从原生微信小程序完全重写而来，主要改进：

1. **跨平台支持**: 从单一微信平台到多端小程序平台
2. **技术栈升级**: 从原生小程序到 UniApp + Vue 3
3. **类型安全**: 使用 TypeScript
4. **开发体验**: Vue 3 Composition API，代码更简洁
5. **样式管理**: 统一的 SCSS 变量和全局样式
6. **云开发**: 支持 uniCloud 云函数调用
7. **项目结构**: 符合 HBuilderX 标准项目结构

## 注意事项

1. 本项目使用本地存储模拟数据持久化，适用于演示和学习
2. 生产环境建议接入真实后端服务或 uniCloud 云开发
3. 微信号等敏感信息需要谨慎处理
4. 多平台发布时注意各平台的API差异
5. 确保所有图标资源路径正确（使用 `static/` 目录）

## 开发计划

- [x] 基础架构搭建（HBuilderX 标准结构）
- [x] 首页/论坛页（Vue 3 Composition API）
- [x] 详情页（Vue 3 Composition API）
- [x] 发布页（Vue 3 Composition API）
- [x] 个人中心页（Vue 3 Composition API）
- [x] 使用 UniApp + Vue 3 重写
- [x] TypeScript 类型支持
- [x] 样式使用 rpx 单位
- [x] 云函数迁移到 uniCloud
- [x] 组件使用 Composition API
- [ ] 完整的云开发集成测试
- [ ] 地理位置功能完善
- [ ] 搜索和筛选功能
- [ ] 消息通知功能

## License

MIT License

---

**MateMatch** - 找到你的临时搭子，让生活更有趣！

使用 UniApp + Vue 3 重写，支持多端小程序平台 🚀
