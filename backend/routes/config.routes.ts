import { Router } from 'express';
import { configController } from '../controllers/config.controller';

export const configRoutes = Router();

configRoutes.get('/configs', configController.getAll);
configRoutes.put('/configs/wecom', configController.setWeCom);
configRoutes.put('/configs/wechat-pay', configController.setWechatPay);

configRoutes.post('/config/save', configController.save);
configRoutes.get('/config/get', configController.get);
