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

const callbackMessageId = request.data ? request.message?.message_id : null;

function getTopReferringUsers() {
  let list = Libs.ReferralLib.getTopList();
  list.order_by = "integer_value";
  list.order_ascending = false;
  list.page = 1;
  list.per_page = 10;
  return list.get();
}

function generateLeaderboardMessage(items) {
  if (items.length === 0) {
    return "排行榜还空着。第一串脚印，等你来踩。";
  }

  let msg = "<b>邀请排行</b>\n\n";
  items.forEach((prop, index) => {
    let name = prop.user.first_name || "用户";
    msg += `${index + 1}. <a href="tg://user?id=${prop.user.telegramid}">${name}</a> - ${prop.value} 人\n`;
  });
  return msg;
}

function sendOrEditMessage(msg, callbackMessageId) {
  const inline_keyboard = [[{ text: "返回主菜单", callback_data: "/start" }]];
  const messageOptions = {
    text: msg,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: inline_keyboard }
  };

  if (callbackMessageId) {
    Api.editMessageText({ ...messageOptions, message_id: callbackMessageId });
  } else {
    Api.sendMessage(messageOptions);
  }
}

const items = getTopReferringUsers();
sendOrEditMessage(generateLeaderboardMessage(items), callbackMessageId);
