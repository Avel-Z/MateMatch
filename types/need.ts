/**
 * 需求类型定义
 */

export interface Need {
  id: string
  type: string
  title: string
  location: string
  date: string
  time: string
  description: string
  cost: string
  publisherId: string
  publisherName: string
  publisherAvatar: string
  wechatId: string
  createTime: string
  status: 'active' | 'inactive'
}

export interface CreateNeedData {
  type: string
  title: string
  location: string
  date: string
  time: string
  description: string
  cost: string
}
