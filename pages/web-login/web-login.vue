<template>
  <view class="web-login-container">
    <view class="title">账号密码登录</view>

    <view class="input-item">
      <text>账号：</text>
      <input 
        v-model="username" 
        placeholder="请输入账号" 
        type="text"
        trim="true"
      />
    </view>

    <view class="input-item">
      <text>密码：</text>
      <input 
        v-model="password" 
        placeholder="请输入密码" 
        type="password"
      />
    </view>

    <button @click="handleLogin" class="login-btn" :disabled="btnDisabled">登录</button>
    <view class="register-link" @click="goToRegister">暂无账号？立即注册</view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Auth from '@/utils/auth';
import { LoginParams } from '@/types/index';

// 响应式数据
const username = ref('');
const password = ref('');
const btnDisabled = ref(false);

// 页面加载：已登录则跳个人中心
onMounted(() => {
  const userId = Auth.getUserId();
  if (userId) {
    uni.redirectTo({ url: '/pages/profile/profile' });
  }
});

/**
 * 处理登录逻辑
 */
const handleLogin = async () => {
  // 基础校验
  if (!username.value || !password.value) {
    return uni.showToast({ title: '账号密码不能为空', icon: 'none' });
  }

  btnDisabled.value = true;
  try {
    // 调用登录工具类
    const loginParams: LoginParams = {
      username: username.value.trim(),
      password: password.value.trim()
    };
    const userId = await Auth.initLogin(loginParams);
    
    // 登录成功跳转个人中心
    uni.showToast({ title: '登录成功', icon: 'success' });
    uni.redirectTo({ url: '/pages/profile/profile' });
  } catch (err) {
    console.error('登录失败：', err);
    uni.showToast({ title: (err as Error).message || '登录失败', icon: 'none' });
  } finally {
    btnDisabled.value = false;
  }
};

/**
 * 跳转到注册页（可选）
 */
const goToRegister = () => {
  uni.redirectTo({ url: '/pages/web-register/web-register' });
};
</script>

<style scoped>
.web-login-container {
  padding: 40rpx;
  max-width: 600rpx;
  margin: 0 auto;
}
.title {
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 40rpx;
}
.input-item {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  border-bottom: 1rpx solid #eee;
  padding-bottom: 10rpx;
}
.input-item text {
  width: 120rpx;
  font-size: 28rpx;
}
.input-item input {
  flex: 1;
  font-size: 28rpx;
  padding: 10rpx 0;
}
.login-btn {
  background-color: #007aff;
  color: #fff;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  margin-top: 20rpx;
}
.register-link {
  text-align: center;
  font-size: 26rpx;
  color: #007aff;
  margin-top: 30rpx;
}
</style>