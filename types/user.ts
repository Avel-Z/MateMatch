/**
 * 用户类型定义
 */

export interface UserInfo {
  id: string
  nickname: string
  avatar: string
  wechatId: string
  createTime: string
}

export interface RegisterUserData {
  nickname: string
  avatar: string
  wechatId: string
}
