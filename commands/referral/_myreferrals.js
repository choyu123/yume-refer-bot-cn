/*CMD
  command: /myreferrals
  help:
  need_reply: false
  auto_retry_time:
  folder: referral
  answer:
  keyboard:
  aliases:
  group:
CMD*/

const records = Libs.YumeReferral.loadRecords();
const items = Libs.YumeReferral.getRecentForInviter(
  records,
  user.telegramid,
  Date.now(),
  Libs.YumeConfig.observationMs(),
  10
);

let message = "<b>邀请明细</b>\n\n最近 10 位好友状态，小橘都记着，喵~\n\n";

if (items.length === 0) {
  message += "这里还空空的。把邀请链接发给朋友，小橘会帮你记账，喵~";
} else {
  items.forEach((item, index) => {
    message += `${index + 1}. <a href="tg://user?id=${item.invited_id}">${item.invited_name}</a> - ${item.status}\n`;
  });
  message += "\n状态说明：未完成验证 / 观察中 / 可结算 / 已结算";
}

const buttons = {
  inline_keyboard: [[{ text: "返回邀请页", callback_data: "/invite" }]]
};

if (request.message && request.message.message_id) {
  Api.editMessageText({
    message_id: request.message.message_id,
    text: message,
    parse_mode: "HTML",
    reply_markup: buttons
  });
  return;
}

Api.sendMessage({ text: message, parse_mode: "HTML", reply_markup: buttons });
