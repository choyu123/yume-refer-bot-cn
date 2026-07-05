/*CMD
  command: /referral
  help:
  need_reply: false
  auto_retry_time:
  folder: referral
  answer:
  keyboard:
  aliases:
  group:
CMD*/

Libs.ReferralLib.setLinkPrefix(SETTINGS.REFER_LINK_PREFIX || "ref");

const currency = Libs.YumeConfig.currency();
const inviteLink = Libs.ReferralLib.getLink(bot.name);
const balance = Libs.ResourcesLib.userRes("balance").value();
const records = Libs.YumeReferral.loadRecords();
const stats = Libs.YumeReferral.getInviterStats(
  records,
  user.telegramid,
  Date.now(),
  Libs.YumeConfig.observationMs()
);

const message = `<b>邀请好友</b>

把这条专属链接发给朋友：
<code>${inviteLink}</code>

朋友完成活人验证，并加入通知频道和交流群后，会进入 2 小时观察期。
满 2 小时后点「刷新邀请奖励」，小橘会去查一下，符合条件就结算，喵~

当前积分：${balance} ${currency}
已绑定好友：${stats.bound} 位
观察中：${stats.observing} 位
可刷新结算：${stats.ready} 位
已结算有效邀请：${stats.settled} 位`;

const buttons = {
  inline_keyboard: [
    [{ text: "刷新邀请奖励", callback_data: "/settle_referrals" }],
    [
      { text: "邀请明细", callback_data: "/myreferrals" },
      { text: "邀请排行", callback_data: "/toplist" }
    ],
    [{ text: "复制邀请链接", copy_text: { text: inviteLink } }],
    [{ text: "返回主菜单", callback_data: "/start" }]
  ]
};

if (request.message && request.message.message_id) {
  Api.editMessageText({
    message_id: request.message.message_id,
    text: message,
    parse_mode: "HTML",
    reply_markup: buttons
  });
  return;
}

Api.sendMessage({ text: message, parse_mode: "HTML", reply_markup: buttons });
