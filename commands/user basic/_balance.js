/*CMD
  command: /balance
  help: 
  need_reply: false
  auto_retry_time: 
  folder: user basic
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

const linkPrefix = SETTINGS.REFER_LINK_PREFIX || "ref";
const currency = SETTINGS.CURRENCY || "积分";
const userId = user.telegramid;
const firstName = user.first_name || "未设置";
const username = user.username ? "@" + user.username : "未设置";
const inviter = Libs.ReferralLib.getAttractedBy();
const inviterName = inviter && inviter.first_name ? inviter.first_name : "无";
const inviteUserId = user.id || user.telegramid;
const inviteLink = "https://t.me/" + bot.name + "?start=" + linkPrefix + inviteUserId;
const balance = Libs.ResourcesLib.userRes("balance").value();
let stats = { settled: 0, observing: 0 };

try {
  const records = Libs.YumeReferral.loadRecords();
  stats = Libs.YumeReferral.getInviterStats(
    records,
    user.telegramid,
    Date.now(),
    Libs.YumeConfig.observationMs()
  );
} catch (e) {}

const profileMessage = `<b>你的小账本</b>

昵称：${firstName}
用户名：${username}
用户 ID：<code>${userId}</code>
邀请人：${inviterName}

当前积分：${balance} ${currency}
已结算有效邀请：${stats.settled} 人
观察中邀请：${stats.observing} 人

你的邀请链接：
<code>${inviteLink}</code>`;

const buttons = {
  inline_keyboard: [
    [
      { text: "邀请赚积分", callback_data: "/invite" },
      { text: "我的卡密", callback_data: "/cards" }
    ],
    [{ text: "返回主菜单", callback_data: "/start" }]
  ]
};

const prms = {
  text: profileMessage,
  parse_mode: "HTML",
  reply_markup: buttons
};

if (typeof request !== "undefined" && request && request.id) {
  try {
    Api.answerCallbackQuery({ callback_query_id: request.id });
  } catch (e) {}
}

Api.sendMessage(prms);
