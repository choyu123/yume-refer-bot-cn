/*CMD
  command: /stock
  help:
  need_reply: false
  auto_retry_time:
  folder: Admin
  answer:
  keyboard:
  aliases:
  group:
CMD*/

const state = Libs.YumeShop.loadState();

Api.sendMessage({
  text: "库存清单，喵~\n\n" + Libs.YumeShop.formatStock(state)
});
