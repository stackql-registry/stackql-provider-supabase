#!/usr/bin/env node

// Developer probe: start the mock Supabase Management API, materialise the
// test registry (as run_integration_tests.mjs does) and run the SQL
// statements given on the command line, printing stackql's stdout/stderr and
// the wire calls the mock saw for each. Handy when a binding misbehaves.
//
// Usage: node tests/integration/probe.mjs "SELECT ..." "EXEC ..." [--env KEY=VALUE ...] [--unset KEY]

import { spawn } from 'child_process';
import { existsSync, rmSync, cpSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import { startMockServer, EXPECTED_TOKEN, REF_A } from './mock_supabase_server.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..', '..');
const API_BASE = 'https://api.supabase.com';

const args = process.argv.slice(2);
const sqls = [];
const envOverrides = {};
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--env') { const [k, ...v] = args[++i].split('='); envOverrides[k] = v.join('='); }
  else if (args[i] === '--unset') { envOverrides[args[++i]] = undefined; }
  else sqls.push(args[i]);
}

function findStackql() {
  if (process.env.STACKQL) return process.env.STACKQL;
  const local = path.join(repoRoot, process.platform === 'win32' ? 'stackql.exe' : 'stackql');
  if (existsSync(local)) return local;
  return 'stackql';
}

function buildTestRegistry(port) {
  const srcDir = path.join(repoRoot, 'provider-dev', 'openapi');
  const tmpDir = path.join(here, '.registry-tmp');
  rmSync(tmpDir, { recursive: true, force: true });
  cpSync(srcDir, tmpDir, { recursive: true });
  const servicesDir = path.join(tmpDir, 'src', 'supabase', 'v00.00.00000', 'services');
  const base = `http://localhost:${port}`;
  for (const f of readdirSync(servicesDir)) {
    if (!f.endsWith('.yaml')) continue;
    const fp = path.join(servicesDir, f);
    const doc = yaml.load(readFileSync(fp, 'utf8'));
    doc.servers[0].url = doc.servers[0].url.replace(API_BASE, base);
    for (const item of Object.values(doc.paths || {})) {
      if (item.servers) item.servers = item.servers.map((s) => ({ ...s, url: s.url.replace(API_BASE, base) }));
    }
    writeFileSync(fp, yaml.dump(doc, { lineWidth: -1, noRefs: true }));
  }
  return tmpDir;
}

const { server, port, log } = await startMockServer();
const tmpDir = buildTestRegistry(port);
const regPath = tmpDir.split(path.sep).join('/');
const registry = JSON.stringify({ url: `file://${regPath}`, localDocRoot: regPath, verifyConfig: { nopVerify: true } });
const bin = findStackql();

function run(sql) {
  return new Promise((resolve) => {
    const env = { ...process.env, SUPABASE_ACCESS_TOKEN: EXPECTED_TOKEN, SUPABASE_PROJECT_ID: REF_A, ...envOverrides };
    for (const [k, v] of Object.entries(envOverrides)) if (v === undefined) delete env[k];
    const child = spawn(bin, [`--registry=${registry}`, 'exec', sql, '--output', 'json'], { cwd: repoRoot, env });
    let out = '', err = '';
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { err += d; });
    child.on('close', () => resolve({ out: out.trim(), err: err.trim() }));
  });
}

try {
  for (const sql of sqls) {
    const mark = log.length;
    const { out, err } = await run(sql);
    console.log(`\n=== ${sql}`);
    console.log(`stdout: ${out.slice(0, 1200)}`);
    if (err) console.log(`stderr: ${err.slice(0, 800)}`);
    for (const e of log.slice(mark)) console.log(`wire: ${e.method} ${e.path} query=${JSON.stringify(e.query)} ct=${e.contentType} body=${JSON.stringify(e.body)}`);
  }
} finally {
  server.close();
}
