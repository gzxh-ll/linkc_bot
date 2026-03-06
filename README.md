# LinkCBot Config Tool v3 Backend

基于 Node.js + TypeScript + Express 的本地后端服务，默认端口 `39393`。

## 快速启动

```bash
npm install
npm run dev
```

生产模式：

```bash
npm run build
npm start
```

## 完整后端目录结构（按要求）

```text
backend/
├─ server/                 # 服务启动与中间件
│  ├─ app.ts
│  ├─ index.ts
│  └─ middlewares.ts
├─ routes/                 # API 路由定义
│  ├─ index.ts
│  ├─ config.routes.ts
│  ├─ bot.routes.ts
│  ├─ webhook.routes.ts
│  └─ tool.routes.ts
├─ controllers/            # 路由层到服务层的请求编排
│  ├─ config.controller.ts
│  ├─ bot.controller.ts
│  ├─ webhook.controller.ts
│  └─ tool.controller.ts
├─ services/               # 业务逻辑与数据访问
│  ├─ store.service.ts
│  ├─ config.service.ts
│  ├─ bot.service.ts
│  └─ callback-debug.service.ts
├─ webhooks/               # 回调处理模块
│  └─ receiver.ts
├─ configs/                # 环境与校验配置
│  ├─ env.ts
│  └─ schema.ts
├─ generators/             # 配置生成（如 .env 文本）
│  └─ env.generator.ts
├─ diagnosis/              # 错误检测/诊断
│  └─ inspector.ts
├─ logs/                   # 日志能力
│  └─ logger.ts
└─ utils/                  # 通用工具与类型
   ├─ http.ts
   ├─ zod.ts
   └─ types.ts
```

## 模块职责

- **routes**：负责 API 路由。
- **controllers**：处理请求参数、调用服务并返回响应。
- **services**：封装核心业务逻辑和存储访问。
- **webhooks**：负责回调接收与落库处理。
- **generators**：负责配置文件内容生成。
- **diagnosis**：负责错误检测与配置健康诊断。
- **logs**：统一日志输出。
- **server**：应用装配、启动与中间件。
- **configs**：环境配置和参数校验规则。
- **utils**：通用响应工具、类型、校验消息处理。
