/*CMD
  command: /cards
  help:
  need_reply: false
  auto_retry_time:
  folder: user basic
  answer:
  keyboard:
  aliases:
  group:
CMD*/

let cards = User.getProperty("card_keys") || [];

if (typeof cards === "string") {
  try {
    cards = JSON.parse(cards);
  } catch (e) {
    cards = [];
  }
}

function formatTime(value) {
  if (!value) return "未知时间";
  const date = new Date(value);
  if (isNaN(date.getTime())) return String(value);
  return date.toLocaleString("zh-CN", { hour12: false });
}

function html(value) {
  return String(value === undefined || value === null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

let message = "<b>你的专属卡密资产库</b>\n\n";

if (!Array.isArray(cards) || cards.length === 0) {
  message += "暂时还没有卡密，喵~\n\n等积分商城上架后，兑换到的卡密都会安安静静躺在这里。";
} else {
  cards
    .slice()
    .sort((a, b) => Number(b.created_at || 0) - Number(a.created_at || 0))
    .forEach((card, index) => {
    const id = card.id || index + 1;
    const title = card.title || "兑换卡密";
    const code = card.code || card.cdk || "未记录";
    const price = card.price ? `｜${card.price} 积分` : "";
    const createdAt = formatTime(card.created_at || card.createdAt);
    message += `${index + 1}. ${html(title)}${price}\n卡密：<code>${html(code)}</code>\n时间：${createdAt}\n订单：<code>${html(id)}</code>\n\n`;
    });
}

const buttons = {
  inline_keyboard: [
    [{ text: "积分商城", callback_data: "/shop" }],
    [{ text: "邀请赚积分", callback_data: "/referral" }],
    [{ text: "返回主菜单", callback_data: "/start" }]
  ]
};

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
