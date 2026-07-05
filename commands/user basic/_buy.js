/*CMD
  command: /buy
  help:
  need_reply: false
  auto_retry_time:
  folder: user basic
  answer:
  keyboard:
  aliases:
  group:
CMD*/

const productId = String(params || "").trim();
const currency = Libs.YumeConfig.currency();

function sendOrEdit(text, buttons) {
  const options = {
    text,
    parse_mode: "HTML",
    reply_markup: buttons || {
      inline_keyboard: [
        [{ text: "返回商城", callback_data: "/shop" }],
        [{ text: "返回主菜单", callback_data: "/start" }]
      ]
    }
  };

  if (request.message?.message_id) {
    Api.editMessageText({ ...options, message_id: request.message.message_id });
    return;
  }

  Api.sendMessage(options);
}

function html(value) {
  return String(value === undefined || value === null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function joinButtons() {
  const chats = Libs.YumeConfig.joinChats();
  const rows = chats.map((chatId) => [{
    text: chatId.indexOf("yumeGptplus") !== -1 ? "加入通知频道" : "加入官方交流群",
    url: `https://t.me/${chatId.replace("@", "")}`
  }]);
  rows.push([{ text: "我已加入/签到", callback_data: "/start" }]);
  return { inline_keyboard: rows };
}

function isJoined() {
  try {
    Libs.MembershipChecker.check();
    return Libs.MembershipChecker.isMember();
  } catch (e) {
    return false;
  }
}

function loadCards() {
  let cards = User.getProperty("card_keys") || [];
  if (typeof cards === "string") {
    try {
      cards = JSON.parse(cards);
    } catch (e) {
      cards = [];
    }
  }
  return Array.isArray(cards) ? cards : [];
}

function saveUserCard(card, order) {
  const cards = loadCards();
  cards.unshift({
    id: order.id,
    order_id: order.id,
    title: card.title,
    code: card.code,
    price: order.price,
    created_at: order.created_at
  });
  User.setProperty("card_keys", cards, "json");
}

function notifyAdmins(order) {
  const admins = Libs.YumeConfig.adminIds();
  admins.forEach((adminId) => {
    Api.sendMessage({
      chat_id: adminId,
      parse_mode: "HTML",
      text: `<b>新的卡密兑换</b>

用户：<a href="tg://user?id=${order.user_id}">${html(order.user_name)}</a>（<code>${order.user_id}</code>）
商品：${html(order.product_title)}
积分：${order.price} ${currency}
卡密：<code>${html(order.code)}</code>`
    });
  });
}

if (!productId) {
  sendOrEdit("小橘没找到你要兑换哪个商品，喵~ 回商城重新点一下。");
  return;
}

if (!isJoined()) {
  sendOrEdit(
    `兑换前要先留在通知频道和官方交流群里，喵~

先加入，再点「我已加入/签到」让小橘确认一下。`,
    { inline_keyboard: joinButtons().inline_keyboard }
  );
  return;
}

const state = Libs.YumeShop.loadState();
const balance = Libs.ResourcesLib.userRes("balance");
const result = Libs.YumeShop.buyProduct(state, productId, user, balance.value(), Date.now());

if (!result.ok) {
  const messages = {
    not_found: "这个商品小橘没找到，可能刚刚下架啦，喵~",
    inactive: "这个商品暂时下架啦，等小橘补好货再来。",
    sold_out: "这份刚刚卖光啦，喵~ 去商城看看别的。",
    insufficient_balance: "积分还不够，喵~ 可以先签到或邀请好友攒一点。"
  };
  sendOrEdit(messages[result.error] || "兑换失败啦，喵~ 稍后再试一下。");
  return;
}

balance.add(-result.product.price);
Libs.YumeShop.saveState(state);
saveUserCard(result.card, result.order);
notifyAdmins(result.order);

sendOrEdit(
  `<b>兑换成功，喵~</b>

商品：${html(result.product.title)}
消耗：${result.product.price} ${currency}
当前积分：${balance.value()} ${currency}

你的卡密：
<code>${html(result.card.code)}</code>

小橘也帮你存进「我的卡密」啦。`,
  {
    inline_keyboard: [
      [{ text: "我的卡密", callback_data: "/cards" }],
      [{ text: "返回商城", callback_data: "/shop" }],
      [{ text: "返回主菜单", callback_data: "/start" }]
    ]
  }
);
