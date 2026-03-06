import { Request, Response } from 'express';
import { weComSchema, wechatPaySchema } from '../configs/schema';
import { configService } from '../services/config.service';
import { badRequest, ok } from '../utils/http';
import { zodMessages } from '../utils/zod';

export const configController = {
  getAll: (_req: Request, res: Response): void => ok(res, configService.getAll()),
  setWeCom: (req: Request, res: Response): void => {
    const parsed = weComSchema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, '企业微信配置校验失败', zodMessages(parsed.error));
    ok(res, configService.setWeCom(parsed.data));
  },
  setWechatPay: (req: Request, res: Response): void => {
    const parsed = wechatPaySchema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, '微信支付配置校验失败', zodMessages(parsed.error));
    ok(res, configService.setWechatPay(parsed.data));
  }
};
