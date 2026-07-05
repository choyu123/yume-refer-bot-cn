/*CMD
  command: !
  help: 
  need_reply: 
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

// we can't send message
if (!user) return;


// error message content
let errorMessage =
  SETTINGS.ERROR_MESSAGE ||
  "操作失败，请稍后重试。若一直无法使用，请加入官方交流群反馈：https://t.me/yumeHubplus";

Bot.sendMessage(errorMessage);
