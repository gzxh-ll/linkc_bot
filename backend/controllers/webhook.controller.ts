import { Request, Response } from 'express';
import { receiveAndSaveWebhook } from '../webhooks/receiver';
import { getStore } from '../services/store.service';
import { ok } from '../utils/http';

export const webhookController = {
  receive: (req: Request, res: Response): void => {
    const log = receiveAndSaveWebhook(req);
    ok(res, { success: true, receivedId: log.id });
  },
  listLogs: (_req: Request, res: Response): void => {
    ok(res, getStore().callbackLogs);
  }
};
