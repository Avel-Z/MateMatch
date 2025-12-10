<template>
  <view class="container">
    <text class="title">我的收藏</text>

    <!-- 加载中状态 -->
    <view class="loading" v-if="loading && list.length === 0">
      加载中...
    </view>

    <!-- 未登录提示（Web端） -->
    <view class="login-tip" v-if="!loading && !userId && isH5">
      <text>请先登录</text>
      <button @click="goToWebLogin">立即登录</button>
    </view>

    <!-- 收藏列表 -->
    <view class="fav-list" v-if="list.length > 0">
      <view class="fav-item" v-for="item in list" :key="item._id">
        <text class="fav-title" @click="goToPostDetail(item.post_id)">
          {{ item.post_info?.title || '已删除的内容' }}
        </text>
        <text class="fav-time">{{ formatTime(item.created_at) }}</text>
        <button size="mini" @click="cancelFav(item.post_id)">取消收藏</button>
      </view>
    </view>

    <!-- 无收藏/加载完成 -->
    <view class="empty" v-else-if="!loading && userId">
      暂无收藏，去发现好内容吧~
    </view>
  </view>
</template>

<script setup lang="ts">
// 正确导入生命周期
import { ref, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import Auth from '@/utils/auth';
import { Favorite } from '@/types/index';

// 响应式数据
const list = ref<Favorite[]>([]);
const loading = ref(false);
const userId = ref('');
const isH5 = ref(false);

// 页面加载初始化
onMounted(() => {
  // 环境判断
  const systemInfo = uni.getSystemInfoSync();
  isH5.value = ['h5', 'browser'].includes(systemInfo.platform);
  // 接收路由参数
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  if (currentPage.options.user_id) {
    userId.value = currentPage.options.user_id;
  }
});

// 页面显示时刷新（UniApp 页面生命周期）
onShow(() => {
  init();
});

/**
 * 初始化：检查登录状态 + 加载收藏
 */
const init = async () => {
  loading.value = true;
  try {
    // Web端：优先读缓存
    if (isH5.value) {
      userId.value = Auth.getUserId() || '';
      if (!userId.value) {
        loading.value = false;
        return;
      }
    } else {
      // 小程序端：自动登录
      userId.value = await Auth.initLogin();
    }

    // 加载收藏列表
    await getFavorites();
  } catch (err) {
    console.error('初始化失败：', err);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

/**
 * 获取收藏列表（调用 UniCloud 云函数 toggleFavorite）
 */
const getFavorites = async () => {
  if (!userId.value) return;

  try {
    const { result } = await uniCloud.callFunction({
      name: 'toggleFavorite',
      data: {
        action: 'getFavorites',
        user_id: userId.value,
        page: 1,
        pageSize: 10
      }
    });

    if (result.code === 0) {
      list.value = result.data.list || [];
    } else {
      uni.showToast({ title: result.msg || '获取收藏失败', icon: 'none' });
    }
  } catch (err) {
    console.error('获取收藏错误：', err);
    uni.showToast({ title: '网络错误', icon: 'none' });
  }
};

/**
 * 取消收藏
 */
const cancelFav = async (postId: string) => {
  if (!userId.value) {
    goToWebLogin();
    return;
  }
  if (!postId) {
    uni.showToast({ title: '参数错误', icon: 'none' });
    return;
  }

  try {
    const { result } = await uniCloud.callFunction({
      name: 'toggleFavorite',
      data: {
        action: 'toggle',
        user_id: userId.value,
        post_id: postId,
        isFavorite: false
      }
    });

    if (result.code === 0) {
      uni.showToast({ title: result.msg, icon: 'success' });
      getFavorites();
    } else {
      uni.showToast({ title: result.msg, icon: 'none' });
    }
  } catch (err) {
    console.error('取消收藏错误：', err);
    uni.showToast({ title: '网络错误', icon: 'none' });
  }
};

/**
 * 跳转到帖子详情
 */
const goToPostDetail = (postId: string) => {
  if (!postId) return;
  uni.navigateTo({ url: `/pages/detail/detail?post_id=${postId}` });
};

/**
 * Web端跳登录页
 */
const goToWebLogin = () => {
  uni.redirectTo({ url: '/pages/web-login/web-login' });
};

/**
 * 时间格式化
 */
const formatTimeDisplay = (time: number) => {
  // 直接传时间戳调用，工具函数内部已做兼容处理
  return time ? formatTime(time) : '';
};
</script>

<style scoped>
.container {
  padding: 20rpx;
  min-height: 100vh;
  background-color: #f5f5f5;
}
.title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
  color: #333;
  padding: 10rpx 0;
}
.loading {
  text-align: center;
  padding: 100rpx 0;
  color: #666;
  font-size: 28rpx;
}
.login-tip {
  text-align: center;
  padding: 80rpx 0;
}
.login-tip text {
  font-size: 28rpx;
  color: #666;
}
.login-tip button {
  margin-top: 30rpx;
  background-color: #007aff;
  color: #fff;
  height: 80rpx;
  width: 60%;
  border-radius: 40rpx;
  font-size: 30rpx;
}
.fav-list {
  margin-top: 20rpx;
}
.fav-item {
  padding: 25rpx;
  background-color: #fff;
  border-radius: 10rpx;
  margin-bottom: 15rpx;
  box-shadow: 0 2rpx 5rpx rgba(0,0,0,0.05);
}
.fav-title {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}
.fav-time {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 15rpx;
}
.fav-item button {
  background-color: #fff1f0;
  color: #ff4d4f;
  border-radius: 6rpx;
}
.empty {
  text-align: center;
  color: #999;
  margin-top: 150rpx;
  font-size: 28rpx;
}
</style>