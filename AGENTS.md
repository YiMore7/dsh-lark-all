# dsh-lark-all — dsh 飞书通道插件自持 fork

项目类型: Standard（工程维护仓）

## 定位

DeepSeek Harness（dsh）飞书通道插件的自持 fork：upstream = `tkwkeven/dsh-lark-all`，fork 仓 = `YiMore7/dsh-lark-all`，**本仓 = 唯一源码固定家**。上游迭代不覆盖本地需求（斜杠命令、错误日志、会话锁自愈等本地补丁），所有定制收敛在本仓，经正规部署通道生效。服务对象：agent-os 项目的飞书主信道（dsh-feishu launchd 常驻）。

## 部署链路（唯一正道）

1. 改动 → 本仓 `src/` → commit
2. build（esbuild，产物入库 `dist/`，git 安装免构建）
3. `dsh plugin update` 正规通道部署（锁文件随之对齐）
4. 验证：dsh-feishu launchd 服务（`com.agentos.dsh-feishu`）长连接恢复 + 飞书实测一条消息流式响应

**禁止只改部署产物不回写本仓**——曾有三次手工拷 dist 热修导致锁文件不对齐，酿成 11-12 锁冲突事故，已全部收口到正规通道。

## 工程红线（事故教训，勿再踩）

1. **esbuild 中文转义**：dist 产物中文一律转成 `\uXXXX`，`grep 中文` 验证必假阴性——验证产物须 grep 英文标识符，或回源码验证。
2. **单实例铁律**：全机只允许一个 dsh 网关实例，多实例会话竞态（瞭望塔 3e 巡检兜底告警）。
3. **跨核会话锁**：桌面端与飞书侧不同开同一 lark 会话（桌面核持锁 → 飞书断）。861acfd 已做 resume 重试自愈 + 人话指引；根治欠账（跨核锁等待/只读打开）待上游方案，不自造。
4. **dsh-session 兼容**：v0.2.x 起废弃 `.events` 属性（改 seq + snapshotEvents），碰会话历史 API 前先核对版本。

## 本地补丁台账（相对 upstream，详见 git log）

- `3033252` 斜杠命令最小集（/new /tasks /ping /status /cancel /help）、错误详情落日志、taskFullAccess 配置化（默认 false）、任务话题首轮自动命名
- `3608905` v4 会话格式 kind:'plugin' 种子修复（首起 UNKNOWN 事故定谳件）
- `861acfd` 会话写锁被桌面核持有时 resume 重试自愈（3×10s）+ 人话指引
- 更早：macOS launchd 工作目录 TCC、SessionPersistence 快照映射、SessionAlreadyExists 降级自愈、dsh-session v0.2.x 适配

## 退场判据

上游若吸收全部本地补丁且不再断代（会话格式/事件 API 变更不再踩空），本 fork 退役回归 upstream；评估信号 = 连续两个上游版本无需 rebase 本地补丁。
