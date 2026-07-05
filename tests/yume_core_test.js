const assert = require("assert");

const shop = require("../libs/YumeShop.js")._test;
const referral = require("../libs/YumeReferral.js")._test;

function testShopImportSkipsDuplicates() {
  const state = shop.createState();
  const result = shop.importCards(state, "GPT月卡", 10, ["A-1", "A-1", "B-2"]);

  assert.strictEqual(result.added, 2);
  assert.strictEqual(result.skipped, 1);
  assert.strictEqual(state.products[0].stock.length, 2);
  assert.strictEqual(state.products[0].price, 10);
}

function testShopBuyMovesCardToOrder() {
  const state = shop.createState();
  shop.importCards(state, "GPT月卡", 10, ["A-1"]);

  const result = shop.buyProduct(
    state,
    "gpt-yue-ka",
    { telegramid: 1001, first_name: "Misaki" },
    25,
    1700000000000
  );

  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.card.code, "A-1");
  assert.strictEqual(result.newBalance, 15);
  assert.strictEqual(state.products[0].stock.length, 0);
  assert.strictEqual(state.products[0].sold, 1);
  assert.strictEqual(state.orders.length, 1);
}

function testHiddenAndEmptyProductsAreNotVisible() {
  const state = shop.createState();
  shop.importCards(state, "GPT月卡", 10, ["A-1"]);
  shop.importCards(state, "Claude月卡", 8, ["C-1"]);
  shop.offProduct(state, "Claude月卡");
  shop.buyProduct(
    state,
    "gpt-yue-ka",
    { telegramid: 1001, first_name: "Misaki" },
    25,
    1700000000000
  );

  assert.deepStrictEqual(shop.visibleProducts(state), []);
}

function testReferralSettlementWindow() {
  const records = [];
  referral.recordInvite(
    records,
    { telegramid: 1, first_name: "Inviter" },
    { telegramid: 2, first_name: "Friend" },
    1000
  );
  referral.markHumanVerified(records, 2, 2000);
  referral.markJoinedAll(records, 2, 3000);

  assert.strictEqual(referral.getRecordStatus(records[0], 3000, 7200000), "观察中");
  assert.strictEqual(referral.getRecordStatus(records[0], 7203001, 7200000), "可结算");

  referral.markSettled(records, records[0].id, 7300000);

  assert.strictEqual(referral.getRecordStatus(records[0], 8000000, 7200000), "已结算");
}

function testReferralLeaderboardAndRank() {
  const records = [];
  referral.recordInvite(records, { telegramid: 1, first_name: "A" }, { telegramid: 11, first_name: "A1" }, 1000);
  referral.recordInvite(records, { telegramid: 1, first_name: "A" }, { telegramid: 12, first_name: "A2" }, 1000);
  referral.recordInvite(records, { telegramid: 2, first_name: "B" }, { telegramid: 21, first_name: "B1" }, 1000);
  records.forEach((record, index) => referral.markSettled(records, record.id, 2000 + index));

  const board = referral.leaderboard(records);
  assert.strictEqual(board[0].telegramid, 1);
  assert.strictEqual(board[0].count, 2);
  assert.strictEqual(referral.rankFor(records, 2), 2);
}

testShopImportSkipsDuplicates();
testShopBuyMovesCardToOrder();
testHiddenAndEmptyProductsAreNotVisible();
testReferralSettlementWindow();
testReferralLeaderboardAndRank();

console.log("yume core tests passed");
