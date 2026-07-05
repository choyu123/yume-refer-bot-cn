/*CMD
  command: /shop
  help:
  need_reply: false
  auto_retry_time:
  folder: user basic
  answer:
  keyboard:
  aliases:
  group:
CMD*/

const currency = SETTINGS.CURRENCY || "积分";
const balance = Libs.ResourcesLib.userRes("balance").value();
const state = Libs.YumeShop.loadState();
const products = Libs.YumeShop.visibleProducts(state);

let message = `<b>积分商城</b>

当前积分：${balance} ${currency}
`;

const buttons = { inline_keyboard: [] };

if (products.length === 0) {
  message += `
小橘正在把货架擦干净，喵~
商品暂未上架。
你可以先每日签到、邀请好友，把积分慢慢攒起来。

有新卡密上架时，会在通知频道说明。`;
} else {
  message += "\n挑一个想兑换的商品，小橘会直接把卡密递给你，喵~";
  products.forEach((product) => {
    buttons.inline_keyboard.push([
      {
        text: `立即兑换｜${product.title}｜${product.price}${currency}｜剩余${product.stock.length}份`,
        callback_data: `/buy ${product.id}`
      }
    ]);
  });
}

buttons.inline_keyboard.push([
  { text: "我的卡密", callback_data: "/cards" },
  { text: "邀请赚积分", callback_data: "/invite" }
]);
buttons.inline_keyboard.push([{ text: "返回主菜单", callback_data: "/start" }]);

if (request.message?.message_id) {
  Api.editMessageText({
    message_id: request.message.message_id,
    text: message,
    parse_mode: "HTML",
    reply_markup: buttons
  });
  return;
}

Api.sendMessage({ text: message, parse_mode: "HTML", reply_markup: buttons });
