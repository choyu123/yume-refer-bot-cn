# Yume Refer Bot CN

这是给 `yume_bot` 使用的 Bots.Business 中文邀请积分机器人模板。

核心玩法：

- 首次活人验证：默认 `+1` 积分
- 每日签到：默认 `+0.5` 积分
- 有效邀请：默认 `+1` 积分
- 邀请好友需完成活人验证，并加入通知频道和官方交流群
- 加入频道/群后观察 2 小时，邀请人点击「刷新邀请奖励」后结算
- 积分商城自动发卡密，兑换后永久保存在「我的卡密」
- 不启用提现，钱包/提现入口已从主菜单移除

默认频道：

```text
通知频道：@yumeGptplus
官方交流群：@yumeHubplus
```

## 导入方式

在 Bots.Business 的 Git 同步页面填：

```text
https://github.com/choyu123/yume-refer-bot-cn.git
```

分支：

```text
main
```

导入后给机器人发送：

```text
/setup
```

## 必填后台配置

打开 `Admin Panel -> Yume 小店设置`：

```text
CURRENCY：积分
REFER_REWARD：1
HUMAN_VERIFY_REWARD：1
BONUS_REWARD：0.5
BONUS_INTERVAL：24
ADMINS：你的 Telegram 数字 ID
REFER_LINK_PREFIX：ref
BACKGROUND_MEMBERSHIP_CHECKUP：关闭
MINIMUM_WITHDRAW：999999
MAXIMUM_WITHDRAW：999999
```

打开 `Admin Panel -> Membership Checker Options`：

```text
Chats or channels for checking:
@yumeGptplus,@yumeHubplus

onNeedJoining:
/needJoinAll

onJoining:
/justJoinedOne

onAllJoining:
/joinedAll

onError:
/mclibError
```

把机器人加入 `@yumeGptplus` 和 `@yumeHubplus`，并设置为管理员，否则无法校验成员状态。

## 用户命令

```text
/start            打开主菜单
/human            活人验证
/bonus            每日签到
/referral         邀请赚积分
/settle_referrals 刷新邀请奖励
/myreferrals      邀请明细
/toplist          邀请排行
/balance          我的积分
/shop             积分商城
/cards            我的卡密
/help             使用教程
```

## 管理员命令

批量导入卡密：

```text
/addcards 商品名 价格
卡密1
卡密2
卡密3
```

例子：

```text
/addcards GPT月卡 10
YUME-AAA-001
YUME-BBB-002
YUME-CCC-003
```

同名商品会自动补货并更新价格；重复卡密会跳过。

库存和订单：

```text
/stock
/orders
```

商品上下架：

```text
/offproduct 商品名或商品ID
/onproduct 商品名或商品ID
```

手动调整积分：

```text
/addpoints 用户ID 数量
/cutpoints 用户ID 数量
```

`/cutpoints` 不会把用户积分扣成负数。

## 本地验证

```powershell
node tests\yume_core_test.js

$failed = @()
Get-ChildItem -Recurse -Include *.js | ForEach-Object {
  node --check $_.FullName
  if ($LASTEXITCODE -ne 0) { $failed += $_.FullName }
}
if ($failed.Count -gt 0) { $failed } else { "OK" }
```
