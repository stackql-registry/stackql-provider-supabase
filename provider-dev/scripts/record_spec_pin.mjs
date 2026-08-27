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

// Deterministic fixes for the NestJS generator's OpenAPI 3.0 violations
// (hetzner precedent: fix deterministically before validating, record the
// counts in the pin). Four defect classes seen so far; a class that is
// absent from a given snapshot simply counts 0 in the pin:
//   type_null_to_nullable - `"type": "null"` is JSON Schema 2020-12, not
//     OpenAPI 3.0; rewritten to `nullable: true` with no type (the always-
//     null discriminant properties in the JIT access oneOf variants, and the
//     deprecated always-null create-project body fields)
//   hide_definitions_removed - `hideDefinitions` is a @nestjs/swagger
//     artifact key, not an OpenAPI schema keyword
//   property_names_removed - `propertyNames` is a JSON Schema 2019-09
//     keyword that OpenAPI 3.0 does not allow (the api-keys
//     `secret_jwt_template` free-form object, 2026-08 refresh); dropped -
//     the constraint (string keys) is implied by JSON anyway
//   exclusive_bound_lowered - numeric `exclusiveMinimum` / `exclusiveMaximum`
//     (JSON Schema 2020-12 form) rewritten to the OpenAPI 3.0 form,
//     `minimum`/`maximum` plus the boolean flag (DiskAutoscaleConfig,
//     2026-08 refresh; the clickhouse pre_normalize precedent)
//   schema_dialect_key_removed - a literal `$schema` key naming the
//     2020-12 dialect inside a response schema (the jit-access oneOf,
//     2026-08 refresh); not an OpenAPI 3.0 keyword, dropped
//   const_to_enum - `const: x` (2019-09) rewritten to `enum: [x]`, the
//     3.0 equivalent (the jit-access "unavailable" discriminant)
const fixes = { type_null_to_nullable: 0, hide_definitions_removed: 0, property_names_removed: 0, exclusive_bound_lowered: 0, schema_dialect_key_removed: 0, const_to_enum: 0 };
function applyFixes(node) {
  if (Array.isArray(node)) { node.forEach(applyFixes); return; }
  if (node && typeof node === 'object') {
    if (node.type === 'null') {
      delete node.type;
      node.nullable = true;
      fixes.type_null_to_nullable++;
    }
    if ('hideDefinitions' in node) {
      delete node.hideDefinitions;
      fixes.hide_definitions_removed++;
    }
    if ('propertyNames' in node) {
      delete node.propertyNames;
      fixes.property_names_removed++;
    }
    if (typeof node.$schema === 'string') {
      delete node.$schema;
      fixes.schema_dialect_key_removed++;
    }
    if ('const' in node) {
      node.enum = [node.const];
      delete node.const;
      fixes.const_to_enum++;
    }
    for (const [excl, bound] of [['exclusiveMinimum', 'minimum'], ['exclusiveMaximum', 'maximum']]) {
      if (typeof node[excl] === 'number') {
        node[bound] = node[excl];
        node[excl] = true;
        fixes.exclusive_bound_lowered++;
      }
    }
    for (const v of Object.values(node)) applyFixes(v);
  }
}
applyFixes(spec);
for (const [name, count] of Object.entries(fixes)) {
  if (count > 0) console.log(`  fix ${name}: ${count} occurrence(s)`);
}

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

// The pin's sha256 is of the raw upstream bytes - drift is always compared
// against upstream; the written snapshot carries the deterministic fixes
const sha256 = crypto.createHash('sha256').update(content).digest('hex');

// Deterministic redaction of credential-shaped example values (none needed
// for the current Supabase spec; add rules here if a refresh introduces any)
const REDACTIONS = [];
let sanitized = JSON.stringify(spec);
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
  fixes,
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
