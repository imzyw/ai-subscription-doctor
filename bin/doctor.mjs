#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { listErrors, lookupErrors, formatErrors, platforms } from '../src/lookup.mjs';
import { runChecks, formatChecks } from '../src/checks.mjs';

const help = `AI Subscription Doctor
用法：
  ai-doctor check [--json]
  ai-doctor lookup <keyword> [--platform <p>] [--json]
  ai-doctor list [--platform <p>] [--json]
  ai-doctor --help | --version

平台：${platforms.join(', ')}`;

function parse(args) {
  const [command, ...options] = args;
  const result = { command, json: false, words: [] };
  if (!['check', 'lookup', 'list'].includes(command)) throw new Error('未知子命令');
  for (let i = 0; i < options.length; i += 1) {
    const option = options[i];
    if (option === '--json' && !result.json) result.json = true;
    else if (option === '--platform' && command !== 'check' && !result.platform) {
      const platform = options[++i];
      if (!platforms.includes(platform)) throw new Error('--platform 需要有效的平台值');
      result.platform = platform;
    } else if (!option.startsWith('-') && command === 'lookup') result.words.push(option);
    else throw new Error('参数无效');
  }
  if (command === 'lookup' && !result.words.join(' ').trim()) throw new Error('请输入查询关键词');
  return result;
}

async function main(args) {
  if (!args.length || (args.length === 1 && ['--help', '-h'].includes(args[0]))) {
    console.log(help);
    return;
  }
  if (args.length === 1 && args[0] === '--version') {
    console.log(JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version);
    return;
  }
  let options;
  try {
    options = parse(args);
  } catch (error) {
    console.error(`${error.message}。运行 ai-doctor --help 查看用法。`);
    process.exitCode = 2;
    return;
  }
  const { command, words, platform, json } = options;
  if (command === 'check') {
    const report = await runChecks();
    console.log(json ? JSON.stringify(report, null, 2) : formatChecks(report));
    return;
  }
  const details = command === 'lookup';
  const entries = details ? lookupErrors(words.join(' '), platform) : listErrors(platform);
  console.log(formatErrors(entries, { json, color: process.stdout.isTTY && !('NO_COLOR' in process.env), details }));
  if (details && !entries.length) process.exitCode = 1;
}

await main(process.argv.slice(2));
