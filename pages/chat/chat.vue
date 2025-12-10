<template>
  <view class="container">
    <!-- 聊天头部信息 -->
    <view class="chat-header card">
      <view class="header-info">
        <image class="avatar" :src="otherUserAvatar" mode="aspectFill"></image>
        <view class="info">
          <text class="nickname">{{ otherUserName }}</text>
          <text class="need-title text-gray">关于：{{ needTitle }}</text>
        </view>
      </view>
    </view>
    
    <!-- 消息列表 -->
    <scroll-view 
      class="message-list" 
      scroll-y 
      :scroll-into-view="scrollIntoView"
      scroll-with-animation
    >
      <view v-if="messages.length === 0" class="empty-message">
        <text class="empty-icon">💬</text>
        <text class="empty-text">开始聊天吧~</text>
      </view>
      
      <view 
        v-for="msg in messages" 
        :key="msg.id"
        :id="`msg-${msg.id}`"
        class="message-item"
        :class="{ 'message-self': msg.senderId === currentUserId }"
      >
        <image 
          v-if="msg.senderId !== currentUserId"
          class="avatar" 
          :src="otherUserAvatar" 
          mode="aspectFill"
        ></image>
        
        <view class="message-content">
          <view class="message-bubble" :class="{ 'bubble-self': msg.senderId === currentUserId }">
            <text class="message-text">{{ msg.content }}</text>
          </view>
          <text class="message-time text-gray">{{ formatTime(msg.timestamp) }}</text>
        </view>
        
        <image 
          v-if="msg.senderId === currentUserId"
          class="avatar" 
          :src="currentUserAvatar" 
          mode="aspectFill"
        ></image>
      </view>
    </scroll-view>
    
    <!-- 输入框 -->
    <view class="input-bar">
      <input 
        class="message-input" 
        type="text" 
        v-model="inputMessage"
        placeholder="输入消息..."
        confirm-type="send"
        @confirm="sendMsg"
      />
      <button class="send-btn" @tap="sendMsg" :disabled="!inputMessage.trim()">
        发送
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getMessages, sendMessage, markAsRead, createOrGetConversation, getConversationById } from '@/api/chat'
import { getUserInfo, getNeedById } from '@/api/index'
import type { Message, Conversation } from '@/types/chat'
import type { UserInfo } from '@/types/user'

// 响应式数据
const messages = ref<Message[]>([])
const inputMessage = ref('')
const scrollIntoView = ref('')
const currentUserId = ref('')
const currentUserAvatar = ref('/static/images/avatar-default.png')
const otherUserId = ref('')
const otherUserName = ref('用户')
const otherUserAvatar = ref('/static/images/avatar-default.png')
const needTitle = ref('')
const conversationId = ref('')

/**
 * 页面加载时
 */
onLoad((options: any) => {
  const userInfo = getUserInfo()
  if (!userInfo) {
    uni.showToast({
      title: '请先完善个人信息',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
    return
  }
  
  currentUserId.value = userInfo.id
  currentUserAvatar.value = userInfo.avatar
  
  // 如果有会话ID，直接加载会话
  if (options.conversationId) {
    conversationId.value = options.conversationId
    loadConversation(options.conversationId)
  }
  // 如果是新会话，创建或获取会话
  else if (options.targetUserId && options.needId) {
    const needId = options.needId
    const targetUserId = options.targetUserId
    
    // 获取需求信息
    const need = getNeedById(needId)
    if (!need) {
      uni.showToast({
        title: '需求不存在',
        icon: 'none'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
      return
    }
    
    needTitle.value = need.title
    otherUserId.value = targetUserId
    otherUserName.value = need.publisherName
    otherUserAvatar.value = need.publisherAvatar
    
    // 创建或获取会话
    const result = createOrGetConversation({
      targetUserId: targetUserId,
      needId: needId,
      needTitle: need.title
    })
    
    if (result.success && result.data) {
      conversationId.value = result.data.id
      loadMessages(result.data.id)
    } else {
      uni.showToast({
        title: result.message || '创建会话失败',
        icon: 'none'
      })
    }
  } else {
    uni.showToast({
      title: '参数错误',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
})

/**
 * 加载会话信息
 */
const loadConversation = (convId: string) => {
  const conv = getConversationById(convId)
  if (!conv) {
    uni.showToast({
      title: '会话不存在',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
    return
  }
  
  needTitle.value = conv.needTitle
  
  // 获取对方用户ID
  const otherUid = conv.participantIds.find(id => id !== currentUserId.value)
  if (otherUid) {
    otherUserId.value = otherUid
    
    // 优先从会话的参与者信息中获取
    if (conv.participantInfo && conv.participantInfo[otherUid]) {
      otherUserName.value = conv.participantInfo[otherUid].name
      otherUserAvatar.value = conv.participantInfo[otherUid].avatar
    } else {
      // 兼容旧数据：从需求中获取用户信息（只查询一次）
      const need = getNeedById(conv.needId)
      if (need && need.publisherId === otherUid) {
        otherUserName.value = need.publisherName
        otherUserAvatar.value = need.publisherAvatar
      }
    }
  }
  
  loadMessages(convId)
  
  // 标记消息已读
  markAsRead(convId, currentUserId.value)
}

/**
 * 加载消息列表
 */
const loadMessages = (convId: string) => {
  messages.value = getMessages(convId)
  scrollToBottom()
}

/**
 * 发送消息
 */
const sendMsg = () => {
  const content = inputMessage.value.trim()
  if (!content) return
  
  if (!conversationId.value || !otherUserId.value) {
    uni.showToast({
      title: '会话信息错误',
      icon: 'none'
    })
    return
  }
  
  const result = sendMessage({
    conversationId: conversationId.value,
    receiverId: otherUserId.value,
    content: content
  })
  
  if (result.success && result.data) {
    messages.value.push(result.data)
    inputMessage.value = ''
    scrollToBottom()
  } else {
    uni.showToast({
      title: result.message || '发送失败',
      icon: 'none'
    })
  }
}

/**
 * 滚动到底部
 */
const scrollToBottom = () => {
  nextTick(() => {
    if (messages.value.length > 0) {
      const lastMsg = messages.value[messages.value.length - 1]
      scrollIntoView.value = `msg-${lastMsg.id}`
    }
  })
}

/**
 * 格式化时间
 */
const formatTime = (timeStr: string): string => {
  if (!timeStr) return ''
  
  const msgTime = new Date(timeStr)
  // 检查日期是否有效
  if (isNaN(msgTime.getTime())) return ''
  
  const hours = msgTime.getHours().toString().padStart(2, '0')
  const minutes = msgTime.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $uni-bg-color;
}

.chat-header {
  padding: $uni-spacing-base;
  background: $uni-bg-color-white;
  margin-bottom: $uni-spacing-base;
}

.header-info {
  display: flex;
  align-items: center;
  
  .avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: $uni-border-radius-circle;
    margin-right: $uni-spacing-base;
  }
  
  .info {
    flex: 1;
    
    .nickname {
      display: block;
      font-size: $uni-font-size-lg;
      font-weight: bold;
      color: $uni-text-color;
      margin-bottom: 6rpx;
    }
    
    .need-title {
      display: block;
      font-size: $uni-font-size-sm;
    }
  }
}

.message-list {
  flex: 1;
  padding: $uni-spacing-base;
  overflow-y: auto;
}

.empty-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
  
  .empty-icon {
    font-size: 100rpx;
    margin-bottom: $uni-spacing-lg;
  }
  
  .empty-text {
    font-size: $uni-font-size-lg;
    color: $uni-text-color-grey;
  }
}

.message-item {
  display: flex;
  margin-bottom: $uni-spacing-lg;
  
  &.message-self {
    flex-direction: row-reverse;
  }
  
  .avatar {
    width: 70rpx;
    height: 70rpx;
    border-radius: $uni-border-radius-circle;
    flex-shrink: 0;
  }
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 500rpx;
  margin: 0 $uni-spacing-base;
  
  .message-self & {
    align-items: flex-end;
  }
}

.message-bubble {
  padding: $uni-spacing-base $uni-spacing-lg;
  background-color: $uni-bg-color-white;
  border-radius: $uni-border-radius-base;
  word-break: break-all;
  
  &.bubble-self {
    background-color: $uni-color-primary;
    
    .message-text {
      color: white;
    }
  }
}

.message-text {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  line-height: 1.5;
}

.message-time {
  font-size: $uni-font-size-sm;
  margin-top: 8rpx;
}

.input-bar {
  display: flex;
  align-items: center;
  padding: $uni-spacing-base;
  background-color: $uni-bg-color-white;
  border-top: 1rpx solid $uni-border-color;
}

.message-input {
  flex: 1;
  height: 70rpx;
  padding: 0 $uni-spacing-base;
  background-color: $uni-bg-color-grey;
  border-radius: $uni-border-radius-lg;
  font-size: $uni-font-size-base;
}

.send-btn {
  margin-left: $uni-spacing-base;
  padding: 0 $uni-spacing-xl;
  height: 70rpx;
  line-height: 70rpx;
  background-color: $uni-color-primary;
  color: white;
  border: none;
  border-radius: $uni-border-radius-lg;
  font-size: $uni-font-size-base;
  
  &[disabled] {
    background-color: $uni-text-color-grey;
    opacity: 0.6;
  }
}

/* 通用样式类 */
.text-gray {
  color: $uni-text-color-grey;
}

.card {
  box-shadow: $uni-shadow-base;
}
</style>
