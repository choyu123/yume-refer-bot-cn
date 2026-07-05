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

const totalUser = Libs.ResourcesLib.anotherChatRes("totalUser", "global");

if (chat && chat.just_created === true) {
  totalUser.add(1);
}

function sendMessage(text, buttons) {
  const options = { text: text, parse_mode: "HTML" };
  if (buttons) options.reply_markup = buttons;
  Api.sendMessage(options);
}

function editOrSend(text, buttons) {
  if (request.message && request.message.message_id) {
    Api.editMessageText({
      message_id: request.message.message_id,
      text: text,
      parse_mode: "HTML",
      reply_markup: buttons
    });
    return;
  }
  sendMessage(text, buttons);
}

function getChatButtonText(chatId) {
  if (chatId.indexOf("yumeGptplus") !== -1) return "加入通知频道";
  if (chatId.indexOf("yumeHubplus") !== -1) return "加入官方交流群";
  return chatId;
}

function joinButtons(chats) {
  const buttons = chats.map((chatId) => [{
    text: getChatButtonText(chatId),
    url: `https://t.me/${chatId.replace("@", "")}`
  }]);
  buttons.push([{ text: "我已加入/签到", callback_data: "/start" }]);
  return { inline_keyboard: buttons };
}

function trackReferral() {
  Libs.ReferralLib.track({
    linkPrefix: SETTINGS.REFER_LINK_PREFIX || "ref",
    onTouchOwnLink: function () {
      Bot.sendMessage("这是你自己的邀请链接，小橘认出来啦，喵~ 换个朋友来试试。");
    },
    onAtractedByUser: function (byUser) {
      const records = Libs.YumeReferral.loadRecords();
      Libs.YumeReferral.recordInvite(records, byUser, user);
      Libs.YumeReferral.saveRecords(records);

      Api.sendMessage({
        text: `你是通过 <a href="tg://user?id=${byUser.telegramid}">${byUser.first_name || "朋友"}</a> 的邀请链接来的，小橘已经记好啦，喵~`,
        parse_mode: "HTML"
      });
    },
    onAlreadyAttracted: function () {}
  });
}

function isHumanVerified() {
  return User.getProperty("human_verified") === true;
}

function sendHumanVerificationMessage() {
  sendMessage(
    `欢迎来到 Yume 小店，喵~

小橘先确认一下你是真人。答对一道小题，就能继续加入频道和群，打开完整菜单。`,
    {
      inline_keyboard: [
        [{ text: "活人验证", callback_data: "/human" }],
        [{ text: "使用教程", callback_data: "/help" }]
      ]
    }
  );
}

function checkMembership() {
  const chats = Libs.YumeConfig.joinChats();
  Libs.MembershipChecker.check();

  if (!Libs.MembershipChecker.isMember()) {
    sendMessage(
      `还差一步，小橘在门口等你，喵~

请先加入通知频道和官方交流群。回来后点「我已加入/签到」，通过后完整菜单就会打开。`,
      joinButtons(chats)
    );
    return false;
  }

  const records = Libs.YumeReferral.loadRecords();
  Libs.YumeReferral.markJoinedAll(records, user.telegramid);
  Libs.YumeReferral.saveRecords(records);
  return true;
}

function startMessage() {
  return (
    SETTINGS.START_MESSAGE ||
    `欢迎回来，Yume 小店开门中，喵~

每日签到：0.5 积分
邀请有效好友：1 积分
首次通过活人验证：1 积分

卡密商城会上架可兑换商品，你可以先把积分攒起来。
通知频道：@yumeGptplus
官方交流群：https://t.me/yumeHubplus`
  );
}

trackReferral();

if (!isHumanVerified()) {
  sendHumanVerificationMessage();
  return;
}

if (!checkMembership()) {
  return;
}

const fullMessage = `${startMessage()}\n\n小店来访人数：${totalUser.value()}`;
editOrSend(fullMessage, Libs.YumeConfig.mainMenuButtons());
