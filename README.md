# LinkCBot Lab

> 微信生态联调实验室 · WeChat Dev Lab

**LinkCBot Lab** 是一款面向中国开发者的本地联调工具，把下面这些东西统一收口到一个界面里：

- 企业微信
- 微信支付
- 飞书机器人
- 钉钉机器人
- QQ 机器人
- Webhook 回调服务器
<img width="2559" height="1359" alt="image" src="https://github.com/user-attachments/assets/8affbf97-5af3-40bd-a57d-e7fd0d8d2ae9" />

你可以在一个工具里完成：配置、检测、回调/推送调试、错误诊断与多环境管理。

---

## ✨ 核心特性

### 1. 多环境 Profile 管理

- 内置三套 Profile：`dev / staging / prod`
- 顶部一键切换当前环境，所有表单、ENV 生成、检测、回调测试均基于当前 Profile
- 支持按 Profile 导出 / 导入 JSON 配置，便于：
  - 团队共享配置
  - 新开发机快速恢复环境
  - 备份线上配置

出厂导出格式示例：

```json
{
  "version": 1,
  "profile": "dev",
  "connectors": {
    "wechatpay": { "...": "..." },
    "wecom": { "...": "..." }
  }
}
```

导入时会进行：

- `version` 兼容性检查（目前支持 version=1）
- 显示源 profile 与当前 profile
- 确认覆盖提示（展示多少个 connector 将被覆盖）

---

### 2. 统一的 Connector 机制

每个平台都被建模为一个 Connector，包含：

- `id`：平台标识（如 `wechatpay` / `wecom` / `feishu` 等）
- `name`：展示名称
- `category`：wechat/pay/bot/webhook 等
- `fields`：配置字段（label / type / required / placeholder / sensitive）
- `defaults`：默认值
- `buildEnv(config, options)`：生成环境变量
- `diagnose(config)`：自动检测规则
- `callbackTest(config)`：回调 / 推送测试器（视平台支持情况）

得益于统一的 Connector 规范，前端 UI 可以：

- 自动渲染表单（含必填标记、隐藏敏感字段）
- 一键生成 ENV
- 一键执行自动检测
- 对支持的 Connector 展示“回调调试”按钮

当前已内置连接器：

- 企业微信（WeCom）
- 微信支付（WeChat Pay）
- 飞书机器人（Feishu Bot）
- 钉钉机器人（DingTalk Bot）
- QQ 机器人（QQ Bot）
- Webhook 回调服务器（自建服务）

---

### 3. 扫码导入 · 标准化 + 签名防篡改

**统一扫码格式**

- URI 规范：`linkcbot://import?v=1&payload=...&sig=...`
- `payload`：Base64URL 编码的 JSON，包含：
  - `v`：schema 版本（目前为 1）
  - `ts`：时间戳
  - `nonce`：随机串
  - `connector`：connector id
  - `config`：配置对象

**签名防篡改**

- `sig = HMAC-SHA256(shareKey, payload)`（hex）
- shareKey 由用户在「系统设置」中配置，保存于本机浏览器存储
- 导入时会对 `sig` 进行验签，UI 显示：
  - 签名是否通过（通过/未通过）
  - schema 版本
  - 失败原因（如 shareKey 不匹配、当前环境未配置 shareKey 等）

**两种使用方式**

- 导出侧：
  - 在某个平台配置好后，点击「复制扫码链接」：
    - 调用后端 `/api/scan/sign` 生成 `linkcbot://import...` URI
    - 自动复制到剪贴板
    - 同时在界面上展示二维码，供其他设备扫码导入
- 导入侧：
  - 可以用摄像头扫二维码，或者粘贴整个 URI/JSON 字符串
  - 工具会调用 `/api/scan/parse` 解码/验签，并展示预览
  - 用户点击「应用到配置」，即可在当前 Profile 中写入对应 connector 的配置

---

### 4. 自动检测与错误知识库

每次「自动检测」将生成 `issues[]`，包含：

- `level`: error / warn / info
- `code`: 机器可读错误码
- `field`: 相关字段
- `message`: 人类可读描述
- `remedy`: 建议的修复措施
- `error_id`: 可选错误库条目 id

错误库存放典型坑位，例如：

- `WX_ACK_RETRY`：微信支付回调一直重试
- `DOMAIN_INVALID`：回调域名无效
- `HTTPS_REQUIRED`：回调必须使用 HTTPS
- `FEISHU_SIGN_FAIL`：飞书机器人签名校验失败
- `DINGTALK_SIGN_FAIL`：钉钉机器人加签失败
- …

前端会：

- 在检测结果中展示错误信息与 remedy
- 对带 `error_id` 的问题，给出「查看修复建议」按钮
- 跳转到“常见错误诊断”页面，并自动带上搜索条件

这样，从“检测出问题”到“找到修复路径”，只需要两三个点击。

---

### 5. 回调 / 推送调试与 ACK 判定

LinkCBot Lab 可以为不同平台构造不同形式的联调请求，并尽量做「ACK 判定」，而不是只看 HTTP 200。

- **微信支付**
  - 生成 notify/refund 回调 URL
  - 构造模拟回调请求（HTTP）
  - 检查 HTTP 状态码与返回内容，判断微信是否会认为“成功”或“会重试”
  - 结合错误库给出诊断（如 HTTPS/证书/Nginx 路径问题）

- **企业微信**
  - 构造 URL 验证流程（echostr 加密 + 签名 + 解密）
  - 判断服务端是否正确返回预期明文
  - 用于快速验证企业微信回调配置是否可用

- **飞书 / 钉钉 / QQ 机器人**
  - 向 Webhook 发送测试消息：
    - 飞书：根据 `code=0` 判定是否成功
    - 钉钉：根据 `errcode=0` 判定是否成功，并识别典型的加签错误
    - QQ：根据 HTTP 200 判定是否成功
  - 记录响应体，便于手工排查

所有测试结果会同步写入“操作日志”模块，便于之后回顾。

---

### 6. 操作日志与可观测性

为了便于排查问题和做轻量级审计，LinkCBot Lab 在本地记录最近 200 条关键操作：

- 记录字段：
  - 时间戳
  - Profile（dev/staging/prod）
  - Connector Id
  - Action（diagnose/env_generate/callback_test/scan_parse/errors_search）
  - Result（success/fail）
  - Detail（简短摘要，如 status/code/ACK 判定等）

- UI 提供：
  - 专门的“操作日志”页面
  - 支持按 Profile / Connector / Action 过滤
  - 一键清空本地日志

这有助于你回答：**“刚刚我在什么环境，对哪个平台做了哪些操作，结果如何？”**

---

## 🧩 支持矩阵（概览）

> 以下是当前版本的能力覆盖概览（简要版，可与 `app/platforms.ts` 对齐）。

| 平台              | 配置能力                                | ENV 生成                   | 自动检测                               | 回调/推送测试                       | ACK 判定 & 错误库          |
|-------------------|-----------------------------------------|----------------------------|----------------------------------------|-------------------------------------|----------------------------|
| 企业微信 WeCom    | corpId/agentId/corpSecret/回调参数      | 企业微信相关 ENV           | 字段格式、ID 误填 URL 等              | URL 验证流程                        | URL 验证错误、字段格式等    |
| 微信支付 Pay      | 商户号、密钥、证书、回调域名/路径      | 支付/退款相关 ENV/URL      | 域名/HTTPS/路径规则                   | 回调模拟                           | 回调重试、HTTPS、Nginx 等 |
| 飞书机器人 Feishu | Webhook URL、签名 Secret                | Webhook ENV                | 必填项检查                            | 发送测试消息                       | 签名错误、时间戳问题等     |
| 钉钉机器人 DingTalk| Webhook URL、加签 Secret               | Webhook ENV                | 必填项检查                            | 加签请求 + errcode 判定            | 加签失败、errcode 310000 等|
| QQ 机器人         | Webhook URL、Secret                     | Webhook ENV                | 必填项检查                            | 发送测试消息                       | 基础失败原因提示           |
| Webhook 回调服务器 | 域名、notify/refund 路径                | 回调 URL ENV               | 域名/路径拼接                         | 与其他平台配合联调                | 路径错误导致的 404/路由问题|

---

## 🏗 技术栈与架构

- 前端：Next.js 14 + React 18 + Tailwind CSS
- 后端：Node.js + Express（本地 Node API）
- 桌面：Electron（封装前端与 Node API，提供 Windows EXE）
- 数据存储：本机浏览器 LocalStorage（配置、Profile、日志等）
- 开发语言：TypeScript（前端）、JavaScript（后端）

---

## 🚀 快速开始（开发者视角）

> 以下为典型的本地开发流程说明，实际命令请以仓库脚本为准。

### 1. 克隆仓库

```bash
git clone https://github.com/your-org/linkcbot-lab.git
cd linkcbot-lab
```

### 2. 安装依赖

```bash
# 根目录安装 Workspace 依赖
npm install
```

### 3. 启动 Node API

```bash
cd backend/node-api
npm run dev
# 默认监听 39394 端口
```

### 4. 启动前端 UI

```bash
cd frontend/nextjs-app
npm run dev
# 默认监听 39393 端口
```

浏览器打开：http://localhost:39393

### 5. （可选）启动桌面应用

```bash
cd desktop/electron
npm run dev
```

---

## 🧪 开发与验证

- 前端 ESLint：

```bash
cd frontend/nextjs-app
npm run lint
```

- Node API 简单自检：
  - 使用 `node --check` 对关键脚本做语法检查；
  - 或 curl 调用 `/api/connectors` 确认连通。

---

## 🗺 规划与路线图（Roadmap）

- [ ] CLI / CI 集成：
  - 提供命令行入口，支持：
    - `linkcbot-lab diagnose --profile prod --connector wechatpay`
    - `linkcbot-lab callback-test --profile staging --connector wecom`
  - 在 CI 中输出 Markdown/HTML 报告。

- [ ] 更多平台与规则：
  - 支持更多机器人/开放平台；
  - 持续扩展错误库（HTTPS/网络/DNS/容器环境相关问题）。

- [ ] 更丰富的可观测性：
  - 按时间范围过滤日志；
  - 导出操作日志以便团队协作排查。

---

## 🤝 适用人群

- 需要频繁联调企业微信/微信支付回调的后端工程师
- 负责接入飞书/钉钉/QQ 机器人的研发团队
- 运营多个环境（dev/staging/prod），常常被“配置不一致”困扰的团队
- 希望把微信生态联调经验沉淀成“工具”的技术负责人

---

如果你在使用 LinkCBot Lab 的过程中踩到新的坑、希望被收录到错误库或新增某个平台的 Connector，可以通过 Issue/PR 的方式贡献，一起把这个“联调实验室”变成社区的公共基础设施。# linkc_bot
