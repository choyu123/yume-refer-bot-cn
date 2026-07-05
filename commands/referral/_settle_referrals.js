/*CMD
  command: /settle_referrals
  help:
  need_reply: false
  auto_retry_time:
  folder: referral
  answer:
  keyboard:
  aliases:
  group:
CMD*/

const now = Date.now();
const lastRefresh = Number(User.getProperty("referral_settle_last_at") || 0);
const cooldown = Libs.YumeConfig.settleCooldownMs();

function sendOrEdit(text) {
  const options = {
    text,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [{ text: "邀请赚积分", callback_data: "/referral" }],
        [{ text: "返回主菜单", callback_data: "/start" }]
      ]
    }
  };

  if (request.message && request.message.message_id) {
    Api.editMessageText({ ...options, message_id: request.message.message_id });
    return;
  }
  Api.sendMessage(options);
}

if (lastRefresh && now - lastRefresh < cooldown) {
  const left = Math.ceil((cooldown - (now - lastRefresh)) / 1000);
  sendOrEdit(`小橘刚刚查过啦，喵~ ${left} 秒后再来刷新。`);
  return;
}

User.setProperty("referral_settle_last_at", now, "integer");

const records = Libs.YumeReferral.loadRecords();
const candidates = Libs.YumeReferral.readyRecordsForInviter(
  records,
  user.telegramid,
  now,
  Libs.YumeConfig.observationMs()
);

if (candidates.length === 0) {
  sendOrEdit(`小橘查过啦，暂时没有可结算邀请，喵~

可能是好友还没满 2 小时，或还没完成频道/群验证。`);
  return;
}

const chats = Libs.YumeConfig.joinChats();
const session = Libs.YumeReferral.createSettlementSession(
  records,
  user.telegramid,
  candidates,
  chats,
  now,
  request.message ? request.message.message_id : null
);
Libs.YumeReferral.saveSession(session);

candidates.forEach((record) => {
  chats.forEach((chatId) => {
    const suffix = `${session.id} ${record.id} ${chatId}`;
    Api.getChatMember({
      chat_id: chatId,
      user_id: record.invited_id,
      on_result: `/settle_check_result ${suffix}`,
      on_error: `/settle_check_error ${suffix}`
    });
  });
});

sendOrEdit(`小橘正在核对 ${candidates.length} 位好友的频道/群状态，喵~

查完会自动把可结算的积分放进你的账本。`);
