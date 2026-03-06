export type DiagnosisCheckInput = {
  webhookRequest: {
    url?: string;
    headers?: Record<string, string | string[] | undefined>;
    body?: unknown;
  };
  httpResponse: {
    status: number;
    statusText?: string;
    body?: string;
  };
};

export type DiagnosisCheckResult = {
  success: boolean;
  issues: Array<{
    code: 'SIGNATURE_ERROR' | 'CERTIFICATE_ERROR' | 'CALLBACK_URL_UNREACHABLE' | 'HTTP_ERROR' | 'UNKNOWN_ERROR';
    level: 'warning' | 'error';
    message: string;
    suggestion?: string;
  }>;
};

export const runDiagnosisCheck = (input: DiagnosisCheckInput): DiagnosisCheckResult => {
  const issues: DiagnosisCheckResult['issues'] = [];

  const responseBody = (input.httpResponse.body ?? '').toLowerCase();
  const statusText = (input.httpResponse.statusText ?? '').toLowerCase();
  const combined = `${responseBody} ${statusText}`;

  if (combined.includes('signature') || combined.includes('签名')) {
    issues.push({
      code: 'SIGNATURE_ERROR',
      level: 'error',
      message: '检测到签名错误。',
      suggestion: '请检查 token、timestamp、nonce、签名算法与密钥是否一致。'
    });
  }

  if (combined.includes('certificate') || combined.includes('cert') || combined.includes('证书')) {
    issues.push({
      code: 'CERTIFICATE_ERROR',
      level: 'error',
      message: '检测到证书错误。',
      suggestion: '请核对证书路径、证书序列号、私钥与平台证书是否匹配。'
    });
  }

  if (input.httpResponse.status === 404 || input.httpResponse.status === 502 || input.httpResponse.status === 503 || combined.includes('connection refused') || combined.includes('econnrefused') || combined.includes('timeout') || combined.includes('unreachable')) {
    issues.push({
      code: 'CALLBACK_URL_UNREACHABLE',
      level: 'error',
      message: '回调 URL 不可访问。',
      suggestion: '请确认回调地址可公网访问、端口开放、网关与防火墙配置正确。'
    });
  }

  if (input.httpResponse.status >= 400 && issues.length === 0) {
    issues.push({
      code: 'HTTP_ERROR',
      level: 'warning',
      message: `收到异常 HTTP 状态码: ${input.httpResponse.status}`,
      suggestion: '请结合响应体日志排查服务端处理逻辑。'
    });
  }

  if (issues.length === 0 && input.httpResponse.status >= 500) {
    issues.push({
      code: 'UNKNOWN_ERROR',
      level: 'warning',
      message: '检测到服务端异常，但未匹配到具体错误模式。',
      suggestion: '请查看服务端日志和反向代理日志。'
    });
  }

  return {
    success: issues.length === 0,
    issues
  };
};
