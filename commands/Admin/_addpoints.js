/*CMD
  command: /addpoints
  help:
  need_reply:
  auto_retry_time:
  folder: Admin
  answer:
  keyboard:
  aliases:
  group:
CMD*/

const currency = Libs.YumeConfig.currency();
const parts = String(params || "").trim().split(/\s+/);
const userId = parts[0];
const amount = Number(parts[1]);

if (!userId || !/^\d+$/.test(userId) || !isFinite(amount) || amount <= 0) {
  Api.sendMessage({ text: "用法：/addpoints 用户ID 数量\n例子：/addpoints 123456789 5" });
  return;
}

const balance = Libs.ResourcesLib.anotherUserRes("balance", userId);
balance.add(amount);

Api.sendMessage({
  text: `已给用户 ${userId} 增加 ${amount} ${currency}。\n当前余额：${balance.value()} ${currency}`
});

Api.sendMessage({
  chat_id: userId,
  text: `小橘给你的账本加上 ${amount} ${currency}，喵~\n当前积分：${balance.value()} ${currency}`
});
