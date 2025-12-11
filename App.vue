<template>
  <!-- App.vue 必须有template标签（即使为空） -->
  <view id="app">
    <router-view />
  </view>
</template>

<script setup>
// 必须有script标签（uni-app 入口逻辑）
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import Auth from '@/utils/auth'

onLaunch(async () => {
  console.log('App Launch')
  initStorage()

  // #ifdef MP-WEIXIN
  // 仅微信小程序执行自动登录
  try {
    if (!Auth.isLogin()) {
      await Auth.wxLogin()
      console.log('小程序自动登录成功')
    } else {
      console.log('已有登录态，跳过自动登录')
    }
  } catch (err) {
    console.error('自动登录失败：', err.message);
  }
  // #endif

  // #ifdef H5
  console.log('H5端，跳过小程序自动登录逻辑')
  // #endif
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})

function initStorage() {
  const needs = uni.getStorageSync('needs')
  if (!needs) {
    uni.setStorageSync('needs', [])
  }
  
  const userInfo = uni.getStorageSync('userInfo')
  if (!userInfo) {
    uni.setStorageSync('userInfo', null)
  }
}
</script>

<style lang="scss">
/* 引入全局样式变量 */
@import '@/uni.scss';

/* 全局样式 */
page {
  background-color: $uni-bg-color;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 通用容器 */
.container {
  min-height: 100vh;
  padding: $uni-spacing-base;
  box-sizing: border-box;
}

/* 通用按钮样式 */
.btn-primary {
  background-color: $uni-color-primary;
  color: white;
  border-radius: $uni-border-radius-base;
  border: none;
  font-size: $uni-font-size-lg;
  padding: 24rpx;
}
.btn-primary:active {
  background-color: $uni-color-primary-dark;
}

.btn-secondary {
  background-color: $uni-bg-color-white;
  color: $uni-color-primary;
  border: 2rpx solid $uni-color-primary;
  border-radius: $uni-border-radius-base;
  font-size: $uni-font-size-lg;
  padding: 24rpx;
}

/* 通用卡片样式 */
.card {
  background: white;
  border-radius: $uni-border-radius-lg;
  box-shadow: $uni-shadow-base;
  padding: $uni-spacing-lg;
  margin-bottom: $uni-spacing-base;
}

/* 通用标签样式 */
.tag {
  display: inline-block;
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
  font-size: $uni-font-size-sm;
  margin-right: $uni-spacing-sm;
}

.tag-primary {
  background-color: $uni-color-primary-light;
  color: $uni-color-primary;
}

/* 通用文本样式 */
.text-primary {
  color: $uni-color-primary;
}

.text-gray {
  color: $uni-text-color-grey;
}

.text-dark {
  color: $uni-text-color;
}
</style>