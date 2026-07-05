/*CMD
  command: /withdraw
  help: 
  need_reply: false
  auto_retry_time: 
  folder: Withdraw
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

Api.sendMessage({
  text: "当前机器人未开启提现功能。积分后续可在「积分商城」兑换福利。",
  reply_markup: {
    inline_keyboard: [
      [{ text: "积分商城", callback_data: "/shop" }],
      [{ text: "返回主菜单", callback_data: "/start" }]
    ]
  }
});
