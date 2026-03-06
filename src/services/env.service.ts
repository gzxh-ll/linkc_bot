import { AppStore } from '../types/config';

const fmt = (key: string, value: string | undefined): string => `${key}=${value ?? ''}`;

export const generateEnvFile = (store: AppStore): string => {
  const lines: string[] = [];

  lines.push('# LinkCBot Config Tool v3 generated environment');
  lines.push(fmt('PORT', process.env.PORT ?? '39393'));

  lines.push('\n# 企业微信配置');
  lines.push(fmt('WECOM_CORP_ID', store.weCom?.corpId));
  lines.push(fmt('WECOM_AGENT_ID', store.weCom?.agentId));
  lines.push(fmt('WECOM_SECRET', store.weCom?.secret));
  lines.push(fmt('WECOM_TOKEN', store.weCom?.token));
  lines.push(fmt('WECOM_AES_KEY', store.weCom?.aesKey));

  lines.push('\n# 微信支付配置');
  lines.push(fmt('WXPAY_MCH_ID', store.wechatPay?.mchId));
  lines.push(fmt('WXPAY_API_V3_KEY', store.wechatPay?.apiV3Key));
  lines.push(fmt('WXPAY_SERIAL_NO', store.wechatPay?.serialNo));
  lines.push(fmt('WXPAY_APP_ID', store.wechatPay?.appId));
  lines.push(fmt('WXPAY_NOTIFY_URL', store.wechatPay?.notifyUrl));

  lines.push('\n# 机器人配置');
  store.bots.forEach((bot, index) => {
    const prefix = `BOT_${index + 1}_${bot.type.toUpperCase()}`;
    lines.push(fmt(`${prefix}_NAME`, bot.name));
    lines.push(fmt(`${prefix}_ENABLED`, String(bot.enabled)));
    lines.push(fmt(`${prefix}_WEBHOOK_URL`, bot.webhookUrl));
    lines.push(fmt(`${prefix}_SECRET`, bot.secret));
  });

  return lines.join('\n');
};
