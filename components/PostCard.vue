<template>
  <view class="post-card" @tap="handleCardClick">
    <view class="card-header">
      <view class="author-info">
        <image class="avatar" :src="post.author?.avatarUrl || defaultAvatar" mode="aspectFill"></image>
        <text class="nickname">{{ post.author?.nickname || '匿名用户' }}</text>
      </view>
      <view class="favorite-btn" @tap.stop="handleFavoriteClick">
        <text class="icon">{{ post.is_favorited ? '❤️' : '🤍' }}</text>
        <text class="count">{{ post.fav_count || 0 }}</text>
      </view>
    </view>

    <view class="card-body">
      <view class="title">{{ post.title }}</view>
      
      <view class="info-row">
        <view class="info-item">
          <text class="icon">📅</text>
          <text class="text">{{ formatTime(post.event_time) }}</text>
        </view>
      </view>

      <view class="info-row">
        <view class="info-item">
          <text class="icon">📍</text>
          <text class="text">{{ post.location_text }}</text>
        </view>
        <view v-if="post.distance_m !== undefined" class="distance">
          <text>{{ formatDist(post.distance_m) }}</text>
        </view>
      </view>

      <view v-if="post.images && post.images.length > 0" class="thumbnail">
        <image :src="post.images[0]" mode="aspectFill"></image>
      </view>
    </view>
  </view>
</template>

<script setup>
import { formatEventTime } from '@/utils/time.js'
import { formatDistance } from '@/utils/distance.js'

// Props 定义
const props = defineProps({
  post: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

// Emits 定义
const emit = defineEmits(['click', 'toggle-favorite'])

// 默认头像
const defaultAvatar = 'https://via.placeholder.com/50'

/**
 * 格式化时间
 */
const formatTime = (time) => {
  return formatEventTime(time)
}

/**
 * 格式化距离
 */
const formatDist = (meters) => {
  return formatDistance(meters)
}

/**
 * 处理卡片点击
 */
const handleCardClick = () => {
  emit('click', props.post)
}

/**
 * 处理收藏点击
 */
const handleFavoriteClick = () => {
  emit('toggle-favorite', props.post)
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.post-card {
  background: $uni-bg-color-white;
  border-radius: $uni-border-radius-lg;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: $uni-shadow-base;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.author-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: $uni-border-radius-circle;
  margin-right: 20rpx;
}

.nickname {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  font-weight: 500;
}

.favorite-btn {
  display: flex;
  align-items: center;
  padding: 8rpx 16rpx;
}

.favorite-btn .icon {
  font-size: 36rpx;
  margin-right: 8rpx;
}

.favorite-btn .count {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-light;
}

.card-body {
  width: 100%;
}

.title {
  font-size: $uni-font-size-lg;
  font-weight: 600;
  color: $uni-text-color;
  margin-bottom: 20rpx;
  line-height: 1.4;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: $uni-text-color-light;
}

.info-item .icon {
  margin-right: 8rpx;
}

.info-item .text {
  line-height: 1.2;
}

.distance {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
}

.thumbnail {
  margin-top: 24rpx;
  width: 100%;
  height: 360rpx;
  border-radius: $uni-border-radius-base;
  overflow: hidden;
}

.thumbnail image {
  width: 100%;
  height: 100%;
}
</style>
