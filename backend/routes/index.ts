import { Router } from 'express';
import { botRoutes } from './bot.routes';
import { configRoutes } from './config.routes';
import { toolRoutes } from './tool.routes';
import { webhookRoutes } from './webhook.routes';

export const apiRoutes = Router();

apiRoutes.use(configRoutes);
apiRoutes.use(botRoutes);
apiRoutes.use(webhookRoutes);
apiRoutes.use(toolRoutes);
