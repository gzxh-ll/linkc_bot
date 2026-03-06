import { randomUUID } from 'node:crypto';
import { Request } from 'express';
import { env } from '../configs/env';
import { appendWebhookLogToFile } from '../services/webhook-log-file.service';
import { getStore, setStore } from '../services/store.service';
import { CallbackLog } from '../utils/types';

export const receiveAndSaveWebhook = (req: Request, sourceOverride?: string): CallbackLog => {
  const log: CallbackLog = {
    id: randomUUID(),
    source: sourceOverride ?? req.params.source ?? 'unknown',
    receivedAt: new Date().toISOString(),
    headers: req.headers,
    payload: req.body
  };

  const store = getStore();
  store.callbackLogs = [log, ...store.callbackLogs].slice(0, env.callbackLogLimit);
  setStore(store);

  appendWebhookLogToFile(log);

  return log;
};
