import fs from 'node:fs';
import path from 'node:path';
import cors from 'cors';
import express, { Request, Response } from 'express';

const PORT = 39393;
const app = express();

type BotConfig = {
  name: string;
  type: 'wechat' | 'feishu' | 'dingtalk' | 'qq';
  enabled: boolean;
  webhookUrl?: string;
};

type PlatformConfig = {
  wecom?: {
    corpId: string;
    agentId: string;
    secret: string;
  };
  wechatPay?: {
    mchId: string;
    apiV3Key: string;
    serialNo: string;
  };
  bots: BotConfig[];
  updatedAt: string;
};

type WebhookRecord = {
  id: string;
  source: string;
  receivedAt: string;
  payload: unknown;
};

const store: {
  config: PlatformConfig;
  webhookLogs: WebhookRecord[];
} = {
  config: {
    bots: [],
    updatedAt: new Date().toISOString()
  },
  webhookLogs: []
};

const logger = {
  info: (msg: string, meta?: unknown): void => console.log(`[INFO] ${msg}`, meta ?? ''),
  warn: (msg: string, meta?: unknown): void => console.warn(`[WARN] ${msg}`, meta ?? ''),
  error: (msg: string, meta?: unknown): void => console.error(`[ERROR] ${msg}`, meta ?? '')
};


const configFilePath = path.resolve('configs', 'config.json');
const allowedConfigKeys = new Set(['wechatWork', 'wechatPay', 'feishuBot', 'dingtalkBot', 'qqBot']);

const ensureConfigFile = (): void => {
  const dir = path.dirname(configFilePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(configFilePath)) {
    fs.writeFileSync(configFilePath, JSON.stringify({ updatedAt: new Date().toISOString() }, null, 2), 'utf-8');
  }
};

const readSavedConfig = (): Record<string, unknown> => {
  ensureConfigFile();
  return JSON.parse(fs.readFileSync(configFilePath, 'utf-8')) as Record<string, unknown>;
};

const writeSavedConfig = (payload: Record<string, unknown>): Record<string, unknown> => {
  const current = readSavedConfig();
  const next = { ...current, ...payload, updatedAt: new Date().toISOString() };
  fs.writeFileSync(configFilePath, JSON.stringify(next, null, 2), 'utf-8');
  return next;
};


const webhookLogFilePath = path.resolve('logs', 'webhooks.log');

const appendWebhookFileLog = (record: WebhookRecord): void => {
  const dir = path.dirname(webhookLogFilePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(webhookLogFilePath)) fs.writeFileSync(webhookLogFilePath, '', 'utf-8');
  fs.appendFileSync(webhookLogFilePath, `${JSON.stringify(record)}\n`, 'utf-8');
};


const runWebhookTestEndpoint = async (webhookPath: string): Promise<unknown> => {
  const response = await fetch(`http://127.0.0.1:${PORT}${webhookPath}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-linkcbot-test': '1' },
    body: JSON.stringify({ test: true, source: webhookPath, triggeredAt: new Date().toISOString() })
  });

  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    body: await response.text()
  };
};


const runDiagnosisCheck = (input: {
  webhookRequest: { url?: string; headers?: Record<string, unknown>; body?: unknown };
  httpResponse: { status: number; statusText?: string; body?: string };
}) => {
  const issues: Array<{ code: string; level: 'warning' | 'error'; message: string; suggestion?: string }> = [];
  const combined = `${(input.httpResponse.body ?? '').toLowerCase()} ${(input.httpResponse.statusText ?? '').toLowerCase()}`;

  if (combined.includes('signature') || combined.includes('签名')) {
    issues.push({ code: 'SIGNATURE_ERROR', level: 'error', message: '检测到签名错误。', suggestion: '请检查签名算法、token、timestamp、nonce。' });
  }
  if (combined.includes('certificate') || combined.includes('cert') || combined.includes('证书')) {
    issues.push({ code: 'CERTIFICATE_ERROR', level: 'error', message: '检测到证书错误。', suggestion: '请核对证书序列号、平台证书、私钥与路径配置。' });
  }
  if (input.httpResponse.status === 404 || input.httpResponse.status === 502 || input.httpResponse.status === 503 || combined.includes('connection refused') || combined.includes('econnrefused') || combined.includes('timeout') || combined.includes('unreachable')) {
    issues.push({ code: 'CALLBACK_URL_UNREACHABLE', level: 'error', message: '回调URL不可访问。', suggestion: '请确认回调地址、网络连通性与防火墙配置。' });
  }
  if (issues.length === 0 && input.httpResponse.status >= 400) {
    issues.push({ code: 'HTTP_ERROR', level: 'warning', message: `收到异常 HTTP 状态码: ${input.httpResponse.status}`, suggestion: '请查看回调服务日志。' });
  }

  return { success: issues.length === 0, issues };
};

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

app.get('/api/dashboard', (_req: Request, res: Response) => {
  const enabledBots = store.config.bots.filter((b) => b.enabled).length;
  res.json({
    service: 'LinkCBot Backend',
    status: 'ok',
    port: PORT,
    summary: {
      hasWeCom: Boolean(store.config.wecom),
      hasWechatPay: Boolean(store.config.wechatPay),
      botCount: store.config.bots.length,
      enabledBots,
      webhookLogCount: store.webhookLogs.length
    },
    updatedAt: store.config.updatedAt
  });
});

app.get('/api/dashboard/status', (_req: Request, res: Response) => {
  const botStatus = (type: BotConfig['type']): 'ok' | 'warning' => {
    const bot = store.config.bots.find((item) => item.type === type && item.enabled);
    if (!bot) return 'warning';
    return bot.webhookUrl ? 'ok' : 'warning';
  };

  res.json({
    wechatWork: store.config.wecom ? 'ok' : 'warning',
    wechatPay: store.config.wechatPay ? 'ok' : 'warning',
    feishuBot: botStatus('feishu'),
    dingtalkBot: botStatus('dingtalk'),
    qqBot: botStatus('qq'),
    webhookServer: 'ok'
  });
});

app.get('/api/config', (_req: Request, res: Response) => {
  res.json(store.config);
});

app.post('/api/config', (req: Request, res: Response) => {
  store.config = {
    ...store.config,
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  res.json({ success: true, config: store.config });
});


app.post('/api/config/save', (req: Request, res: Response) => {
  const payload = req.body as Record<string, unknown>;
  const keys = Object.keys(payload);

  if (keys.length === 0) {
    res.status(400).json({ message: '配置内容不能为空' });
    return;
  }

  const invalidKeys = keys.filter((key) => !allowedConfigKeys.has(key));
  if (invalidKeys.length > 0) {
    res.status(400).json({ message: '存在不支持的配置类型', details: invalidKeys });
    return;
  }

  const config = writeSavedConfig(payload);
  res.json({ success: true, config });
});

app.get('/api/config/get', (_req: Request, res: Response) => {
  res.json(readSavedConfig());
});

const handleWebhook = (req: Request, res: Response, sourceOverride?: string): void => {
  const record: WebhookRecord = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    source: sourceOverride ?? String(req.headers['x-source'] ?? 'unknown'),
    receivedAt: new Date().toISOString(),
    payload: req.body
  };

  store.webhookLogs.unshift(record);
  store.webhookLogs = store.webhookLogs.slice(0, 200);
  appendWebhookFileLog(record);

  logger.info('Webhook received', { id: record.id, source: record.source });
  res.json({ success: true, id: record.id });
};

app.post('/webhook/wechat/work', (req: Request, res: Response) => handleWebhook(req, res, 'wechat/work'));
app.post('/webhook/wechat/pay', (req: Request, res: Response) => handleWebhook(req, res, 'wechat/pay'));
app.post('/webhook/feishu', (req: Request, res: Response) => handleWebhook(req, res, 'feishu'));
app.post('/webhook/dingtalk', (req: Request, res: Response) => handleWebhook(req, res, 'dingtalk'));
app.post('/webhook/qq', (req: Request, res: Response) => handleWebhook(req, res, 'qq'));

app.post('/api/webhook', (req: Request, res: Response) => {
  handleWebhook(req, res);
});

app.get('/api/webhook', (_req: Request, res: Response) => {
  res.json(store.webhookLogs);
});

app.get('/api/test', (_req: Request, res: Response) => {
  res.json({ ok: true, message: 'LinkCBot API test passed', timestamp: new Date().toISOString() });
});


app.post('/api/test/wechat-work', async (_req: Request, res: Response) => {
  try {
    res.json(await runWebhookTestEndpoint('/webhook/wechat/work'));
  } catch (error) {
    res.status(400).json({ message: '回调检测失败', detail: (error as Error).message });
  }
});

app.post('/api/test/wechat-pay', async (_req: Request, res: Response) => {
  try {
    res.json(await runWebhookTestEndpoint('/webhook/wechat/pay'));
  } catch (error) {
    res.status(400).json({ message: '回调检测失败', detail: (error as Error).message });
  }
});

app.post('/api/test/feishu', async (_req: Request, res: Response) => {
  try {
    res.json(await runWebhookTestEndpoint('/webhook/feishu'));
  } catch (error) {
    res.status(400).json({ message: '回调检测失败', detail: (error as Error).message });
  }
});

app.post('/api/test/dingtalk', async (_req: Request, res: Response) => {
  try {
    res.json(await runWebhookTestEndpoint('/webhook/dingtalk'));
  } catch (error) {
    res.status(400).json({ message: '回调检测失败', detail: (error as Error).message });
  }
});

app.post('/api/test/qq', async (_req: Request, res: Response) => {
  try {
    res.json(await runWebhookTestEndpoint('/webhook/qq'));
  } catch (error) {
    res.status(400).json({ message: '回调检测失败', detail: (error as Error).message });
  }
});

app.get('/api/env', (_req: Request, res: Response) => {
  const lines = [
    'PORT=39393',
    `WECOM_CORP_ID=${store.config.wecom?.corpId ?? ''}`,
    `WECOM_AGENT_ID=${store.config.wecom?.agentId ?? ''}`,
    `WECOM_SECRET=${store.config.wecom?.secret ?? ''}`,
    `WXPAY_MCH_ID=${store.config.wechatPay?.mchId ?? ''}`,
    `WXPAY_API_V3_KEY=${store.config.wechatPay?.apiV3Key ?? ''}`,
    `WXPAY_SERIAL_NO=${store.config.wechatPay?.serialNo ?? ''}`
  ];

  store.config.bots.forEach((bot, index) => {
    const p = `BOT_${index + 1}_${bot.type.toUpperCase()}`;
    lines.push(`${p}_NAME=${bot.name}`);
    lines.push(`${p}_ENABLED=${String(bot.enabled)}`);
    lines.push(`${p}_WEBHOOK_URL=${bot.webhookUrl ?? ''}`);
  });

  res.type('text/plain').send(lines.join('\n'));
});

app.get('/api/diagnosis', (_req: Request, res: Response) => {
  const diagnostics: Array<{ level: 'info' | 'warning' | 'error'; message: string }> = [];

  if (!store.config.wecom) diagnostics.push({ level: 'warning', message: '企业微信配置缺失' });
  if (!store.config.wechatPay) diagnostics.push({ level: 'warning', message: '微信支付配置缺失' });

  const invalidBots = store.config.bots.filter((b) => b.enabled && !b.webhookUrl);
  if (invalidBots.length > 0) diagnostics.push({ level: 'error', message: `有 ${invalidBots.length} 个启用机器人缺少 webhookUrl` });

  if (diagnostics.length === 0) diagnostics.push({ level: 'info', message: '配置正常' });

  res.json({ updatedAt: store.config.updatedAt, diagnostics });
});


app.post('/api/diagnosis/check', (req: Request, res: Response) => {
  const payload = req.body as {
    webhookRequest?: { url?: string; headers?: Record<string, unknown>; body?: unknown };
    httpResponse?: { status?: number; statusText?: string; body?: string };
  };

  if (!payload.webhookRequest || !payload.httpResponse || typeof payload.httpResponse.status !== 'number') {
    res.status(400).json({ message: '诊断参数非法，需要 webhookRequest 与 httpResponse.status' });
    return;
  }

  res.json(runDiagnosisCheck({
    webhookRequest: payload.webhookRequest,
    httpResponse: {
      status: payload.httpResponse.status,
      statusText: payload.httpResponse.statusText,
      body: payload.httpResponse.body
    }
  }));
});

app.use((err: Error, _req: Request, res: Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', err.message);
  res.status(500).json({ message: 'Internal server error', detail: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`LinkCBot backend running on http://127.0.0.1:${PORT}`);
});
