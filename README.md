# Yume Refer Bot CN

这是给 `yume_bot` 使用的 Bots.Business 中文邀请积分机器人模板。

已包含：

- 活人验证随机算术题
- 频道/群成员校验
- 每日签到：默认 0.5 积分
- 邀请有效好友：默认 1 积分
- 首次活人验证：默认 1 积分
- 邀请链接
- 我的积分
- 邀请排行
- 邀请明细
- 积分商城占位
- 我的卡密资产库
- 使用教程

已移除主菜单里的钱包和提现入口。

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

进入 Admin Panel，打开 Membership Checker Options：

```text
Channels Chat IDs:
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

打开 Yume 小店设置：

```text
管理员 Telegram 数字 ID:
填你的 Telegram 数字 ID，可用 @userinfobot 查询
```

## Telegram 权限

把机器人加入：

```text
@yumeGptplus
@yumeHubplus
```

并设置为管理员，否则无法校验成员状态。
