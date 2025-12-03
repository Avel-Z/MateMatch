/**
 * 阿里云 API 封装
 * 统一处理云函数调用和错误处理
 */

// 云函数基础配置
const CLOUD_BASE_URL = process.env.VUE_APP_CLOUD_BASE_URL || '';

/**
 * 统一请求处理
 * @param {string} functionName - 云函数名称
 * @param {object} data - 请求参数
 * @returns {Promise} 响应数据
 */
async function cloudRequest(functionName, data = {}) {
  try {
    // 使用 uni.request 调用云函数
    const response = await new Promise((resolve, reject) => {
      uni.request({
        url: `${CLOUD_BASE_URL}/${functionName}`,
        method: 'POST',
        data: data,
        header: {
          'Content-Type': 'application/json',
        },
        success: (res) => {
          resolve(res.data);
        },
        fail: (err) => {
          reject(err);
        },
      });
    });

    // 检查响应格式
    if (response.code === 0) {
      return response;
    } else {
      // 返回响应对象，让调用方根据 code 字段处理错误
      return response;
    }
  } catch (error) {
    console.error(`云函数调用失败 [${functionName}]:`, error);
    throw error;
  }
}

/**
 * API 接口对象
 */
export const api = {
  /**
   * 查询帖子列表
   * @param {object} params - 查询参数
   * @param {number} params.page - 页码，默认 1
   * @param {number} params.pageSize - 每页数量，默认 10
   * @param {string} params.category - 可选，分类筛选
   * @param {object} params.userLocation - 可选，用户位置 { latitude, longitude }
   * @returns {Promise} 帖子列表数据
   */
  async queryPosts(params) {
    return await cloudRequest('queryPosts', params);
  },

  /**
   * 获取帖子详情
   * @param {object} params - 查询参数
   * @param {string} params.postId - 帖子ID
   * @param {string} params.userId - 可选，用户ID，用于判断是否已收藏
   * @returns {Promise} 帖子详情数据
   */
  async getPost(params) {
    return await cloudRequest('getPost', params);
  },

  /**
   * 收藏/取消收藏帖子
   * @param {object} params - 参数
   * @param {string} params.postId - 帖子ID
   * @param {string} params.userId - 用户ID
   * @param {boolean} params.isFavorite - 是否收藏
   * @returns {Promise} 操作结果
   */
  async toggleFavorite(params) {
    return await cloudRequest('toggleFavorite', params);
  },
};

export default api;
