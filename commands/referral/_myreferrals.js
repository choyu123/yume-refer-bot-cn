/*CMD
  command: /myreferrals
  help: 
  need_reply: false
  auto_retry_time: 
  folder: referral
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

const refList = Libs.ReferralLib.getRefList();
let referralDetails = `<b>邀请明细</b>

累计有效邀请：${Libs.ReferralLib.getRefCount()}
首次邀请时间：${refList.created_at || "暂无"}

<b>我的邀请用户：</b>
`;

if (!refList.exist) {
  referralDetails = "暂无邀请记录。";
} else {
  const referredUsers = refList.getUsers();
  for (let index in referredUsers) {
    const invited = referredUsers[index];
    referralDetails += `- <a href="tg://user?id=${invited.telegramid}">${invited.first_name || "用户"}</a>\n`;
  }
}

const backButton = [[{ text: "返回邀请页", callback_data: "/referral" }]];

if (request.message && request.message.message_id) {
  Api.editMessageText({
    message_id: request.message.message_id,
    text: referralDetails,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: backButton }
  });
} else {
  Api.sendMessage({
    text: referralDetails,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: backButton }
  });
}
