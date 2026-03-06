import { Router } from 'express';
import {
  createBot,
  debugCallback,
  deleteBot,
  diagnostics,
  exportEnv,
  getAllConfigs,
  getCallbackLogs,
  listBots,
  receiveWebhook,
  setWeComConfig,
  setWechatPayConfig,
  updateBot
} from '../controllers/config.controller';

export const router = Router();

router.get('/health', (_req, res) => {
  res.json({ service: 'LinkCBot Config Tool v3 backend', status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/configs', getAllConfigs);
router.put('/configs/wecom', setWeComConfig);
router.put('/configs/wechat-pay', setWechatPayConfig);

router.get('/bots', listBots);
router.post('/bots', createBot);
router.put('/bots/:id', updateBot);
router.delete('/bots/:id', deleteBot);

router.post('/webhook/:source', receiveWebhook);
router.get('/webhook-logs', getCallbackLogs);
router.post('/callback-debug', debugCallback);

router.get('/env/export', exportEnv);
router.get('/diagnostics', diagnostics);
