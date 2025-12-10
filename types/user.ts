export interface UserInfo {
  _id: string; // 数据库主键（用户ID），对应代码中的user_id
  nickname: string;
  avatar?: string; // 可选字段（头像）
  wechat_id: string; // 对应代码中的wechat_id
  created_at?: number; // 时间戳
  updated_at?: number; // 时间戳
}

export interface RegisterUserData {
  nickname: string;
  avatar?: string;
  wechat_id: string;
}