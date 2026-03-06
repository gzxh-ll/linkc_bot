import { Request, Response } from 'express';
import { botSchema } from '../configs/schema';
import { botService } from '../services/bot.service';
import { badRequest, notFound, ok } from '../utils/http';
import { zodMessages } from '../utils/zod';

export const botController = {
  list: (_req: Request, res: Response): void => ok(res, botService.list()),
  create: (req: Request, res: Response): void => {
    const parsed = botSchema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, '机器人配置校验失败', zodMessages(parsed.error));
    res.status(201).json(botService.create(parsed.data));
  },
  update: (req: Request, res: Response): void => {
    const parsed = botSchema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, '机器人配置校验失败', zodMessages(parsed.error));
    const updated = botService.update(req.params.id, parsed.data);
    if (!updated) return notFound(res, '机器人不存在');
    ok(res, updated);
  },
  remove: (req: Request, res: Response): void => {
    if (!botService.remove(req.params.id)) return notFound(res, '机器人不存在');
    res.status(204).send();
  }
};
