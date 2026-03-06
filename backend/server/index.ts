import 'dotenv/config';
import { env } from '../configs/env';
import { logger } from '../logs/logger';
import { getStore, getStorePath } from '../services/store.service';
import { app } from './app';

getStore();

app.listen(env.port, '0.0.0.0', () => {
  logger.info(`Backend running at http://127.0.0.1:${env.port}`);
  logger.info(`Store file: ${getStorePath()}`);
});
