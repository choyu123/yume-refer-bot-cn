/*CMD
  command: /history
  help: 
  need_reply: false
  auto_retry_time: 
  folder: user basic
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

Api.sendMessage({
  text: "当前机器人未开启提现记录。你可以在「我的积分」查看当前积分。",
  reply_markup: {
    inline_keyboard: [
      [{ text: "我的积分", callback_data: "/balance" }],
      [{ text: "返回主菜单", callback_data: "/start" }]
    ]
  }
});
