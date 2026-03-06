import { Request, Response } from 'express';
import { callbackDebugSchema } from '../configs/schema';
import { inspectStore } from '../diagnosis/inspector';
import { generateEnvText } from '../generators/env.generator';
import { callbackDebugService } from '../services/callback-debug.service';
import { getStore } from '../services/store.service';
import { badRequest, ok } from '../utils/http';
import { zodMessages } from '../utils/zod';

export const toolController = {
  health: (_req: Request, res: Response): void => {
    ok(res, { service: 'LinkCBot Config Tool v3 backend', status: 'ok', timestamp: new Date().toISOString() });
  },
  exportEnv: (_req: Request, res: Response): void => {
    res.type('text/plain').send(generateEnvText(getStore()));
  },
  diagnostics: (_req: Request, res: Response): void => {
    const store = getStore();
    ok(res, { updatedAt: store.updatedAt, diagnostics: inspectStore(store) });
  },
  callbackDebug: async (req: Request, res: Response): Promise<void> => {
    const parsed = callbackDebugSchema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, '回调调试参数非法', zodMessages(parsed.error));

    try {
      ok(res, await callbackDebugService.send(parsed.data.targetUrl, parsed.data.method, parsed.data.payload, parsed.data.headers));
    } catch (error) {
      badRequest(res, '回调调试请求失败', (error as Error).message);
    }
  }
};
