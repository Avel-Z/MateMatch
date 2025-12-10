<template>
  <view class="container">
    <!-- 未登录状态 -->
    <view v-if="!isLoggedIn" class="login-section">
      <view class="welcome-card card">
        <text class="welcome-icon">👋</text>
        <view class="welcome-title">欢迎来到 MateMatch</view>
        <view class="welcome-desc">完善个人信息，开始找搭子吧！</view>
      </view>
      
      <view class="form-card card">
        <view class="form-item">
          <view class="label required">昵称</view>
          <input 
            class="input" 
            placeholder="请输入昵称" 
            v-model="formData.nickname"
            maxlength="20"
          />
        </view>
        
        <view class="form-item">
          <view class="label required">微信号</view>
          <input 
            class="input" 
            placeholder="用于他人联系你" 
            v-model="formData.wechatId"
            maxlength="30"
          />
          <view class="hint">其他人通过此微信号联系你</view>
        </view>
        
        <button class="btn-primary" @tap="onRegister">完成注册</button>
      </view>
    </view>
    
    <!-- 已登录状态 -->
    <view v-else>
      <!-- 用户信息卡片 -->
      <view class="user-card card">
        <image class="avatar" :src="userInfo?.avatar" mode="aspectFill"></image>
        <view class="user-info">
          <view class="nickname">{{ userInfo?.nickname }}</view>
          <view class="wechat-id text-gray">微信号：{{ userInfo?.wechatId }}</view>
        </view>
        <button class="edit-btn" @tap="showEditDialog">编辑</button>
      </view>
      
      <!-- 我的发布 -->
      <view class="my-needs-section">
        <view class="section-title">我的发布</view>
        
        <view v-if="myNeeds.length > 0">
          <view 
            v-for="item in myNeeds" 
            :key="item.id" 
            class="need-item card"
          >
            <view class="need-header">
              <view class="type-tag tag tag-primary">{{ item.type }}</view>
              <view class="time text-gray">{{ item.date }} {{ item.time }}</view>
            </view>
            <view class="need-title">{{ item.title }}</view>
            <view class="need-location">
              <text class="icon">📍</text>
              <text>{{ item.location }}</text>
            </view>
            <view class="actions">
              <button 
                class="action-btn edit" 
                @tap="editNeed(item.id)"
              >
                编辑
              </button>
              <button 
                class="action-btn delete" 
                @tap="deleteNeed(item.id)"
              >
                删除
              </button>
            </view>
          </view>
        </view>
        
        <view v-else class="empty-state">
          <text class="empty-icon">📝</text>
          <text class="empty-text">还没有发布任何需求</text>
          <button class="btn-secondary" @tap="goToPublish">去发布</button>
        </view>
      </view>
    </view>
    
    <!-- 编辑弹窗 -->
    <view v-if="showEdit" class="modal-mask" @tap="hideEditDialog">
      <view class="modal-content" @tap.stop>
        <view class="modal-title">编辑个人信息</view>
        
        <view class="form-item">
          <view class="label required">昵称</view>
          <input 
            class="input" 
            placeholder="请输入昵称" 
            v-model="editFormData.nickname"
            maxlength="20"
          />
        </view>
        
        <view class="form-item">
          <view class="label required">微信号</view>
          <input 
            class="input" 
            placeholder="用于他人联系你" 
            v-model="editFormData.wechatId"
            maxlength="30"
          />
        </view>
        
        <view class="modal-actions">
          <button class="btn-secondary" @tap="hideEditDialog">取消</button>
          <button class="btn-primary" @tap="onSaveEdit">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getUserInfo, saveUserInfo, updateUserInfo, getUserNeeds, deleteNeed as apiDeleteNeed } from '@/api/index'
import { showToast, showLoading, hideLoading } from '@/utils/util'
import type { UserInfo } from '@/types/user'
import type { Need } from '@/types/need'

// 响应式数据
const isLoggedIn = ref(false)
const userInfo = ref<UserInfo | null>(null)
const myNeeds = ref<Need[]>([])
const formData = ref({
  nickname: '',
  wechatId: '',
  avatar: '/static/images/avatar-default.png'
})
const showEdit = ref(false)
const editFormData = ref({
  nickname: '',
  wechatId: ''
})

/**
 * 页面加载时
 */
onMounted(() => {
  checkLoginStatus()
})

/**
 * 页面显示时
 */
onShow(() => {
  checkLoginStatus()
  if (isLoggedIn.value) {
    loadMyNeeds()
  }
})

/**
 * 检查登录状态
 */
const checkLoginStatus = () => {
  const user = getUserInfo()
  if (user) {
    isLoggedIn.value = true
    userInfo.value = user
  } else {
    isLoggedIn.value = false
  }
}

/**
 * 加载我的发布
 */
const loadMyNeeds = () => {
  if (!userInfo.value) return
  
  const needs = getUserNeeds(userInfo.value.id)
  myNeeds.value = needs
}

/**
 * 注册
 */
const onRegister = () => {
  const { nickname, wechatId } = formData.value
  
  if (!nickname || nickname.trim() === '') {
    showToast('请输入昵称')
    return
  }
  
  if (!wechatId || wechatId.trim() === '') {
    showToast('请输入微信号')
    return
  }
  
  showLoading('注册中...')
  
  const result = saveUserInfo(formData.value)
  
  hideLoading()
  
  if (result.success) {
    uni.showToast({
      title: '注册成功',
      icon: 'success'
    })
    
    setTimeout(() => {
      checkLoginStatus()
    }, 1500)
  } else {
    showToast(result.message || '注册失败')
  }
}

/**
 * 显示编辑弹窗
 */
const showEditDialog = () => {
  if (!userInfo.value) return
  
  showEdit.value = true
  editFormData.value = {
    nickname: userInfo.value.nickname,
    wechatId: userInfo.value.wechatId
  }
}

/**
 * 隐藏编辑弹窗
 */
const hideEditDialog = () => {
  showEdit.value = false
}

/**
 * 保存编辑
 */
const onSaveEdit = () => {
  const { nickname, wechatId } = editFormData.value
  
  if (!nickname || nickname.trim() === '') {
    showToast('请输入昵称')
    return
  }
  
  if (!wechatId || wechatId.trim() === '') {
    showToast('请输入微信号')
    return
  }
  
  showLoading('保存中...')
  
  const result = updateUserInfo(editFormData.value)
  
  hideLoading()
  
  if (result.success) {
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
    
    showEdit.value = false
    
    setTimeout(() => {
      checkLoginStatus()
      loadMyNeeds()
    }, 500)
  } else {
    showToast(result.message || '保存失败')
  }
}

/**
 * 编辑需求
 */
const editNeed = (id: string) => {
  uni.showModal({
    title: '提示',
    content: '编辑功能开发中，敬请期待！',
    showCancel: false
  })
}

/**
 * 删除需求
 */
const deleteNeed = (id: string) => {
  uni.showModal({
    title: '确认删除',
    content: '删除后无法恢复，确定要删除这条需求吗？',
    success: (res) => {
      if (res.confirm) {
        const result = apiDeleteNeed(id)
        
        if (result.success) {
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })
          
          loadMyNeeds()
        } else {
          showToast(result.message || '删除失败')
        }
      }
    }
  })
}

/**
 * 跳转到发布页
 */
const goToPublish = () => {
  uni.switchTab({
    url: '/pages/publish/publish'
  })
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.container {
  background-color: $uni-bg-color;
  min-height: 100vh;
  padding: $uni-spacing-base;
}

// 登录部分
.login-section {
  .welcome-card {
    text-align: center;
    padding: 60rpx $uni-spacing-lg;
    margin-bottom: $uni-spacing-base;
    
    .welcome-icon {
      font-size: 120rpx;
      display: block;
      margin-bottom: $uni-spacing-lg;
    }
    
    .welcome-title {
      font-size: $uni-font-size-xl;
      font-weight: bold;
      color: $uni-text-color;
      margin-bottom: $uni-spacing-sm;
    }
    
    .welcome-desc {
      font-size: $uni-font-size-base;
      color: $uni-text-color-grey;
    }
  }
  
  .form-card {
    padding: $uni-spacing-lg;
    
    .form-item {
      margin-bottom: $uni-spacing-lg;
      
      .label {
        font-size: $uni-font-size-base;
        color: $uni-text-color;
        margin-bottom: $uni-spacing-sm;
        font-weight: 500;
        
        &.required::before {
          content: '*';
          color: #ff4d4f;
          margin-right: 4rpx;
        }
      }
      
      .input {
        width: 100%;
        padding: $uni-spacing-base;
        font-size: $uni-font-size-base;
        border: 1rpx solid $uni-border-color;
        border-radius: $uni-border-radius-base;
        background-color: $uni-bg-color-white;
        box-sizing: border-box;
      }
      
      .hint {
        font-size: $uni-font-size-sm;
        color: $uni-text-color-grey;
        margin-top: 8rpx;
      }
    }
  }
}

// 用户信息卡片
.user-card {
  display: flex;
  align-items: center;
  padding: $uni-spacing-lg;
  margin-bottom: $uni-spacing-base;
  
  .avatar {
    width: 100rpx;
    height: 100rpx;
    border-radius: $uni-border-radius-circle;
    margin-right: $uni-spacing-base;
  }
  
  .user-info {
    flex: 1;
    
    .nickname {
      font-size: $uni-font-size-lg;
      font-weight: bold;
      color: $uni-text-color;
      margin-bottom: 8rpx;
    }
    
    .wechat-id {
      font-size: $uni-font-size-sm;
    }
  }
  
  .edit-btn {
    padding: 8rpx 24rpx;
    font-size: $uni-font-size-sm;
    background-color: $uni-color-primary-light;
    color: $uni-color-primary;
    border: none;
    border-radius: $uni-border-radius-base;
  }
}

// 我的发布
.my-needs-section {
  .section-title {
    font-size: $uni-font-size-lg;
    font-weight: bold;
    color: $uni-text-color;
    margin-bottom: $uni-spacing-base;
    padding: 0 $uni-spacing-sm;
  }
  
  .need-item {
    padding: $uni-spacing-lg;
    margin-bottom: $uni-spacing-base;
    
    .need-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: $uni-spacing-base;
    }
    
    .need-title {
      font-size: $uni-font-size-lg;
      font-weight: bold;
      color: $uni-text-color;
      margin-bottom: $uni-spacing-sm;
    }
    
    .need-location {
      display: flex;
      align-items: center;
      color: $uni-text-color-light;
      font-size: $uni-font-size-base;
      margin-bottom: $uni-spacing-base;
      
      .icon {
        margin-right: 4rpx;
      }
    }
    
    .actions {
      display: flex;
      gap: $uni-spacing-base;
      padding-top: $uni-spacing-base;
      border-top: 1rpx solid $uni-border-color;
      
      .action-btn {
        flex: 1;
        padding: 16rpx;
        font-size: $uni-font-size-sm;
        border-radius: $uni-border-radius-base;
        border: none;
        
        &.edit {
          background-color: $uni-color-primary-light;
          color: $uni-color-primary;
        }
        
        &.delete {
          background-color: #fff1f0;
          color: #ff4d4f;
        }
      }
    }
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx $uni-spacing-base;
    
    .empty-icon {
      font-size: 120rpx;
      margin-bottom: $uni-spacing-lg;
    }
    
    .empty-text {
      font-size: $uni-font-size-base;
      color: $uni-text-color-grey;
      margin-bottom: $uni-spacing-lg;
    }
  }
}

// 编辑弹窗
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  
  .modal-content {
    width: 600rpx;
    background-color: $uni-bg-color-white;
    border-radius: $uni-border-radius-lg;
    padding: $uni-spacing-lg;
    
    .modal-title {
      font-size: $uni-font-size-lg;
      font-weight: bold;
      color: $uni-text-color;
      margin-bottom: $uni-spacing-lg;
      text-align: center;
    }
    
    .form-item {
      margin-bottom: $uni-spacing-lg;
      
      .label {
        font-size: $uni-font-size-base;
        color: $uni-text-color;
        margin-bottom: $uni-spacing-sm;
        font-weight: 500;
        
        &.required::before {
          content: '*';
          color: #ff4d4f;
          margin-right: 4rpx;
        }
      }
      
      .input {
        width: 100%;
        padding: $uni-spacing-base;
        font-size: $uni-font-size-base;
        border: 1rpx solid $uni-border-color;
        border-radius: $uni-border-radius-base;
        background-color: $uni-bg-color-white;
        box-sizing: border-box;
      }
    }
    
    .modal-actions {
      display: flex;
      gap: $uni-spacing-base;
      margin-top: $uni-spacing-xl;
      
      button {
        flex: 1;
      }
    }
  }
}
</style>
