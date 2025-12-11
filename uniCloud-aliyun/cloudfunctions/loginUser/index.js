'use strict';
const db = uniCloud.database();
exports.main = async (event, context) => {
  const {username, password} = event;
  // 数据库查找用户
  const userRes = await db.collection('users').where({username, password}).get();
  if (userRes.data.length === 0) {
    return {code: 1, msg: "用户名或密码错误"};
  }
  // 返回简单用户信息（实际应用请加密token或session）
  return {code: 0, msg: "登录成功", data: userRes.data[0]};
};