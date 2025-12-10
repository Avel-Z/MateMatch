<template>
  <view class="container">
    <!-- 会话列表 -->
    <view v-if="conversations.length > 0" class="conversation-list">
      <view 
        v-for="conv in conversations" 
        :key="conv.id"
        class="conversation-item card"
        @tap="openChat(conv)"
      >
        <view class="user-info">
          <image 
            class="avatar" 
            :src="getOtherUserAvatar(conv)" 
            mode="aspectFill"
          ></image>
          <view class="info">
            <view class="top-line">
              <text class="nickname">{{ getOtherUserName(conv) }}</text>
              <text class="time text-gray">{{ formatMessageTime(conv.lastMessageTime) }}</text>
            </view>
            <view class="need-title text-gray">{{ conv.needTitle }}</view>
            <view class="last-message text-light">{{ conv.lastMessage || '暂无消息' }}</view>
          </view>
        </view>
        <view v-if="conv.unreadCount > 0" class="unread-badge">
          {{ conv.unreadCount > 99 ? '99+' : conv.unreadCount }}
        </view>
      </view>
    </view>
    
    <!-- 空状态 -->
    <view v-else class="empty-state">
      <text class="empty-icon">💬</text>
      <text class="empty-text">暂无消息</text>
      <text class="empty-hint">快去找个搭子聊聊吧~</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { getConversations } from '@/api/chat'
import { getUserInfo, getNeedById } from '@/api/index'
import type { Conversation } from '@/types/chat'
import type { UserInfo } from '@/types/user'

// 响应式数据
const conversations = ref<Conversation[]>([])
const currentUser = ref<UserInfo | null>(null)

/**
 * 页面显示时
 */
onShow(() => {
  loadConversations()
})

/**
 * 下拉刷新
 */
onPullDownRefresh(() => {
  loadConversations()
  setTimeout(() => {
    uni.stopPullDownRefresh()
  }, 1000)
})

/**
 * 加载会话列表
 */
const loadConversations = () => {
  const userInfo = getUserInfo()
  if (!userInfo) {
    uni.showToast({
      title: '请先完善个人信息',
      icon: 'none'
    })
    return
  }
  
  currentUser.value = userInfo
  conversations.value = getConversations(userInfo.id)
}

/**
 * 获取对方用户信息
 */
const getOtherUserInfo = (conv: Conversation): { avatar: string; name: string } => {
  const defaultInfo = { 
    avatar: '/static/images/avatar-default.png', 
    name: '未知用户' 
  }
  
  const user = currentUser.value
  if (!user) return defaultInfo
  
  const otherUserId = conv.participantIds.find(id => id !== user.id)
  if (!otherUserId) return defaultInfo
  
  // 优先从会话的参与者信息中获取
  if (conv.participantInfo && conv.participantInfo[otherUserId]) {
    return {
      avatar: conv.participantInfo[otherUserId].avatar,
      name: conv.participantInfo[otherUserId].name
    }
  }
  
  // 兼容旧数据：从关联的需求中获取发布者信息
  const need = getNeedById(conv.needId)
  if (need && need.publisherId === otherUserId) {
    return {
      avatar: need.publisherAvatar,
      name: need.publisherName
    }
  }
  
  return defaultInfo
}

/**
 * 获取对方用户头像
 */
const getOtherUserAvatar = (conv: Conversation): string => {
  return getOtherUserInfo(conv).avatar
}

/**
 * 获取对方用户昵称
 */
const getOtherUserName = (conv: Conversation): string => {
  return getOtherUserInfo(conv).name
}

/**
 * 格式化消息时间
 */
const formatMessageTime = (timeStr: string): string => {
  if (!timeStr) return ''
  
  const msgTime = new Date(timeStr)
  // 检查日期是否有效
  if (isNaN(msgTime.getTime())) return ''
  
  const now = new Date()
  const diff = now.getTime() - msgTime.getTime()
  
  // 1分钟内
  if (diff < 60 * 1000) {
    return '刚刚'
  }
  
  // 1小时内
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`
  }
  
  // 今天
  if (now.toDateString() === msgTime.toDateString()) {
    const hours = msgTime.getHours().toString().padStart(2, '0')
    const minutes = msgTime.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }
  
  // 昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (yesterday.toDateString() === msgTime.toDateString()) {
    return '昨天'
  }
  
  // 更早
  const month = (msgTime.getMonth() + 1).toString().padStart(2, '0')
  const day = msgTime.getDate().toString().padStart(2, '0')
  return `${month}-${day}`
}

/**
 * 打开聊天页面
 */
const openChat = (conv: Conversation) => {
  uni.navigateTo({
    url: `/pages/chat/chat?conversationId=${conv.id}`
  })
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.container {
  background-color: $uni-bg-color;
  min-height: 100vh;
}

.conversation-list {
  padding: $uni-spacing-base;
}

.conversation-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $uni-spacing-lg;
  margin-bottom: $uni-spacing-base;
  background: $uni-bg-color-white;
  
  &:active {
    background-color: $uni-bg-color-grey;
  }
}

.user-info {
  display: flex;
  align-items: center;
  flex: 1;
  overflow: hidden;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: $uni-border-radius-circle;
  margin-right: $uni-spacing-base;
  flex-shrink: 0;
}

.info {
  flex: 1;
  overflow: hidden;
}

.top-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.nickname {
  font-size: $uni-font-size-lg;
  font-weight: bold;
  color: $uni-text-color;
}

.time {
  font-size: $uni-font-size-sm;
  flex-shrink: 0;
  margin-left: $uni-spacing-sm;
}

.need-title {
  font-size: $uni-font-size-sm;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.last-message {
  font-size: $uni-font-size-base;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unread-badge {
  position: absolute;
  right: $uni-spacing-lg;
  top: $uni-spacing-lg;
  min-width: 36rpx;
  height: 36rpx;
  line-height: 36rpx;
  padding: 0 8rpx;
  background-color: #ff4444;
  color: white;
  font-size: $uni-font-size-sm;
  border-radius: 18rpx;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx $uni-spacing-base;
  
  .empty-icon {
    font-size: 120rpx;
    margin-bottom: $uni-spacing-lg;
  }
  
  .empty-text {
    font-size: $uni-font-size-xl;
    color: $uni-text-color;
    margin-bottom: $uni-spacing-base;
  }
  
  .empty-hint {
    font-size: $uni-font-size-base;
    color: $uni-text-color-grey;
  }
}

/* 通用样式类 */
.text-gray {
  color: $uni-text-color-grey;
}

.text-light {
  color: $uni-text-color-light;
}

.card {
  border-radius: $uni-border-radius-base;
  box-shadow: $uni-shadow-base;
}
</style>
