import fs from 'node:fs';
import path from 'node:path';
import { CallbackLog } from '../utils/types';

const logFilePath = path.resolve('logs', 'webhooks.log');

const ensureLogFile = (): void => {
  const dir = path.dirname(logFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, '', 'utf-8');
  }
};

export const appendWebhookLogToFile = (log: CallbackLog): void => {
  ensureLogFile();
  fs.appendFileSync(logFilePath, `${JSON.stringify(log)}\n`, 'utf-8');
};

export const getWebhookLogFilePath = (): string => logFilePath;
