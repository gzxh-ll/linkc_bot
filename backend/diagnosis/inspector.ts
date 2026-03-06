import { DiagnosticItem, StoreModel } from '../utils/types';

export const inspectStore = (store: StoreModel): DiagnosticItem[] => {
  const result: DiagnosticItem[] = [];

  if (!store.weCom) {
    result.push({ level: 'warning', code: 'WECOM_MISSING', message: '企业微信配置缺失', suggestion: '请填写 corpId/agentId/secret' });
  }
  if (!store.wechatPay) {
    result.push({ level: 'warning', code: 'WXPAY_MISSING', message: '微信支付配置缺失', suggestion: '请填写 mchId/apiV3Key/serialNo' });
  }
  if (store.bots.length === 0) {
    result.push({ level: 'info', code: 'BOT_EMPTY', message: '未配置机器人', suggestion: '至少添加一个机器人用于通知' });
  }
  const invalidBots = store.bots.filter((x) => x.enabled && !x.webhookUrl);
  if (invalidBots.length > 0) {
    result.push({ level: 'error', code: 'BOT_WEBHOOK_EMPTY', message: `有 ${invalidBots.length} 个启用机器人缺失 webhook 地址` });
  }

  return result;
};
