/*CMD
  command: /setwallet
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
  text: "当前机器人未开启钱包/提现功能，不需要设置钱包地址。",
  reply_markup: {
    inline_keyboard: [[{ text: "返回主菜单", callback_data: "/start" }]]
  }
});
