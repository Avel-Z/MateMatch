/**
 * 工具函数模块
 * 提供时间格式化、ID生成、Toast提示等通用功能
 * 修复 iOS 时间解析兼容问题
 */

/**
 * 格式化数字为两位数
 */
const formatNumber = (n: number): string => {
  const str = n.toString()
  return str.length === 1 ? `0${str}` : str
}

/**
 * 【新增】兼容 iOS 的时间解析函数
 * @param timeStr 时间字符串/时间戳/Date对象
 * @returns 标准 Date 对象
 */
const parseCompatibleDate = (timeStr: string | number | Date): Date => {
  if (timeStr instanceof Date) {
    return timeStr;
  }
  
  let date: Date;
  if (typeof timeStr === 'number') {
    // 时间戳直接解析（全端兼容）
    date = new Date(timeStr);
  } else {
    // 修复 iOS 不支持 "yyyy-MM-dd HH:mm:ss" 格式
    const iosCompatibleStr = timeStr.replace(/ /g, 'T').replace(/-/g, '/');
    date = new Date(iosCompatibleStr);
  }
  
  // 解析失败兜底
  if (isNaN(date.getTime())) {
    return new Date();
  }
  return date;
}

/**
 * 格式化时间为 YYYY-MM-DD HH:mm:ss（改造）
 * @param time 时间字符串/时间戳/Date 对象
 */
export const formatTime = (time: string | number | Date): string => {
  // 替换原有 date 参数，改用兼容解析
  const date = parseCompatibleDate(time);
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('-')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

/**
 * 格式化日期为 YYYY-MM-DD（改造）
 * @param time 时间字符串/时间戳/Date 对象
 */
export const formatDate = (time: string | number | Date): string => {
  // 替换原有 date 参数，改用兼容解析
  const date = parseCompatibleDate(time);
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  return `${[year, month, day].map(formatNumber).join('-')}`
}

/**
 * 格式化时间为 HH:mm（改造）
 * @param time 时间字符串/时间戳/Date 对象
 */
export const formatTimeOnly = (time: string | number | Date): string => {
  // 替换原有 date 参数，改用兼容解析
  const date = parseCompatibleDate(time);
  const hour = date.getHours()
  const minute = date.getMinutes()
  
  return `${[hour, minute].map(formatNumber).join(':')}`
}

/**
 * 生成唯一ID（无需修改）
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

/**
 * 显示Toast提示（无需修改）
 */
export const showToast = (title: string, icon: 'success' | 'error' | 'none' = 'none'): void => {
  uni.showToast({
    title,
    icon,
    duration: 2000
  })
}

/**
 * 显示加载提示（无需修改）
 */
export const showLoading = (title: string = '加载中...'): void => {
  uni.showLoading({
    title,
    mask: true
  })
}

/**
 * 隐藏加载提示（无需修改）
 */
export const hideLoading = (): void => {
  uni.hideLoading()
}