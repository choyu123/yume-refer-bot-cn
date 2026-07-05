/*CMD
  command: /justJoinedOne
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

Bot.sendMessage("这一处已经通过啦，喵~ " + options.chat_id, { parse_mode: "HTML" });
