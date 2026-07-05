/*CMD
  command: /addcards
  help:
  need_reply:
  auto_retry_time:
  folder: Admin
  answer:
  keyboard:
  aliases:
  group:
CMD*/

function send(text) {
  Api.sendMessage({ text });
}

function usage() {
  send(`用法：
/addcards 商品名 价格
卡密1
卡密2
卡密3

例子：
/addcards GPT月卡 10
YUME-AAA-001
YUME-BBB-002`);
}

const text = String(params || "").trim();
if (!text) {
  usage();
  return;
}

const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
if (lines.length < 2) {
  usage();
  return;
}

const headerParts = lines[0].split(/\s+/);
const priceText = headerParts.pop();
const title = headerParts.join(" ").trim();
const price = Number(priceText);
const codes = lines.slice(1);

if (!title || !isFinite(price) || price <= 0 || codes.length === 0) {
  usage();
  return;
}

const state = Libs.YumeShop.loadState();
const result = Libs.YumeShop.importCards(state, title, price, codes, Date.now());

if (!result.ok) {
  send("补货失败啦，喵~ 检查一下商品名、价格和卡密格式。");
  return;
}

Libs.YumeShop.saveState(state);

send(`补货完成，喵~

商品：${result.product.title}
商品ID：${result.product.id}
价格：${result.product.price} 积分
新增：${result.added} 张
跳过重复：${result.skipped} 张
当前库存：${result.stock} 张`);
