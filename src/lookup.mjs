import { readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../data/error-codes.sample.json', import.meta.url), 'utf8'));
export const platforms = ['chatgpt', 'codex', 'gemini', 'claude', 'grok', 'google-play', 'apple'];
const labels = {
  chatgpt: /chatgpt|openai/i,
  codex: /codex/i,
  gemini: /gemini|google ai studio/i,
  claude: /claude|anthropic/i,
  grok: /grok|xai|x\.ai/i,
  'google-play': /google play|google pay/i,
  apple: /apple|app store/i,
};

export function listErrors(platform) {
  if (!platform) return data;
  if (!Object.hasOwn(labels, platform)) return [];
  return data.filter(entry => labels[platform].test(
    platform === 'google-play' ? entry.platform + ' ' + entry.title : entry.platform,
  ));
}

const normalize = value => value.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');

export function lookupErrors(query, platform) {
  const normalized = normalize(query);
  if (!normalized) return [];
  const tokens = query.normalize('NFKC').trim().split(/\s+/).map(normalize).filter(Boolean);
  return listErrors(platform).map(entry => {
    const code = normalize(entry.code);
    const fields = [entry.id, entry.title, entry.platform, ...entry.keywords].map(normalize);
    const contains = token => [code, ...fields].some(field => field.includes(token));
    let score = 0;
    if (code === normalized) score = 4;
    else if (code.includes(normalized)) score = 3;
    else if (contains(normalized)) score = 2;
    else if (tokens.every(contains)) score = 1;
    return { entry, score };
  }).filter(result => result.score).sort((a, b) => b.score - a.score).map(result => result.entry);
}

const width = value => [...value].reduce((sum, char) => sum + (/\p{Script=Han}/u.test(char) ? 2 : 1), 0);

export function formatErrors(entries, { json = false, color = false, details = false } = {}) {
  if (json) return JSON.stringify(entries, null, 2);
  if (!entries.length) return '未找到匹配的报错。';
  const rows = [['错误码', '平台', '严重度', '说明'],
    ...entries.map(entry => [entry.code, entry.platform, entry.severity, entry.title])];
  const columns = rows[0].slice(0, 3).map((_, i) => Math.max(...rows.map(row => width(row[i]))));
  const table = rows.map((row, index) => {
    const line = row.map((value, i) => i < columns.length
      ? value + ' '.repeat(columns[i] - width(value)) : value).join('  │  ');
    if (!color) return line;
    const ansi = index === 0 ? 36 : row[2] === 'high' ? 33 : 0;
    return ansi ? `\x1b[${ansi}m${line}\x1b[0m` : line;
  });
  if (details) {
    for (const { code, cause, steps, avoid } of entries) {
      table.push('', code, `可能原因：${cause}`, ...steps.map((step, i) => `  ${i + 1}. ${step}`),
        ...avoid.map(item => `  避免：${item}`));
    }
  }
  return table.join('\n');
}
