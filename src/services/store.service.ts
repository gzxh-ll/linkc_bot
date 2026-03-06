import fs from 'node:fs';
import path from 'node:path';
import { AppStore } from '../types/config';

const dataDir = process.env.DATA_DIR ?? './runtime-data';
const storeFilePath = path.resolve(dataDir, 'store.json');

const defaultStore = (): AppStore => ({
  bots: [],
  callbackLogs: [],
  updatedAt: new Date().toISOString()
});

const ensureStorage = (): void => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(storeFilePath)) {
    fs.writeFileSync(storeFilePath, JSON.stringify(defaultStore(), null, 2), 'utf-8');
  }
};

export const loadStore = (): AppStore => {
  ensureStorage();
  const raw = fs.readFileSync(storeFilePath, 'utf-8');
  return JSON.parse(raw) as AppStore;
};

export const saveStore = (store: AppStore): AppStore => {
  const nextStore = {
    ...store,
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(storeFilePath, JSON.stringify(nextStore, null, 2), 'utf-8');
  return nextStore;
};

export const getStoreFilePath = (): string => storeFilePath;
