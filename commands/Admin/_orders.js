/*CMD
  command: /orders
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
  text: "最近兑换订单，喵~\n\n" + Libs.YumeShop.formatOrders(state, 20)
});
