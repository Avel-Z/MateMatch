/**
 * UniCloud API 封装
 * 使用 uniCloud.callFunction 调用云函数
 */

/**
 * 统一云函数调用处理
 * @param {string} name - 云函数名称
 * @param {object} data - 请求参数
 * @returns {Promise} 响应数据
 */
async function callCloudFunction(name, data = {}) {
  try {
    const res = await uniCloud.callFunction({
      name: name,
      data: data
    })
    
    // 检查响应
    if (res.result) {
      return res.result
    } else {
      throw new Error('云函数返回数据格式错误')
    }
  } catch (error) {
    console.error(`云函数调用失败 [${name}]:`, error)
    throw error
  }
}

/**
 * API 接口对象
 */
export const cloudApi = {
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
    return await callCloudFunction('queryPosts', params)
  },

  /**
   * 获取帖子详情
   * @param {object} params - 查询参数
   * @param {string} params.postId - 帖子ID
   * @param {string} params.userId - 可选，用户ID，用于判断是否已收藏
   * @returns {Promise} 帖子详情数据
   */
  async getPost(params) {
    return await callCloudFunction('getPost', params)
  },

  /**
   * 收藏/取消收藏帖子
   * @param {object} params - 参数
   * @param {string} params.postId - 帖子ID
   * @param {string} params.userId - 用户ID
   * @param {boolean} params.isFavorite - true: 收藏, false: 取消收藏
   * @returns {Promise} 操作结果
   */
  async toggleFavorite(params) {
    return await callCloudFunction('toggleFavorite', params)
  }
}

export default cloudApi
