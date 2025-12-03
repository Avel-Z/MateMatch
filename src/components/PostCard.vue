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

<script>
import { formatEventTime } from '@/utils/time.js';
import { formatDistance } from '@/utils/distance.js';

export default {
  name: 'PostCard',
  props: {
    post: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },
  data() {
    return {
      defaultAvatar: 'https://via.placeholder.com/50',
    };
  },
  methods: {
    formatTime(time) {
      return formatEventTime(time);
    },
    formatDist(meters) {
      return formatDistance(meters);
    },
    handleCardClick() {
      this.$emit('click', this.post);
    },
    handleFavoriteClick() {
      this.$emit('toggle-favorite', this.post);
    },
  },
};
</script>

<style scoped>
.post-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.author-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.nickname {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.favorite-btn {
  display: flex;
  align-items: center;
  padding: 4px 8px;
}

.favorite-btn .icon {
  font-size: 18px;
  margin-right: 4px;
}

.favorite-btn .count {
  font-size: 12px;
  color: #666;
}

.card-body {
  width: 100%;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin-bottom: 10px;
  line-height: 1.4;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #666;
}

.info-item .icon {
  margin-right: 4px;
}

.info-item .text {
  line-height: 1.2;
}

.distance {
  font-size: 12px;
  color: #999;
}

.thumbnail {
  margin-top: 12px;
  width: 100%;
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
}

.thumbnail image {
  width: 100%;
  height: 100%;
}
</style>
