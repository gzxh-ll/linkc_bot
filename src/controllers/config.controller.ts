import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { botSchema, callbackDebugSchema, wechatPaySchema, weComSchema } from '../config/schemas';
import { runDiagnostics } from '../services/diagnostic.service';
import { generateEnvFile } from '../services/env.service';
import { loadStore, saveStore } from '../services/store.service';
import { appendCallbackLog } from '../services/webhook.service';
import { BotConfig } from '../types/config';
import { badRequest, notFound } from '../utils/http';

const formatZodError = (error: z.ZodError): string[] =>
  error.issues.map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`);

export const getAllConfigs = (_req: Request, res: Response): void => {
  res.json(loadStore());
};

export const setWeComConfig = (req: Request, res: Response): void => {
  const parsed = weComSchema.safeParse(req.body);
  if (!parsed.success) {
    badRequest(res, '企业微信配置校验失败', formatZodError(parsed.error));
    return;
  }

  const store = loadStore();
  store.weCom = parsed.data;
  res.json(saveStore(store));
};

export const setWechatPayConfig = (req: Request, res: Response): void => {
  const parsed = wechatPaySchema.safeParse(req.body);
  if (!parsed.success) {
    badRequest(res, '微信支付配置校验失败', formatZodError(parsed.error));
    return;
  }

  const store = loadStore();
  store.wechatPay = parsed.data;
  res.json(saveStore(store));
};

export const listBots = (_req: Request, res: Response): void => {
  const store = loadStore();
  res.json(store.bots);
};

export const createBot = (req: Request, res: Response): void => {
  const parsed = botSchema.safeParse(req.body);
  if (!parsed.success) {
    badRequest(res, '机器人配置校验失败', formatZodError(parsed.error));
    return;
  }

  const store = loadStore();
  const nextBot: BotConfig = {
    ...parsed.data,
    id: parsed.data.id ?? uuidv4()
  };
  store.bots.push(nextBot);

  saveStore(store);
  res.status(201).json(nextBot);
};

export const updateBot = (req: Request, res: Response): void => {
  const parsed = botSchema.safeParse(req.body);
  if (!parsed.success) {
    badRequest(res, '机器人配置校验失败', formatZodError(parsed.error));
    return;
  }

  const store = loadStore();
  const index = store.bots.findIndex((bot) => bot.id === req.params.id);

  if (index < 0) {
    notFound(res, '机器人不存在');
    return;
  }

  store.bots[index] = {
    ...store.bots[index],
    ...parsed.data,
    id: store.bots[index].id
  };

  saveStore(store);
  res.json(store.bots[index]);
};

export const deleteBot = (req: Request, res: Response): void => {
  const store = loadStore();
  const originalLength = store.bots.length;
  store.bots = store.bots.filter((bot) => bot.id !== req.params.id);

  if (store.bots.length === originalLength) {
    notFound(res, '机器人不存在');
    return;
  }

  saveStore(store);
  res.status(204).send();
};

export const receiveWebhook = (req: Request, res: Response): void => {
  const store = loadStore();

  const callbackLog = {
    id: uuidv4(),
    source: req.params.source,
    receivedAt: new Date().toISOString(),
    headers: req.headers,
    payload: req.body
  };

  store.callbackLogs = appendCallbackLog(store.callbackLogs, callbackLog);
  saveStore(store);

  res.json({ success: true, receivedId: callbackLog.id });
};

export const getCallbackLogs = (_req: Request, res: Response): void => {
  const store = loadStore();
  res.json(store.callbackLogs);
};

export const debugCallback = async (req: Request, res: Response): Promise<void> => {
  const parsed = callbackDebugSchema.safeParse(req.body);
  if (!parsed.success) {
    badRequest(res, '回调调试参数非法', formatZodError(parsed.error));
    return;
  }

  try {
    const response = await fetch(parsed.data.targetUrl, {
      method: parsed.data.method,
      headers: {
        'content-type': 'application/json',
        ...(parsed.data.headers ?? {})
      },
      body: parsed.data.method === 'POST' ? JSON.stringify(parsed.data.payload ?? {}) : undefined
    });

    const text = await response.text();

    res.json({
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      responseBody: text
    });
  } catch (error) {
    badRequest(res, '回调调试请求失败', (error as Error).message);
  }
};

export const exportEnv = (_req: Request, res: Response): void => {
  const store = loadStore();
  res.type('text/plain').send(generateEnvFile(store));
};

export const diagnostics = (_req: Request, res: Response): void => {
  const store = loadStore();
  res.json({
    updatedAt: store.updatedAt,
    diagnostics: runDiagnostics(store)
  });
};
