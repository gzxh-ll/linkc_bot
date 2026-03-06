import { Request, Response } from 'express';
import { env } from '../configs/env';
import { callbackDebugSchema, diagnosisCheckSchema } from '../configs/schema';
import { runDiagnosisCheck } from '../diagnosis/checker';
import { inspectStore } from '../diagnosis/inspector';
import { generateEnvText } from '../generators/env.generator';
import { callbackDebugService } from '../services/callback-debug.service';
import { getStore } from '../services/store.service';
import { BotType, StoreModel } from '../utils/types';
import { badRequest, ok } from '../utils/http';
import { zodMessages } from '../utils/zod';

type StatusLevel = 'ok' | 'warning';

const botStatus = (store: StoreModel, type: BotType): StatusLevel => {
  const bot = store.bots.find((item) => item.type === type && item.enabled);
  if (!bot) return 'warning';
  return bot.webhookUrl ? 'ok' : 'warning';
};

const runWebhookTest = async (path: string): Promise<unknown> => {
  const payload = {
    test: true,
    source: path,
    triggeredAt: new Date().toISOString()
  };

  const targetUrl = `http://127.0.0.1:${env.port}${path}`;
  return callbackDebugService.send(targetUrl, 'POST', payload, { 'x-linkcbot-test': '1' });
};

const handleWebhookTest = async (res: Response, path: string): Promise<void> => {
  try {
    ok(res, await runWebhookTest(path));
  } catch (error) {
    badRequest(res, '回调检测失败', (error as Error).message);
  }
};

export const toolController = {
  health: (_req: Request, res: Response): void => {
    ok(res, { service: 'LinkCBot Config Tool v3 backend', status: 'ok', timestamp: new Date().toISOString() });
  },
  dashboardStatus: (_req: Request, res: Response): void => {
    const store = getStore();

    ok(res, {
      wechatWork: store.weCom ? 'ok' : 'warning',
      wechatPay: store.wechatPay ? 'ok' : 'warning',
      feishuBot: botStatus(store, 'feishu'),
      dingtalkBot: botStatus(store, 'dingtalk'),
      qqBot: botStatus(store, 'qq'),
      webhookServer: 'ok'
    });
  },
  exportEnv: (_req: Request, res: Response): void => {
    res.type('text/plain').send(generateEnvText(getStore()));
  },
  diagnostics: (_req: Request, res: Response): void => {
    const store = getStore();
    ok(res, { updatedAt: store.updatedAt, diagnostics: inspectStore(store) });
  },
  diagnosisCheck: (req: Request, res: Response): void => {
    const parsed = diagnosisCheckSchema.safeParse(req.body);
    if (!parsed.success) {
      badRequest(res, '诊断参数非法', zodMessages(parsed.error));
      return;
    }

    ok(res, runDiagnosisCheck(parsed.data));
  },
  callbackDebug: async (req: Request, res: Response): Promise<void> => {
    const parsed = callbackDebugSchema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, '回调调试参数非法', zodMessages(parsed.error));

    try {
      ok(res, await callbackDebugService.send(parsed.data.targetUrl, parsed.data.method, parsed.data.payload, parsed.data.headers));
    } catch (error) {
      badRequest(res, '回调调试请求失败', (error as Error).message);
    }
  },
  testWechatWork: async (_req: Request, res: Response): Promise<void> => {
    await handleWebhookTest(res, '/webhook/wechat/work');
  },
  testWechatPay: async (_req: Request, res: Response): Promise<void> => {
    await handleWebhookTest(res, '/webhook/wechat/pay');
  },
  testFeishu: async (_req: Request, res: Response): Promise<void> => {
    await handleWebhookTest(res, '/webhook/feishu');
  },
  testDingtalk: async (_req: Request, res: Response): Promise<void> => {
    await handleWebhookTest(res, '/webhook/dingtalk');
  },
  testQq: async (_req: Request, res: Response): Promise<void> => {
    await handleWebhookTest(res, '/webhook/qq');
  }
};
