/*CMD
  command: /onproduct
  help:
  need_reply:
  auto_retry_time:
  folder: Admin
  answer:
  keyboard:
  aliases:
  group:
CMD*/

const productKey = String(params || "").trim();

if (!productKey) {
  Api.sendMessage({ text: "用法：/onproduct 商品名或商品ID" });
  return;
}

const state = Libs.YumeShop.loadState();
const result = Libs.YumeShop.onProduct(state, productKey);

if (!result.ok) {
  Api.sendMessage({ text: "没找到这个商品，喵~ 可以先用 /stock 看一下商品ID。" });
  return;
}

Libs.YumeShop.saveState(state);
Api.sendMessage({ text: `已上架：${result.product.title}\n商品ID：${result.product.id}\n库存：${result.product.stock.length} 张` });
