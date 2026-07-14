#!/usr/bin/env node

// Builds the endpoint inventory (provider-dev/config/endpoint_inventory.csv)
// from the pinned Supabase Management API spec: one row per operation with
// the ref/slug scoping, pagination-style query parameters (recorded to
// confirm the mostly-bounded expectation per endpoint, not to configure
// traversal), request body presence and kind (multipart/eszip/form/bare-array
// flagged), the update verb's semantics presumption (per the keycloak
// warning, unverified until the toggle-and-restore probe), the vendor's
// [Beta]/[Alpha] label, the deprecated flag, the response shape with its
// top-level array keys (the object key for list reads is a per-resource
// mapping decision), the proposed service (from the path rules in
// provider-dev/config/service_names.json), a draft resource and StackQL
// verb, and a skip reason where the operation is not mapped.
//
// The proposed resource/verb columns are groundwork drafts -
// map_operations.mjs produces the authoritative mapping. Fails without
// writing if any path lacks a service rule.
//
// Usage: npm run build-inventory

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pluralize from 'pluralize';
import {
  INVENTORY_VERBS, pathParams, scopeOf, makeResolver, makeServiceResolver,
  classifyResponseShape, classifyBeta, classifyRequestBody, paginationParams,
  updateSemantics, skipReason, deriveResource, deriveVerb
} from './lib/spec_helpers.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const specPath = path.join(repoRoot, 'provider-dev', 'downloaded', 'supabase-v1.json');
const outPath = path.join(repoRoot, 'provider-dev', 'config', 'endpoint_inventory.csv');

const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const resolve = makeResolver(spec);
const resolveService = makeServiceResolver();

const rows = [];
const errors = [];
const stats = { byService: {}, byVerb: {}, byShape: {}, byBeta: {}, byDisposition: {}, byScope: {}, byUpdateVerb: {} };
const paginationFindings = [];
const bump = (obj, key) => { obj[key] = (obj[key] || 0) + 1; };

for (const [pathKey, pathItem] of Object.entries(spec.paths || {})) {
  for (const verb of INVENTORY_VERBS) {
    const op = pathItem[verb];
    if (!op) continue;

    const service = resolveService(pathKey);
    if (!service) {
      errors.push(`no service rule matches ${verb.toUpperCase()} ${pathKey}`);
      continue;
    }
    const { shape, arrayKeys, mediaTypes } = classifyResponseShape(op, resolve);
    const skip = skipReason(pathKey, op, resolve, verb);
    const beta = classifyBeta(op);
    const body = classifyRequestBody(op, resolve);
    const pageParams = paginationParams(op, pathItem, resolve);

    if (pageParams.length > 0) {
      paginationFindings.push(`${verb.toUpperCase()} ${pathKey}: ${pageParams.join(', ')}`);
    }

    rows.push({
      method: verb,
      path: pathKey,
      operation_id: op.operationId,
      tag: (op.tags || []).join(';'),
      scope: scopeOf(pathKey),
      path_params: pathParams(pathKey).join(';'),
      pagination_params: pageParams.join(';'),
      has_request_body: body.has,
      body_kinds: body.kinds.join(';'),
      body_bare_array: body.bareArray ? 'y' : '',
      update_semantics: updateSemantics(verb),
      beta,
      deprecated: op.deprecated ? 'y' : '',
      response_shape: shape,
      response_array_keys: arrayKeys.join(';'),
      response_media_types: mediaTypes.filter((m) => !m.includes('json')).join(';'),
      proposed_service: service,
      proposed_resource: skip ? '' : deriveResource(pathKey, verb, service, pluralize),
      proposed_verb: skip ? '' : deriveVerb(verb, pathKey),
      skip_reason: skip
    });

    bump(stats.byShape, shape);
    bump(stats.byBeta, beta || 'ga');
    bump(stats.byScope, scopeOf(pathKey));
    bump(stats.byDisposition, skip ? `skipped: ${skip}` : 'mapped');
    if (verb === 'patch' || verb === 'put') bump(stats.byUpdateVerb, verb);
    if (!skip) {
      bump(stats.byService, service);
      bump(stats.byVerb, deriveVerb(verb, pathKey));
    }
  }
}

if (errors.length > 0) {
  console.error(`FAILED with ${errors.length} error(s), nothing written:`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}

const columns = Object.keys(rows[0]);
const csvField = (v) => (/[",\n\r]/.test(v) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
const csv = [columns.join(',')]
  .concat(rows.map((r) => columns.map((c) => csvField(r[c] ?? '')).join(',')))
  .join('\n') + '\n';
fs.writeFileSync(outPath, csv);

console.log(`Endpoint inventory written to ${outPath} (${rows.length} operations)\n`);
const printStats = (title, obj) => {
  console.log(title);
  for (const [k, v] of Object.entries(obj).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(4)}  ${k}`);
};
printStats('By disposition:', stats.byDisposition);
printStats('\nMapped operations by proposed service:', stats.byService);
printStats('\nMapped operations by proposed StackQL verb:', stats.byVerb);
printStats('\nBy response shape:', stats.byShape);
printStats('\nBy beta label:', stats.byBeta);
printStats('\nBy scope:', stats.byScope);
printStats('\nUpdate operations by verb (semantics unverified until probed):', stats.byUpdateVerb);

console.log('\nPagination check (query parameters that look like paging):');
if (paginationFindings.length === 0) {
  console.log('  none - every list endpoint returns the complete collection');
} else {
  for (const f of paginationFindings) console.log(`  ${f}`);
}
