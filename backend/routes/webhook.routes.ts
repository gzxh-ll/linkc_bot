import { Router } from 'express';
import { webhookController } from '../controllers/webhook.controller';

export const webhookRoutes = Router();

webhookRoutes.get('/webhook/health', webhookController.health);
webhookRoutes.post('/webhook/:source', webhookController.receive);
webhookRoutes.get('/webhook-logs', webhookController.listLogs);
webhookRoutes.get('/webhook/logs', webhookController.listWebhookLogs);

export const webhookCallbackRoutes = Router();

webhookCallbackRoutes.post('/webhook/wechat/work', webhookController.receiveWechatWork);
webhookCallbackRoutes.post('/webhook/wechat/pay', webhookController.receiveWechatPay);
webhookCallbackRoutes.post('/webhook/feishu', webhookController.receiveFeishu);
webhookCallbackRoutes.post('/webhook/dingtalk', webhookController.receiveDingtalk);
webhookCallbackRoutes.post('/webhook/qq', webhookController.receiveQq);
