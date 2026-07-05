/*CMD
  command: /invite
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
Libs.ReferralLib.setLinkPrefix(linkPrefix);

const currency = Libs.YumeConfig.currency();
const inviteLink = Libs.ReferralLib.getLink(bot.name);
const balance = Libs.ResourcesLib.userRes("balance").value();
const reward = Libs.YumeConfig.referReward();
const records = Libs.YumeReferral.loadRecords();
const stats = Libs.YumeReferral.getInviterStats(
  records,
  user.telegramid,
  Date.now(),
  Libs.YumeConfig.observationMs()
);
const shareText = "来 Yume 小店领积分，喵~";
const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareText)}`;

const message = `<b>邀请赚积分</b>

这是你的专属邀请链接，每个人都不一样，喵~
<code>${inviteLink}</code>

长按上面的链接就能复制。发给朋友后，朋友第一次点进来才会绑定到你。

怎么算有效邀请：
1. 新朋友首次通过你的链接打开机器人
2. 完成活人验证
3. 加入通知频道和官方交流群
4. 保持加入满 2 小时
5. 你点「刷新邀请奖励」，小橘确认后结算

有效邀请奖励：${reward} ${currency}/人
老用户、自己点自己的链接、已经绑定过别人的用户，不会重复计算。

当前积分：${balance} ${currency}
已绑定好友：${stats.bound} 位
未完成验证：${stats.notVerified} 位
观察中：${stats.observing} 位
可刷新结算：${stats.ready} 位
已结算有效邀请：${stats.settled} 位`;

const buttons = {
  inline_keyboard: [
    [{ text: "一键转发到 Telegram", url: shareUrl }],
    [{ text: "刷新邀请奖励", callback_data: "/settle_referrals" }],
    [
      { text: "邀请明细", callback_data: "/myreferrals" },
      { text: "邀请排行", callback_data: "/toplist" }
    ],
    [
      { text: "我的积分", callback_data: "/balance" },
      { text: "返回主菜单", callback_data: "/start" }
    ]
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
