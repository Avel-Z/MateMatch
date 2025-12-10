# UniApp 迁移完成指南

## 迁移概述

本项目已从原生微信小程序完全重写为 **UniApp + Vue 3** 版本，支持多端小程序平台。

## 主要变更

### 1. 项目结构变更

#### 原生微信小程序结构（已备份到 `.backup-wechat/`）
```
MateMatch/
├── pages/          # 原生页面（.wxml, .wxss, .js）
├── utils/          # 工具函数
├── images/         # 图片资源
├── app.js
├── app.json
└── app.wxss
```

#### 新 UniApp 结构（当前 `new` 分支）
```
MateMatch/
├── uniCloud-aliyun/      # 云开发目录
├── pages/                # Vue 3 页面（每个页面独立文件夹）
├── components/           # 公共组件
├── static/               # 静态资源
├── api/                  # API 封装
├── utils/                # 工具函数
├── types/                # TypeScript 类型
├── App.vue               # 应用入口
├── main.js               # 主入口
├── manifest.json         # 应用配置
├── pages.json            # 页面路由配置
└── uni.scss              # 全局样式变量
```

### 2. 语法变更

#### 页面结构
**原生微信小程序**:
```xml
<!-- index.wxml -->
<view class="container">
  <text>{{title}}</text>
</view>
```

```javascript
// index.js
Page({
  data: {
    title: 'Hello'
  }
})
```

**UniApp + Vue 3**:
```vue
<template>
  <view class="container">
    <text>{{ title }}</text>
  </view>
</template>

<script setup>
import { ref } from 'vue'
const title = ref('Hello')
</script>
```

#### 样式单位
**原生**: 使用 rpx 或 px
**UniApp**: 统一使用 rpx

#### API 调用
**原生**: `wx.xxx`
**UniApp**: `uni.xxx`

例如：
- `wx.navigateTo` → `uni.navigateTo`
- `wx.getStorageSync` → `uni.getStorageSync`
- `wx.showToast` → `uni.showToast`

### 3. 云函数变更

#### 云函数位置
- **原生**: `cloud/functions/`
- **UniApp**: `uniCloud-aliyun/cloudfunctions/`

#### 云函数调用方式

**原生微信小程序**:
```javascript
wx.cloud.callFunction({
  name: 'getPost',
  data: { postId: 'xxx' }
})
```

**UniApp + uniCloud**:
```javascript
import { cloudApi } from '@/api/cloudApi.js'

const result = await cloudApi.getPost({ postId: 'xxx' })
```

或使用 uniCloud 原生 API:
```javascript
const result = await uniCloud.callFunction({
  name: 'getPost',
  data: { postId: 'xxx' }
})
```

### 4. 页面配置变更

#### 原生 app.json
```json
{
  "pages": [
    "pages/index/index",
    "pages/detail/detail"
  ],
  "tabBar": {
    "list": [...]
  }
}
```

#### UniApp pages.json
```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页"
      }
    }
  ],
  "tabBar": {
    "list": [...]
  }
}
```

## 迁移后的优势

### 1. 多端支持
- ✅ 微信小程序
- ✅ 支付宝小程序
- ✅ 百度小程序
- ✅ 头条小程序
- ✅ H5
- ✅ App (iOS/Android)

### 2. 开发体验提升
- **Vue 3 Composition API**: 更简洁的代码组织
- **TypeScript 支持**: 类型安全，减少错误
- **热重载**: 开发时实时预览
- **统一的 API**: uni.xxx 适配多端

### 3. 性能优化
- **按需编译**: 只编译目标平台代码
- **体积优化**: 移除未使用的代码
- **渲染优化**: Vue 3 的性能提升

### 4. 维护性提升
- **模块化结构**: 清晰的目录组织
- **组件化开发**: 可复用的组件
- **统一的状态管理**: 易于扩展

## 功能对比

| 功能 | 原生微信小程序 | UniApp 版本 | 状态 |
|-----|--------------|------------|------|
| 首页列表 | ✅ | ✅ | 完全迁移 |
| 详情页 | ✅ | ✅ | 完全迁移 |
| 发布页 | ✅ | ✅ | 完全迁移 |
| 个人中心 | ✅ | ✅ | 完全迁移 |
| 下拉刷新 | ✅ | ✅ | 完全迁移 |
| 上拉加载 | ✅ | ✅ | 完全迁移 |
| 本地存储 | ✅ | ✅ | 完全迁移 |
| 云函数 | ✅ | ✅ | 已迁移到 uniCloud |
| 多端支持 | ❌ | ✅ | **新增** |
| TypeScript | ❌ | ✅ | **新增** |
| 组件化 | 部分 | ✅ | **增强** |

## 如何使用

### 1. 查看原生代码（参考）
```bash
git checkout main
# 原生代码在 main 分支
```

### 2. 使用 UniApp 版本
```bash
git checkout new
# UniApp 代码在 new 分支
```

### 3. 开发新功能
在 `new` 分支上继续开发：
```bash
git checkout new
npm install
npm run dev:mp-weixin
```

### 4. 发布到多个平台
```bash
# 微信小程序
npm run build:mp-weixin

# 支付宝小程序
npm run build:mp-alipay

# H5
npm run build:h5
```

## 注意事项

### 1. 原生代码备份
原生微信小程序代码已备份到 `.backup-wechat/` 目录，该目录已添加到 `.gitignore`。

### 2. 云函数配置
如果使用 uniCloud 云开发：
1. 在 HBuilderX 中创建云服务空间
2. 关联项目到服务空间
3. 右键上传云函数
4. 配置数据库

### 3. API 密钥
确保在 `manifest.json` 中配置正确的 AppID：
- 微信小程序: `mp-weixin.appid`
- 支付宝小程序: `mp-alipay.appid`
- 其他平台类似

### 4. 静态资源
所有图片资源已迁移到 `static/images/` 目录，确保路径正确。

### 5. 本地存储
数据存储兼容性：
- `wx.setStorageSync` → `uni.setStorageSync`
- 数据格式保持一致，可以直接迁移

## 常见问题

### Q1: 如何在 HBuilderX 中运行？
A: 
1. 打开 HBuilderX
2. 文件 → 导入 → 从本地目录导入
3. 选择项目目录
4. 运行 → 运行到小程序模拟器 → 微信开发者工具

### Q2: 云函数如何调用？
A:
```javascript
// 方式 1: 使用封装的 API
import { cloudApi } from '@/api/cloudApi.js'
const result = await cloudApi.queryPosts({ page: 1 })

// 方式 2: 使用 uniCloud 原生 API
const res = await uniCloud.callFunction({
  name: 'queryPosts',
  data: { page: 1 }
})
```

### Q3: 如何添加新页面？
A:
1. 在 `pages/` 下创建新文件夹，如 `pages/newpage/`
2. 创建 `newpage.vue` 文件
3. 在 `pages.json` 中添加路由配置：
```json
{
  "path": "pages/newpage/newpage",
  "style": {
    "navigationBarTitleText": "新页面"
  }
}
```

### Q4: 如何使用 TypeScript？
A: 
在 `<script>` 标签中添加 `lang="ts"`：
```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { Need } from '@/types/need'

const needList = ref<Need[]>([])
</script>
```

### Q5: 原生小程序代码还能用吗？
A: 
原生代码在 `main` 分支保留，仅作参考。新功能请在 `new` 分支上使用 UniApp 开发。

## 后续开发建议

### 1. 使用 Composition API
推荐使用 `<script setup>` 语法，更简洁：
```vue
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const double = computed(() => count.value * 2)

const increment = () => {
  count.value++
}
</script>
```

### 2. 使用 TypeScript
为数据添加类型定义，提高代码质量：
```typescript
interface User {
  id: string
  nickname: string
  avatar: string
}

const user = ref<User | null>(null)
```

### 3. 复用组件
将重复的 UI 抽取为组件：
```vue
<!-- components/MyButton.vue -->
<template>
  <button class="my-btn" @click="handleClick">
    <slot></slot>
  </button>
</template>

<script setup>
const emit = defineEmits(['click'])
const handleClick = () => emit('click')
</script>
```

### 4. 使用全局样式变量
在 `uni.scss` 中定义，在组件中引用：
```scss
<style lang="scss" scoped>
@import '@/uni.scss';

.container {
  background: $uni-bg-color;
  padding: $uni-spacing-base;
}
</style>
```

## 总结

✅ 项目已完全迁移到 UniApp + Vue 3  
✅ 所有原有功能已实现  
✅ 支持多端小程序平台  
✅ 使用 TypeScript 提升开发体验  
✅ 代码结构更清晰，易于维护  

继续在 `new` 分支上开发，享受 UniApp 带来的便利！🚀
