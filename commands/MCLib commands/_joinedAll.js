/*CMD
  command: /joinedAll
  help:
  need_reply:
  auto_retry_time:
  folder: MCLib commands
  answer:
  keyboard:
  aliases:
  group:
CMD*/

if (!options) return;

const records = Libs.YumeReferral.loadRecords();
Libs.YumeReferral.markJoinedAll(records, user.telegramid);
Libs.YumeReferral.saveRecords(records);

Bot.sendMessage("验证通过，小橘把完整菜单端出来啦，喵~", {
  reply_markup: Libs.YumeConfig.mainMenuButtons()
});
