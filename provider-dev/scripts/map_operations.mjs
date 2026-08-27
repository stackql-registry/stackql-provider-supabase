#!/usr/bin/env node

// Populates stackql_resource_name, stackql_method_name, stackql_verb and
// stackql_object_key in provider-dev/config/all_services.csv from the split
// service specs in provider-dev/source. Deterministic and re-runnable on
// spec refreshes; review the CSV diff after running. Manual mapping decisions
// are applied as rules here, never as hand-edits to the CSV.
//
// Mapping conventions (see CLAUDE.md):
//   GET collection                   -> SELECT  <resource>.list (bare arrays
//                                       are wrapped by normalize; the wrap
//                                       key is confirmed on the first
//                                       normalize run and set here - blank
//                                       until then; envelope reads carry
//                                       their key, e.g. $.keys, $.items)
//   GET single / config singleton    -> SELECT  <resource>.get
//   POST create                      -> INSERT  <resource>.create
//   PATCH/PUT edit                   -> UPDATE  <resource>.update (UPDATE vs
//                                       REPLACE labelled per resource once
//                                       the toggle-and-restore probe runs -
//                                       keycloak warning: default UPDATE,
//                                       REPLACE only on proven
//                                       full-replacement semantics)
//   DELETE                           -> DELETE  <resource>.delete
//   POST lifecycle actions           -> EXEC    <parent>.<action>
//     (pause, restart, restore, upgrade, setup/remove replicas, ...)
//   POST .../database/query          -> provisional EXEC draft; the flagship
//     mapping (snowflake SubmitStatement framework, EXEC vs INSERT ...
//     RETURNING) is decided on live projection evidence and recorded in
//     NOTES.md before the database service is generated
//   multipart deploy, oauth flow,    -> skipped (skip_this_resource,
//     untyped function body, HEAD       reason-coded in
//                                       endpoint_inventory.csv)
//
// Resource names come from the shared derivation in lib/spec_helpers.mjs
// (scoping pairs stripped, last segment pluralized); RESOURCE_RULES applies
// explicit overrides where the mechanical name is wrong.
//
// Validates before writing: every CSV row mapped or skipped with a reason,
// every spec operation present in the CSV, (resource, method) unique per
// service, and unique required-parameter signatures per (resource, sqlVerb).
// Fails without writing on violations.
//
// Usage: npm run map-operations [-- --out other.csv]

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import pluralize from 'pluralize';
import {
  HTTP_VERBS, camelToSnake, pathParams, makeResolver,
  classifyResponseShape, skipReason, scopedSegments,
  ACTION_SEGMENTS, POST_EXEC_SEGMENTS, deriveResource
} from './lib/spec_helpers.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const sourceDir = path.join(repoRoot, 'provider-dev', 'source');
const csvPath = path.join(repoRoot, 'provider-dev', 'config', 'all_services.csv');

// Explicit resource-name overrides, matched on (service, verb-optional,
// normalized path with params collapsed to {}). First match wins; add rules
// here as services come online - never edit the CSV. Pilot services
// (projects, config, secrets) are covered; the remaining services get their
// rules when they are split.
const RESOURCE_RULES = [
  // --- config: singleton config surfaces read poorly when derived
  // mechanically (config/auth -> "auths"); the *_configs convention is the
  // CLAUDE.md posture-surface naming
  { service: 'config', re: /\/config\/auth$/, resource: 'auth_configs' },
  { service: 'config', re: /\/config\/auth\/signing-keys\/legacy$/, resource: 'legacy_signing_keys' },
  { service: 'config', re: /\/config\/auth\/third-party-auth(\/\{\})?$/, resource: 'third_party_auth_integrations' },
  { service: 'config', re: /\/config\/auth\/sso\/providers(\/\{\})?$/, resource: 'sso_providers' },
  { service: 'config', re: /\/config\/database\/postgres$/, resource: 'postgres_configs' },
  { service: 'config', re: /\/config\/database\/pooler$/, resource: 'pooler_configs' },
  { service: 'config', re: /\/config\/database\/pgbouncer$/, resource: 'pgbouncer_configs' },
  { service: 'config', re: /\/config\/realtime(\/shutdown)?$/, resource: 'realtime_configs' },
  { service: 'config', re: /\/config\/storage$/, resource: 'storage_configs' },
  { service: 'config', re: /\/postgrest$/, resource: 'postgrest_configs' },
  { service: 'config', re: /\/ssl-enforcement$/, resource: 'ssl_enforcement_configs' },
  { service: 'config', re: /\/pgsodium$/, resource: 'pgsodium_configs' },
  // --- projects
  { service: 'projects', re: /\/health$/, resource: 'service_health' },
  { service: 'projects', verb: 'get', re: /\/restore$/, resource: 'restore_versions' },
  { service: 'projects', re: /\/restore\/cancel$/, resource: 'projects' },
  { service: 'projects', re: /\/upgrade\/eligibility$/, resource: 'upgrade_eligibility' },
  { service: 'projects', re: /\/upgrade\/status$/, resource: 'upgrade_status' },
  { service: 'projects', re: /\/config\/disk$/, resource: 'disk_configs' },
  { service: 'projects', re: /\/config\/disk\/util$/, resource: 'disk_utilization' },
  { service: 'projects', re: /\/config\/disk\/autoscale$/, resource: 'disk_autoscale_configs' },
  { service: 'projects', re: /^\/v1\/organizations\/\{\}\/projects$/, resource: 'organization_projects' },
  // --- secrets
  { service: 'secrets', re: /\/api-keys\/legacy$/, resource: 'legacy_api_keys' },
  // --- branches: the branch-by-id read returns the branch's database
  // connection details (BranchDetailResponse), a different shape from the
  // project-scoped list/get (BranchResponse); it gets its own resource so
  // each resource projects one shape. The vendor's operationId is
  // v1-get-a-branch-config.
  { service: 'branches', verb: 'get', re: /^\/v1\/branches\/\{\}$/, resource: 'branch_configs' },
  { service: 'branches', re: /\/actions(\/|$)/, resource: 'action_runs' },
  // --- database
  { service: 'database', re: /\/database\/query(\/read-only)?$/, resource: 'queries' },
  { service: 'database', re: /\/database\/password$/, resource: 'databases' },
  { service: 'database', re: /\/database\/context$/, resource: 'databases' },
  { service: 'database', re: /\/database\/backups\/restore-point$/, resource: 'restore_points' },
  { service: 'database', re: /\/database\/backups\/schedule$/, resource: 'backup_schedules' },
  { service: 'database', verb: 'get', re: /\/database\/jit$/, resource: 'jit_role_mappings' },
  { service: 'database', re: /\/database\/jit(\/list|\/\{\})?$/, resource: 'jit_access' },
  { service: 'database', re: /\/database\/jit\/invite/, resource: 'jit_invites' },
  { service: 'database', re: /\/jit-access$/, resource: 'jit_access_configs' },
  { service: 'database', re: /\/readonly(\/temporary-disable)?$/, resource: 'readonly_mode' },
  { service: 'database', re: /\/types\/typescript$/, resource: 'typescript_types' },
  { service: 'database', re: /\/database\/webhooks\/enable$/, resource: 'webhooks' },
  // --- functions: the CLAUDE.md naming (supabase.functions.edge_functions)
  { service: 'functions', re: /\/functions(\/|$)/, resource: 'edge_functions' },
  // --- network: both POST-backed ban reads are the network_bans resource
  { service: 'network', re: /\/network-bans(\/|$)/, resource: 'network_bans' },
  // --- analytics: one resource per endpoint, named for what it returns
  { service: 'analytics', re: /\/endpoints\/logs\.all$/, resource: 'all_logs' },
  { service: 'analytics', re: /\/endpoints\/logs$/, resource: 'logs' },
  { service: 'analytics', re: /\/endpoints\/usage\.api-counts$/, resource: 'api_counts' },
  { service: 'analytics', re: /\/endpoints\/usage\.api-requests-count$/, resource: 'api_request_counts' },
  { service: 'analytics', re: /\/endpoints\/functions\.combined-stats$/, resource: 'function_stats' },
  // --- advisors: the lint rows are the resource
  { service: 'advisors', re: /\/advisors\/performance$/, resource: 'performance_lints' },
  { service: 'advisors', re: /\/advisors\/security$/, resource: 'security_lints' },
  // --- organizations
  { service: 'organizations', re: /\/project-claim\/\{\}$/, resource: 'project_claims' }
];

// Method-name / verb / objectKey overrides for cases the generic rules
// cannot express, matched on (verb, normalized path). First match wins.
const METHOD_RULES = [
  // envelope list reads carry their array key
  { verb: 'get', re: /\/config\/auth\/signing-keys$/, method: 'list', sqlVerb: 'select', objectKey: '$.keys' },
  { verb: 'get', re: /\/config\/auth\/sso\/providers$/, method: 'list', sqlVerb: 'select', objectKey: '$.items' },
  { verb: 'get', re: /\/restore$/, method: 'list', sqlVerb: 'select', objectKey: '$.available_versions' },
  { verb: 'get', re: /^\/v1\/organizations\/\{\}\/projects$/, method: 'list', sqlVerb: 'select', objectKey: '$.projects' },
  // the realtime shutdown command is an action on the config parent
  { verb: 'post', re: /\/config\/realtime\/shutdown$/, method: 'shutdown', sqlVerb: 'exec', objectKey: '' },
  // POST config/disk modifies the disk (grow/change), not a create
  { verb: 'post', re: /\/config\/disk$/, method: 'modify', sqlVerb: 'exec', objectKey: '' },
  // restore/cancel is a projects lifecycle command; the mechanical name
  // would collide with a restores resource
  { verb: 'post', re: /\/restore\/cancel$/, method: 'cancel_restore', sqlVerb: 'exec', objectKey: '' },
  // --- branches: DELETE /projects/{ref}/branches disables preview branching
  // for the project (an action, not a row delete); the branch-by-id DELETE is
  // the row delete
  { verb: 'delete', re: /^\/branches$/, method: 'disable_branching', sqlVerb: 'exec', objectKey: '' },
  // --- database
  // snippets list is a {data, cursor} envelope (cursor pagination is
  // configured in post_process)
  { verb: 'get', re: /^\/v1\/snippets$/, method: 'list', sqlVerb: 'select', objectKey: '$.data' },
  // migrations: PUT is an upsert (apply-or-record), distinct from the PATCH
  // edit of a recorded version
  { verb: 'put', re: /\/database\/migrations$/, method: 'upsert', sqlVerb: 'exec', objectKey: '' },
  // the flagship: POST database/query maps as INSERT (queries.run) so that
  // INSERT ... RETURNING flows the result rows (snowflake SubmitStatement
  // framework, projection evidence in NOTES.md finding 1); the read-only
  // sibling is EXEC-only - the main method takes read_only in its body
  { verb: 'post', re: /\/database\/query$/, method: 'run', sqlVerb: 'insert', objectKey: '' },
  { verb: 'post', re: /\/database\/query\/read-only$/, method: 'run_read_only', sqlVerb: 'exec', objectKey: '' },
  // database metadata (deprecated) is the databases list
  { verb: 'get', re: /\/database\/context$/, method: 'list', sqlVerb: 'select', objectKey: '$.databases' },
  // backups: the envelope's backups array is the row source
  { verb: 'get', re: /\/database\/backups$/, method: 'list', sqlVerb: 'select', objectKey: '$.backups' },
  // JIT access: the list envelope
  { verb: 'get', re: /\/database\/jit\/list$/, method: 'list', sqlVerb: 'select', objectKey: '$.items' },
  // --- functions: PUT /functions is a bulk update taking a bare array body
  { verb: 'put', re: /^\/functions$/, method: 'bulk_update', sqlVerb: 'exec', objectKey: '' },
  // --- network bans: the enriched POST read is the list (object rows); the
  // plain POST read (string rows) stays available as EXEC
  { verb: 'post', re: /\/network-bans\/retrieve\/enriched$/, method: 'list', sqlVerb: 'select', objectKey: '$.banned_ipv4_addresses' },
  { verb: 'post', re: /\/network-bans\/retrieve$/, method: 'retrieve', sqlVerb: 'exec', objectKey: '' },
  // --- advisors: the lints array is the row source
  { verb: 'get', re: /\/advisors\/(performance|security)$/, method: 'list', sqlVerb: 'select', objectKey: '$.lints' },
  // --- billing: the project's applied add-ons are the rows
  { verb: 'get', re: /\/billing\/addons$/, method: 'list', sqlVerb: 'select', objectKey: '$.selected_addons' },
  // --- organizations: claiming a project is an action on the claim
  { verb: 'post', re: /\/project-claim\/\{\}$/, method: 'claim', sqlVerb: 'exec', objectKey: '' }
];

function normalizePath(pathKey) {
  return pathKey.replace(/\{[^}]+\}/g, '{}');
}

// ---------------------------------------------------------------------------
// Index every operation in the split service specs
// ---------------------------------------------------------------------------

const ops = new Map(); // `${filename}::${path}::${verb}` -> { op, pathItem, resolve }
const specFiles = fs.readdirSync(sourceDir).filter((f) => f.endsWith('.yaml')).sort();
if (specFiles.length === 0) {
  console.error(`Error: no service specs in ${sourceDir} - run npm run split first`);
  process.exit(1);
}
for (const filename of specFiles) {
  const spec = yaml.load(fs.readFileSync(path.join(sourceDir, filename), 'utf8'));
  const resolve = makeResolver(spec);
  for (const [pathKey, pathItem] of Object.entries(spec.paths || {})) {
    for (const verb of HTTP_VERBS) {
      if (!pathItem[verb]) continue;
      ops.set(`${filename}::${pathKey}::${verb}`, { op: pathItem[verb], pathItem, resolve });
    }
  }
}

// ---------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------

function resourceFor(service, pathKey, verb) {
  const norm = normalizePath(pathKey);
  for (const rule of RESOURCE_RULES) {
    if (rule.service && rule.service !== service) continue;
    if (rule.verb && rule.verb !== verb) continue;
    if (rule.re.test(norm)) return rule.resource;
  }
  return deriveResource(pathKey, verb, service, pluralize);
}

function mapOperation(filename, pathKey, verb) {
  const entry = ops.get(`${filename}::${pathKey}::${verb}`);
  if (!entry) return { error: `operation not found in ${sourceDir}` };
  const { op, resolve } = entry;
  const service = filename.replace(/\.yaml$/, '');

  const skip = skipReason(pathKey, op, resolve, verb);
  if (skip) return { resource: 'skip_this_resource', method: '', sqlVerb: '', objectKey: '', skip };

  const norm = normalizePath(pathKey);
  const methodRule = METHOD_RULES.find((r) => r.verb === verb && r.re.test(norm));
  const resource = resourceFor(service, pathKey, verb);
  if (methodRule) {
    return { resource, method: methodRule.method, sqlVerb: methodRule.sqlVerb, objectKey: methodRule.objectKey || '' };
  }

  const { segs } = scopedSegments(pathKey);
  const statics = segs.filter((s) => !s.startsWith('{'));
  const lastStatic = statics[statics.length - 1];
  const lastSegIsParam = /\}$/.test(pathKey);
  const { shape } = classifyResponseShape(op, resolve);

  if (verb === 'get') {
    // bare-array lists: normalize wraps these; the wrap key is confirmed on
    // the first normalize run and set via METHOD_RULES then (left blank in
    // the phase 1 groundwork mapping)
    if (shape === 'bare-array') return { resource, method: 'list', sqlVerb: 'select', objectKey: '' };
    return { resource, method: 'get', sqlVerb: 'select', objectKey: '' };
  }
  if (verb === 'delete') {
    return { resource, method: 'delete', sqlVerb: 'delete', objectKey: '' };
  }
  if (verb === 'patch' || verb === 'put') {
    if (ACTION_SEGMENTS.has(lastStatic)) {
      return { resource, method: `update_${camelToSnake(lastStatic)}`, sqlVerb: 'exec', objectKey: '' };
    }
    return { resource, method: 'update', sqlVerb: 'update', objectKey: '' };
  }
  // post
  if (POST_EXEC_SEGMENTS.has(lastStatic)) {
    return { resource, method: camelToSnake(lastStatic), sqlVerb: 'exec', objectKey: '' };
  }
  return { resource, method: 'create', sqlVerb: 'insert', objectKey: '' };
}

// ---------------------------------------------------------------------------
// CSV read/transform/write (RFC 4180, preserves column order)
// ---------------------------------------------------------------------------

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else { field += c; }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else { field += c; }
  }
  if (field !== '' || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

function csvField(v) {
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'));
const header = rows[0];
const col = Object.fromEntries(header.map((h, i) => [h, i]));
for (const required of ['filename', 'path', 'verb', 'operationId', 'stackql_resource_name', 'stackql_method_name', 'stackql_verb', 'stackql_object_key']) {
  if (!(required in col)) {
    console.error(`Missing expected CSV column: ${required}`);
    process.exit(1);
  }
}

const errors = [];
const seenKeys = new Set();
const stats = { select: 0, insert: 0, update: 0, delete: 0, exec: 0, skipped: 0 };
const skipsByReason = {};

for (const row of rows.slice(1)) {
  const filename = row[col.filename], pathKey = row[col.path], verb = row[col.verb];
  seenKeys.add(`${filename}::${pathKey}::${verb}`);
  const m = mapOperation(filename, pathKey, verb);
  if (m.error) {
    errors.push(`${filename} ${verb} ${pathKey}: ${m.error}`);
    continue;
  }
  row[col.stackql_resource_name] = m.resource;
  if (m.resource === 'skip_this_resource') {
    stats.skipped++;
    skipsByReason[m.skip] = (skipsByReason[m.skip] || 0) + 1;
    row[col.stackql_method_name] = '';
    row[col.stackql_verb] = '';
    row[col.stackql_object_key] = '';
    continue;
  }
  row[col.stackql_method_name] = m.method;
  row[col.stackql_verb] = m.sqlVerb;
  row[col.stackql_object_key] = m.objectKey;
  stats[m.sqlVerb]++;
}

// every spec operation must have a CSV row (else generate-provider misses it)
for (const key of ops.keys()) {
  if (!seenKeys.has(key)) errors.push(`in spec but not in CSV: ${key}`);
}

// ---------------------------------------------------------------------------
// Consistency checks
// ---------------------------------------------------------------------------

const methodSeen = new Map();
const sigSeen = new Map();
for (const row of rows.slice(1)) {
  const resource = row[col.stackql_resource_name];
  if (!resource || resource === 'skip_this_resource') continue;
  const service = row[col.filename].replace(/\.yaml$/, '');
  const methodKey = `${service}.${resource}.${row[col.stackql_method_name]}`;
  if (methodSeen.has(methodKey)) {
    errors.push(`duplicate method ${methodKey} (${methodSeen.get(methodKey)} and ${row[col.path]}:${row[col.verb]})`);
  }
  methodSeen.set(methodKey, `${row[col.path]}:${row[col.verb]}`);

  const sqlVerb = row[col.stackql_verb];
  if (sqlVerb === 'exec') continue;
  // signature = required inputs: path params plus required query params
  const entry = ops.get(`${row[col.filename]}::${row[col.path]}::${row[col.verb]}`);
  const requiredQuery = [...(entry?.pathItem?.parameters || []), ...(entry?.op.parameters || [])]
    .map((p) => entry.resolve(p))
    .filter((p) => p && p.in === 'query' && p.required)
    .map((p) => p.name);
  const sig = [...pathParams(row[col.path]), ...requiredQuery].sort().join(',');
  const sigKey = `${service}.${resource}.${sqlVerb}::${sig}`;
  if (sigSeen.has(sigKey)) {
    errors.push(`signature clash on ${service}.${resource} ${sqlVerb} [${sig}] (${sigSeen.get(sigKey)} and ${row[col.stackql_method_name]})`);
  }
  sigSeen.set(sigKey, row[col.stackql_method_name]);
}

if (process.argv.includes('--report')) {
  // diagnostic listing of the derived mapping per operation (no write)
  for (const row of rows.slice(1)) {
    console.log(`${row[col.filename].replace(/.yaml$/, '').padEnd(14)} ${row[col.verb].padEnd(6)} ${row[col.path].padEnd(62)} -> ${row[col.stackql_resource_name]}.${row[col.stackql_method_name]} [${row[col.stackql_verb]}] ${row[col.stackql_object_key]}`);
  }
}
if (errors.length > 0) {
  console.error(`FAILED with ${errors.length} error(s), nothing written:`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}

const outArgIdx = process.argv.indexOf('--out');
const outPath = outArgIdx !== -1 ? path.resolve(process.argv[outArgIdx + 1]) : csvPath;
const out = rows.map((r) => r.map(csvField).join(',')).join('\n') + '\n';
fs.writeFileSync(outPath, out);

// summary
const resourcesByService = new Map();
for (const row of rows.slice(1)) {
  const resource = row[col.stackql_resource_name];
  if (!resource || resource === 'skip_this_resource') continue;
  const service = row[col.filename].replace(/\.yaml$/, '');
  if (!resourcesByService.has(service)) resourcesByService.set(service, new Set());
  resourcesByService.get(service).add(resource);
}
console.log(`Mapped: select ${stats.select}, insert ${stats.insert}, update ${stats.update}, delete ${stats.delete}, exec ${stats.exec}; skipped ${stats.skipped}${stats.skipped ? ` (${Object.entries(skipsByReason).map(([k, v]) => `${k}: ${v}`).join(', ')})` : ''}`);
console.log('Resources per service:');
for (const [service, resources] of [...resourcesByService.entries()].sort()) {
  console.log(`  ${service}: ${[...resources].sort().join(', ')}`);
}
