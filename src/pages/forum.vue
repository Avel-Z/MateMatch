<template>
  <view class="forum-page">
    <!-- 分类筛选 -->
    <view class="category-filter">
      <view
        v-for="cat in categories"
        :key="cat.value"
        class="category-item"
        :class="{ active: category === cat.value }"
        @tap="selectCategory(cat.value)"
      >
        {{ cat.label }}
      </view>
    </view>

    <!-- 帖子列表 -->
    <view class="post-list">
      <!-- 加载中状态 -->
      <view v-if="loading && posts.length === 0" class="loading-container">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 空状态 -->
      <view v-else-if="!loading && posts.length === 0" class="empty-container">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无帖子</text>
        <text class="empty-hint">快来发布第一个活动吧！</text>
      </view>

      <!-- 帖子卡片列表 -->
      <view v-else class="posts-container">
        <PostCard
          v-for="post in posts"
          :key="post._id"
          :post="post"
          @click="goToDetail"
          @toggle-favorite="handleToggleFavorite"
        />
      </view>

      <!-- 加载更多提示 -->
      <view v-if="posts.length > 0" class="load-more">
        <text v-if="loadingMore" class="load-more-text">加载中...</text>
        <text v-else-if="!hasMore" class="load-more-text">没有更多了</text>
      </view>
    </view>

    <!-- 错误提示 -->
    <view v-if="error" class="error-toast">
      <text>{{ error }}</text>
    </view>
  </view>
</template>

<script>
import PostCard from '@/components/PostCard.vue';
import { api } from '@/api/aliyunApi.js';

export default {
  name: 'ForumPage',
  components: {
    PostCard,
  },
  data() {
    return {
      posts: [],
      page: 1,
      pageSize: 10,
      category: '',
      loading: false,
      loadingMore: false,
      hasMore: true,
      error: '',
      userLocation: null,
      categories: [
        { label: '全部', value: '' },
        { label: '看展', value: 'exhibition' },
        { label: '吃饭', value: 'dining' },
        { label: '运动', value: 'sports' },
        { label: '其他', value: 'other' },
      ],
    };
  },
  onLoad() {
    this.getUserLocation();
    this.loadPosts(true);
  },
  onPullDownRefresh() {
    this.refreshPosts();
  },
  onReachBottom() {
    this.loadMore();
  },
  methods: {
    /**
     * 获取用户位置
     */
    getUserLocation() {
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          this.userLocation = {
            latitude: res.latitude,
            longitude: res.longitude,
          };
        },
        fail: (err) => {
          console.warn('获取位置失败:', err);
        },
      });
    },

    /**
     * 选择分类
     */
    selectCategory(value) {
      if (this.category === value) return;
      this.category = value;
      this.refreshPosts();
    },

    /**
     * 加载帖子列表
     * @param {boolean} isRefresh - 是否是刷新操作
     */
    async loadPosts(isRefresh = false) {
      if (this.loading || this.loadingMore) return;

      if (isRefresh) {
        this.loading = true;
        this.page = 1;
        this.hasMore = true;
      } else {
        this.loadingMore = true;
      }

      try {
        const params = {
          page: this.page,
          pageSize: this.pageSize,
        };

        if (this.category) {
          params.category = this.category;
        }

        if (this.userLocation) {
          params.userLocation = this.userLocation;
        }

        // 调用 API 获取帖子列表
        const response = await api.queryPosts(params);

        if (response.code === 0) {
          const { list, hasMore } = response.data;

          if (isRefresh) {
            this.posts = list;
          } else {
            this.posts = [...this.posts, ...list];
          }

          this.hasMore = hasMore;
          this.error = '';
        } else {
          throw new Error(response.msg || '加载失败');
        }
      } catch (error) {
        console.error('加载帖子失败:', error);
        this.error = error.message || '加载失败，请稍后重试';
        setTimeout(() => {
          this.error = '';
        }, 3000);
      } finally {
        this.loading = false;
        this.loadingMore = false;
        if (isRefresh) {
          uni.stopPullDownRefresh();
        }
      }
    },

    /**
     * 刷新帖子列表
     */
    refreshPosts() {
      this.loadPosts(true);
    },

    /**
     * 加载更多帖子
     */
    loadMore() {
      if (!this.hasMore || this.loadingMore) return;
      this.page += 1;
      this.loadPosts(false);
    },

    /**
     * 跳转到帖子详情页
     */
    goToDetail(post) {
      uni.navigateTo({
        url: `/pages/post-detail?postId=${post._id}`,
      });
    },

    /**
     * 切换收藏状态
     */
    async handleToggleFavorite(post) {
      try {
        // 获取当前用户ID（需要从存储或全局状态中获取）
        const userId = uni.getStorageSync('userId') || '';
        if (!userId) {
          uni.showToast({
            title: '请先登录',
            icon: 'none',
          });
          return;
        }

        const isFavorite = !post.is_favorited;

        // 调用收藏接口
        const response = await api.toggleFavorite({
          postId: post._id,
          userId: userId,
          isFavorite: isFavorite,
        });

        if (response.code === 0) {
          // 更新本地状态
          const index = this.posts.findIndex((p) => p._id === post._id);
          if (index !== -1) {
            this.posts[index].is_favorited = isFavorite;
            this.posts[index].fav_count = isFavorite
              ? (this.posts[index].fav_count || 0) + 1
              : Math.max((this.posts[index].fav_count || 0) - 1, 0);
          }

          uni.showToast({
            title: isFavorite ? '收藏成功' : '取消收藏',
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
  },
};
</script>

<style scoped>
.forum-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
}

.category-filter {
  display: flex;
  background: #ffffff;
  padding: 12px 16px;
  margin-bottom: 8px;
  overflow-x: auto;
  white-space: nowrap;
}

.category-item {
  display: inline-block;
  padding: 6px 16px;
  margin-right: 12px;
  background: #f5f5f5;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  transition: all 0.3s;
}

.category-item.active {
  background: #007aff;
  color: #ffffff;
}

.post-list {
  padding: 0 16px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
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

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 14px;
  color: #999;
}

.posts-container {
  padding-top: 8px;
}

.load-more {
  text-align: center;
  padding: 16px 0;
}

.load-more-text {
  font-size: 13px;
  color: #999;
}

.error-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.75);
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 9999;
}
</style>
