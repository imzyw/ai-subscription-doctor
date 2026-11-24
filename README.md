# ai-subscription-doctor

> **2026 AI 订阅网络环境体检与支付/风控报错离线诊断 CLI（ChatGPT / Codex / Gemini / Claude / Grok）**  
> An open-source diagnostic CLI and troubleshooting knowledge base for AI subscription payment errors, region checks, and account safety.

[![Node.js >= 18](https://img.shields.io/badge/Node.js-%3E%3D18-339933?style=flat-square)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

`ai-subscription-doctor` 是一个面向中文开发者与海外 AI 工具用户的纯本地只读诊断工具与排查百科。它不收集任何 API Key、邮箱密码或浏览器 Cookie，仅在本地检测当前代理分流连通性、DNS 归属地、系统时间偏差，并提供 2026 年全平台支付与风控报错代码离线速查。

---

## 快速开始（CLI）

无需全局安装，确保本地已安装 Node.js 18+ 即可运行：

```bash
git clone https://github.com/imzyw/ai-subscription-doctor.git
cd ai-subscription-doctor

# 1. 本地网络与支付网关连通性只读体检
node bin/doctor.mjs check

# 2. 离线速查指定报错代码或关键词
node bin/doctor.mjs lookup OR-REH-04
node bin/doctor.mjs lookup "Your card was declined"
node bin/doctor.mjs lookup "Codex 手机号"
```

### 终端输出示例

```text
$ node bin/doctor.mjs check
[ai-subscription-doctor] Running local read-only environment checks...

✓ System Clock Offset : +0.2s (OK - within Stripe/3DS tolerance)
✓ chatgpt.com         : 200 OK via US (San Jose) - Supported Region
✓ auth.openai.com     : 200 OK via US (San Jose) - Same egress IP
✗ pay.openai.com      : 403 Forbidden / Region mismatch (HK IP detected in split rule!)
✓ checkout.stripe.com : 200 OK (TLS 1.3)

[Diagnosis]
  检测到 pay.openai.com 未走同一支持区出口（疑似分流规则遗漏或落入香港节点）。
  建议：将 *.openai.com 与 *.stripe.com 统一路由至 US / JP / SG 支持区节点后再试。
```

```text
$ node bin/doctor.mjs lookup OR-REH-04
Code     : OR-REH-04
Platform : Google Play / Gemini
Severity : HIGH
Cause    : Google Payments 检测到账号归属区、付款资料国家与当前 IP 环境冲突，或新号处于风控冷却期。
Steps    :
  1. 登录 pay.google.com 检查付款资料国家，清理多余冲突的旧区资料。
  2. 确保网络出口 IP 与目标国家严格一致，并开启 Google 两步验证。
  3. 报错后至少静置冷却 72 小时，切勿反复删卡重绑。
Avoid    : 1 小时内连续解绑重绑银行卡会把冷却期拉长至 14 天以上。
```

---

## 2026 高频报错速查总表

| 报错代码 / 现象 | 所属平台 | 核心根因 | 第一步止损动作 |
| :--- | :--- | :--- | :--- |
| `Your card was declined` | ChatGPT / Stripe | 内地双币卡被拒、虚拟卡 BIN 拉黑、IP 与账单地不符 | 连败 2 次立即停手，勿硬刷第 3 次 |
| `We are unable to authenticate your payment method` | ChatGPT / Stripe | 广告拦截插件阻断 3DS 验证 iframe 或网络超时 | 关屏蔽插件 + 无痕模式重试 |
| `OR-REH-04` / `OR-CCSEH-21` / `OR-HDT-01` | Google Play / Gemini | 付款资料多区冲突或触发跨区礼品卡风控 | 清理冲突资料，冷却 72 小时 |
| `403 User location is not supported` | OpenAI / Claude | 使用了香港/澳门等非支持区节点或分流规则漏域名 | 切至美/日/新节点并清理 Cookie |
| `Upgrade button disabled`（按钮灰色） | ChatGPT | 旧 iOS/Google 订阅未彻底过期或处于 Team 工作区 | 切回 Personal 个人空间并强刷 |
| Codex / 桌面端收不到手机验证码 | OpenAI / Codex | VOIP/免费接码池被屏蔽，或短时连点触发冷却 | 停手冷却后改用实体卡号段 |
| `Account deactivated` | OpenAI / Claude | 盗刷黑卡拒付（Chargeback）或共享拼车并发 | 排查卡来源，走官方申诉工单 |

---

## 账号安全与防封红线（必读）

无论你选择自刷外币卡、苹果礼品卡还是正规充自己账号渠道，请务必严守以下底线：

1. **绝不向任何陌生个人或脚本交出主邮箱密码**（如 Gmail / Outlook 密码）。
2. **绝不交出网页 `Session Token` / `accessToken` / `Cookie`**：任何要求你安装来路不明的浏览器插件提取 Token 的行为都存在极高的数据泄露与账号被盗风险。
3. **远离“远低于官方成本”的超低价黑卡或多人拼车号**：盗刷卡在原持卡人发起拒付后会导致账号被永久封禁（`Account deactivated`）。
4. **定期导出备份对话数据**：在 ChatGPT `Settings -> Data controls -> Export data` 定期备份重要工作记录。

---

## 专题文档索引

- [Codex / ChatGPT 桌面端手机验证收不到码深度排查](./docs/chatgpt-codex-phone-verification.md)
- [2026 全平台 AI 订阅支付与风控报错百科](./docs/payment-error-codes-2026.md)
- [飞书（Lark）公开维基导出排版稿](./docs/lark-wiki-export.md)

---

## 在线工具与实测参考

- 在线报错急救秒查器与实时比价雷达：[https://gpt.imzyw.com/](https://gpt.imzyw.com/)
- 2026 购买与售后通用参考指南：[https://gptyw.pro/guide.html](https://gptyw.pro/guide.html)
