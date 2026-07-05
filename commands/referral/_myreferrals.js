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

let message = "<b>邀请明细</b>\n\n";

if (items.length === 0) {
  message += "这里还空空的。把邀请链接发给朋友，小橘会帮你记账，喵~";
} else {
  items.forEach((item, index) => {
    message += `${index + 1}. <a href="tg://user?id=${item.invited_id}">${item.invited_name}</a> - ${item.status}\n`;
  });
}

const buttons = {
  inline_keyboard: [[{ text: "返回邀请页", callback_data: "/referral" }]]
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
