# Branch Guide - MateMatch Project

## Branch Overview

This repository contains two main versions of the MateMatch mini-program:

### 1. `main` Branch - Original Native WeChat Mini-Program

The original implementation using native WeChat mini-program code.

**Technology Stack:**
- Native WeChat Mini-Program
- WXML/WXSS/JS
- WeChat APIs (`wx.*`)

**Structure:**
```
├── app.js / app.json / app.wxss
├── pages/
│   ├── index/
│   ├── detail/
│   ├── publish/
│   └── profile/
├── utils/
└── images/
```

### 2. `new` Branch - UniApp + Vue 3 Rewrite ✨

**⭐ Complete rewrite using UniApp + Vue 3 + TypeScript**

**Technology Stack:**
- **Framework**: UniApp
- **Language**: Vue 3 (Composition API) + TypeScript
- **Build Tool**: Vite
- **Styling**: SCSS
- **Multi-Platform**: WeChat, Alipay, Baidu, Toutiao mini-programs

**Structure:**
```
├── src/
│   ├── api/              # API 模块 (TypeScript)
│   ├── pages/            # 4个页面 (Vue 3)
│   │   ├── index/
│   │   ├── detail/
│   │   ├── publish/
│   │   └── profile/
│   ├── static/           # 静态资源
│   ├── types/            # TypeScript 类型
│   ├── utils/            # 工具函数 (TypeScript)
│   ├── App.vue
│   ├── main.js
│   ├── manifest.json
│   ├── pages.json
│   └── uni.scss
├── cloud/                # 云函数 (preserved)
├── vite.config.js
├── tsconfig.json
└── package.json
```

## Quick Start Guide

### For Native WeChat Version (main branch)

```bash
git checkout main
# Open with WeChat Developer Tools
```

### For UniApp Version (new branch) ⭐

```bash
git checkout new
npm install
npm run dev:mp-weixin
# Import dist/dev/mp-weixin in WeChat Developer Tools
```

## Key Differences

| Feature | main (Native) | new (UniApp) |
|---------|---------------|--------------|
| Framework | Native WeChat | UniApp |
| Language | JavaScript | TypeScript |
| UI Components | WXML | Vue 3 SFC |
| APIs | `wx.*` | `uni.*` |
| State | `this.setData()` | Vue Reactivity |
| Multi-Platform | ❌ WeChat only | ✅ Multiple platforms |
| Type Safety | ❌ None | ✅ Full TypeScript |
| Modern Syntax | ❌ Options API | ✅ Composition API |

## Documentation

### On `new` Branch:
- **README_UNIAPP.md** - Complete setup and usage guide
- **MIGRATION_GUIDE.md** - Detailed migration documentation
- **COMPLETION_SUMMARY.md** - Task completion report

## Build Commands (new branch)

```bash
# Development
npm run dev:mp-weixin    # WeChat Mini-Program
npm run dev:mp-alipay    # Alipay Mini-Program
npm run dev:mp-baidu     # Baidu Mini-Program
npm run dev:mp-toutiao   # Toutiao Mini-Program
npm run dev:h5           # H5 Web

# Production
npm run build:mp-weixin   # Build for WeChat
npm run build:mp-alipay   # Build for Alipay
npm run build:mp-baidu    # Build for Baidu
npm run build:mp-toutiao  # Build for Toutiao
npm run build:h5          # Build for H5
```

## Migration Status

✅ **100% Complete**

All 4 pages have been successfully migrated:
- ✅ Index Page (首页/论坛)
- ✅ Detail Page (需求详情)
- ✅ Publish Page (发布需求)
- ✅ Profile Page (个人中心)

All functionality from the original version is preserved and enhanced.

## Recommendation

**Use the `new` branch** for new development:
- ✅ Modern Vue 3 syntax
- ✅ TypeScript type safety
- ✅ Multi-platform deployment
- ✅ Better maintainability
- ✅ Enhanced development experience

---

For detailed information, check out the documentation files in the `new` branch!
