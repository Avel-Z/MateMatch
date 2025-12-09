<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
  // 初始化本地存储
  initStorage()
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})

/**
 * 初始化本地存储
 */
function initStorage() {
  // 初始化需求列表
  const needs = uni.getStorageSync('needs')
  if (!needs) {
    uni.setStorageSync('needs', [])
  }
  
  // 初始化用户信息
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
  
  &:active {
    background-color: $uni-color-primary-dark;
  }
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
