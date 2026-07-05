/*CMD
  command: /human
  help:
  need_reply: false
  auto_retry_time:
  folder: user basic
  answer:
  keyboard:
  aliases:
  group:
CMD*/

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeQuestion() {
  const ops = ["+", "-", "x"];
  const op = ops[randomInt(0, ops.length - 1)];
  let a = randomInt(2, 12);
  let b = randomInt(2, 12);

  if (op === "-" && b > a) {
    const tmp = a;
    a = b;
    b = tmp;
  }

  let answer = 0;
  if (op === "+") answer = a + b;
  if (op === "-") answer = a - b;
  if (op === "x") answer = a * b;

  return { text: `${a} ${op} ${b}`, answer: answer };
}

if (User.getProperty("human_verified")) {
  Api.sendMessage({
    text: `你已经通过活人验证啦，喵~

下一步加入通知频道和官方交流群，再点「我已加入/签到」。`,
    reply_markup: {
      inline_keyboard: [
        [
          { text: "加入通知频道", url: "https://t.me/yumeGptplus" },
          { text: "加入官方交流群", url: "https://t.me/yumeHubplus" }
        ],
        [{ text: "我已加入/签到", callback_data: "/start" }]
      ]
    }
  });
  return;
}

const question = makeQuestion();
User.setProperty("human_pending", true, "boolean");
User.setProperty("human_answer", question.answer.toString(), "string");
User.setProperty("human_question", question.text, "string");
User.setProperty("human_attempts", 0, "integer");

Api.sendMessage({
  text: `小橘出题啦，喵~

${question.text} = ?

直接回复答案数字就行。`,
  reply_markup: {
    inline_keyboard: [[{ text: "换一道题", callback_data: "/human" }]]
  }
});
