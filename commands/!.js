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

// we can't send message
if (!user) return;

function getIncomingText() {
  return (typeof message !== "undefined" && message ? message : request?.text || "").trim();
}

function sendJoinNextStep() {
  Api.sendMessage({
    text: "活人验证已通过，还差最后一步。\n\n请加入通知频道和官方交流群，然后点击「验证入群」。",
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
      Bot.sendMessage(`恭喜，真人校验通过。\n系统已赠送 ${reward} ${currency}。`);
    } else {
      Bot.sendMessage("恭喜，真人校验通过。");
    }

    sendJoinNextStep();
    return;
  }

  let attempts = Number(User.getProperty("human_attempts") || 0) + 1;
  User.setProperty("human_attempts", attempts, "integer");

  if (attempts >= 3) {
    User.setProperty("human_pending", false, "boolean");
    Bot.sendMessage("答案错误次数较多，请点击「活人验证」重新获取题目。");
  } else {
    Bot.sendMessage("答案不正确，请重新输入数字答案。");
  }
  return;
}

// error message content
let errorMessage =
  SETTINGS.ERROR_MESSAGE ||
  "操作失败，请稍后重试。若一直无法使用，请加入官方交流群反馈：https://t.me/yumeHubplus";

Bot.sendMessage(errorMessage);
