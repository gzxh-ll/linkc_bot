import { Request, Response } from 'express';
import { getStore } from '../services/store.service';
import { ok } from '../utils/http';
import { receiveAndSaveWebhook } from '../webhooks/receiver';

const handleReceive = (req: Request, res: Response, source?: string): void => {
  const log = receiveAndSaveWebhook(req, source);
  ok(res, { success: true, receivedId: log.id });
};

export const webhookController = {
  receive: (req: Request, res: Response): void => {
    handleReceive(req, res);
  },
  receiveWechatWork: (req: Request, res: Response): void => {
    handleReceive(req, res, 'wechat/work');
  },
  receiveWechatPay: (req: Request, res: Response): void => {
    handleReceive(req, res, 'wechat/pay');
  },
  receiveFeishu: (req: Request, res: Response): void => {
    handleReceive(req, res, 'feishu');
  },
  receiveDingtalk: (req: Request, res: Response): void => {
    handleReceive(req, res, 'dingtalk');
  },
  receiveQq: (req: Request, res: Response): void => {
    handleReceive(req, res, 'qq');
  },
  listLogs: (_req: Request, res: Response): void => {
    ok(res, getStore().callbackLogs);
  }
};
