'use strict';
const db = uniCloud.database();
exports.main = async (event, context) => {
  const {fromUserId, toUserId, content, type = 'text'} = event;
  
  if (!fromUserId || !toUserId || !content) {
    return {code: 1, msg: "参数缺失"};
  }
  
  // 添加消息记录
  const result = await db.collection('messages').add({
    fromUserId,
    toUserId,
    content,
    type,
    createTime: Date.now(),
    read: false
  });
  
  return {code: 0, msg: "发送成功", data: {_id: result.id}};
};