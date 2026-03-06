import fs from 'node:fs';
import path from 'node:path';

export type SavedConfig = {
  wechatWork?: Record<string, unknown>;
  wechatPay?: Record<string, unknown>;
  feishuBot?: Record<string, unknown>;
  dingtalkBot?: Record<string, unknown>;
  qqBot?: Record<string, unknown>;
  updatedAt: string;
};

const configPath = path.resolve('configs', 'config.json');

const defaultConfig = (): SavedConfig => ({
  updatedAt: new Date().toISOString()
});

const ensureConfigFile = (): void => {
  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig(), null, 2), 'utf-8');
  }
};

export const getSavedConfig = (): SavedConfig => {
  ensureConfigFile();
  return JSON.parse(fs.readFileSync(configPath, 'utf-8')) as SavedConfig;
};

export const saveConfig = (payload: Partial<SavedConfig>): SavedConfig => {
  const current = getSavedConfig();
  const next: SavedConfig = {
    ...current,
    ...payload,
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(configPath, JSON.stringify(next, null, 2), 'utf-8');
  return next;
};

export const getConfigFilePath = (): string => configPath;
