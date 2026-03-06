import fs from 'node:fs';
import path from 'node:path';
import { env } from '../configs/env';
import { StoreModel } from '../utils/types';

const storePath = path.resolve(env.dataDir, 'store.json');

const initialStore = (): StoreModel => ({
  bots: [],
  callbackLogs: [],
  updatedAt: new Date().toISOString()
});

const ensureStore = (): void => {
  if (!fs.existsSync(env.dataDir)) fs.mkdirSync(env.dataDir, { recursive: true });
  if (!fs.existsSync(storePath)) fs.writeFileSync(storePath, JSON.stringify(initialStore(), null, 2));
};

export const getStore = (): StoreModel => {
  ensureStore();
  return JSON.parse(fs.readFileSync(storePath, 'utf-8')) as StoreModel;
};

export const setStore = (store: StoreModel): StoreModel => {
  const next = { ...store, updatedAt: new Date().toISOString() };
  fs.writeFileSync(storePath, JSON.stringify(next, null, 2));
  return next;
};

export const getStorePath = (): string => storePath;
