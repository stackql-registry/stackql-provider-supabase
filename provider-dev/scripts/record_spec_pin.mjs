#!/usr/bin/env node

// Helper for bin/fetch-spec.sh: validates the freshly downloaded Supabase
// Management API spec with @apidevtools/swagger-parser, verifies it against
// provider-dev/config/spec_pin.json, and moves it into place.
//
// - Validation failure: fail without writing anything.
// - No pin recorded: record it (first fetch).
// - Pin matches: refresh the fetched date only.
// - Pin mismatch: fail without writing anything, unless UPDATE=true, in
//   which case the new hash is recorded (a reviewed spec refresh).
//
// The written snapshot passes through a deterministic redaction step for
// vendor example values that pattern-match real credentials (none found in
// the current spec - the REDACTIONS list is empty but the mechanism stays,
// per the clickhouse precedent where Slack webhook examples tripped GitHub
// push protection). The pin records the raw upstream sha256 (drift is always
// compared against upstream) plus the sanitized sha256 of the file on disk
// and the redaction count.
//
// Reports the spec's stated version, path count and operation count on every
// run. Inputs via environment: UPDATE, TMP_DIR, DOWNLOAD_DIR, PIN_FILE,
// SPEC_URL, SPEC_FILE.

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import SwaggerParser from '@apidevtools/swagger-parser';

const update = process.env.UPDATE === 'true';
const tmpDir = process.env.TMP_DIR;
const downloadDir = process.env.DOWNLOAD_DIR;
const pinFile = process.env.PIN_FILE;
const specUrl = process.env.SPEC_URL;
const specFile = process.env.SPEC_FILE;

if (!tmpDir || !downloadDir || !pinFile || !specUrl || !specFile) {
  console.error('record_spec_pin.mjs: missing TMP_DIR / DOWNLOAD_DIR / PIN_FILE / SPEC_URL / SPEC_FILE');
  process.exit(1);
}

const tmpPath = path.join(tmpDir, specFile);
const content = fs.readFileSync(tmpPath);
const spec = JSON.parse(content.toString('utf8'));

// Validate before anything else touches disk
try {
  await SwaggerParser.validate(structuredClone(spec));
  console.log('Spec validated OK (@apidevtools/swagger-parser)');
} catch (err) {
  console.error(`Spec validation FAILED, nothing written: ${err.message}`);
  process.exit(1);
}

const pathKeys = Object.keys(spec.paths || {});
const httpVerbs = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];
let opCount = 0;
for (const p of pathKeys) {
  for (const v of httpVerbs) {
    if (spec.paths[p][v]) opCount++;
  }
}
console.log(`Spec: ${spec.info?.title} - openapi ${spec.openapi}, stated version ${spec.info?.version}, ${pathKeys.length} paths, ${opCount} operations`);

const sha256 = crypto.createHash('sha256').update(content).digest('hex');

// Deterministic redaction of credential-shaped example values (none needed
// for the current Supabase spec; add rules here if a refresh introduces any)
const REDACTIONS = [];
let sanitized = content.toString('utf8');
const redactionCounts = {};
for (const r of REDACTIONS) {
  const matches = sanitized.match(r.re);
  if (matches) {
    redactionCounts[r.name] = matches.length;
    sanitized = sanitized.replace(r.re, r.replacement);
  }
}
const sanitizedSha256 = crypto.createHash('sha256').update(sanitized).digest('hex');

let pin = { specs: {} };
if (fs.existsSync(pinFile)) {
  pin = JSON.parse(fs.readFileSync(pinFile, 'utf8'));
}
const existing = pin.specs[specFile.replace(/\.json$/, '')];

if (existing && existing.sha256 !== sha256 && !update) {
  console.error(
    `Spec pin verification FAILED, nothing written: upstream content changed ` +
    `(pinned ${existing.sha256.slice(0, 12)}..., fetched ${sha256.slice(0, 12)}...). ` +
    `Re-run with --update to accept the refresh.`
  );
  process.exit(1);
}

const status = !existing ? 'pinned' : existing.sha256 === sha256 ? 'unchanged' : 'updated';
fs.writeFileSync(path.join(downloadDir, specFile), sanitized);
pin.specs[specFile.replace(/\.json$/, '')] = {
  url: specUrl,
  filename: specFile,
  spec_version: spec.info?.version,
  openapi: spec.openapi,
  paths: pathKeys.length,
  operations: opCount,
  sha256,
  sanitized_sha256: sanitizedSha256,
  redactions: redactionCounts,
  bytes: content.length,
  fetched: new Date().toISOString().slice(0, 10)
};
fs.mkdirSync(path.dirname(pinFile), { recursive: true });
fs.writeFileSync(pinFile, JSON.stringify(pin, null, 2) + '\n');
console.log(`  ${specFile}: ${status} (upstream sha256 ${sha256.slice(0, 12)}..., ${content.length} bytes)`);
for (const [name, count] of Object.entries(redactionCounts)) {
  console.log(`  redacted ${count} ${name} value(s) in the written snapshot (sanitized sha256 ${sanitizedSha256.slice(0, 12)}...)`);
}
