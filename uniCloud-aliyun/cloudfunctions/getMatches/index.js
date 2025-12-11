'use strict';
const db = uniCloud.database();
exports.main = async (event, context) => {
  const {userId} = event;
  
  if (!userId) {
    return {code: 1, msg: "参数缺失"};
  }
  
  // 获取用户的所有配对记录
  const matches = await db.collection('matches')
    .where(db.command.or([
      {userA: userId},
      {userB: userId}
    ]))
    .orderBy('matchTime', 'desc')
    .get();
  
  // 获取配对用户的详细信息
  const matchList = [];
  for (let match of matches.data) {
    const otherId = match.userA === userId ? match.userB : match.userA;
    const userRes = await db.collection('users').doc(otherId).get();
    if (userRes.data.length > 0) {
      matchList.push({
        matchId: match._id,
        matchTime: match.matchTime,
        user: userRes.data[0]
      });
    }
  }
  
  return {code: 0, data: matchList};
};