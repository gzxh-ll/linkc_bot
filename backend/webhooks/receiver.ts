import { randomUUID } from 'node:crypto';
import { Request } from 'express';
import { env } from '../configs/env';
import { CallbackLog } from '../utils/types';
import { getStore, setStore } from '../services/store.service';

export const receiveAndSaveWebhook = (req: Request): CallbackLog => {
  const log: CallbackLog = {
    id: randomUUID(),
    source: req.params.source,
    receivedAt: new Date().toISOString(),
    headers: req.headers,
    payload: req.body
  };

  const store = getStore();
  store.callbackLogs = [log, ...store.callbackLogs].slice(0, env.callbackLogLimit);
  setStore(store);
  return log;
};
