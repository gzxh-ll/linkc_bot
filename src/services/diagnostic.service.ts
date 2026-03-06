import { AppStore, DiagnosticItem } from '../types/config';

export const runDiagnostics = (store: AppStore): DiagnosticItem[] => {
  const diagnostics: DiagnosticItem[] = [];

  if (!store.weCom) {
    diagnostics.push({
      level: 'warning',
      code: 'WECOM_MISSING',
      message: '企业微信配置尚未完成。',
      suggestion: '请填写 corpId、agentId、secret。'
    });
  }

  if (!store.wechatPay) {
    diagnostics.push({
      level: 'warning',
      code: 'WXPAY_MISSING',
      message: '微信支付配置尚未完成。',
      suggestion: '请填写商户号、APIv3 Key、证书序列号。'
    });
  }

  if (store.bots.length === 0) {
    diagnostics.push({
      level: 'info',
      code: 'BOTS_EMPTY',
      message: '当前未配置机器人。',
      suggestion: '至少添加一个企业机器人用于消息通知。'
    });
  }

  const enabledBotsWithoutWebhook = store.bots.filter((bot) => bot.enabled && !bot.webhookUrl);
  if (enabledBotsWithoutWebhook.length > 0) {
    diagnostics.push({
      level: 'error',
      code: 'BOT_WEBHOOK_INVALID',
      message: `${enabledBotsWithoutWebhook.length} 个启用中的机器人缺少 webhook 地址。`,
      suggestion: '为已启用机器人填写 webhookUrl。'
    });
  }

  if (store.callbackLogs.length === 0) {
    diagnostics.push({
      level: 'info',
      code: 'CALLBACK_NO_LOG',
      message: '尚未收到回调请求，可使用回调调试功能进行联调。'
    });
  }

  return diagnostics;
};
