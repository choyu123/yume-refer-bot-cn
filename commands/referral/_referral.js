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

const referralBonus = SETTINGS.REFER_REWARD || 1;
const currency = SETTINGS.CURRENCY || "积分";
const inviteLink = RefLib.getRefLink(bot.name, SETTINGS.REFER_LINK_PREFIX || "ref");
const balance = Libs.ResourcesLib.userRes("balance").value();
const totalInvites = RefLib.getRefCount();

const refMessage = `<b>邀请赚积分</b>

把下面的专属链接发给新用户：
<code>${inviteLink}</code>

有效规则：
新用户必须通过你的链接启动机器人，并完成通知频道/官方交流群验证，才算有效邀请。

每 1 个有效邀请奖励 ${referralBonus} ${currency}。

当前积分：${balance} ${currency}
累计有效邀请：${totalInvites}`;

const buttons = {
  inline_keyboard: [
    [
      { text: "邀请明细", callback_data: "/myreferrals" },
      { text: "邀请排行", callback_data: "/toplist" }
    ],
    [{ text: "复制邀请链接", copy_text: { text: inviteLink } }],
    [{ text: "返回主菜单", callback_data: "/start" }]
  ]
};

const prms = {
  text: refMessage,
  parse_mode: "HTML",
  reply_markup: buttons
};

if (request.message?.message_id) {
  Api.editMessageText({ ...prms, message_id: request.message.message_id });
  return;
}

Api.sendMessage(prms);
