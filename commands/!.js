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

function getIncomingText() {
  return (typeof message !== "undefined" && message ? message : request?.text || "").trim();
}

function sendJoinNextStep() {
  Api.sendMessage({
    text: "验证通过，小橘给你开门啦，喵~\n\n现在加入通知频道和官方交流群，再点「验证入群」。",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "加入通知频道", url: "https://t.me/yumeGptplus" },
          { text: "加入官方交流群", url: "https://t.me/yumeHubplus" }
        ],
        [{ text: "验证入群", callback_data: "/start" }]
      ]
    }
  });
}

if (User.getProperty("human_pending")) {
  const text = getIncomingText();
  const expected = User.getProperty("human_answer");

  if (text === expected) {
    User.setProperty("human_pending", false, "boolean");
    User.setProperty("human_verified", true, "boolean");
    User.setProperty("human_verified_at", new Date().toISOString(), "string");

    if (!User.getProperty("human_rewarded")) {
      const reward = Number(SETTINGS.HUMAN_VERIFY_REWARD || 1);
      const currency = SETTINGS.CURRENCY || "积分";
      Libs.ResourcesLib.userRes("balance").add(reward);
      User.setProperty("human_rewarded", true, "boolean");
      Bot.sendMessage(`答对啦，喵~ 小橘给你放了 ${reward} ${currency} 到账本里。`);
    } else {
      Bot.sendMessage("答对啦，活人验证通过，喵~");
    }

    sendJoinNextStep();
    return;
  }

  let attempts = Number(User.getProperty("human_attempts") || 0) + 1;
  User.setProperty("human_attempts", attempts, "integer");

  if (attempts >= 3) {
    User.setProperty("human_pending", false, "boolean");
    Bot.sendMessage("这题先放过啦，喵~ 点「活人验证」换一道，小橘重新出题。");
  } else {
    Bot.sendMessage("答案不太对，喵~ 再看一眼题目，直接回复数字就好。");
  }
  return;
}

let errorMessage =
  SETTINGS.ERROR_MESSAGE ||
  "小橘没看懂这句，喵~ 可以点「返回主菜单」重新选一下。";

Bot.sendMessage(errorMessage);
