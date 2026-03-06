import { StoreModel } from '../utils/types';

const kv = (key: string, value?: string): string => `${key}=${value ?? ''}`;

export const generateEnvText = (store: StoreModel): string => {
  const lines = [
    '# LinkCBot Config Tool v3 generated file',
    kv('PORT', process.env.PORT ?? '39393'),
    '',
    '# 企业微信',
    kv('WECOM_CORP_ID', store.weCom?.corpId),
    kv('WECOM_AGENT_ID', store.weCom?.agentId),
    kv('WECOM_SECRET', store.weCom?.secret),
    kv('WECOM_TOKEN', store.weCom?.token),
    kv('WECOM_AES_KEY', store.weCom?.aesKey),
    '',
    '# 微信支付',
    kv('WXPAY_MCH_ID', store.wechatPay?.mchId),
    kv('WXPAY_API_V3_KEY', store.wechatPay?.apiV3Key),
    kv('WXPAY_SERIAL_NO', store.wechatPay?.serialNo),
    kv('WXPAY_APP_ID', store.wechatPay?.appId),
    kv('WXPAY_NOTIFY_URL', store.wechatPay?.notifyUrl),
    ''
  ];

  store.bots.forEach((bot, idx) => {
    const p = `BOT_${idx + 1}_${bot.type.toUpperCase()}`;
    lines.push(kv(`${p}_NAME`, bot.name));
    lines.push(kv(`${p}_ENABLED`, String(bot.enabled)));
    lines.push(kv(`${p}_WEBHOOK_URL`, bot.webhookUrl));
    lines.push(kv(`${p}_SECRET`, bot.secret));
    lines.push('');
  });

  return lines.join('\n');
};
