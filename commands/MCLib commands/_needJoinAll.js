/*CMD
  command: /needJoinAll
  help:
  need_reply: false
  auto_retry_time:
  folder: MCLib commands
  answer:
  keyboard:
  aliases:
  group:
CMD*/

if (!options) return;

const chats = Libs.YumeConfig.joinChats();
const buttons = chats.map((chatId) => [{
  text: chatId.indexOf("yumeGptplus") !== -1 ? "加入通知频道" : "加入官方交流群",
  url: `https://t.me/${chatId.replace("@", "")}`
}]);
buttons.push([{ text: "我已加入/签到", callback_data: "/start" }]);

Bot.sendMessage("小橘还没在名单里看到你，喵~\n\n先把频道和群都加入，再回来点「我已加入/签到」。", {
  reply_markup: { inline_keyboard: buttons }
});
