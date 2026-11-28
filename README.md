# ai-subscription-doctor

> **2026 AI 订阅网络环境体检、防封分流规则生成与支付风控报错离线诊断工具箱（ChatGPT / Codex / Gemini / Claude / Grok）**  
> An open-source diagnostic CLI, routing rules generator, and troubleshooting knowledge base for AI subscription payment errors, region checks, and account safety.

[![Node.js >= 18](https://img.shields.io/badge/Node.js-%3E%3D18-339933?style=flat-square)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/Web%20Tool-GitHub%20Pages-2563eb?style=flat-square)](https://imzyw.github.io/ai-subscription-doctor/)

`ai-subscription-doctor` 是一个面向中文开发者与海外 AI 工具用户的纯本地只读诊断工具、代理防封分流规则生成器与排障百科。它不收集任何 API Key、邮箱密码或浏览器 Cookie，仅在本地检测当前代理分流连通性、DNS 归属地、系统时间偏差，一键生成防 403 / 拒付的完整分流规则片段，并提供 2026 年全平台 57 条支付与风控报错代码离线秒查。

---

## 🌐 在线免费工具箱（免安装即用）

无需下载安装 Node.js，直接访问纯静态无依赖的 GitHub Pages 网页版工具：

👉 **[https://imzyw.github.io/ai-subscription-doctor/](https://imzyw.github.io/ai-subscription-doctor/)**

### 三大实用能力一览
1. **Clash / Mihomo / Shadowrocket AI 防封分流规则一键生成器**：支持 OpenAI / ChatGPT / Codex、Stripe 支付网关、Google Gemini、Claude、Grok 分流勾选与策略组自定义导出，彻底解决 `pay.openai.com` / `auth.openai.com` / `checkout.stripe.com` 漏分流导致的 403 与发卡行拒付。
2. **57 条 AI 订阅支付与风控报错离线秒查**：内置全平台完整排查库，支持检索 `OR-REH-04`、`Your card was declined`、`Codex 手机号`、`403`、`升级按钮变灰`、`3DS 验证`，点击展开根因与避坑红线。
3. **2026 订阅档位官方倍率与成本速算器**：准确反映官方 ChatGPT Plus（标准 1x）、Pro 100（10x）、Pro 200（20x 极速）、Pro 500（50x 顶格算力破除 5 小时限制）档位对比，测算自申虚拟卡隐性开销与风控风险。

---

> ### 💡 懒得折腾外卡与虚拟卡？无需外卡，2 分钟支付宝/微信自助充值自己 ChatGPT Plus 账号（不交密码、稳定不封号）
> 
> 如果你不想承受海外虚拟信用卡的高额开卡费（$5-$10/张）、充值手续费（3%-6%）、频发的 Stripe 拒付扣罚或卡段被封资金沉淀风险，可直接使用正规官方代付收银台：
> - **核心优势**：支持支付宝 / 微信 / USDT · 无需外币信用卡 · 无需交出账号密码 · 官方正规代付无黑卡拒付风险 · 2 分钟全自动发货与查单
> - **热门服务**：ChatGPT Plus ¥158 | Go ¥59 | Pro 100 (10x) ¥758 | Pro 200 (20x) ¥1,228 | Pro 500 (50x) ¥3,580 | Codex 额度包 | 美区实卡 Codex 手机接码验证 ¥2.2 起（纯正实体卡号段，彻底解决收不到验证码）
> - **自助收银与避坑导航**：
>   - 🛒 [ChatGPT 正规自助充值收银台](https://gpt.gptyw.pro/?utm_source=github&utm_medium=readme&utm_campaign=ai-subscription-doctor)
>   - 📖 [2026 订阅防封与售后避坑指南](https://gptyw.pro/guide.html)
>   - ⚡ [在线报错急救秒查与比价雷达](https://gpt.imzyw.com/)

---

## 快速开始（本地 CLI 方式）

确保本地已安装 Node.js 18+ 即可运行：

```bash
git clone https://github.com/imzyw/ai-subscription-doctor.git
cd ai-subscription-doctor

# 1. 本地网络与支付网关连通性只读体检（零凭据、纯只读）
node bin/doctor.mjs check

# 2. 离线速查指定报错代码或关键词（内置 57 条报错库）
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

### 2026 年 11 月底最新动态与避坑专刊（在线图文直读）
- [12 月新规后 ChatGPT 怎么选？Go / Plus / Pro 10x / 20x / 50x 额度与人群对照](https://gpt.imzyw.com/guides/chatgpt-go-vs-plus-vs-pro-10x-20x-50x-december-2026/)
- [Gemini Tasks 定时自动任务怎么用？国内开启条件与 ChatGPT Tasks 实测对比](https://gpt.imzyw.com/guides/gemini-4-tasks-scheduled-automation-china-guide-2026/)
- [Claude Code 写大项目总撞 5 小时限额？6 个实测省一半 Token 的工程技巧](https://gpt.imzyw.com/guides/claude-code-rate-limit-5h-window-tips-2026/)
- [2026 AI 深度搜索横评：Perplexity Pro、ChatGPT Search 与 Grok DeepSearch 谁最准？](https://gpt.imzyw.com/guides/perplexity-pro-vs-chatgpt-search-vs-grok-deepsearch-2026/)
- [GPT-6.2 Astra 额度掉快 40%？11 月 26 日计费修复与 Banked Reset 应对指南](https://gpt.imzyw.com/guides/gpt-6-2-astra-sol-quota-cut-40-percent-banked-reset-2026/)
- [Google AI Plus 不能选 Pro 模型了？2026 年 11 月档位大改与 Gemini 4 Carbon 涨价前攻略](https://gpt.imzyw.com/guides/google-ai-plus-removed-pro-model-upgrade-pro-guide-2026/)
- [Claude Mythos 5.2 与 Fable 5.2 怎么选？Rust 提速与近期报错波动应对指南](https://gpt.imzyw.com/guides/claude-mythos-5-2-vs-fable-5-2-rust-api-outage-guide-2026/)
- [Grok Bot 1.3.0 上线与 SuperGrok 算力限额：2026 年底 Grok 还值得买吗？](https://gpt.imzyw.com/guides/grok-bot-1-3-supergrok-limits-china-subscribe-2026/)
- [ChatGPT / Claude / Gemini 绑卡一直报 Your card was declined？2026 银行 CNP 与 3DS 排查清单](https://gpt.imzyw.com/guides/chatgpt-claude-gemini-3ds-cnp-card-declined-2026-checklist/)

### 完整排查与对比知识库
- [在线免费工具箱（GitHub Pages 直达）](https://imzyw.github.io/ai-subscription-doctor/)
- [飞书（Lark）公开维基在线阅读版（免登录直达）](https://ucnsm4aewnst.feishu.cn/wiki/YsP9wCWNBidKl3kvHS3c34tjnMf)
- [DeepSeek API 调整定价（峰谷分时计费）后怎么选最省钱？对比 ChatGPT / Codex / Gemini](./docs/deepseek-api-price-hike-vs-chatgpt-codex-gemini-2026.md)
- [2026 年底四大 AI 编程工具横评：Cursor / Claude Code / Codex / Antigravity](./docs/cursor-claude-code-codex-antigravity-coding-compare-2026.md)
- [2026 美区 Apple ID 充值礼品卡被锁 / 72 小时风控解封排查指南](./docs/us-apple-id-gift-card-72h-lock-unlock-guide-2026.md)
- [Google AI Pro 改版（原 Gemini Advanced）与 Plus / Ultra 5x·20x 反重力额度避坑指南](./docs/google-ai-pro-vs-plus-ultra-antigravity-2026.md)
- [Claude Max（5x/20x）与 Claude Code 封号会退款吗？2026 诱因排查与止损手册](./docs/claude-max-code-ban-refund-appeal-2026.md)
- [ChatGPT 微软 Outlook / 企业邮箱收不到登录验证码（OTP）急救指南](./docs/chatgpt-outlook-corporate-email-otp-ban-fix-2026.md)
- [Codex / OpenAI 手机收不到验证码与美区实体卡排查](./docs/codex-sms-verification-us-sim-guide.md)
- [ChatGPT "Your card was declined" 与 Stripe 3DS 拒付排查](./docs/chatgpt-card-declined-stripe-2026.md)
- [2026 ChatGPT Plus / Pro 100 (10x) / Pro 200 (20x) / Pro 500 (50x) 算力选型指南](./docs/chatgpt-pro-10x-20x-50x-comparison-2026.md)
- [Google Play OR-REH-04 / OR-CCSEH-21 地区验证失败排查](./docs/gemini-or-reh-04-google-play-fix.md)
- [Gemini 教育号与 Ultra 5x/20x 差异及 Antigravity 兼容避坑](./docs/gemini-edu-vs-ultra-antigravity-guide.md)
- [Clash / Mihomo / Shadowrocket 防 403 防拒付分流规则实战](./docs/clash-shadowrocket-ai-anti-ban-rules.md)
- [Claude 注册防秒封：精养 Gmail 2FA 与节点隔离清单](./docs/claude-china-register-anti-ban-checklist.md)
- [Grok Plus 与 SuperGrok 国内稳定订阅与常见报错](./docs/grok-plus-supergrok-china-guide-2026.md)
- [美区 Apple ID 与苹果礼品卡订阅 AI 防封防锁机指南](./docs/apple-gift-card-us-id-ai-subscription-risks.md)
- [海外虚拟信用卡隐性开卡/手续费/封卡成本账单拆解](./docs/virtual-card-hidden-fees-vs-self-recharge.md)
- [Codex / ChatGPT 桌面端手机验证收不到码排查（基础篇）](./docs/chatgpt-codex-phone-verification.md)
- [2026 全平台 AI 订阅支付与风控报错百科](./docs/payment-error-codes-2026.md)
- [飞书（Lark）公开维基导出排版稿（Markdown 源码）](./docs/lark-wiki-export.md)

---

## 开源协议与声明

本项目基于 [MIT License](LICENSE) 纯开源维护，仅供网络诊断与开发交流，不修改任何官方网站数据。
