/*CMD
  command: /shop
  help: 
  need_reply: false
  auto_retry_time: 
  folder: user basic
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

const currency = SETTINGS.CURRENCY || "积分";
const balance = Libs.ResourcesLib.userRes("balance").value();

const message = `<b>积分商城</b>

当前积分：${balance} ${currency}

商品即将上架。
你可以先通过每日签到和邀请新用户积累积分。

后续可兑换的福利会在通知频道公布。`;

const buttons = {
  inline_keyboard: [
    [{ text: "邀请赚积分", callback_data: "/referral" }],
    [{ text: "返回主菜单", callback_data: "/start" }]
  ]
};

if (request.message?.message_id) {
  Api.editMessageText({
    message_id: request.message.message_id,
    text: message,
    parse_mode: "HTML",
    reply_markup: buttons
  });
  return;
}

Api.sendMessage({ text: message, parse_mode: "HTML", reply_markup: buttons });
