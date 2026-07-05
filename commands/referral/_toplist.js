/*CMD
  command: /toplist
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
const board = Libs.YumeReferral.leaderboard(records);
const rank = Libs.YumeReferral.rankFor(records, user.telegramid);

let message = "<b>邀请排行</b>\n\n";

if (board.length === 0) {
  message += "排行榜还空着，第一只脚印等你来踩，喵~";
} else {
  board.slice(0, 10).forEach((item, index) => {
    message += `${index + 1}. <a href="tg://user?id=${item.telegramid}">${item.name}</a> - ${item.count} 人\n`;
  });
  message += `\n我的排名：${rank ? `第 ${rank} 名` : "暂未上榜"}`;
}

const buttons = {
  inline_keyboard: [[{ text: "返回主菜单", callback_data: "/start" }]]
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
