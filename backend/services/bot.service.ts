import { randomUUID } from 'node:crypto';
import { BotConfig } from '../utils/types';
import { getStore, setStore } from './store.service';

export const botService = {
  list: (): BotConfig[] => getStore().bots,
  create: (payload: Omit<BotConfig, 'id'>): BotConfig => {
    const store = getStore();
    const bot: BotConfig = { id: randomUUID(), ...payload };
    store.bots.push(bot);
    setStore(store);
    return bot;
  },
  update: (id: string, payload: Omit<BotConfig, 'id'>): BotConfig | null => {
    const store = getStore();
    const idx = store.bots.findIndex((b) => b.id === id);
    if (idx < 0) return null;
    store.bots[idx] = { ...store.bots[idx], ...payload, id };
    setStore(store);
    return store.bots[idx];
  },
  remove: (id: string): boolean => {
    const store = getStore();
    const before = store.bots.length;
    store.bots = store.bots.filter((b) => b.id !== id);
    if (before === store.bots.length) return false;
    setStore(store);
    return true;
  }
};
