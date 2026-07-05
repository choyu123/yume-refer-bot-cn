const DEFAULT_CHATS = ["@yumeGptplus", "@yumeHubplus"];

function getSettings() {
  if (typeof SETTINGS !== "undefined" && SETTINGS) return SETTINGS;
  return {};
}

function numberSetting(name, fallback) {
  const settings = getSettings();
  const value = Number(settings[name]);
  return Number.isFinite(value) ? value : fallback;
}

function stringSetting(name, fallback) {
  const settings = getSettings();
  const value = settings[name];
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
}

function currency() {
  return stringSetting("CURRENCY", "积分");
}

function referReward() {
  return numberSetting("REFER_REWARD", 1);
}

function humanReward() {
  return numberSetting("HUMAN_VERIFY_REWARD", numberSetting("HUMAN_REWARD", 1));
}

function bonusReward() {
  return numberSetting("BONUS_REWARD", 0.5);
}

function bonusIntervalHours() {
  return numberSetting("BONUS_INTERVAL", 24);
}

function observationMs() {
  return numberSetting("REFERRAL_OBSERVATION_MS", 2 * 60 * 60 * 1000);
}

function settleCooldownMs() {
  return numberSetting("REFERRAL_SETTLE_COOLDOWN_MS", 60 * 1000);
}

function joinChats() {
  try {
    if (typeof Libs !== "undefined" && Libs.MembershipChecker) {
      const chats = Libs.MembershipChecker.getChats();
      if (chats) {
        return chats.split(",").map((chat) => chat.trim()).filter(Boolean);
      }
    }
  } catch (e) {
    // Fallback to defaults below when MembershipChecker is not ready.
  }

  const configured = stringSetting("YUME_JOIN_CHATS", "");
  if (configured) {
    return configured.split(",").map((chat) => chat.trim()).filter(Boolean);
  }

  return DEFAULT_CHATS.slice();
}

function adminIds() {
  return stringSetting("ADMINS", "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

function isAdmin(currentUser) {
  if (!currentUser || !currentUser.telegramid) return false;
  return adminIds().includes(String(currentUser.telegramid));
}

function mainMenuButtons() {
  return {
    inline_keyboard: [
      [
        { text: "加入官方频道", url: "https://t.me/yumeGptplus" },
        { text: "我已加入/签到", callback_data: "/bonus" }
      ],
      [
        { text: "邀请赚积分", callback_data: "/referral" },
        { text: "我的积分", callback_data: "/balance" }
      ],
      [
        { text: "积分商城", callback_data: "/shop" },
        { text: "邀请排行", callback_data: "/toplist" }
      ],
      [
        { text: "使用教程", callback_data: "/help" },
        { text: "返回主菜单", callback_data: "/start" }
      ]
    ]
  };
}

function backToMainButtons() {
  return {
    inline_keyboard: [[{ text: "返回主菜单", callback_data: "/start" }]]
  };
}

const api = {
  currency,
  referReward,
  humanReward,
  bonusReward,
  bonusIntervalHours,
  observationMs,
  settleCooldownMs,
  joinChats,
  adminIds,
  isAdmin,
  mainMenuButtons,
  backToMainButtons
};

if (typeof publish === "function") publish(api);
if (typeof module !== "undefined") module.exports = api;
