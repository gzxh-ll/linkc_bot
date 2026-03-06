import { Router } from 'express';
import { toolController } from '../controllers/tool.controller';

export const toolRoutes = Router();

toolRoutes.get('/health', toolController.health);
toolRoutes.get('/dashboard/status', toolController.dashboardStatus);
toolRoutes.get('/env/export', toolController.exportEnv);
toolRoutes.get('/diagnostics', toolController.diagnostics);
toolRoutes.post('/callback-debug', toolController.callbackDebug);
