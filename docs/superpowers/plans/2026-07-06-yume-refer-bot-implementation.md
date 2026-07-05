# Yume Refer Bot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete Bots.Business version of the Yume referral points bot, including delayed invite settlement, card-key shop, and admin operations.

**Architecture:** Keep the existing Bots.Business command layout and add focused libraries for shared behavior. Core calculations live in `libs/YumeConfig.js`, `libs/YumeReferral.js`, and `libs/YumeShop.js`; commands stay thin and call those libraries. Local Node tests cover the pure parts of referral and shop logic, while `node --check` protects Bots.Business command syntax.

**Tech Stack:** Bots.Business JavaScript commands, `Bot/User` properties, `Libs.ResourcesLib`, Telegram `Api.getChatMember`, Node.js `assert` for local smoke tests.

---

## File Map

- Create `tests/yume_core_test.js`: local Node assertions for shop inventory, duplicate skipping, product visibility, and referral settlement math.
- Create `libs/YumeConfig.js`: constants, admin parsing, currency/reward values, join chat list, helper message buttons.
- Create `libs/YumeReferral.js`: invite records, verification status, observation window, settlement session helpers, leaderboard data.
- Create `libs/YumeShop.js`: products, card inventory, duplicate checks, buy flow data mutations, stock and orders.
- Modify `commands/user basic/_start.js`: remove immediate invite reward and call Yume invite tracking / membership gate.
- Modify `commands/user basic/_human.js`: keep random challenges and make first-pass reward explicit.
- Modify `commands/MCLib commands/_joinedAll.js`: mark invited user as joined and observation-started.
- Modify `commands/referral/_referral.js`: show current invite stats and add refresh-settlement button.
- Create `commands/referral/_settle_referrals.js`: start async settlement checks with cooldown.
- Create `commands/referral/_settle_check_result.js`: collect Telegram membership results and finalize settlement.
- Create `commands/referral/_settle_check_error.js`: treat failed membership checks as not joined and finalize when all checks return.
- Modify `commands/referral/_myreferrals.js`: show latest 10 invite records and statuses.
- Modify `commands/referral/_toplist.js`: rank settled invite counts and show current user rank.
- Modify `commands/user basic/_shop.js`: render only visible in-stock products with buy buttons.
- Create `commands/user basic/_buy.js`: execute automatic card-key exchange.
- Modify `commands/user basic/_cards.js`: render permanent card-key vault.
- Create `commands\Admin\_addcards.js`: admin bulk card import.
- Create `commands\Admin\_stock.js`: admin stock view.
- Create `commands\Admin\_offproduct.js`: admin product hide.
- Create `commands\Admin\_onproduct.js`: admin product restore.
- Create `commands\Admin\_orders.js`: admin recent order list with full card keys.
- Create `commands\Admin\_addpoints.js`: admin manual points grant.
- Create `commands\Admin\_cutpoints.js`: admin manual points deduction.
- Modify `README.md`: add new command list and import/test notes.

## Task 1: Add Local Core Tests

**Files:**
- Create: `tests/yume_core_test.js`
- Test target, initially missing: `libs/YumeShop.js`, `libs/YumeReferral.js`

- [ ] **Step 1: Write failing tests**

Create `tests/yume_core_test.js` with Node `assert`. It should require the new libraries and test:

```javascript
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
  const result = shop.buyProduct(state, "gpt-yue-ka", {
    telegramid: 1001,
    first_name: "Misaki"
  }, 25, 1700000000000);
  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.card.code, "A-1");
  assert.strictEqual(result.newBalance, 15);
  assert.strictEqual(state.products[0].stock.length, 0);
  assert.strictEqual(state.products[0].sold, 1);
  assert.strictEqual(state.orders.length, 1);
}

function testReferralSettlementWindow() {
  const records = [];
  referral.recordInvite(records, { telegramid: 1, first_name: "Inviter" }, { telegramid: 2, first_name: "Friend" }, 1000);
  referral.markHumanVerified(records, 2, 2000);
  referral.markJoinedAll(records, 2, 3000);
  assert.strictEqual(referral.getRecordStatus(records[0], 3000, 7200000), "观察中");
  assert.strictEqual(referral.getRecordStatus(records[0], 7203001, 7200000), "可结算");
  referral.markSettled(records, records[0].id, 7300000);
  assert.strictEqual(referral.getRecordStatus(records[0], 8000000, 7200000), "已结算");
}

testShopImportSkipsDuplicates();
testShopBuyMovesCardToOrder();
testReferralSettlementWindow();
console.log("yume core tests passed");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/yume_core_test.js`

Expected: fails because `libs/YumeShop.js` and `libs/YumeReferral.js` do not exist or do not export `_test`.

- [ ] **Step 3: Commit failing tests**

Commit only the test file.

## Task 2: Implement Shared Config

**Files:**
- Create: `libs/YumeConfig.js`

- [ ] **Step 1: Add config library**

Implement:

- `currency()` returns `SETTINGS.CURRENCY || "积分"`.
- `referReward()` returns numeric `SETTINGS.REFER_REWARD || 1`.
- `humanReward()` returns numeric `SETTINGS.HUMAN_REWARD || 1`.
- `bonusReward()` returns numeric `SETTINGS.BONUS_REWARD || 0.5`.
- `bonusIntervalHours()` returns numeric `SETTINGS.BONUS_INTERVAL || 24`.
- `observationMs()` returns `7200000`.
- `settleCooldownMs()` returns `60000`.
- `joinChats()` returns `["@yumeGptplus", "@yumeHubplus"]` unless MembershipChecker settings are configured.
- `adminIds()` parses `SETTINGS.ADMINS` into strings.
- `isAdmin(user)` checks `user.telegramid`.
- `mainMenuButtons()` returns the agreed 2-column inline menu.

The library must `publish(api)` for Bots.Business and `module.exports = api` for local checks.

- [ ] **Step 2: Syntax check**

Run: `node --check libs/YumeConfig.js`

Expected: no output and exit code `0`.

- [ ] **Step 3: Commit**

Commit `libs/YumeConfig.js`.

## Task 3: Implement Shop Library

**Files:**
- Create: `libs/YumeShop.js`
- Test: `tests/yume_core_test.js`

- [ ] **Step 1: Implement pure and Bots.Business shop functions**

Implement these pure functions under `_test` and reused by Bots.Business wrappers:

- `createState()`
- `slugify(name)`
- `importCards(state, title, price, codes)`
- `visibleProducts(state)`
- `buyProduct(state, productId, buyer, balance, now)`
- `offProduct(state, title)`
- `onProduct(state, title)`
- `formatStock(state)`
- `formatOrders(state, limit)`

Bots.Business wrappers should read and write `Bot.getProperty("YUME_SHOP_STATE")` and `Bot.setProperty("YUME_SHOP_STATE", state, "json")`.

- [ ] **Step 2: Run tests**

Run: `node tests/yume_core_test.js`

Expected: fails only on missing referral library if `YumeReferral.js` is not done yet; shop-specific assertions pass once referral require is temporarily present or after Task 4.

- [ ] **Step 3: Syntax check**

Run: `node --check libs/YumeShop.js`

Expected: exit code `0`.

- [ ] **Step 4: Commit**

Commit `libs/YumeShop.js`.

## Task 4: Implement Referral Library

**Files:**
- Create: `libs/YumeReferral.js`
- Test: `tests/yume_core_test.js`

- [ ] **Step 1: Implement pure referral functions**

Implement:

- `recordInvite(records, inviter, invited, now)`
- `markHumanVerified(records, invitedTelegramId, now)`
- `markJoinedAll(records, invitedTelegramId, now)`
- `getRecordStatus(record, now, observationMs)`
- `getInviterStats(records, inviterTelegramId, now, observationMs)`
- `getRecentForInviter(records, inviterTelegramId, now, observationMs, limit)`
- `markSettled(records, recordId, now)`
- `leaderboard(records)`
- `rankFor(records, telegramid)`

Record shape:

```javascript
{
  id: "inviterTelegramId:invitedTelegramId",
  inviter_id: 1,
  inviter_name: "Inviter",
  invited_id: 2,
  invited_name: "Friend",
  created_at: 1000,
  human_verified_at: null,
  joined_all_at: null,
  settled_at: null,
  notify_sent: false
}
```

- [ ] **Step 2: Implement Bots.Business wrappers**

Add wrappers around `Bot.getProperty("YUME_REFERRAL_RECORDS")` and `Bot.setProperty("YUME_REFERRAL_RECORDS", records, "json")`.

- [ ] **Step 3: Run tests**

Run: `node tests/yume_core_test.js`

Expected: `yume core tests passed`.

- [ ] **Step 4: Syntax check**

Run: `node --check libs/YumeReferral.js`

Expected: exit code `0`.

- [ ] **Step 5: Commit**

Commit `libs/YumeReferral.js` and passing test updates.

## Task 5: Wire User Entry, Verification, and Join State

**Files:**
- Modify: `commands/user basic/_start.js`
- Modify: `commands/user basic/_human.js`
- Modify: `commands/MCLib commands/_joinedAll.js`
- Modify: `commands/MCLib commands/_needJoinAll.js`
- Modify: `commands/MCLib commands/_justJoinedOne.js`

- [ ] **Step 1: Update `/start`**

Use `Libs.ReferralLib.track` only for binding, and call `Libs.YumeReferral.recordInvite(inviter, user)` inside the attracted callback. Remove the old immediate `rewardInviterIfNeeded()` call.

- [ ] **Step 2: Update `/human` and answer handler**

When the answer is correct for the first time:

- set `human_verified = true`
- add `HUMAN_REWARD`
- call `Libs.YumeReferral.markHumanVerified(user.telegramid)`

- [ ] **Step 3: Update membership callbacks**

When all joining is confirmed, call `Libs.YumeReferral.markJoinedAll(user.telegramid)`.

- [ ] **Step 4: Syntax check changed commands**

Run `node --check` on all modified command files.

Expected: exit code `0`.

- [ ] **Step 5: Commit**

Commit entry, human verification, and membership changes.

## Task 6: Implement Invite Pages and Settlement

**Files:**
- Modify: `commands/referral/_referral.js`
- Create: `commands/referral/_settle_referrals.js`
- Create: `commands/referral/_settle_check_result.js`
- Create: `commands/referral/_settle_check_error.js`
- Modify: `commands/referral/_myreferrals.js`
- Modify: `commands/referral/_toplist.js`

- [ ] **Step 1: Update `/referral` page**

Show invite link, current balance, bound count, observing count, settle-ready count, settled count, and buttons for refresh, details, leaderboard, copy link, and main menu.

- [ ] **Step 2: Add `/settle_referrals`**

Apply 60-second cooldown. Find candidates that are human-verified, joined-all, not settled, and older than 2 hours. For each candidate, call Telegram `Api.getChatMember` for `@yumeGptplus` and `@yumeHubplus` with callback data containing a settlement session id.

- [ ] **Step 3: Add settlement result collection**

`/settle_check_result` and `/settle_check_error` update a session object. When all checks finish, settle records where both chats returned `member`, `administrator`, or `creator`, then add `REFER_REWARD` points to the inviter.

- [ ] **Step 4: Update details and leaderboard**

`/myreferrals` shows latest 10 records and statuses. `/toplist` ranks settled counts, displays top 10 and current user rank.

- [ ] **Step 5: Syntax check**

Run `node --check` on all referral command files.

Expected: exit code `0`.

- [ ] **Step 6: Commit**

Commit referral pages and settlement.

## Task 7: Implement Shop User Flow

**Files:**
- Modify: `commands/user basic/_shop.js`
- Create: `commands/user basic/_buy.js`
- Modify: `commands/user basic/_cards.js`
- Modify: `commands/user basic/_balance.js`

- [ ] **Step 1: Update `/shop`**

Render only visible in-stock products. Each button calls `/buy <productId>`.

- [ ] **Step 2: Add `/buy`**

Check membership, balance, product status, and stock. On success, deduct points, consume one card, append the card to `User.getProperty("card_keys")`, save an order, notify admins, and show the card to the user.

- [ ] **Step 3: Update `/cards`**

Show all saved card keys permanently, newest first, with product name and time.

- [ ] **Step 4: Syntax check**

Run `node --check` on the modified user command files.

Expected: exit code `0`.

- [ ] **Step 5: Commit**

Commit shop user flow.

## Task 8: Implement Admin Commands

**Files:**
- Create: `commands\Admin\_addcards.js`
- Create: `commands\Admin\_stock.js`
- Create: `commands\Admin\_offproduct.js`
- Create: `commands\Admin\_onproduct.js`
- Create: `commands\Admin\_orders.js`
- Create: `commands\Admin\_addpoints.js`
- Create: `commands\Admin\_cutpoints.js`

- [ ] **Step 1: Add `/addcards`**

Parse the first line as product title and price, following lines as card keys. Reject malformed input. Import cards through `Libs.YumeShop.importCards`.

- [ ] **Step 2: Add stock and order views**

`/stock` renders product price, remaining stock, sold count, and status. `/orders` renders the latest 20 orders with full card keys.

- [ ] **Step 3: Add product status commands**

`/offproduct 商品名` hides a product. `/onproduct 商品名` restores a product.

- [ ] **Step 4: Add points adjustment commands**

`/addpoints 用户ID 数量` and `/cutpoints 用户ID 数量` update `Libs.ResourcesLib.anotherUserRes("balance", userId)`. `/cutpoints` refuses to make the balance negative. Both commands notify the target user and return an admin receipt.

- [ ] **Step 5: Syntax check**

Run `node --check` on all new admin command files.

Expected: exit code `0`.

- [ ] **Step 6: Commit**

Commit admin commands.

## Task 9: Documentation and Final Verification

**Files:**
- Modify: `README.md`
- Run checks over: `libs/*.js`, `commands/**/*.js`, `tests/*.js`

- [ ] **Step 1: Update README**

Add command list, admin usage examples, import URL, and required Membership Checker configuration.

- [ ] **Step 2: Run local tests**

Run: `node tests/yume_core_test.js`

Expected: `yume core tests passed`.

- [ ] **Step 3: Run syntax checks**

Run a PowerShell loop:

```powershell
Get-ChildItem -Recurse -Include *.js | ForEach-Object { node --check $_.FullName }
```

Expected: no syntax errors.

- [ ] **Step 4: Check git status**

Run: `git status --short`

Expected: only intentional README changes before final commit.

- [ ] **Step 5: Commit and push**

Commit final docs and push to `origin main`.

## Self-Review Notes

- Spec coverage: user onboarding, delayed referral settlement, card shop, admin stock/order/points commands, membership gating, duplicate card skipping, and verification are all mapped to tasks.
- No intentionally deferred scope remains in this plan.
- Property names are centralized in the planned libraries to avoid command-level string drift.
