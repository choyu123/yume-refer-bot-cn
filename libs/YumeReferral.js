const RECORDS_KEY = "YUME_REFERRAL_RECORDS";
const SESSION_PREFIX = "YUME_SETTLE_SESSION_";

function normalizeRecords(records) {
  return Array.isArray(records) ? records : [];
}

function recordId(inviterId, invitedId) {
  return `${inviterId}:${invitedId}`;
}

function safeName(person) {
  return person.first_name || person.username || "用户";
}

function findByInvited(records, invitedTelegramId) {
  return normalizeRecords(records).find((record) => String(record.invited_id) === String(invitedTelegramId));
}

function recordInvite(records, inviter, invited, now) {
  records = normalizeRecords(records);
  now = now || Date.now();
  if (!inviter || !invited) return { ok: false, error: "missing_user" };
  if (String(inviter.telegramid) === String(invited.telegramid)) return { ok: false, error: "self" };

  const existing = findByInvited(records, invited.telegramid);
  if (existing) return { ok: false, error: "exists", record: existing };

  const record = {
    id: recordId(inviter.telegramid, invited.telegramid),
    inviter_id: inviter.telegramid,
    inviter_name: safeName(inviter),
    invited_id: invited.telegramid,
    invited_name: safeName(invited),
    created_at: now,
    human_verified_at: null,
    joined_all_at: null,
    settled_at: null,
    notify_sent: false
  };

  records.push(record);
  return { ok: true, record };
}

function markHumanVerified(records, invitedTelegramId, now) {
  const record = findByInvited(records, invitedTelegramId);
  if (!record) return { ok: false, error: "not_found" };
  if (!record.human_verified_at) record.human_verified_at = now || Date.now();
  return { ok: true, record };
}

function markJoinedAll(records, invitedTelegramId, now) {
  const record = findByInvited(records, invitedTelegramId);
  if (!record) return { ok: false, error: "not_found" };
  if (!record.human_verified_at) return { ok: false, error: "not_human" };
  if (!record.joined_all_at) record.joined_all_at = now || Date.now();
  return { ok: true, record };
}

function getRecordStatus(record, now, observationMs) {
  now = now || Date.now();
  observationMs = observationMs || 2 * 60 * 60 * 1000;
  if (record.settled_at) return "已结算";
  if (!record.human_verified_at || !record.joined_all_at) return "未完成验证";
  if (now - record.joined_all_at >= observationMs) return "可结算";
  return "观察中";
}

function getInviterRecords(records, inviterTelegramId) {
  return normalizeRecords(records).filter((record) => String(record.inviter_id) === String(inviterTelegramId));
}

function getInviterStats(records, inviterTelegramId, now, observationMs) {
  const own = getInviterRecords(records, inviterTelegramId);
  const stats = {
    bound: own.length,
    notVerified: 0,
    observing: 0,
    ready: 0,
    settled: 0
  };

  own.forEach((record) => {
    const status = getRecordStatus(record, now, observationMs);
    if (status === "未完成验证") stats.notVerified += 1;
    if (status === "观察中") stats.observing += 1;
    if (status === "可结算") stats.ready += 1;
    if (status === "已结算") stats.settled += 1;
  });

  return stats;
}

function getRecentForInviter(records, inviterTelegramId, now, observationMs, limit) {
  return getInviterRecords(records, inviterTelegramId)
    .slice()
    .sort((a, b) => b.created_at - a.created_at)
    .slice(0, limit || 10)
    .map((record) => ({
      id: record.id,
      invited_id: record.invited_id,
      invited_name: record.invited_name,
      status: getRecordStatus(record, now, observationMs),
      created_at: record.created_at
    }));
}

function markSettled(records, id, now) {
  const record = normalizeRecords(records).find((item) => item.id === id);
  if (!record) return { ok: false, error: "not_found" };
  if (!record.settled_at) record.settled_at = now || Date.now();
  return { ok: true, record };
}

function leaderboard(records) {
  const grouped = {};
  normalizeRecords(records).forEach((record) => {
    if (!record.settled_at) return;
    const key = String(record.inviter_id);
    if (!grouped[key]) {
      grouped[key] = {
        telegramid: record.inviter_id,
        name: record.inviter_name,
        count: 0
      };
    }
    grouped[key].count += 1;
  });

  return Object.values(grouped).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return String(a.telegramid).localeCompare(String(b.telegramid));
  });
}

function rankFor(records, telegramid) {
  const board = leaderboard(records);
  const index = board.findIndex((item) => String(item.telegramid) === String(telegramid));
  return index === -1 ? null : index + 1;
}

function readyRecordsForInviter(records, inviterTelegramId, now, observationMs) {
  return getInviterRecords(records, inviterTelegramId).filter(
    (record) => getRecordStatus(record, now, observationMs) === "可结算"
  );
}

function createSettlementSession(records, inviterTelegramId, candidates, chats, now, messageId) {
  now = now || Date.now();
  const id = `${inviterTelegramId}:${now}`;
  const session = {
    id,
    inviter_id: inviterTelegramId,
    message_id: messageId || null,
    created_at: now,
    chats: chats.slice(),
    checks_total: candidates.length * chats.length,
    checks_done: 0,
    checks: {},
    candidate_ids: candidates.map((record) => record.id)
  };

  candidates.forEach((record) => {
    session.checks[record.id] = {
      invited_id: record.invited_id,
      invited_name: record.invited_name,
      chats: {}
    };
    chats.forEach((chat) => {
      session.checks[record.id].chats[chat] = null;
    });
  });

  return session;
}

function applySettlementCheck(session, recordIdValue, chatId, isMember) {
  if (!session || !session.checks || !session.checks[recordIdValue]) return session;
  const check = session.checks[recordIdValue];
  if (check.chats[chatId] === null) {
    session.checks_done += 1;
  }
  check.chats[chatId] = Boolean(isMember);
  return session;
}

function isSettlementSessionComplete(session) {
  return session && session.checks_done >= session.checks_total;
}

function finalizeSettlement(records, session, now) {
  now = now || Date.now();
  const settled = [];
  const stayedPending = [];

  session.candidate_ids.forEach((id) => {
    const check = session.checks[id];
    const allJoined = Object.values(check.chats).every((value) => value === true);
    if (allJoined) {
      const result = markSettled(records, id, now);
      if (result.ok) settled.push(result.record);
    } else {
      stayedPending.push(id);
    }
  });

  return { settled, stayedPending };
}

function loadRecords() {
  if (typeof Bot === "undefined") return [];
  return normalizeRecords(Bot.getProperty(RECORDS_KEY, []));
}

function saveRecords(records) {
  records = normalizeRecords(records);
  if (typeof Bot !== "undefined") Bot.setProperty(RECORDS_KEY, records, "json");
  return records;
}

function saveSession(session) {
  if (typeof Bot !== "undefined") Bot.setProperty(SESSION_PREFIX + session.id, session, "json");
  return session;
}

function loadSession(id) {
  if (typeof Bot === "undefined") return null;
  return Bot.getProperty(SESSION_PREFIX + id);
}

function deleteSession(id) {
  if (typeof Bot !== "undefined") Bot.setProperty(SESSION_PREFIX + id, null, "json");
}

const api = {
  recordInvite,
  markHumanVerified,
  markJoinedAll,
  getRecordStatus,
  getInviterStats,
  getRecentForInviter,
  markSettled,
  leaderboard,
  rankFor,
  readyRecordsForInviter,
  createSettlementSession,
  applySettlementCheck,
  isSettlementSessionComplete,
  finalizeSettlement,
  loadRecords,
  saveRecords,
  saveSession,
  loadSession,
  deleteSession,
  _test: {
    recordInvite,
    markHumanVerified,
    markJoinedAll,
    getRecordStatus,
    getInviterStats,
    getRecentForInviter,
    markSettled,
    leaderboard,
    rankFor,
    readyRecordsForInviter,
    createSettlementSession,
    applySettlementCheck,
    isSettlementSessionComplete,
    finalizeSettlement
  }
};

if (typeof publish === "function") publish(api);
if (typeof module !== "undefined") module.exports = api;
