import { Router } from 'express';
import { toolController } from '../controllers/tool.controller';

export const toolRoutes = Router();

toolRoutes.get('/health', toolController.health);
toolRoutes.get('/dashboard/status', toolController.dashboardStatus);
toolRoutes.get('/env/export', toolController.exportEnv);
toolRoutes.get('/diagnostics', toolController.diagnostics);
toolRoutes.post('/diagnosis/check', toolController.diagnosisCheck);
toolRoutes.post('/callback-debug', toolController.callbackDebug);

toolRoutes.post('/test/wechat-work', toolController.testWechatWork);
toolRoutes.post('/test/wechat-pay', toolController.testWechatPay);
toolRoutes.post('/test/feishu', toolController.testFeishu);
toolRoutes.post('/test/dingtalk', toolController.testDingtalk);
toolRoutes.post('/test/qq', toolController.testQq);
