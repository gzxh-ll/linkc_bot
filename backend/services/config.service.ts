import { WeComConfig, WechatPayConfig } from '../utils/types';
import { getStore, setStore } from './store.service';

export const configService = {
  getAll: () => getStore(),
  setWeCom: (payload: WeComConfig) => {
    const store = getStore();
    store.weCom = payload;
    return setStore(store);
  },
  setWechatPay: (payload: WechatPayConfig) => {
    const store = getStore();
    store.wechatPay = payload;
    return setStore(store);
  }
};
