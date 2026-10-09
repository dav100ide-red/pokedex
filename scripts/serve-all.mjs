#!/usr/bin/env node
// Starts `ng serve` in every ../runs/level-N-run-K folder (the experiment clones next to this repo),
// all at once, on port 4200 + N*10 + K (level-0-run-1 -> 4201, level-0-run-2 -> 4202, level-1-run-1 -> 4211, ...).
// Output is prefixed with the run name; Ctrl+C stops every server.
//
//   node scripts/serve-all.mjs [--only a,b]

import { spawn } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const RUNS = join(dirname(ROOT), 'runs');
const RUN_NAME = /^level-(\d+)-run-(\d+)$/;

const onlyIdx = process.argv.indexOf('--only');
const only = onlyIdx > -1 ? new Set(process.argv[onlyIdx + 1]?.split(',')) : null;

const runs = readdirSync(RUNS)
  .map((name) => ({ name, m: name.match(RUN_NAME) }))
  .filter(({ name, m }) => m && (!only || only.has(name)))
  .map(({ name, m }) => ({ name, dir: join(RUNS, name), port: 4200 + Number(m[1]) * 10 + Number(m[2]) }))
  .sort((a, b) => a.port - b.port);

if (!runs.length) {
  console.error('No runs found' + (only ? ` matching --only ${[...only].join(',')}` : ''));
  process.exit(1);
}

const width = Math.max(...runs.map((r) => r.name.length));
const children = [];

for (const run of runs) {
  const ng = join(run.dir, 'node_modules', '.bin', 'ng');
  if (!existsSync(ng)) {
    console.error(`[${run.name}] skipped: node_modules missing (run npm ci)`);
    continue;
  }
  const child = spawn(ng, ['serve', '--port', String(run.port), '--no-open'], {
    cwd: run.dir,
    env: { ...process.env, NG_CLI_ANALYTICS: 'false', FORCE_COLOR: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const prefix = `[${run.name.padEnd(width)} :${run.port}] `;
  const pipe = (stream, out) => {
    let buf = '';
    stream.on('data', (chunk) => {
      buf += chunk;
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) out.write(prefix + line + '\n');
    });
  };
  pipe(child.stdout, process.stdout);
  pipe(child.stderr, process.stderr);
  child.on('exit', (code, signal) => console.log(`${prefix}exited (${signal ?? code})`));
  children.push(child);
}

console.log('\n' + runs.map((r) => `  ${r.name.padEnd(width)}  http://localhost:${r.port}/`).join('\n') + '\n');

const stop = () => {
  for (const child of children) child.kill('SIGTERM');
  setTimeout(() => process.exit(0), 2000).unref();
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
