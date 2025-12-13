<template>
  <view class="container">
    <view class="page-title">发布需求</view>
    
    <view class="form-card card">
      <form @submit.prevent="onSubmit">
        <!-- 活动类型 -->
        <view class="form-item">
          <view class="label required">活动类型</view>
          <picker 
            mode="selector" 
            :range="typeList" 
            :value="typeIndex"
            @change="onTypeChange"
          >
            <view class="picker">
              {{ typeList[typeIndex] || '请选择活动类型' }}
            </view>
          </picker>
        </view>
        
        <!-- 活动标题 -->
        <view class="form-item">
          <view class="label required">活动标题</view>
          <input 
            class="input" 
            placeholder="简短描述你的需求" 
            v-model="formData.title"
            maxlength="50"
          />
        </view>
        
        <!-- 活动地点 -->
        <view class="form-item">
          <view class="label required">活动地点</view>
          <input 
            class="input" 
            placeholder="请输入活动地点" 
            v-model="formData.location"
          />
        </view>
        
        <!-- 活动日期 -->
        <view class="form-item">
          <view class="label required">活动日期</view>
          <picker 
            mode="date" 
            :value="formData.date"
            :start="minDate"
            @change="onDateChange"
          >
            <view class="picker">
              {{ formData.date || '请选择日期' }}
            </view>
          </picker>
        </view>
        
        <!-- 活动时间 -->
        <view class="form-item">
          <view class="label required">活动时间</view>
          <picker 
            mode="time" 
            :value="formData.time"
            @change="onTimeChange"
          >
            <view class="picker">
              {{ formData.time || '请选择时间' }}
            </view>
          </picker>
        </view>
        
        <!-- 详细描述 -->
        <view class="form-item">
          <view class="label required">详细描述</view>
          <textarea 
            class="textarea" 
            placeholder="详细描述你的需求和期望..." 
            v-model="formData.description"
            maxlength="500"
          />
          <view class="text-count">{{ formData.description.length }}/500</view>
        </view>
        
        <!-- 费用说明 -->
        <view class="form-item">
          <view class="label required">费用说明</view>
          <input 
            class="input" 
            placeholder="如：AA制、免费等" 
            v-model="formData.cost"
          />
        </view>
        
        <!-- 提交按钮 -->
        <button class="btn-primary submit-btn" @tap="onSubmit">发布需求</button>
      </form>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getUserInfo, createNeed } from '@/api/index'
import { formatDate, showToast, showLoading, hideLoading } from '@/utils/util'
import type { CreateNeedData } from '@/types/need'

// 响应式数据
const typeList = ref(['看展', '聚餐', '运动', '电影', '其他'])
const typeIndex = ref<number | null>(null)
const minDate = ref('')
const formData = ref<CreateNeedData>({
  type: '',
  title: '',
  location: '',
  date: '',
  time: '',
  description: '',
  cost: ''
})

/**
 * 页面加载时
 */
onMounted(() => {
  // 设置最小日期为今天
  const today = new Date()
  minDate.value = formatDate(today)
})

/**
 * 页面显示时
 */
onShow(() => {
  // 检查用户是否已登录
  const userInfo = getUserInfo()
  if (!userInfo) {
    uni.showModal({
      title: '提示',
      content: '请先完善个人信息后再发布需求',
      confirmText: '去完善',
      success: (res) => {
        if (res.confirm) {
          uni.switchTab({
            url: '/pages/profile/profile'
          })
        }
      }
    })
  }
})

/**
 * 活动类型选择
 */
const onTypeChange = (e: any) => {
  const index = e.detail.value
  typeIndex.value = index
  formData.value.type = typeList.value[index]
}

/**
 * 日期选择
 */
const onDateChange = (e: any) => {
  formData.value.date = e.detail.value
}

/**
 * 时间选择
 */
const onTimeChange = (e: any) => {
  formData.value.time = e.detail.value
}

/**
 * 表单验证
 */
const validateForm = (): boolean => {
  const { type, title, location, date, time, description, cost } = formData.value
  
  if (!type) {
    showToast('请选择活动类型')
    return false
  }
  
  if (!title || title.trim() === '') {
    showToast('请输入活动标题')
    return false
  }
  
  if (!location || location.trim() === '') {
    showToast('请输入活动地点')
    return false
  }
  
  if (!date) {
    showToast('请选择活动日期')
    return false
  }
  
  if (!time) {
    showToast('请选择活动时间')
    return false
  }
  
  if (!description || description.trim() === '') {
    showToast('请输入详细描述')
    return false
  }
  
  if (!cost || cost.trim() === '') {
    showToast('请输入费用说明')
    return false
  }
  
  return true
}

/**
 * 提交表单
 */
const onSubmit = () => {
  // 验证表单
  if (!validateForm()) {
    return
  }
  
  // 获取用户信息（尝试从多个来源获取）
  let userInfo = null
  
  try {
    // 方式1：从本地存储获取
    userInfo = uni.getStorageSync('userInfo')
    
    // 如果是字符串，解析为JSON
    if (typeof userInfo === 'string') {
      userInfo = JSON.parse(userInfo)
    }
    
    // 方式2：调用API函数获取
    if (!userInfo) {
      userInfo = getUserInfo()
    }
    
    console.log('发布时获取的用户信息:', userInfo)
    
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
  
  // 检查用户信息是否完整
  if (!userInfo || !userInfo.userId) {
    uni.showModal({
      title: '提示',
      content: '请先完善个人信息后再发布需求',
      confirmText: '去完善',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          uni.switchTab({
            url: '/pages/profile/profile'
          })
        }
      }
    })
    return
  }
  
  showLoading('发布中...')
  
  try {
    // 准备需求数据
    const needData = {
      ...formData.value,
      id: 'need_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      userId: userInfo.userId,
      publisherName: userInfo.nickname || '匿名用户',
      publisherAvatar: userInfo.avatar || '/static/default-avatar.png',
      createTime: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
      status: 'active'
    }
    
    console.log('发布的需求数据:', needData)
    
    // 创建需求
    const result = createNeed(needData)
    
    hideLoading()
    
    if (result.success) {
      uni.showToast({
        title: '发布成功',
        icon: 'success',
        duration: 1500,
        success: () => {
          // 重置表单
          typeIndex.value = null
          formData.value = {
            type: '',
            title: '',
            location: '',
            date: '',
            time: '',
            description: '',
            cost: ''
          }
          
          // 延迟跳转
          setTimeout(() => {
            uni.switchTab({
              url: '/pages/index/index'
            })
          }, 1500)
        }
      })
    } else {
      uni.showToast({
        title: result.message || '发布失败',
        icon: 'error',
        duration: 2000
      })
    }
    
  } catch (error) {
    hideLoading()
    console.error('发布异常:', error)
    uni.showToast({
      title: '发布失败，请重试',
      icon: 'error',
      duration: 2000
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.container {
  background-color: $uni-bg-color;
  min-height: 100vh;
  padding: 0;
}

.page-title {
  font-size: $uni-font-size-xl;
  font-weight: bold;
  padding: $uni-spacing-lg $uni-spacing-base;
  color: $uni-text-color;
  background-color: $uni-bg-color-white;
}

.form-card {
  margin: $uni-spacing-base;
  padding: $uni-spacing-lg;
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
    padding: 20rpx $uni-spacing-base;  // 上下内边距从8px增加到20rpx
    font-size: $uni-font-size-base;
    border: 1rpx solid $uni-border-color;
    border-radius: $uni-border-radius-base;
    background-color: $uni-bg-color-white;
    box-sizing: border-box;
    min-height: 100rpx;  // 新增：最小高度
    line-height: 1.5;   // 新增：行高，使文字垂直居中
  }
  .picker {
    width: 100%;
    padding: $uni-spacing-base;
    font-size: $uni-font-size-base;
    border: 1rpx solid $uni-border-color;
    border-radius: $uni-border-radius-base;
    background-color: $uni-bg-color-white;
    box-sizing: border-box;
  }
  
  .picker {
    color: $uni-text-color;
    
    &:empty::before {
      content: attr(placeholder);
      color: $uni-text-color-placeholder;
    }
  }
  
  .textarea {
    width: 100%;
    padding: $uni-spacing-base;
    font-size: $uni-font-size-base;
    border: 1rpx solid $uni-border-color;
    border-radius: $uni-border-radius-base;
    background-color: $uni-bg-color-white;
    min-height: 200rpx;
    box-sizing: border-box;
  }
  
  .text-count {
    text-align: right;
    font-size: $uni-font-size-sm;
    color: $uni-text-color-grey;
    margin-top: 8rpx;
  }
}

.submit-btn {
  margin-top: $uni-spacing-xl;
  width: 100%;
}
</style>
