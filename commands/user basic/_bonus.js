/*CMD
  command: /bonus
  help: 
  need_reply: false
  auto_retry_time: 
  folder: user basic
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

const interval = SETTINGS.BONUS_INTERVAL || 24;
const bonusAmount = SETTINGS.BONUS_REWARD || 1;
const currency = SETTINGS.CURRENCY || "积分";

function getTimeDifferenceInHours(lastTime, currentTime) {
  return (currentTime - lastTime) / (1000 * 60 * 60);
}

function sendMessage(text) {
  Api.sendMessage({ text: text, parse_mode: "HTML" });
}

let lastClaimTime = User.getProp("claimTime");
let currentTime = Date.now();

if (lastClaimTime) {
  let timeDifference = getTimeDifferenceInHours(lastClaimTime, currentTime);
  if (timeDifference < interval) {
    let remainingTime = (interval - timeDifference).toFixed(2);
    sendMessage(`你已经签到过了。\n距离下次签到还需要 ${remainingTime} 小时。`);
    return;
  }
}

let balance = ResLib.userRes("balance");
balance.add(Number(bonusAmount));
User.setProp("claimTime", currentTime);

sendMessage(`签到成功。\n获得 ${bonusAmount} ${currency}。\n当前积分：${balance.value()} ${currency}`);
