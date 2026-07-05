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

let channels = Libs.MembershipChecker.getChats();
Bot.sendMessage("请先加入以下频道/群后，再点击「我已加入/签到」：\n\n" + channels);
