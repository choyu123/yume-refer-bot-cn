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

小橘正在把货架擦干净，喵~

当前积分：${balance} ${currency}

商品暂未上架。
你可以先每日签到、邀请好友，把积分慢慢攒起来。

有新卡密上架时，会在通知频道说明。`;

const buttons = {
  inline_keyboard: [
    [
      { text: "我的卡密", callback_data: "/cards" },
      { text: "邀请好友", callback_data: "/referral" }
    ],
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
