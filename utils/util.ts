/**
 * 工具函数模块
 * 提供时间格式化、ID生成、Toast提示等通用功能
 */

/**
 * 格式化数字为两位数
 */
const formatNumber = (n: number): string => {
  const str = n.toString()
  return str.length === 1 ? `0${str}` : str
}

/**
 * 格式化时间为 YYYY-MM-DD HH:mm:ss
 */
export const formatTime = (date: Date): string => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('-')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  return `${[year, month, day].map(formatNumber).join('-')}`
}

/**
 * 格式化时间为 HH:mm
 */
export const formatTimeOnly = (date: Date): string => {
  const hour = date.getHours()
  const minute = date.getMinutes()
  
  return `${[hour, minute].map(formatNumber).join(':')}`
}

/**
 * 生成唯一ID
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

/**
 * 显示Toast提示
 */
export const showToast = (title: string, icon: 'success' | 'error' | 'none' = 'none'): void => {
  uni.showToast({
    title,
    icon,
    duration: 2000
  })
}

/**
 * 显示加载提示
 */
export const showLoading = (title: string = '加载中...'): void => {
  uni.showLoading({
    title,
    mask: true
  })
}

/**
 * 隐藏加载提示
 */
export const hideLoading = (): void => {
  uni.hideLoading()
}
