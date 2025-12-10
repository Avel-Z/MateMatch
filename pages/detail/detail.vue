<template>
  <view class="container">
    <view class="detail-card card">
      <!-- 类型和时间 -->
      <view class="header">
        <view class="type-tag tag tag-primary">{{ need.type }}</view>
        <view class="time-info text-gray">{{ need.date }} {{ need.time }}</view>
      </view>
      
      <!-- 标题 -->
      <view class="title">{{ need.title }}</view>
      
      <!-- 位置 -->
      <view class="info-item">
        <text class="icon">📍</text>
        <text class="label">活动地点：</text>
        <text class="value">{{ need.location }}</text>
      </view>
      
      <!-- 时间 -->
      <view class="info-item">
        <text class="icon">🕒</text>
        <text class="label">活动时间：</text>
        <text class="value">{{ need.date }} {{ need.time }}</text>
      </view>
      
      <!-- 费用 -->
      <view class="info-item">
        <text class="icon">💰</text>
        <text class="label">费用说明：</text>
        <text class="value text-primary">{{ need.cost }}</text>
      </view>
      
      <!-- 详细描述 -->
      <view class="description-section">
        <view class="section-title">详细描述</view>
        <view class="description-content">{{ need.description }}</view>
      </view>
      
      <!-- 发布者信息 -->
      <view class="publisher-section">
        <view class="section-title">发布者信息</view>
        <view class="publisher-info">
          <image class="avatar" :src="need.publisherAvatar" mode="aspectFill"></image>
          <view class="info">
            <view class="name">{{ need.publisherName }}</view>
            <view class="time text-gray">发布于 {{ need.createTime }}</view>
          </view>
        </view>
      </view>
      
      <!-- 获取微信号按钮 -->
      <button 
        class="btn-primary contact-btn" 
        @tap="showWechatId"
        v-if="!wechatIdVisible"
      >
        获取微信号
      </button>
      
      <!-- 微信号显示 -->
      <view v-else class="wechat-info">
        <text class="icon">💬</text>
        <text class="label">微信号：</text>
        <text class="wechat-id">{{ need.wechatId }}</text>
        <button class="copy-btn" @tap="copyWechatId">复制</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getNeedById } from '@/api/index'
import type { Need } from '@/types/need'

// 响应式数据
const need = ref<Need>({
  id: '',
  type: '',
  title: '',
  location: '',
  date: '',
  time: '',
  description: '',
  cost: '',
  publisherId: '',
  publisherName: '',
  publisherAvatar: '',
  wechatId: '',
  createTime: '',
  status: 'active'
})
const wechatIdVisible = ref(false)

/**
 * 页面加载时
 */
onLoad((options: any) => {
  const id = options.id
  if (id) {
    loadNeedDetail(id)
  } else {
    uni.showToast({
      title: '参数错误',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
})

/**
 * 加载需求详情
 */
const loadNeedDetail = (id: string) => {
  const needData = getNeedById(id)
  if (needData) {
    need.value = needData
  } else {
    uni.showToast({
      title: '需求不存在',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
}

/**
 * 显示微信号
 */
const showWechatId = () => {
  wechatIdVisible.value = true
}

/**
 * 复制微信号
 */
const copyWechatId = () => {
  uni.setClipboardData({
    data: need.value.wechatId,
    success: () => {
      uni.showToast({
        title: '微信号已复制',
        icon: 'success'
      })
    }
  })
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.container {
  background-color: $uni-bg-color;
  min-height: 100vh;
  padding: $uni-spacing-base;
}

.detail-card {
  background: $uni-bg-color-white;
  padding: $uni-spacing-lg;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $uni-spacing-lg;
}

.type-tag {
  font-weight: bold;
}

.time-info {
  font-size: $uni-font-size-sm;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: $uni-text-color;
  margin-bottom: $uni-spacing-lg;
  line-height: 1.4;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: $uni-spacing-base;
  font-size: $uni-font-size-base;
  
  .icon {
    margin-right: 8rpx;
  }
  
  .label {
    color: $uni-text-color-grey;
    margin-right: 8rpx;
  }
  
  .value {
    color: $uni-text-color;
    flex: 1;
  }
}

.description-section,
.publisher-section {
  margin-top: $uni-spacing-lg;
  padding-top: $uni-spacing-lg;
  border-top: 1rpx solid $uni-border-color;
}

.section-title {
  font-size: $uni-font-size-lg;
  font-weight: bold;
  color: $uni-text-color;
  margin-bottom: $uni-spacing-base;
}

.description-content {
  font-size: $uni-font-size-base;
  color: $uni-text-color-light;
  line-height: 1.8;
  white-space: pre-wrap;
}

.publisher-info {
  display: flex;
  align-items: center;
  
  .avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: $uni-border-radius-circle;
    margin-right: $uni-spacing-base;
  }
  
  .info {
    flex: 1;
    
    .name {
      font-size: $uni-font-size-lg;
      color: $uni-text-color;
      margin-bottom: 8rpx;
    }
    
    .time {
      font-size: $uni-font-size-sm;
    }
  }
}

.contact-btn {
  margin-top: $uni-spacing-xl;
  width: 100%;
}

.wechat-info {
  display: flex;
  align-items: center;
  margin-top: $uni-spacing-xl;
  padding: $uni-spacing-lg;
  background-color: $uni-color-primary-light;
  border-radius: $uni-border-radius-base;
  
  .icon {
    margin-right: 8rpx;
  }
  
  .label {
    color: $uni-text-color-grey;
    margin-right: 8rpx;
  }
  
  .wechat-id {
    flex: 1;
    font-size: $uni-font-size-lg;
    font-weight: bold;
    color: $uni-color-primary;
  }
  
  .copy-btn {
    padding: 8rpx 24rpx;
    font-size: $uni-font-size-sm;
    background-color: $uni-color-primary;
    color: white;
    border: none;
    border-radius: $uni-border-radius-base;
  }
}
</style>
