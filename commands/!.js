/*CMD
  command: !
  help:
  need_reply:
  auto_retry_time:
  folder:
  answer:
  keyboard:
  aliases:
  group:
CMD*/

if (!user) return;

function incomingText() {
  const candidates = [
    request?.data,
    request?.text,
    typeof message !== "undefined" ? message : "",
    request?.message?.text
  ];

  for (let i = 0; i < candidates.length; i += 1) {
    const value = candidates[i];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }

  return "";
}

const text = incomingText();

const callbackRoutes = {
  "/invite": "/invite",
  "/referral": "/invite",
  "邀请赚积分": "/invite",
  "邀请好友": "/invite",
  "/balance": "/balance",
  "我的积分": "/balance",
  "/shop": "/shop",
  "积分商城": "/shop",
  "/cards": "/cards",
  "我的卡密": "/cards",
  "/bonus": "/bonus",
  "我已加入/签到": "/bonus",
  "/toplist": "/toplist",
  "邀请排行": "/toplist",
  "/help": "/help",
  "使用教程": "/help",
  "/start": "/start",
  "返回主菜单": "/start",
  "/human": "/human",
  "活人验证": "/human",
  "/myreferrals": "/myreferrals",
  "邀请明细": "/myreferrals",
  "/settle_referrals": "/settle_referrals",
  "刷新邀请奖励": "/settle_referrals"
};

if (callbackRoutes[text]) {
  Bot.runCommand(callbackRoutes[text]);
  return;
}

if (text.indexOf("/buy ") === 0) {
  Bot.runCommand(text);
  return;
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

if (User.getProperty("human_pending")) {
  const expected = User.getProperty("human_answer");

  if (text === expected) {
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

    const inviter = Libs.ReferralLib.getAttractedBy();
    const noticeKey = inviter ? "YUME_INVITER_NOTICE_COUNT_" + inviter.telegramid : "";
    const noticeCount = noticeKey ? Number(Bot.getProperty(noticeKey, 0)) : 0;
    if (inviter && noticeCount < 5) {
      Api.sendMessage({
        chat_id: inviter.telegramid,
        text: `你邀请的好友 <a href="tg://user?id=${user.telegramid}">${user.first_name || "用户"}</a> 已通过活人验证，正在往有效邀请路上走，喵~`,
        parse_mode: "HTML"
      });
      Bot.setProperty(noticeKey, noticeCount + 1, "integer");
    }

    sendJoinNextStep();
    return;
  }

  const attempts = Number(User.getProperty("human_attempts") || 0) + 1;
  User.setProperty("human_attempts", attempts, "integer");

  if (attempts >= 3) {
    User.setProperty("human_pending", false, "boolean");
    Bot.sendMessage("这题先放过啦，喵~ 点「活人验证」换一道，小橘重新出题。");
  } else {
    Bot.sendMessage("答案不太对，喵~ 再看一眼题目，直接回复数字就好。");
  }
  return;
}

Bot.sendMessage(
  SETTINGS.ERROR_MESSAGE ||
  "小橘没看懂这句，喵~ 可以点「返回主菜单」重新选一下。"
);
