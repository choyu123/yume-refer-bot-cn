/*CMD
  command: /settle_check_result
  help:
  need_reply:
  auto_retry_time:
  folder: referral
  answer:
  keyboard:
  aliases:
  group:
CMD*/

function finishIfComplete(session) {
  if (!Libs.YumeReferral.isSettlementSessionComplete(session)) {
    Libs.YumeReferral.saveSession(session);
    return;
  }

  const records = Libs.YumeReferral.loadRecords();
  const result = Libs.YumeReferral.finalizeSettlement(records, session, Date.now());
  Libs.YumeReferral.saveRecords(records);
  Libs.YumeReferral.deleteSession(session.id);

  const currency = Libs.YumeConfig.currency();
  const points = result.settled.length * Libs.YumeConfig.referReward();
  const balance = Libs.ResourcesLib.anotherUserRes("balance", session.inviter_id);
  if (points > 0) balance.add(points);

  const stats = Libs.YumeReferral.getInviterStats(
    records,
    session.inviter_id,
    Date.now(),
    Libs.YumeConfig.observationMs()
  );

  if (result.settled.length === 0) {
    Api.sendMessage({
      chat_id: session.inviter_id,
      text: `小橘查过啦，暂时没有可结算邀请，喵~

可能是好友还没满 2 小时，或还没完成频道/群验证。`
    });
    return;
  }

  Api.sendMessage({
    chat_id: session.inviter_id,
    text: `小橘结算好啦，喵~

本次结算：${result.settled.length} 位有效好友
获得积分：${points} ${currency}
当前积分：${balance.value()} ${currency}
还有 ${stats.observing + stats.ready} 位好友正在观察中，晚点再来刷新。`
  });
}

const parts = params.split(" ");
const sessionId = parts[0];
const recordId = parts[1];
const chatId = parts[2];
const session = Libs.YumeReferral.loadSession(sessionId);

if (!session) return;

const status = options && options.result ? options.result.status : "";
const isMember = ["member", "administrator", "creator"].includes(status);
Libs.YumeReferral.applySettlementCheck(session, recordId, chatId, isMember);
finishIfComplete(session);
