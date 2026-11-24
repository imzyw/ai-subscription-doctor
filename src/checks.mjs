const endpoints = [
  ['OpenAI API', 'https://api.openai.com/v1/models'],
  ['ChatGPT', 'https://chatgpt.com/'],
  ['Gemini API', 'https://generativelanguage.googleapis.com/v1beta/models'],
  ['Claude', 'https://claude.ai/'],
  ['Grok', 'https://x.ai/'],
];

async function readPreview(response) {
  const reader = response.body?.getReader();
  if (!reader) return response.text ? (await response.text()).slice(0, 16384) : '';
  const decoder = new TextDecoder();
  let count = 0;
  let preview = '';
  try {
    while (count < 16384) {
      const { done, value } = await reader.read();
      if (done) break;
      preview += decoder.decode(value.subarray(0, 16384 - count), { stream: true });
      count += value.length;
    }
    return preview + decoder.decode();
  } finally {
    void reader.cancel().catch(() => {});
  }
}

async function probe([service, url], fetchImpl, timeoutMs) {
  const controller = new AbortController();
  const host = new URL(url).hostname;
  let timer;
  let status = null;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error('timeout'));
    }, timeoutMs);
  });
  try {
    return await Promise.race([timeout, (async () => {
      const response = await fetchImpl(url, { signal: controller.signal, redirect: 'manual', credentials: 'omit' });
      status = response.status;
      const preview = await readPreview(response);
      const regionPattern = /unsupported[_ -](country|region|territory)|(?:country|region|location|hong kong).{0,35}(?:not supported|not available|restricted|unavailable)|(?:not available|not supported).{0,35}(?:country|region|hong kong)|(?:香港|地区).{0,24}(?:不支持|不可用|受限)/i;
      const warnings = [];
      if (status === 403) warnings.push('HTTP 403：可能涉及服务权限、地区或边缘访问策略。');
      if (regionPattern.test(preview)) warnings.push('响应包含地区限制提示，请核对服务的官方支持范围。');
      if (status >= 500) warnings.push('HTTP 5xx：请查看服务状态页。');
      return { service, host, status, reachable: true, warnings };
    })()]);
  } catch {
    const warning = controller.signal.aborted ? '探测超时。' : '请求失败，请检查 DNS、TLS 和网络连接。';
    return { service, host, status, reachable: status !== null, warnings: [warning] };
  } finally {
    clearTimeout(timer);
  }
}

export async function runChecks({ fetchImpl = globalThis.fetch, env = process.env, timeoutMs = 5000 } = {}) {
  return {
    proxy: { HTTP_PROXY: Boolean(env.HTTP_PROXY), HTTPS_PROXY: Boolean(env.HTTPS_PROXY) },
    services: await Promise.all(endpoints.map(endpoint => probe(endpoint, fetchImpl, timeoutMs))),
    notes: [
      '探测使用无凭据请求。HTTP 状态仅反映探测地址的响应。',
      '代理配置是否生效取决于 Node.js 运行时。请使用服务支持的地区和官方登录入口，避免频繁重试支付或登录。',
    ],
  };
}

export function formatChecks(report) {
  return [
    ...Object.entries(report.proxy).map(([key, set]) => `${key}：${set ? '已设置' : '未设置'}`),
    ...report.services.flatMap(({ host, status, warnings }) => [
      `${host}  ${status === null ? '未收到 HTTP 响应' : `HTTP ${status}`}`,
      ...warnings.map(warning => `  ${warning}`),
    ]),
    ...report.notes,
  ].join('\n');
}
