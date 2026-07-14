#!/usr/bin/env node

// Splits the pinned Supabase Management API spec into per-service StackQL
// service specs. The spec is split by the ordered path rules in
// provider-dev/config/service_names.json (shared with build_inventory.mjs via
// lib/spec_helpers.mjs); the vendor's tags are too coarse for the split
// (Database spans the query endpoint, migrations, backups, JIT and pooler
// config; Projects spans lifecycle, network and disk). Unmatched paths fail
// the run without writing.
//
// provider-utils split() cleans its output dir on every call, so the spec is
// split into a temp dir and the requested service specs are copied into
// --output-dir (all services by default, or a --services subset).
//
// Usage:
//   node bin/split.mjs --provider-name supabase \
//     [--api-doc provider-dev/downloaded/supabase-v1.json] \
//     [--output-dir provider-dev/source] \
//     [--services projects,config,secrets] [--overwrite] [--verbose]

import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { providerdev } from '@stackql/provider-utils';
import { makeServiceResolver } from '../provider-dev/scripts/lib/spec_helpers.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2);
const getArg = (flag) => {
  const index = args.indexOf(flag);
  return index !== -1 ? args[index + 1] : null;
};

const providerName = getArg('--provider-name') || 'supabase';
const apiDoc = getArg('--api-doc') || path.join(repoRoot, 'provider-dev', 'downloaded', 'supabase-v1.json');
const outputDir = getArg('--output-dir') || path.join(repoRoot, 'provider-dev', 'source');
const servicesFilter = getArg('--services') ? getArg('--services').split(',').map((s) => s.trim()) : null;
const overwrite = args.includes('--overwrite');
const verbose = args.includes('--verbose');

if (!fs.existsSync(apiDoc)) {
  console.error(`Error: spec not found at ${apiDoc} (run npm run fetch-spec first)`);
  process.exit(1);
}
const resolveService = makeServiceResolver();

// Prepare the output directory, preserving non-spec files (e.g. .gitkeep)
fs.mkdirSync(outputDir, { recursive: true });
const existing = fs.readdirSync(outputDir).filter((f) => /\.(yaml|yml|json)$/.test(f));
if (existing.length > 0 && !overwrite) {
  console.error(`Error: output directory ${outputDir} is not empty. Use --overwrite to replace existing service specs.`);
  process.exit(1);
}

const unmapped = new Set();
const svcDiscriminatorFn = (pathKey) => {
  const service = resolveService(pathKey);
  if (!service) {
    unmapped.add(pathKey);
    return 'unmapped_service';
  }
  return service;
};

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stackql-split-'));
const written = [];
try {
  const result = await providerdev.split({
    apiDoc,
    providerName,
    outputDir: tmpDir,
    svcDiscriminator: 'function',
    svcDiscriminatorFn,
    overwrite: true,
    verbose,
    svcNameOverrides: {}
  });
  if (!result) {
    console.error('Error: split failed');
    process.exit(1);
  }
  if (unmapped.size > 0) {
    console.error('Error: paths with no service rule in provider-dev/config/service_names.json:');
    for (const t of [...unmapped].sort()) console.error(`  ${t}`);
    process.exit(1);
  }

  // Clear previous service specs only after the split and config validated
  for (const f of existing) {
    fs.rmSync(path.join(outputDir, f));
  }
  for (const outFile of fs.readdirSync(tmpDir)) {
    const service = outFile.replace(/\.(yaml|yml|json)$/, '');
    if (servicesFilter && !servicesFilter.includes(service)) continue;
    fs.copyFileSync(path.join(tmpDir, outFile), path.join(outputDir, outFile));
    written.push(outFile);
  }
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

console.log(`Split completed: ${written.length} service specs written to ${outputDir}`);
for (const f of written.sort()) {
  console.log(`  ${f}`);
}
