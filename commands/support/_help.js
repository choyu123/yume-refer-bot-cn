/*CMD
  command: /help
  help:
  need_reply: false
  auto_retry_time:
  folder: support
  answer:
  keyboard:
  aliases:
  group:
CMD*/

const helpMessage =
  SETTINGS.SUPPORT_MESSAGE ||
  `小橘使用说明，喵~

1. 先点「活人验证」，答对一道小题。
2. 加入通知频道 @yumeGptplus。
3. 加入官方交流群 https://t.me/yumeHubplus。
4. 回到机器人点「验证入群」。
5. 每日签到可以拿 0.5 积分。
6. 邀请有效好友可以拿 1 积分。
7. 以后兑换到的卡密，会放在「我的卡密」里。

有问题就来官方交流群找小橘，喵~`;

const buttons = {
  inline_keyboard: [
    [{ text: "官方交流群", url: "https://t.me/yumeHubplus" }],
    [{ text: "返回主菜单", callback_data: "/start" }]
  ]
};

let prms = {
  text: helpMessage,
  reply_markup: buttons,
  parse_mode: "HTML"
};

if (request.message?.message_id) {
  Api.editMessageText({ ...prms, message_id: request.message.message_id });
  return;
}

Api.sendMessage(prms);
