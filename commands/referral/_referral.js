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
const shareText = `来 Yume 小店领积分，喵~\n\n1. 点我的专属链接进入机器人\n2. 完成活人验证\n3. 加入通知频道和官方交流群\n\n完成后你可以签到、邀请赚积分，后面在积分商城换卡密：\n${inviteLink}`;
const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent("来 Yume 小店领积分，喵~")}`;

const message = `<b>邀请赚积分</b>

这是你的专属邀请链接，每个人都不一样，喵~
<code>${inviteLink}</code>

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
    [{ text: "复制邀请链接", copy_text: { text: inviteLink } }],
    [{ text: "复制邀请文案", copy_text: { text: shareText } }],
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
