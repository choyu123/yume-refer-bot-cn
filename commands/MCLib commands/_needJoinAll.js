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
Bot.sendMessage("小橘还没在名单里看到你。\n\n请先加入这些频道/群，然后再点「验证入群」：\n\n" + channels);
