<template>
  <view class="container">
    <!-- 标题 -->
    <view class="page-title">附近的搭子</view>
    
    <!-- 需求列表 -->
    <scroll-view 
      class="need-list" 
      scroll-y 
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <view v-if="needList.length > 0">
        <view 
          v-for="item in needList" 
          :key="item.id" 
          class="need-card"
          @tap="goToDetail(item.id)"
        >
          <!-- 卡片头部 -->
          <view class="card-header">
            <view class="type-tag tag tag-primary">{{ item.type }}</view>
            <view class="time-info text-gray">{{ item.date }} {{ item.time }}</view>
          </view>
          
          <!-- 标题 -->
          <view class="card-title">{{ item.title }}</view>
          
          <!-- 位置 -->
          <view class="location">
            <text class="icon">📍</text>
            <text>{{ item.location }}</text>
          </view>
          
          <!-- 描述 -->
          <view class="description text-gray">{{ item.description }}</view>
          
          <!-- 费用 -->
          <view class="cost">
            <text class="icon">💰</text>
            <text class="text-primary">{{ item.cost }}</text>
          </view>
          
          <!-- 发布者信息 -->
          <view class="publisher">
            <image class="avatar" :src="item.publisherAvatar" mode="aspectFill"></image>
            <text class="name">{{ item.publisherName }}</text>
            <text class="time text-gray">{{ item.createTime }}</text>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-else class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无需求，快去发布一个吧！</text>
      </view>
      
      <!-- 加载更多提示 -->
      <view v-if="hasMore" class="loading-more">加载更多...</view>
      <view v-else class="no-more">没有更多了</view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { getNeeds } from '@/api/index'
import { initMockData } from '@/utils/mock'
import type { Need } from '@/types/need'

// 响应式数据
const needList = ref<Need[]>([])
const refreshing = ref(false)
const hasMore = ref(false)

/**
 * 页面加载时
 */
onMounted(() => {
  // 初始化mock数据
  initMockData()
  loadNeeds()
})

/**
 * 页面显示时
 */
onShow(() => {
  // 每次显示页面时刷新列表
  loadNeeds()
})

/**
 * 下拉刷新
 */
onPullDownRefresh(() => {
  onRefresh()
})

/**
 * 加载需求列表
 */
const loadNeeds = () => {
  const needs = getNeeds()
  needList.value = needs
  hasMore.value = false // 本地存储不需要分页
}

/**
 * 下拉刷新
 */
const onRefresh = () => {
  refreshing.value = true
  
  // 模拟刷新延迟
  setTimeout(() => {
    loadNeeds()
    refreshing.value = false
    uni.showToast({
      title: '刷新成功',
      icon: 'success'
    })
    uni.stopPullDownRefresh()
  }, 500)
}

/**
 * 上拉加载更多
 */
const onLoadMore = () => {
  // 本地存储不需要分页
  if (!hasMore.value) {
    return
  }
}

/**
 * 跳转到详情页
 */
const goToDetail = (id: string) => {
  uni.navigateTo({
    url: `/pages/detail/detail?id=${id}`
  })
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.container {
  background-color: $uni-bg-color;
  min-height: 100vh;
  padding: 0;
}

.page-title {
  font-size: $uni-font-size-xl;
  font-weight: bold;
  padding: $uni-spacing-lg $uni-spacing-base;
  color: $uni-text-color;
  background-color: $uni-bg-color-white;
}

.need-list {
  height: calc(100vh - 90rpx);
  padding: $uni-spacing-base;
}

.need-card {
  background: $uni-bg-color-white;
  border-radius: $uni-border-radius-lg;
  box-shadow: $uni-shadow-base;
  padding: $uni-spacing-lg;
  margin-bottom: $uni-spacing-base;
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $uni-spacing-base;
}

.type-tag {
  font-weight: bold;
}

.time-info {
  font-size: $uni-font-size-sm;
}

.card-title {
  font-size: $uni-font-size-lg;
  font-weight: bold;
  color: $uni-text-color;
  margin-bottom: $uni-spacing-sm;
}

.location {
  display: flex;
  align-items: center;
  margin-bottom: $uni-spacing-sm;
  color: $uni-text-color-light;
  font-size: $uni-font-size-base;
  
  .icon {
    margin-right: 4rpx;
  }
}

.description {
  font-size: $uni-font-size-base;
  line-height: 1.6;
  margin-bottom: $uni-spacing-sm;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.cost {
  display: flex;
  align-items: center;
  margin-bottom: $uni-spacing-base;
  font-size: $uni-font-size-base;
  
  .icon {
    margin-right: 4rpx;
  }
}

.publisher {
  display: flex;
  align-items: center;
  padding-top: $uni-spacing-base;
  border-top: 1rpx solid $uni-border-color;
  
  .avatar {
    width: 60rpx;
    height: 60rpx;
    border-radius: $uni-border-radius-circle;
    margin-right: $uni-spacing-sm;
  }
  
  .name {
    flex: 1;
    font-size: $uni-font-size-base;
    color: $uni-text-color;
  }
  
  .time {
    font-size: $uni-font-size-sm;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  
  .empty-icon {
    font-size: 120rpx;
    margin-bottom: $uni-spacing-lg;
  }
  
  .empty-text {
    font-size: $uni-font-size-base;
    color: $uni-text-color-grey;
  }
}

.loading-more,
.no-more {
  text-align: center;
  padding: $uni-spacing-lg 0;
  color: $uni-text-color-grey;
  font-size: $uni-font-size-sm;
}
</style>
