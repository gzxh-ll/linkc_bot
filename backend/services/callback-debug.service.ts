export const callbackDebugService = {
  async send(targetUrl: string, method: 'POST' | 'GET', payload?: unknown, headers?: Record<string, string>) {
    const response = await fetch(targetUrl, {
      method,
      headers: { 'content-type': 'application/json', ...(headers ?? {}) },
      body: method === 'POST' ? JSON.stringify(payload ?? {}) : undefined
    });

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      body: await response.text()
    };
  }
};
