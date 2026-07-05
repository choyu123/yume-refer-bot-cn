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
    Bot.sendMessage("这是你自己的邀请链接，小橘已经认出来啦。换个朋友来试试。");
  },
  onAtractedByUser: function (byUser) {
    Api.sendMessage({
      text: `你是通过 <a href="tg://user?id=${byUser.telegramid}">${byUser.first_name}</a> 的邀请链接来的，小橘已经记好啦。`,
      parse_mode: "HTML"
    });
    Api.sendMessage({
      chat_id: byUser.telegramid,
      text: `有新朋友 <a href="tg://user?id=${user.telegramid}">${user.first_name}</a> 通过你的邀请链接进来了。等对方完成验证后，小橘会继续记录邀请状态。`,
      parse_mode: "HTML"
    });
  },
  onAlreadyAttracted: function () {
    Bot.sendMessage("你已经绑定过邀请关系啦，不用重复操作。");
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

function isHumanVerified() {
  return User.getProperty("human_verified") === true;
}

function sendHumanVerificationMessage() {
  const msg = `欢迎来到 Yume 小店。

小橘先确认一下你是真人。
答对一道小题，就能继续加入频道和群，打开完整菜单。`;

  sendMessage(msg, {
    inline_keyboard: [
      [{ text: "活人验证", callback_data: "/human" }],
      [{ text: "使用教程", callback_data: "/help" }]
    ]
  });
}

function sendJoinMessage(chats) {
  const inlineKeyboard = generateJoinButtons(chats);
  const msg =
    SETTINGS.NEED_JOIN_MSG ||
    `还差一步，小橘在门口等你。

请先加入通知频道和官方交流群。
回来后点「验证入群」，通过后完整菜单就会打开。`;
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
  inlineKeyboard.push([{ text: "验证入群", callback_data: "/start" }]);
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
    text: `你邀请的新朋友 ${user.first_name} 已完成验证。${referralBonus} ${currency} 已放进你的小账本。`,
    parse_mode: "HTML"
  });
}

function getStartMessageContent() {
  return (
    SETTINGS.START_MESSAGE ||
    `欢迎回来，Yume 小店开门中。

每日签到：0.5 积分
邀请有效好友：1 积分
首次通过活人验证：1 积分

卡密商城还在上货，你可以先把积分攒起来。

通知频道：@yumeGptplus
官方交流群：https://t.me/yumeHubplus`
  );
}

function getStartButtons() {
  return {
    inline_keyboard: [
      [
        { text: "我的积分", callback_data: "/balance" },
        { text: "每日签到", callback_data: "/bonus" }
      ],
      [
        { text: "邀请好友", callback_data: "/referral" },
        { text: "积分商城", callback_data: "/shop" }
      ],
      [
        { text: "邀请排行", callback_data: "/toplist" },
        { text: "使用教程", callback_data: "/help" }
      ],
      [
        { text: "我的卡密", callback_data: "/cards" },
        { text: "返回主菜单", callback_data: "/start" }
      ]
    ]
  };
}

if (!isHumanVerified()) {
  sendHumanVerificationMessage();
  return;
}

if (!checkMembership()) {
  return;
}

rewardInviterIfNeeded();

const fullMessage = `${getStartMessageContent()}\n\n小店来访人数：${totalUser.value()}`;
const buttons = getStartButtons();

if (request.message?.message_id) {
  editMessage(request.message.message_id, fullMessage, buttons);
} else {
  sendMessage(fullMessage, buttons);
}
