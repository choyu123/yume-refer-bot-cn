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
  `使用教程

1. 先关注通知频道 @yumeGptplus
2. 再加入官方交流群 https://t.me/yumeHubplus
3. 回到机器人，点击「我已加入/签到」
4. 点击「邀请赚积分」复制你的专属邀请链接
5. 新用户通过你的链接进入并完成验证后，你获得积分
6. 积分后续可在「积分商城」兑换福利

如需反馈问题，请加入官方交流群。`;

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
