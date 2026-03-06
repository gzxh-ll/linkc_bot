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

app.post('/api/webhook', (req: Request, res: Response) => {
  const record: WebhookRecord = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    source: String(req.headers['x-source'] ?? 'unknown'),
    receivedAt: new Date().toISOString(),
    payload: req.body
  };

  store.webhookLogs.unshift(record);
  store.webhookLogs = store.webhookLogs.slice(0, 200);

  logger.info('Webhook received', { id: record.id, source: record.source });
  res.json({ success: true, id: record.id });
});

app.get('/api/webhook', (_req: Request, res: Response) => {
  res.json(store.webhookLogs);
});

app.get('/api/test', (_req: Request, res: Response) => {
  res.json({ ok: true, message: 'LinkCBot API test passed', timestamp: new Date().toISOString() });
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

app.use((err: Error, _req: Request, res: Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', err.message);
  res.status(500).json({ message: 'Internal server error', detail: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`LinkCBot backend running on http://127.0.0.1:${PORT}`);
});
