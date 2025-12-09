/**
 * Mock 数据模块
 * 提供初始示例数据
 */

import type { Need } from '@/types/need'

/**
 * 模拟需求数据
 */
export const mockNeeds: Need[] = [
  {
    id: '1',
    type: '看展',
    title: '周末一起看艺术展',
    location: '北京798艺术区',
    date: '2024-12-08',
    time: '14:00',
    description: '想找个人一起去看当代艺术展，有兴趣的朋友一起呀！最近有个很不错的展览，想找个志同道合的朋友一起欣赏。',
    cost: 'AA制，门票约80元',
    publisherId: 'user1',
    publisherName: '小明',
    publisherAvatar: '/static/images/avatar-default.png',
    wechatId: 'xiaoming123',
    createTime: '2024-12-01 10:30:00',
    status: 'active'
  },
  {
    id: '2',
    type: '聚餐',
    title: '寻找火锅搭子',
    location: '朝阳大悦城',
    date: '2024-12-10',
    time: '18:30',
    description: '一个人吃火锅太孤单，找个小伙伴一起吃火锅聊天！喜欢吃辣的优先~',
    cost: 'AA制，人均100左右',
    publisherId: 'user2',
    publisherName: '小红',
    publisherAvatar: '/static/images/avatar-default.png',
    wechatId: 'xiaohong456',
    createTime: '2024-12-02 15:20:00',
    status: 'active'
  },
  {
    id: '3',
    type: '运动',
    title: '一起打羽毛球',
    location: '奥林匹克森林公园',
    date: '2024-12-09',
    time: '10:00',
    description: '周末想打羽毛球，水平中等，找个技术相当的朋友一起切磋！',
    cost: '场地费AA，约30元/小时',
    publisherId: 'user3',
    publisherName: '阿强',
    publisherAvatar: '/static/images/avatar-default.png',
    wechatId: 'aqiang789',
    createTime: '2024-12-03 09:00:00',
    status: 'active'
  }
]

/**
 * 获取所有需求列表
 */
export const getMockNeeds = (): Need[] => {
  return mockNeeds
}

/**
 * 初始化本地存储数据
 */
export const initMockData = (): void => {
  try {
    const localNeeds = uni.getStorageSync('needs')
    if (!localNeeds || localNeeds.length === 0) {
      uni.setStorageSync('needs', mockNeeds)
    }
  } catch (e) {
    console.error('初始化数据失败', e)
  }
}
