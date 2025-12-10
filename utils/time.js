/**
 * 时间格式化工具
 * 提供活动时间和相对时间格式化功能
 * 修复 iOS 时间解析兼容问题
 */

/**
 * 【新增】兼容 iOS 的时间解析函数
 * @param timeStr 时间字符串/时间戳/Date对象
 * @returns 标准 Date 对象
 */
const parseCompatibleDate = (timeStr) => {
  if (timeStr instanceof Date) {
    return timeStr;
  }
  
  let date;
  if (typeof timeStr === 'number') {
    // 时间戳直接解析（全端兼容）
    date = new Date(timeStr);
  } else {
    // 修复 iOS 不支持 "yyyy-MM-dd HH:mm:ss" 格式：替换空格为T，横杠为/
    const iosCompatibleStr = timeStr.replace(/ /g, 'T').replace(/-/g, '/');
    date = new Date(iosCompatibleStr);
  }
  
  // 解析失败兜底
  if (isNaN(date.getTime())) {
    return new Date();
  }
  return date;
};

/**
 * 格式化活动时间（改造：调用兼容解析函数）
 * @param {string|Date|number} timeStr - 时间字符串/时间戳/Date 对象
 * @returns {string} 格式化后的时间字符串（YYYY-MM-DD HH:mm）
 */
export function formatEventTime(timeStr) {
  if (!timeStr) return '';

  // 替换原有 new Date(timeStr)，改用兼容解析
  const date = parseCompatibleDate(timeStr);
  if (isNaN(date.getTime())) {
    return typeof timeStr === 'string' ? timeStr : '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 格式化相对时间（改造：调用兼容解析函数）
 * @param {string|Date|number} date - 时间字符串/时间戳/Date 对象
 * @returns {string} 相对时间字符串（如 "3小时前"）
 */
export function formatRelativeTime(date) {
  if (!date) return '';

  // 替换原有 new Date(date)，改用兼容解析
  const targetDate = parseCompatibleDate(date);
  if (isNaN(targetDate.getTime())) {
    return '';
  }

  const now = new Date();
  const diffMs = now - targetDate;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return '刚刚';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return formatEventTime(targetDate);
  }
}