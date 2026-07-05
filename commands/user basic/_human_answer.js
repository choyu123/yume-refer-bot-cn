/*CMD
  command: /human_answer
  help:
  need_reply: true
  auto_retry_time:
  folder: user basic
  answer:
  keyboard:
  aliases:
  group:
CMD*/

if (!user) return;

function incomingText() {
  if (typeof message !== "undefined" && message) return String(message).trim();
  if (typeof request !== "undefined" && request && request.text) return String(request.text).trim();
  return "";
}

function joinButtons() {
  return {
    inline_keyboard: [
      [
        { text: "加入通知频道", url: "https://t.me/yumeGptplus" },
        { text: "加入官方交流群", url: "https://t.me/yumeHubplus" }
      ],
      [{ text: "我已加入/签到", callback_data: "/start" }]
    ]
  };
}

function sendJoinNextStep() {
  Api.sendMessage({
    text: `验证通过，小橘给你开门啦，喵~

现在加入通知频道和官方交流群，再点「我已加入/签到」。`,
    reply_markup: joinButtons()
  });
}

function notifyInviter() {
  const inviter = Libs.ReferralLib.getAttractedBy();
  const noticeKey = inviter ? "YUME_INVITER_NOTICE_COUNT_" + inviter.telegramid : "";
  const noticeCount = noticeKey ? Number(Bot.getProperty(noticeKey, 0)) : 0;

  if (!inviter || noticeCount >= 5) return;

  Api.sendMessage({
    chat_id: inviter.telegramid,
    text: `你邀请的好友 <a href="tg://user?id=${user.telegramid}">${user.first_name || "用户"}</a> 已通过活人验证，正在往有效邀请路上走，喵~`,
    parse_mode: "HTML"
  });
  Bot.setProperty(noticeKey, noticeCount + 1, "integer");
}

function passHumanCheck() {
  User.setProperty("human_pending", false, "boolean");
  User.setProperty("human_verified", true, "boolean");
  User.setProperty("human_verified_at", new Date().toISOString(), "string");

  const records = Libs.YumeReferral.loadRecords();
  Libs.YumeReferral.markHumanVerified(records, user.telegramid);
  Libs.YumeReferral.saveRecords(records);

  if (!User.getProperty("human_rewarded")) {
    const reward = Libs.YumeConfig.humanReward();
    const currency = Libs.YumeConfig.currency();
    Libs.ResourcesLib.userRes("balance").add(reward);
    User.setProperty("human_rewarded", true, "boolean");
    Bot.sendMessage(`答对啦，喵~ 小橘给你放了 ${reward} ${currency} 到账本里。`);
  } else {
    Bot.sendMessage("答对啦，活人验证通过，喵~");
  }

  notifyInviter();
  sendJoinNextStep();
}

if (User.getProperty("human_verified")) {
  sendJoinNextStep();
  return;
}

if (!User.getProperty("human_pending")) {
  Bot.sendMessage("这道题已经过期啦，喵~ 点「活人验证」让小橘重新出一道。");
  return;
}

const text = incomingText();
const expected = User.getProperty("human_answer");

if (text === expected) {
  passHumanCheck();
  return;
}

const attempts = Number(User.getProperty("human_attempts") || 0) + 1;
User.setProperty("human_attempts", attempts, "integer");

if (attempts >= 3) {
  User.setProperty("human_pending", false, "boolean");
  Bot.sendMessage("这题先放过啦，喵~ 点「活人验证」换一道，小橘重新出题。");
  return;
}

Bot.sendMessage("答案不太对，喵~ 再看一眼题目，直接回复数字就好。");
Bot.runCommand("/human_answer");
