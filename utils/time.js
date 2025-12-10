/**
 * 时间格式化工具
 * 提供活动时间和相对时间格式化功能
 */

/**
 * 格式化活动时间
 * @param {string|Date} timeStr - 时间字符串或 Date 对象
 * @returns {string} 格式化后的时间字符串（YYYY-MM-DD HH:mm）
 */
export function formatEventTime(timeStr) {
  if (!timeStr) return '';

  const date = new Date(timeStr);
  if (isNaN(date.getTime())) {
    return timeStr; // 如果无法解析，返回原字符串
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 格式化相对时间
 * @param {string|Date} date - 时间字符串或 Date 对象
 * @returns {string} 相对时间字符串（如 "3小时前"）
 */
export function formatRelativeTime(date) {
  if (!date) return '';

  const targetDate = new Date(date);
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
