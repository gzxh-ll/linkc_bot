import cors from 'cors';
import express from 'express';
import { apiRoutes } from '../routes';
import { webhookCallbackRoutes } from '../routes/webhook.routes';
import { errorHandler, requestLogger } from './middlewares';

export const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(requestLogger);

app.use(webhookCallbackRoutes);
app.use('/api', apiRoutes);
app.use(errorHandler);
