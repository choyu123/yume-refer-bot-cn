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
const inviter = RefLib.getAttractedBy();
Libs.ReferralLib.setLinkPrefix(linkPrefix);
const inviteLink = Libs.ReferralLib.getLink(bot.name);
const balance = Libs.ResourcesLib.userRes("balance").value();
const records = Libs.YumeReferral.loadRecords();
const stats = Libs.YumeReferral.getInviterStats(
  records,
  user.telegramid,
  Date.now(),
  Libs.YumeConfig.observationMs()
);

const profileMessage = `<b>你的小账本</b>

昵称：${firstName}
用户名：${username}
用户 ID：<code>${userId}</code>
邀请人：${inviter?.first_name || "无"}

当前积分：${balance} ${currency}
已结算有效邀请：${stats.settled} 人
观察中邀请：${stats.observing} 人

你的邀请链接：
<code>${inviteLink}</code>`;

const buttons = {
  inline_keyboard: [
    [{ text: "复制邀请链接", copy_text: { text: inviteLink } }],
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

if (request.message?.message_id) {
  Api.editMessageText({ ...prms, message_id: request.message.message_id });
  return;
}

Api.sendMessage(prms);
