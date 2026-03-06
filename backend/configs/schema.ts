import { z } from 'zod';

export const weComSchema = z.object({
  corpId: z.string().min(1),
  agentId: z.string().min(1),
  secret: z.string().min(1),
  token: z.string().optional(),
  aesKey: z.string().optional()
});

export const wechatPaySchema = z.object({
  mchId: z.string().min(1),
  apiV3Key: z.string().min(1),
  serialNo: z.string().min(1),
  appId: z.string().optional(),
  notifyUrl: z.string().url().optional()
});

export const botSchema = z.object({
  type: z.enum(['wechat', 'feishu', 'dingtalk', 'qq']),
  name: z.string().min(1),
  enabled: z.boolean().default(true),
  webhookUrl: z.string().url().optional(),
  secret: z.string().optional(),
  remark: z.string().optional()
});

export const callbackDebugSchema = z.object({
  targetUrl: z.string().url(),
  method: z.enum(['POST', 'GET']).default('POST'),
  payload: z.unknown().optional(),
  headers: z.record(z.string()).optional()
});

export const diagnosisCheckSchema = z.object({
  webhookRequest: z.object({
    url: z.string().url().optional(),
    headers: z.record(z.union([z.string(), z.array(z.string())])).optional(),
    body: z.unknown().optional()
  }),
  httpResponse: z.object({
    status: z.number().int(),
    statusText: z.string().optional(),
    body: z.string().optional()
  })
});
