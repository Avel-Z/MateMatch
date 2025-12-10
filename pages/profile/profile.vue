<template>
  <view class="profile-container">
    <!-- 加载中 -->
    <view v-if="loading" class="loading">登录中...</view>

    <!-- Web端未登录：显示登录提示 -->
    <view v-else-if="isH5 && !userId" class="web-login-tip">
      <text>请先登录</text>
      <button @click="goToWebLogin">立即登录</button>
    </view>

    <!-- 已登录内容 -->
    <view v-else class="info-container">
      <view class="title">个人信息</view>
      
      <!-- 我的收藏入口 -->
      <view class="nav-item" @click="goToFavorites">
        <text>我的收藏</text>
        <text class="arrow">→</text>
      </view>

      <view class="input-item">
        <text>昵称：</text>
        <input v-model="userInfo.nickname" placeholder="请输入昵称" trim="true" />
      </view>
      <view class="input-item">
        <text>微信号：</text>
        <input v-model="userInfo.wechat_id" placeholder="请输入微信号" trim="true" />
      </view>

      <button @click="saveInfo" class="save-btn">保存修改</button>
      <button @click="logout" class="logout-btn" type="warn">退出登录</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Auth from '@/utils/auth';
import { UserInfo } from '@/types/index';

// 响应式数据
const loading = ref(true);
const isH5 = ref(false);
const userId = ref('');
const userInfo = ref<UserInfo>({ _id: '', nickname: '', wechat_id: '' });

// 页面加载初始化
onMounted(async () => {
  // 环境判断
  const systemInfo = uni.getSystemInfoSync();
  isH5.value = ['h5', 'browser'].includes(systemInfo.platform);
  // 初始化用户信息
  await initUser();
});

/**
 * 初始化用户登录状态 + 加载用户信息
 */
const initUser = async () => {
  try {
    loading.value = true;
    const isMpWeixin = typeof uni.getAccountInfoSync === 'function' && uni.getAccountInfoSync()?.miniProgram?.appId;
    
    if (isMpWeixin) {
      // 小程序端：自动登录
      userId.value = await Auth.initLogin();
    } else {
      // Web端：读取本地缓存
      userId.value = Auth.getUserId().trim();
    }

    // 已登录则加载用户信息
    if (userId.value) {
      await loadUserInfo();
    }
  } catch (err) {
    console.error('初始化失败：', err);
    userId.value = '';
  } finally {
    loading.value = false;
  }
};

/**
 * 加载用户信息（调用 UniCloud 云函数）
 */
const loadUserInfo = async () => {
  try {
    const { result } = await uniCloud.callFunction({
      name: 'user-info', // 用户信息云函数名
      data: {
        action: 'getUserInfo',
        user_id: userId.value
      }
    });

    if (result.code === 0) {
      userInfo.value = result.data;
    } else if (result.code === 2) {
      uni.showToast({ title: '用户不存在', icon: 'none' });
      userId.value = '';
    } else {
      uni.showToast({ title: `加载失败：${result.msg}`, icon: 'none' });
    }
  } catch (err) {
    console.error('加载用户信息失败：', err);
    uni.showToast({ title: '加载信息失败', icon: 'none' });
  }
};

/**
 * 保存用户信息（调用 UniCloud 云函数）
 */
const saveInfo = async () => {
  // 登录状态校验
  if (!userId.value) {
    return uni.showToast({ title: '请先登录', icon: 'none' });
  }
  // 昵称非空校验
  if (!userInfo.value.nickname.trim()) {
    return uni.showToast({ title: '昵称不能为空', icon: 'none' });
  }

  try {
    const { result } = await uniCloud.callFunction({
      name: 'user-info',
      data: {
        action: 'update',
        user_id: userId.value,
        nickname: userInfo.value.nickname.trim(),
        wechat_id: userInfo.value.wechat_id.trim() || '',
        updated_at: Date.now()
      }
    });

    if (result.code === 0) {
      uni.showToast({ title: '保存成功', icon: 'success' });
    } else {
      uni.showToast({ title: `保存失败：${result.msg}`, icon: 'none' });
    }
  } catch (err) {
    console.error('保存信息失败：', err);
    uni.showToast({ title: '保存信息失败', icon: 'none' });
  }
};

/**
 * 退出登录
 */
const logout = async () => {
  try {
    Auth.logout();
    userId.value = '';
    userInfo.value = { _id: '', nickname: '', wechat_id: '' };
    uni.showToast({ title: '退出成功', icon: 'success' });

    // Web端退出后跳登录页
    if (isH5.value) {
      uni.redirectTo({ url: '/pages/web-login/web-login' });
    } else {
      // 小程序端重新初始化
      await initUser();
    }
  } catch (err) {
    console.error('退出登录失败：', err);
    uni.showToast({ title: '退出失败', icon: 'none' });
  }
};

/**
 * 跳转到收藏页
 */
const goToFavorites = () => {
  if (!userId.value) {
    return uni.showToast({ title: '请先登录', icon: 'none' });
  }
  uni.navigateTo({ url: '/pages/favorites/favorites' });
};

/**
 * Web端跳转到登录页
 */
const goToWebLogin = () => {
  uni.redirectTo({ url: '/pages/web-login/web-login' });
};
</script>

<style scoped>
.profile-container {
  padding: 20rpx;
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 加载中/未登录提示 */
.loading, .web-login-tip {
  text-align: center;
  padding: 80rpx 0;
  font-size: 28rpx;
  color: #666;
}
.web-login-tip button {
  margin-top: 30rpx;
  background-color: #007aff;
  color: #fff;
  height: 80rpx;
  width: 60%;
  border-radius: 40rpx;
  font-size: 30rpx;
}

/* 已登录信息容器 */
.info-container {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
  margin: 20rpx;
}
.title {
  font-size: 36rpx;
  font-weight: bold;
  margin: 0 0 40rpx 0;
  color: #333;
}

/* 收藏入口 */
.nav-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background-color: #f8f8f8;
  border-radius: 12rpx;
  margin-bottom: 30rpx;
}
.nav-item text:first-child {
  font-size: 32rpx;
  color: #333;
}
.arrow {
  color: #999;
  font-size: 28rpx;
}

/* 表单项 */
.input-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
}
.input-item:last-child {
  border-bottom: none;
}
.input-item text {
  width: 140rpx;
  font-size: 28rpx;
  color: #333;
}
.input-item input {
  flex: 1;
  font-size: 28rpx;
  color: #666;
  padding: 10rpx 0;
}

/* 按钮 */
.save-btn {
  margin-top: 40rpx;
  background-color: #27AE60;
  color: #fff;
  height: 80rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
}
.logout-btn {
  margin-top: 20rpx;
  background-color: #e74c3c;
  color: #fff;
  height: 80rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
}
</style>