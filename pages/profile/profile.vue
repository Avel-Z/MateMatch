<template>
  <view class="profile-container">
    <view v-if="loading" class="loading">加载中...</view>
    
    <view v-else-if="!isLogin" class="login-tip">
      <text>请先登录</text>
      <button @click="handleLogin">立即登录</button>
    </view>
    
    <view v-else class="info-container">
      <view v-if="!userInfo.wechat_id" class="tips">⚠️ 请完善微信号</view>
      <view class="title">个人信息</view>
      
      <view class="input-item">
        <text>账号：</text>
        <text class="text">{{ userInfo.username || '微信用户' }}</text>
      </view>
      <view class="input-item">
        <text>昵称：</text>
        <input v-model="userInfo.nickname" placeholder="请输入昵称" />
      </view>
      <view class="input-item">
        <text>微信号：</text>
        <input v-model="userInfo.wechat_id" placeholder="请输入微信号" />
      </view>
      
      <button @click="saveInfo" class="save-btn">保存</button>
      <button @click="logout" class="logout-btn">退出登录</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import Auth from '@/utils/auth';

const loading = ref(true);
const isLogin = ref(false);
const userInfo = ref({ username: '', nickname: '', wechat_id: '', openid: '' });
const isH5 = ref(false);

onMounted(async () => {
  // 明确标记是否为H5端
  isH5.value = process.env.VUE_APP_PLATFORM === 'h5' || uni.getSystemInfoSync().platform === 'h5';
  await initUser();
});

onShow(async () => {
  await initUser();
});

const initUser = async () => {
  loading.value = true;
  isLogin.value = Auth.isLogin();
  
  if (isLogin.value) {
    const fnName = isH5.value ? 'web-auth' : 'auth';
    try {
      const res = await uniCloud.callFunction({
        name: fnName,
        data: { action: 'getUserInfo', user_id: Auth.getUserId() }
      });
      if (res.result?.code === 0) {
        userInfo.value = res.result.data;
      }
    } catch (err) {
      console.error('加载信息失败：', err);
    }
  }
  
  loading.value = false;
};

const handleLogin = async () => {
  if (Auth.isLogin()) {
    uni.showToast({ title: '已登录，无需重复登录', icon: 'none' });
    return;
  }

  // #ifdef H5
  // H5端直接跳登录页，不执行任何微信登录逻辑
  uni.redirectTo({ url: '/pages/web-login/web-login' });
  return;
  // #endif

  // #ifdef MP-WEIXIN
  // 仅小程序端执行微信登录
  try {
    uni.showLoading({ title: '登录中...' });
    await Auth.wxLogin();
    await initUser();
    uni.hideLoading();
    uni.showToast({ title: '登录成功', icon: 'success' });
  } catch (err) {
    uni.hideLoading();
    uni.showToast({ title: '微信登录失败：' + err.message, icon: 'none', duration: 3000 });
  }
  // #endif
};

const saveInfo = async () => {
  if (!Auth.isLogin()) {
    return uni.showToast({ title: '请先登录', icon: 'none' });
  }
  
  if (!userInfo.value.nickname) {
    return uni.showToast({ title: '昵称不能为空', icon: 'none' });
  }
  
  const fnName = isH5.value ? 'web-auth' : 'auth';
  try {
    const res = await uniCloud.callFunction({
      name: fnName,
      data: {
        action: 'update',
        user_id: Auth.getUserId(),
        nickname: userInfo.value.nickname,
        wechat_id: userInfo.value.wechat_id,
        updated_at: Date.now()
      }
    });
    
    if (res.result?.code === 0) {
      uni.showToast({ title: '保存成功', icon: 'success' });
      uni.setStorageSync(Auth.USER_INFO_KEY, userInfo.value);
    } else {
      uni.showToast({ title: '保存失败：' + res.result?.msg, icon: 'none' });
    }
  } catch (err) {
    console.error('保存信息失败：', err);
    uni.showToast({ title: '服务器错误：' + err.errMsg, icon: 'none' });
  }
};

const logout = () => {
  Auth.logout();
  isLogin.value = false;
  userInfo.value = { username: '', nickname: '', wechat_id: '', openid: '' };
  uni.showToast({ title: '退出成功', icon: 'success' });
  
  if (isH5.value) {
    uni.redirectTo({ url: '/pages/web-login/web-login' });
  }
};
</script>

<style scoped>
/* 原有样式保留 */
.profile-container {
  padding: 20rpx;
  min-height: 100vh;
  background-color: #f5f5f5;
}
.loading, .login-tip {
  text-align: center;
  padding: 80rpx 0;
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
}
.info-container {
  background: #fff;
  padding: 30rpx;
  border-radius: 16rpx;
  margin: 20rpx;
}
.tips {
  background: #fff8e1;
  color: #ff9800;
  padding: 16rpx;
  border-radius: 8rpx;
  margin-bottom: 20rpx;
  font-size: 26rpx;
}
.title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 40rpx;
}
.input-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
}
.input-item text {
  width: 120rpx;
  font-size: 28rpx;
}
.input-item .text {
  color: #666;
}
.input-item input {
  flex: 1;
  font-size: 28rpx;
  color: #666;
}
.save-btn {
  background: #27AE60;
  color: #fff;
  height: 80rpx;
  border-radius: 16rpx;
  margin-top: 40rpx;
}
.logout-btn {
  background: #e74c3c;
  color: #fff;
  height: 80rpx;
  border-radius: 16rpx;
  margin-top: 20rpx;
}
</style>