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

const refMessage = `<b>邀请好友</b>

把这条专属链接发给朋友：
<code>${inviteLink}</code>

朋友通过链接进入，完成活人验证、加入频道和群后，会进入有效邀请记录。

每 1 位有效好友奖励 ${referralBonus} ${currency}。

当前积分：${balance} ${currency}
有效邀请：${totalInvites} 人`;

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
