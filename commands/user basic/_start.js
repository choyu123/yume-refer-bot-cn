/*CMD
  command: /start
  help: 
  need_reply: false
  auto_retry_time: 
  folder: user basic

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/

const linkPrefix = SETTINGS.REFER_LINK_PREFIX || "ref";
const currency = SETTINGS.CURRENCY || "积分";
const totalUser = Libs.ResourcesLib.anotherChatRes("totalUser", "global");

if (chat && chat.just_created === true) {
  totalUser.add(1);
}

RefLib.track({
  onTouchOwnLink: function () {
    Bot.sendMessage("不能通过自己的邀请链接进入。");
  },
  onAtractedByUser: function (byUser) {
    Api.sendMessage({
      text: `你通过 <a href="tg://user?id=${byUser.telegramid}">${byUser.first_name}</a> 的邀请链接进入。`,
      parse_mode: "HTML"
    });
    Api.sendMessage({
      chat_id: byUser.telegramid,
      text: `有新用户 <a href="tg://user?id=${user.telegramid}">${user.first_name}</a> 通过你的邀请链接进入。对方完成频道/群验证后，你将获得奖励。`,
      parse_mode: "HTML"
    });
  },
  onAlreadyAttracted: function () {
    Bot.sendMessage("你已经绑定过邀请关系。");
  },
  linkPrefix: linkPrefix
});

function sendMessage(text, buttons) {
  const options = { text: text, parse_mode: "HTML" };
  if (buttons) options.reply_markup = buttons;
  Api.sendMessage(options);
}

function editMessage(messageId, text, buttons) {
  const options = { message_id: messageId, text: text, parse_mode: "HTML" };
  if (buttons) options.reply_markup = buttons;
  Api.editMessageText(options);
}

function checkMembership() {
  const chats = Libs.MembershipChecker.getNotJoinedChats();
  Libs.MembershipChecker.check();
  const isMember = Libs.MembershipChecker.isMember();

  if (!isMember) {
    sendJoinMessage(chats);
    return false;
  }
  return true;
}

function sendJoinMessage(chats) {
  const inlineKeyboard = generateJoinButtons(chats);
  const msg =
    SETTINGS.NEED_JOIN_MSG ||
    "请先完成以下两步：\n\n1. 关注通知频道\n2. 加入官方交流群\n\n完成后点击「我已加入/签到」继续。";
  sendMessage(msg, { inline_keyboard: inlineKeyboard });
}

function getChatButtonText(chat) {
  if (chat.indexOf("yumeGptplus") !== -1) return "加入通知频道";
  if (chat.indexOf("yumeHubplus") !== -1) return "加入官方交流群";
  return chat;
}

function generateJoinButtons(chats) {
  const chatArray = chats.split(",").map((chat) => chat.trim()).filter(Boolean);
  const inlineKeyboard = chatArray.map((chat) => [{
    text: getChatButtonText(chat),
    url: `https://t.me/${chat.replace("@", "")}`
  }]);
  inlineKeyboard.push([{ text: "我已加入/签到", callback_data: "/start" }]);
  return inlineKeyboard;
}

function rewardInviterIfNeeded() {
  const inviter = RefLib.getAttractedBy();
  if (!inviter || User.getProperty("rewarded")) return;

  const referralBonus = parseFloat(SETTINGS.REFER_REWARD) || 1;
  Libs.ResourcesLib.anotherUserRes("balance", inviter.telegramid).add(referralBonus);
  User.setProp("rewarded", true);

  Api.sendMessage({
    chat_id: inviter.telegramid,
    text: `你的邀请用户 ${user.first_name} 已完成验证，奖励 ${referralBonus} ${currency} 已到账。`,
    parse_mode: "HTML"
  });
}

function getStartMessageContent() {
  return (
    SETTINGS.START_MESSAGE ||
    `欢迎使用 Yume 积分机器人。

使用方式：
1. 先关注通知频道，并加入官方交流群。
2. 加入后点击「我已加入/签到」完成验证。
3. 每日签到可获得积分。
4. 邀请新用户加入并完成验证，可获得额外积分。
5. 积分后续可在「积分商城」兑换福利。

通知频道：@yumeGptplus
官方交流群：https://t.me/yumeHubplus`
  );
}

function getStartButtons() {
  return {
    inline_keyboard: [
      [
        { text: "加入官方频道", url: "https://t.me/yumeGptplus" },
        { text: "我已加入/签到", callback_data: "/bonus" }
      ],
      [
        { text: "邀请赚积分", callback_data: "/referral" },
        { text: "我的积分", callback_data: "/balance" }
      ],
      [
        { text: "积分商城", callback_data: "/shop" },
        { text: "邀请排行", callback_data: "/toplist" }
      ],
      [
        { text: "使用教程", callback_data: "/help" },
        { text: "返回主菜单", callback_data: "/start" }
      ]
    ]
  };
}

if (!checkMembership()) {
  return;
}

rewardInviterIfNeeded();

const fullMessage = `${getStartMessageContent()}\n\n当前累计用户：${totalUser.value()}`;
const buttons = getStartButtons();

if (request.message?.message_id) {
  editMessage(request.message.message_id, fullMessage, buttons);
} else {
  sendMessage(fullMessage, buttons);
}
