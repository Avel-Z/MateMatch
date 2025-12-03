<template>
  <view class="post-detail-page">
    <!-- 加载中 -->
    <view v-if="loading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 帖子详情 -->
    <view v-else-if="post" class="detail-container">
      <!-- 作者信息 -->
      <view class="author-section">
        <view class="author-info">
          <image class="avatar" :src="author?.avatarUrl || defaultAvatar" mode="aspectFill"></image>
          <view class="author-text">
            <text class="nickname">{{ author?.nickname || '匿名用户' }}</text>
            <text class="post-time">{{ formatRelTime(post.created_at) }}</text>
          </view>
        </view>
        <view class="favorite-btn" @tap="handleToggleFavorite">
          <text class="icon">{{ isFavorited ? '❤️' : '🤍' }}</text>
          <text class="count">{{ post.fav_count || 0 }}</text>
        </view>
      </view>

      <!-- 帖子内容 -->
      <view class="content-section">
        <view class="title">{{ post.title }}</view>
        <view class="description">{{ post.description }}</view>

        <!-- 帖子图片 -->
        <view v-if="post.images && post.images.length > 0" class="images">
          <image
            v-for="(img, index) in post.images"
            :key="index"
            :src="img"
            mode="aspectFill"
            class="post-image"
            @tap="previewImage(index)"
          ></image>
        </view>
      </view>

      <!-- 活动信息 -->
      <view class="info-section">
        <view class="info-item">
          <text class="label">活动时间</text>
          <text class="value">{{ formatTime(post.event_time) }}</text>
        </view>
        <view class="info-item">
          <text class="label">活动地点</text>
          <text class="value">{{ post.location_text }}</text>
        </view>
        <view v-if="post.status" class="info-item">
          <text class="label">活动状态</text>
          <text class="value status" :class="statusClass">{{ statusText }}</text>
        </view>
      </view>

      <!-- 联系方式 -->
      <view v-if="author?.wechat_id" class="contact-section">
        <view class="contact-title">联系方式</view>
        <view class="contact-item">
          <text class="label">微信号</text>
          <text class="value">{{ author.wechat_id }}</text>
          <view class="copy-btn" @tap="copyWechat">复制</view>
        </view>
      </view>
    </view>

    <!-- 错误状态 -->
    <view v-else-if="error" class="error-container">
      <text class="error-icon">⚠️</text>
      <text class="error-text">{{ error }}</text>
      <view class="retry-btn" @tap="loadPostDetail">重试</view>
    </view>
  </view>
</template>

<script>
import { api } from '@/api/aliyunApi.js';
import { formatEventTime, formatRelativeTime } from '@/utils/time.js';

export default {
  name: 'PostDetail',
  data() {
    return {
      postId: '',
      userId: '',
      post: null,
      author: null,
      isFavorited: false,
      loading: true,
      error: '',
      defaultAvatar: 'https://via.placeholder.com/50',
    };
  },
  computed: {
    statusText() {
      const statusMap = {
        open: '进行中',
        closed: '已结束',
        expired: '已过期',
      };
      return statusMap[this.post?.status] || '未知';
    },
    statusClass() {
      return this.post?.status || '';
    },
  },
  onLoad(options) {
    this.postId = options.postId;
    this.userId = uni.getStorageSync('userId') || '';
    this.loadPostDetail();
  },
  methods: {
    /**
     * 加载帖子详情
     */
    async loadPostDetail() {
      this.loading = true;
      this.error = '';

      try {
        const params = {
          postId: this.postId,
        };

        if (this.userId) {
          params.userId = this.userId;
        }

        // 调用 API 获取帖子详情
        const response = await api.getPost(params);

        if (response.code === 0) {
          this.post = response.data.post;
          this.author = response.data.author;
          this.isFavorited = response.data.is_favorited || false;
        } else if (response.code === 4004) {
          this.error = '帖子不存在';
        } else {
          throw new Error(response.msg || '加载失败');
        }
      } catch (error) {
        console.error('加载帖子详情失败:', error);
        this.error = error.message || '加载失败，请稍后重试';
      } finally {
        this.loading = false;
      }
    },

    /**
     * 切换收藏状态
     */
    async handleToggleFavorite() {
      if (!this.userId) {
        uni.showToast({
          title: '请先登录',
          icon: 'none',
        });
        return;
      }

      try {
        const newFavoriteState = !this.isFavorited;

        const response = await api.toggleFavorite({
          postId: this.postId,
          userId: this.userId,
          isFavorite: newFavoriteState,
        });

        if (response.code === 0) {
          this.isFavorited = newFavoriteState;
          this.post.fav_count = newFavoriteState
            ? (this.post.fav_count || 0) + 1
            : Math.max((this.post.fav_count || 0) - 1, 0);

          uni.showToast({
            title: newFavoriteState ? '收藏成功' : '取消收藏',
            icon: 'success',
          });
        }
      } catch (error) {
        console.error('收藏操作失败:', error);
        uni.showToast({
          title: '操作失败',
          icon: 'none',
        });
      }
    },

    /**
     * 预览图片
     */
    previewImage(index) {
      uni.previewImage({
        urls: this.post.images,
        current: index,
      });
    },

    /**
     * 复制微信号
     */
    copyWechat() {
      uni.setClipboardData({
        data: this.author.wechat_id,
        success: () => {
          uni.showToast({
            title: '已复制',
            icon: 'success',
          });
        },
      });
    },

    /**
     * 格式化时间
     */
    formatTime(time) {
      return formatEventTime(time);
    },

    /**
     * 格式化相对时间
     */
    formatRelTime(time) {
      return formatRelativeTime(time);
    },
  },
};
</script>

<style scoped>
.post-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007aff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 12px;
  font-size: 14px;
  color: #999;
}

.error-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.error-text {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

.retry-btn {
  padding: 8px 24px;
  background: #007aff;
  color: #ffffff;
  border-radius: 20px;
  font-size: 14px;
}

.detail-container {
  padding-bottom: 20px;
}

.author-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  padding: 16px;
  margin-bottom: 8px;
}

.author-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
}

.author-text {
  display: flex;
  flex-direction: column;
}

.nickname {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.post-time {
  font-size: 12px;
  color: #999;
}

.favorite-btn {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background: #f5f5f5;
  border-radius: 20px;
}

.favorite-btn .icon {
  font-size: 20px;
  margin-right: 4px;
}

.favorite-btn .count {
  font-size: 14px;
  color: #666;
}

.content-section {
  background: #ffffff;
  padding: 16px;
  margin-bottom: 8px;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: #222;
  margin-bottom: 12px;
  line-height: 1.4;
}

.description {
  font-size: 15px;
  color: #555;
  line-height: 1.6;
  margin-bottom: 16px;
}

.images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.post-image {
  width: calc(33.333% - 6px);
  height: 100px;
  border-radius: 8px;
}

.info-section {
  background: #ffffff;
  padding: 16px;
  margin-bottom: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  font-size: 14px;
  color: #999;
}

.info-item .value {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
}

.status.open {
  background: #e8f5e9;
  color: #4caf50;
}

.status.closed,
.status.expired {
  background: #ffebee;
  color: #f44336;
}

.contact-section {
  background: #ffffff;
  padding: 16px;
}

.contact-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
}

.contact-item .label {
  font-size: 14px;
  color: #999;
  margin-right: 12px;
}

.contact-item .value {
  flex: 1;
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.copy-btn {
  padding: 4px 16px;
  background: #007aff;
  color: #ffffff;
  border-radius: 16px;
  font-size: 13px;
}
</style>
