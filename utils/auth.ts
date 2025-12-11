class Auth {
  private static readonly USER_ID_KEY = 'mate_match_user_id';
  private static readonly USER_INFO_KEY = 'mate_match_user_info';

  /**
   * 【小程序专属】微信自动登录（H5端不会编译这段代码）
   */
  // #ifdef MP-WEIXIN
  static async wxLogin(): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeoutTimer = setTimeout(() => {
        reject(new Error('微信登录超时，请检查网络'));
      }, 10000);

      uni.login({
        provider: 'weixin',
        success: (res) => {
          uniCloud.callFunction({
            name: 'auth',
            data: { action: 'wxLogin', code: res.code },
            timeout: 10000,
            success: (cloudRes) => {
              clearTimeout(timeoutTimer);
              if (cloudRes.result?.code === 0) {
                uni.setStorageSync(Auth.USER_ID_KEY, cloudRes.result.data.user_id);
                uni.setStorageSync(Auth.USER_INFO_KEY, cloudRes.result.data.user_info);
                resolve(cloudRes.result.data.user_id);
              } else {
                reject(new Error(cloudRes.result?.msg || '微信登录失败'));
              }
            },
            fail: (err) => {
              clearTimeout(timeoutTimer);
              reject(new Error(`服务器错误：${err.errMsg || '云函数调用失败'}`));
            }
          });
        },
        fail: (err) => {
          clearTimeout(timeoutTimer);
          reject(new Error(`获取微信授权失败：${err.errMsg || '请检查微信授权'}`));
        }
      });
    });
  }
  // #endif

  /**
   * 【H5专属】账号密码登录
   */
  // #ifdef H5
  static async initLogin(type: 'web', params: { username: string; password: string }): Promise<string> {
    if (type !== 'web') {
      return Promise.reject(new Error('仅支持WEB端登录'));
    }
    return this.webLogin(params.username, params.password);
  }

  static async webLogin(username: string, password: string): Promise<string> {
    if (!username || !password) {
      return Promise.reject(new Error('账号/密码不能为空'));
    }

    return new Promise((resolve, reject) => {
      const timeoutTimer = setTimeout(() => {
        reject(new Error('登录请求超时，请检查网络'));
      }, 10000);

      uniCloud.callFunction({
        name: 'web-auth',
        data: { action: 'login', username: username.trim(), password: password.trim() },
        timeout: 10000,
        success: (res) => {
          clearTimeout(timeoutTimer);
          if (res.result?.code === 0) {
            uni.setStorageSync(Auth.USER_ID_KEY, res.result.data.user_id);
            uni.setStorageSync(Auth.USER_INFO_KEY, res.result.data.user_info);
            resolve(res.result.data.user_id);
          } else {
            reject(new Error(res.result?.msg || '账号或密码错误'));
          }
        },
        fail: (err) => {
          clearTimeout(timeoutTimer);
          reject(new Error(`服务器错误：${err.errMsg || '请稍后重试'}`));
        }
      });
    });
  }

  static async webRegister(username: string, password: string, nickname: string): Promise<boolean> {
    if (!username) return Promise.reject(new Error('账号不能为空'));
    if (!password || password.length < 6) return Promise.reject(new Error('密码不少于6位'));
    if (!nickname) return Promise.reject(new Error('昵称不能为空'));

    return new Promise((resolve, reject) => {
      const timeoutTimer = setTimeout(() => {
        reject(new Error('注册请求超时，请检查网络'));
      }, 10000);

      uniCloud.callFunction({
        name: 'web-auth',
        data: { action: 'register', username: username.trim(), password: password.trim(), nickname: nickname.trim() },
        timeout: 10000,
        success: (res) => {
          clearTimeout(timeoutTimer);
          if (res.result?.code === 0) {
            resolve(true);
          } else {
            reject(new Error(res.result?.msg || '注册失败，账号已存在'));
          }
        },
        fail: (err) => {
          clearTimeout(timeoutTimer);
          reject(new Error(`服务器错误：${err.errMsg || '请稍后重试'}`));
        }
      });
    });
  }
  // #endif

  /**
   * 通用方法：获取用户ID
   */
  static getUserId(): string {
    try {
      return uni.getStorageSync(Auth.USER_ID_KEY) || '';
    } catch (e) {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(Auth.USER_ID_KEY) || '' : '';
    }
  }

  /**
   * 通用方法：获取用户信息
   */
  static getUserInfo(): {
    username?: string;
    nickname?: string;
    wechat_id?: string;
    openid?: string;
  } {
    try {
      const info = uni.getStorageSync(Auth.USER_INFO_KEY);
      return typeof info === 'object' ? info : {};
    } catch (e) {
      const info = typeof localStorage !== 'undefined' ? localStorage.getItem(Auth.USER_INFO_KEY) : null;
      return info ? JSON.parse(info) : {};
    }
  }

  /**
   * 通用方法：退出登录
   */
  static logout(): void {
    try {
      uni.removeStorageSync(Auth.USER_ID_KEY);
      uni.removeStorageSync(Auth.USER_INFO_KEY);
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(Auth.USER_ID_KEY);
        localStorage.removeItem(Auth.USER_INFO_KEY);
      }
    } catch (e) {
      console.warn('退出登录时清空缓存失败：', e);
    }
  }

  /**
   * 通用方法：校验登录态（区分平台）
   */
  static isLogin(): boolean {
    const userId = this.getUserId();
    const userInfo = this.getUserInfo();
    
    // #ifdef MP-WEIXIN
    return !!userId && !!userInfo.openid;
    // #endif

    // #ifdef H5
    return !!userId && !!userInfo.username;
    // #endif
  }
}

export default Auth;