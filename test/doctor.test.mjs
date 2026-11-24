import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { formatErrors, listErrors, lookupErrors, platforms } from '../src/lookup.mjs';
import { formatChecks, runChecks } from '../src/checks.mjs';

const bin = fileURLToPath(new URL('../bin/doctor.mjs', import.meta.url));
const cli = (...args) => spawnSync(process.execPath, [bin, ...args], { encoding: 'utf8' });

test('ships a usable offline knowledge base with unique ids', () => {
  const entries = listErrors();
  assert.ok(entries.length >= 20);
  assert.equal(new Set(entries.map(row => row.id)).size, entries.length);
  for (const row of entries) {
    for (const key of ['id', 'code', 'platform', 'category', 'title', 'severity', 'cause', 'onlineToolUrl', 'guideUrl']) {
      assert.ok(typeof row[key] === 'string' && row[key].trim(), key);
    }
    for (const key of ['keywords', 'steps', 'avoid']) assert.ok(Array.isArray(row[key]) && row[key].length);
  }
});

test('ranks exact and normalized error codes first', () => {
  assert.equal(lookupErrors('ＯＲ＿ＲＥＨ ０４')[0].code, 'OR-REH-04');
  assert.equal(lookupErrors('or-reh')[0].code, 'OR-REH-04');
});

test('finds Chinese keywords and English text fragments', () => {
  assert.equal(lookupErrors('无法完成交易')[0].code, 'OR-REH-04');
  assert.equal(lookupErrors('信用卡被拒')[0].code, 'card_declined');
  assert.equal(lookupErrors('request too larg')[0].code, 'request_too_large');
  assert.equal(lookupErrors('codex 认证失败')[0].code, 'authentication_error');
  assert.deepEqual(lookupErrors('..!'), []);
});

test('filters all documented platforms and constrains matching', () => {
  for (const platform of platforms) assert.ok(listErrors(platform).length, platform);
  assert.equal(lookupErrors('OR-REH-04', 'google-play')[0].code, 'OR-REH-04');
  assert.equal(lookupErrors('OR-REH-04', 'gemini')[0].code, 'OR-REH-04');
  assert.deepEqual(lookupErrors('OR-REH-04', 'apple'), []);
  assert.ok(lookupErrors('429', 'grok').every(row => row.platform.includes('Grok')));
});

test('formats JSON, colored table, and local troubleshooting steps', () => {
  const rows = lookupErrors('OR-REH-04');
  assert.deepEqual(JSON.parse(formatErrors(rows, { json: true, color: true })), rows);
  assert.match(formatErrors(rows, { color: true }), /\x1b\[36m.*错误码/);
  assert.match(formatErrors(rows, { details: true }), /可能原因.*付款需要额外资料/);
});

test('probes five fixed public endpoints without credentials', async () => {
  const requested = [];
  const report = await runChecks({ env: {}, fetchImpl: async (url, options) => {
    assert.equal(options.credentials, 'omit');
    assert.equal(options.redirect, 'manual');
    assert.equal(options.headers, undefined);
    requested.push(new URL(url).hostname);
    return new Response('OK', { status: 200 });
  } });
  assert.deepEqual(requested, ['api.openai.com', 'chatgpt.com', 'generativelanguage.googleapis.com', 'claude.ai', 'x.ai']);
  assert.ok(report.services.every(service => service.reachable && service.status === 200 && !service.warnings.length));
});

test('marks 403 and regional restriction from HTTP bodies without echoing them', async () => {
  const report = await runChecks({ env: {}, fetchImpl: async url => new Response(
    url.includes('openai') ? 'unsupported_country_region_territory private-body' : '香港地区暂不可用',
    { status: url.includes('openai') ? 403 : 200 },
  ) });
  assert.equal(report.services[0].status, 403);
  assert.match(report.services[0].warnings.join(' '), /403.*地区限制/);
  assert.match(report.services[1].warnings.join(' '), /地区限制/);
  assert.doesNotMatch(JSON.stringify(report), /private-body/);
});

test('times out requests even when an injected fetch ignores abort', async () => {
  const signals = [];
  const report = await runChecks({ env: {}, timeoutMs: 10, fetchImpl: (_, { signal }) => {
    signals.push(signal);
    return new Promise(() => {});
  } });
  assert.ok(report.services.every(item => !item.reachable && item.status === null && item.warnings[0].includes('超时')));
  assert.ok(signals.every(signal => signal.aborted));
});

test('times out the read phase while keeping a received HTTP status', async () => {
  const report = await runChecks({ env: {}, timeoutMs: 10, fetchImpl: async () => ({
    status: 200, text: () => new Promise(() => {}),
  }) });
  assert.ok(report.services.every(item => item.reachable && item.status === 200 && item.warnings[0].includes('超时')));
});

test('redacts proxy URLs, API keys and thrown network details in both output modes', async () => {
  const env = { HTTP_PROXY: 'http://proxy-denied:secret-pass@private-proxy:3300', OPENAI_API_KEY: 'secret-key' };
  const report = await runChecks({ env, fetchImpl: async () => { throw new Error(JSON.stringify(env)); } });
  assert.deepEqual(report.proxy, { HTTP_PROXY: true, HTTPS_PROXY: false });
  assert.ok(report.services.every(item => !item.reachable));
  for (const output of [JSON.stringify(report), formatChecks(report)]) {
    assert.doesNotMatch(output, /secret-pass|secret-key|private-proxy|proxy-denied/);
  }
});

test('CLI exposes executable help and version', () => {
  assert.ok(statSync(bin).mode & 0o111);
  const help = cli('--help');
  assert.equal(help.status, 0);
  assert.match(help.stdout, /ai-doctor check/);
  assert.equal(cli('--version').stdout.trim(), '1.0.0');
});

test('CLI handles JSON lookup and platform listing', () => {
  const result = cli('lookup', 'or reh', '04', '--platform', 'google-play', '--json');
  assert.equal(result.status, 0);
  assert.equal(JSON.parse(result.stdout)[0].code, 'OR-REH-04');
  const list = cli('list', '--platform', 'apple', '--json');
  assert.equal(list.status, 0);
  assert.deepEqual(JSON.parse(list.stdout), listErrors('apple'));
});

test('CLI returns distinct exits for empty search and invalid usage', () => {
  const notFound = cli('lookup', 'unlikely-no-such-error', '--json');
  assert.equal(notFound.status, 1);
  assert.deepEqual(JSON.parse(notFound.stdout), []);
  for (const args of [['lookup'], ['look'], ['--help', 'extra'], ['list', 'extra'],
    ['check', '--platform', 'grok'], ['list', '--platform'], ['list', '--platform', 'unknown'],
    ['list', '--json', '--json']]) {
    const error = cli(...args);
    assert.equal(error.status, 2, args.join(' '));
    assert.match(error.stderr, /ai-doctor --help/);
  }
});
