export type WeComConfig = {
  corpId: string;
  agentId: string;
  secret: string;
  token?: string;
  aesKey?: string;
};

export type WechatPayConfig = {
  mchId: string;
  apiV3Key: string;
  serialNo: string;
  appId?: string;
  notifyUrl?: string;
};

export type BotType = 'wechat' | 'feishu' | 'dingtalk' | 'qq';

export type BotConfig = {
  id: string;
  type: BotType;
  name: string;
  enabled: boolean;
  webhookUrl?: string;
  secret?: string;
  remark?: string;
};

export type CallbackLog = {
  id: string;
  source: string;
  receivedAt: string;
  headers: Record<string, string | string[] | undefined>;
  payload: unknown;
};

export type CallbackDebugRequest = {
  targetUrl: string;
  method?: 'POST' | 'GET';
  payload?: unknown;
  headers?: Record<string, string>;
};

export type DiagnosticLevel = 'info' | 'warning' | 'error';

export type DiagnosticItem = {
  level: DiagnosticLevel;
  code: string;
  message: string;
  suggestion?: string;
};

export type AppStore = {
  weCom?: WeComConfig;
  wechatPay?: WechatPayConfig;
  bots: BotConfig[];
  callbackLogs: CallbackLog[];
  updatedAt: string;
};
