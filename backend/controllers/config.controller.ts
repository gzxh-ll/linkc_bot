import { Request, Response } from 'express';
import { weComSchema, wechatPaySchema } from '../configs/schema';
import { configService } from '../services/config.service';
import { getSavedConfig, saveConfig } from '../services/config-file.service';
import { badRequest, ok } from '../utils/http';
import { zodMessages } from '../utils/zod';

const allowedConfigKeys = new Set(['wechatWork', 'wechatPay', 'feishuBot', 'dingtalkBot', 'qqBot']);

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
  },
  save: (req: Request, res: Response): void => {
    const payload = req.body as Record<string, unknown>;
    const keys = Object.keys(payload);

    if (keys.length === 0) {
      badRequest(res, '配置内容不能为空');
      return;
    }

    const invalidKeys = keys.filter((key) => !allowedConfigKeys.has(key));
    if (invalidKeys.length > 0) {
      badRequest(res, '存在不支持的配置类型', invalidKeys);
      return;
    }

    const saved = saveConfig(payload);
    ok(res, { success: true, config: saved });
  },
  get: (_req: Request, res: Response): void => {
    ok(res, getSavedConfig());
  }
};
