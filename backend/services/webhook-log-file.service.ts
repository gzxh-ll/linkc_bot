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

export const readWebhookLogsFromFile = (): CallbackLog[] => {
  ensureLogFile();
  const content = fs.readFileSync(logFilePath, 'utf-8').trim();
  if (!content) return [];

  return content
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as CallbackLog)
    .reverse();
};

export const getWebhookLogFilePath = (): string => logFilePath;
