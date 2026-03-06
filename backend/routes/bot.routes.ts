import { Router } from 'express';
import { botController } from '../controllers/bot.controller';

export const botRoutes = Router();

botRoutes.get('/bots', botController.list);
botRoutes.post('/bots', botController.create);
botRoutes.put('/bots/:id', botController.update);
botRoutes.delete('/bots/:id', botController.remove);
