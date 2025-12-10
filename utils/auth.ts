import { LoginParams } from '@/types/index';

export default class Auth {
  private static USER_KEY = 'user_id'; // 本地存储用户ID的key

  /**
   * 初始化登录（跨端兼容：小程序自动登录 / Web账号密码登录）
   */
  static async initLogin(webLoginInfo?: LoginParams): Promise<string> {
    // 优先读取本地已登录的user_id
    const localUserId = uni.getStorageSync(this.USER_KEY);
    if (localUserId) return localUserId;

    // 环境判断
    const systemInfo = uni.getSystemInfoSync();
    const isH5 = ['h5', 'browser'].includes(systemInfo.platform);
    const isMpWeixin = typeof uni.getAccountInfoSync === 'function' && uni.getAccountInfoSync()?.miniProgram?.appId;

    try {
      let userId = '';
      // 微信小程序端：自动登录（调用 UniCloud 云函数）
      if (isMpWeixin) {
        userId = await this.wechatLogin();
      }
      // Web端：账号密码登录
      else if (isH5) {
        if (!webLoginInfo?.username || !webLoginInfo.password) {
          throw new Error('Web端请输入账号密码');
        }
        userId = await this.webAccountLogin(webLoginInfo);
      }
      // 其他环境：测试ID
      else {
        userId = 'test_user_001';
        console.warn('非小程序/Web环境，使用测试ID');
      }

      uni.setStorageSync(this.USER_KEY, userId);
      return userId;
    } catch (err) {
      uni.showToast({ title: `登录失败：${(err as Error).message}`, icon: 'none' });
      throw err;
    }
  }

  /**
   * 微信小程序登录（调用 UniCloud 云函数）
   */
  private static async wechatLogin(): Promise<string> {
    const { code } = await uni.login();
    if (!code) throw new Error('获取微信登录凭证失败');

    const { result } = await uniCloud.callFunction({
      name: 'auth', // 小程序登录云函数名
      data: { code }
    });

    if (result.code !== 0) throw new Error(result.msg || '微信登录失败');
    return result.data.user_id;
  }

  /**
   * Web端账号密码登录（调用 UniCloud 云函数）
   */
  private static async webAccountLogin({ username, password }: LoginParams): Promise<string> {
    const { result } = await uniCloud.callFunction({
      name: 'web-auth', // Web登录云函数名
      data: { username, password }
    });

    if (result.code !== 0) throw new Error(result.msg || '账号密码错误');
    return result.data.user_id;
  }

  /**
   * 获取当前登录用户ID
   */
  static getUserId(): string {
    return uni.getStorageSync(this.USER_KEY) || '';
  }

  /**
   * 退出登录（清除本地缓存）
   */
  static logout(): void {
    uni.removeStorageSync(this.USER_KEY);
  }
}