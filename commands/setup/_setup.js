/*CMD
  command: /setup
  help:
  need_reply: false
  auto_retry_time:
  folder: setup

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases:
  group:
CMD*/

const defaultStartMessage = `欢迎回来，Yume 小店开门中，喵~

每日签到：0.5 积分
邀请有效好友：1 积分
首次通过活人验证：1 积分

积分商城会不定期上架卡密，你可以先把积分攒起来。

通知频道：@yumeGptplus
官方交流群：https://t.me/yumeHubplus`;

const defaultHelpMessage = `小橘使用说明，喵~

1. 先点「活人验证」，答对一道小题。
2. 加入通知频道 @yumeGptplus。
3. 加入官方交流群 https://t.me/yumeHubplus。
4. 回到机器人点「验证入群」。
5. 每日签到可以拿 0.5 积分。
6. 邀请有效好友可以拿 1 积分。
7. 以后兑换到的卡密，会放在「我的卡密」里。

有问题就来官方交流群找小橘，喵~`;

const settingsPanel = {
  title: "Yume 小店设置",
  description: "配置积分、邀请奖励、欢迎语和管理员。",
  index: 0,
  icon: "settings",
  button_title: "保存",
  fields: [
    {
      name: "ANNOUNCEMENT_CHANNEL",
      title: "通知频道",
      description: "用于发布公告的频道。",
      type: "string",
      placeholder: "@yumeGptplus",
      value: "@yumeGptplus"
    },
    {
      name: "WITHDRAW_NOTIFICATION_CHANNEL",
      title: "提现通知频道（占位）",
      description: "本版本不启用提现，保留此字段避免旧模板报错。",
      type: "string",
      placeholder: "@yumeGptplus",
      value: "@yumeGptplus"
    },
    {
      name: "CURRENCY",
      title: "积分名称",
      description: "用户看到的积分单位。",
      type: "string",
      placeholder: "积分",
      value: "积分"
    },
    {
      name: "BONUS_REWARD",
      title: "签到奖励",
      description: "用户每次签到获得多少积分。",
      type: "float",
      placeholder: "0.5",
      value: 0.5
    },
    {
      name: "BONUS_INTERVAL",
      title: "签到间隔（小时）",
      description: "多少小时可以签到一次。",
      type: "integer",
      placeholder: "24",
      value: 24
    },
    {
      name: "REFER_REWARD",
      title: "邀请奖励",
      description: "每个有效邀请奖励多少积分。",
      type: "float",
      placeholder: "1",
      value: 1
    },
    {
      name: "HUMAN_VERIFY_REWARD",
      title: "活人验证奖励",
      description: "用户首次通过活人验证后赠送多少积分。",
      type: "float",
      placeholder: "1",
      value: 1
    },
    {
      name: "ADMINS",
      title: "管理员 Telegram 数字 ID",
      description: "多个管理员用英文逗号分隔。可用 @userinfobot 查询数字 ID。",
      type: "string",
      placeholder: "123456789"
    },
    {
      name: "SUPPORT_MESSAGE",
      title: "使用教程/客服说明",
      description: "用户点击「使用教程」时看到的内容。",
      type: "text",
      placeholder: "填写教程或客服说明",
      value: defaultHelpMessage
    },
    {
      name: "START_MESSAGE",
      title: "欢迎语",
      description: "用户启动机器人后看到的主文案。",
      type: "text",
      placeholder: "欢迎回来，Yume 小店开门中，喵~",
      value: defaultStartMessage
    },
    {
      name: "ERROR_MESSAGE",
      title: "错误提示",
      description: "用户操作失败时看到的提示。",
      type: "text",
      placeholder: "小橘没看懂这句，喵~",
      value: "小橘没看懂这句，喵~ 可以点「返回主菜单」重新选一下。"
    },
    {
      name: "MINIMUM_WITHDRAW",
      title: "最小提现（已关闭，占位）",
      description: "本版本不启用提现。",
      type: "float",
      placeholder: "999999",
      value: 999999
    },
    {
      name: "MAXIMUM_WITHDRAW",
      title: "最大提现（已关闭，占位）",
      description: "本版本不启用提现。",
      type: "float",
      placeholder: "999999",
      value: 999999
    },
    {
      name: "REFER_LINK_PREFIX",
      title: "邀请链接前缀",
      description: "生成邀请链接时使用的 start 参数前缀。",
      type: "string",
      placeholder: "ref",
      value: "ref"
    },
    {
      name: "REFER_IMAGE_URL",
      title: "邀请页预览图",
      description: "可留空。",
      type: "string",
      placeholder: "https://..."
    },
    {
      name: "BACKGROUND_MEMBERSHIP_CHECKUP",
      title: "后台自动校验成员",
      description: "免费额度有限，建议关闭。",
      type: "checkbox",
      value: false
    }
  ]
};

const botCommands = [
  { command: "/start", description: "打开主菜单" },
  { command: "/human", description: "活人验证" },
  { command: "/bonus", description: "每日签到" },
  { command: "/referral", description: "邀请好友" },
  { command: "/balance", description: "我的积分" },
  { command: "/shop", description: "积分商城" },
  { command: "/cards", description: "我的卡密" },
  { command: "/toplist", description: "邀请排行" },
  { command: "/myreferrals", description: "邀请明细" },
  { command: "/help", description: "使用教程" },
  { command: "/addcards", description: "管理员：批量导入卡密" },
  { command: "/stock", description: "管理员：查看库存" },
  { command: "/orders", description: "管理员：查看订单" },
  { command: "/offproduct", description: "管理员：下架商品" },
  { command: "/onproduct", description: "管理员：上架商品" },
  { command: "/addpoints", description: "管理员：增加积分" },
  { command: "/cutpoints", description: "管理员：扣除积分" },
  { command: "/broadcast", description: "管理员：群发消息" },
  { command: "/broadcast_status", description: "管理员：查看群发状态" },
  { command: "/ban", description: "管理员：封禁用户" },
  { command: "/unban", description: "管理员：解封用户" }
];

Api.setMyCommands({ commands: botCommands });

AdminPanel.setPanel({
  panel_name: "SETTINGS",
  data: settingsPanel,
  force: true
});

Libs.MembershipChecker.setup();
Bot.sendMessage("Yume 小店基础设置已完成，喵~");
Bot.sendMessage("命令菜单已更新。");
