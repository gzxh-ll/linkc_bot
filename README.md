# LinkCBot Config Tool v3 Backend

Node.js + TypeScript + Express 后端服务，面向 Electron 桌面工具 **LinkCBot Config Tool v3**。

- 默认端口：`39393`
- 本地数据存储：`runtime-data/store.json`
- 主要能力：
  - 企业微信配置
  - 微信支付配置
  - 机器人配置
  - Webhook 回调服务器
  - 回调调试
  - 环境变量生成
  - 错误诊断

## 1. 快速开始

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
npm start
```

健康检查：

```bash
curl http://127.0.0.1:39393/api/health
```

## 2. 项目结构

```text
linkc_bot/
├─ src/
│  ├─ config/
│  │  └─ schemas.ts               # Zod 参数校验
│  ├─ controllers/
│  │  └─ config.controller.ts     # 配置/机器人/回调/诊断控制器
│  ├─ middleware/
│  │  └─ error.middleware.ts      # 全局错误处理中间件
│  ├─ routes/
│  │  └─ index.ts                 # API 路由定义
│  ├─ services/
│  │  ├─ diagnostic.service.ts    # 错误诊断逻辑
│  │  ├─ env.service.ts           # 环境变量文本生成
│  │  ├─ store.service.ts         # 本地 JSON 持久化
│  │  └─ webhook.service.ts       # 回调日志管理
│  ├─ types/
│  │  └─ config.ts                # 核心类型定义
│  ├─ utils/
│  │  └─ http.ts                  # HTTP 响应工具
│  ├─ app.ts                      # Express App 装配
│  └─ index.ts                    # 启动入口
├─ runtime-data/                  # 运行时数据目录
├─ .env.example
├─ .gitignore
├─ package.json
├─ tsconfig.json
└─ README.md
```

## 3. API 概览

Base URL: `http://127.0.0.1:39393/api`

- `GET /health` 健康状态
- `GET /configs` 获取全部配置
- `PUT /configs/wecom` 保存企业微信配置
- `PUT /configs/wechat-pay` 保存微信支付配置
- `GET /bots` 获取机器人列表
- `POST /bots` 创建机器人
- `PUT /bots/:id` 更新机器人
- `DELETE /bots/:id` 删除机器人
- `POST /webhook/:source` 接收任意来源回调
- `GET /webhook-logs` 获取回调日志
- `POST /callback-debug` 回调调试（主动发起请求）
- `GET /env/export` 生成 `.env` 文本
- `GET /diagnostics` 获取诊断结果

## 4. 示例请求

### 4.1 保存企业微信配置

```bash
curl -X PUT http://127.0.0.1:39393/api/configs/wecom \
  -H "Content-Type: application/json" \
  -d '{
    "corpId": "ww123",
    "agentId": "1000002",
    "secret": "sec_xxx",
    "token": "token_xxx",
    "aesKey": "aes_key_xxx"
  }'
```

### 4.2 创建机器人

```bash
curl -X POST http://127.0.0.1:39393/api/bots \
  -H "Content-Type: application/json" \
  -d '{
    "type": "wechat",
    "name": "企微机器人",
    "enabled": true,
    "webhookUrl": "https://example.com/webhook",
    "secret": "bot_secret"
  }'
```

### 4.3 回调调试

```bash
curl -X POST http://127.0.0.1:39393/api/callback-debug \
  -H "Content-Type: application/json" \
  -d '{
    "targetUrl": "http://127.0.0.1:39393/api/webhook/debug",
    "method": "POST",
    "payload": { "hello": "world" }
  }'
```
