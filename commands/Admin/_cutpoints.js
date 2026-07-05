/*CMD
  command: /cutpoints
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
  Api.sendMessage({ text: "用法：/cutpoints 用户ID 数量\n例子：/cutpoints 123456789 5" });
  return;
}

const balance = Libs.ResourcesLib.anotherUserRes("balance", userId);
const current = Number(balance.value() || 0);

if (amount > current) {
  Api.sendMessage({
    text: `不能扣成负数，喵~\n用户当前只有 ${current} ${currency}，你要扣 ${amount} ${currency}。`
  });
  return;
}

balance.add(-amount);

Api.sendMessage({
  text: `已从用户 ${userId} 扣除 ${amount} ${currency}。\n当前余额：${balance.value()} ${currency}`
});

Api.sendMessage({
  chat_id: userId,
  text: `小橘把你的账本扣除 ${amount} ${currency}，喵~\n当前积分：${balance.value()} ${currency}`
});
