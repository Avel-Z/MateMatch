'use strict';
const db = uniCloud.database();
exports.main = async (event, context) => {
  const {username, password, nickname, avatar} = event;
  // 检查用户是否已存在
  const userInfo = await db.collection('users').where({username}).get();
  if (userInfo.data.length > 0) {
    return {code: 1, msg: '用户已存在'};
  }
  // 新增用户
  const result = await db.collection('users').add({
    username, 
    password, 
    nickname: nickname || username,
    avatar: avatar || '',
    createTime: Date.now(),
    score: 0,
    status: 1
  });
  return {code: 0, msg: '注册成功', data: {_id: result.id}};
};