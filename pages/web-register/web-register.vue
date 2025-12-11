<template>
  <view class="web-register-container">
    <view class="title">账号注册</view>

    <view class="input-item">
      <text>账号：</text>
      <input 
        v-model="username" 
        placeholder="请输入账号（字母/数字）" 
        type="text"
        trim="true"
      />
    </view>

    <view class="input-item">
      <text>密码：</text>
      <input 
        v-model="password" 
        placeholder="请输入密码（不少于6位）" 
        type="password"
      />
    </view>

    <view class="input-item">
      <text>昵称：</text>
      <input 
        v-model="nickname" 
        placeholder="请输入昵称" 
        type="text"
        trim="true"
      />
    </view>

    <button @click="handleRegister" class="register-btn" :disabled="btnDisabled">注册</button>
    <view class="login-link" @click="goToLogin">已有账号？立即登录</view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Auth from '@/utils/auth';

// 响应式数据
const username = ref('');
const password = ref('');
const nickname = ref('');
const btnDisabled = ref(false);

/**
 * 处理注册逻辑（修复传参格式）
 */
const handleRegister = async () => {
  // 基础校验
  if (!username.value) return uni.showToast({ title: '账号不能为空', icon: 'none' });
  if (!password.value || password.value.length < 6) return uni.showToast({ title: '密码不少于6位', icon: 'none' });
  if (!nickname.value) return uni.showToast({ title: '昵称不能为空', icon: 'none' });

  btnDisabled.value = true;
  try {
    // ✅ 修复：传三个独立参数，匹配Auth.ts的webRegister方法定义
    await Auth.webRegister(
      username.value.trim(),
      password.value.trim(),
      nickname.value.trim()
    );
    
    uni.showToast({ title: '注册成功', icon: 'success', duration: 1500 });
    // 注册成功跳登录页
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/web-login/web-login' });
    }, 1500);
  } catch (err) {
    uni.showToast({ title: (err as Error).message || '注册失败', icon: 'none' });
  } finally {
    btnDisabled.value = false;
  }
};

/**
 * 跳转到登录页
 */
const goToLogin = () => {
  uni.redirectTo({ url: '/pages/web-login/web-login' });
};
</script>

<style scoped>
.web-register-container {
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
.register-btn {
  background-color: #27AE60;
  color: #fff;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  margin-top: 20rpx;
}
.login-link {
  text-align: center;
  font-size: 26rpx;
  color: #007aff;
  margin-top: 30rpx;
}
</style>