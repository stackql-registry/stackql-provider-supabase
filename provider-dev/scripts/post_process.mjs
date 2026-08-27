#!/usr/bin/env node

// Post-generation fixes for things the generator cannot express. Idempotent;
// re-run after every generate. Validates and fails without writing.
//
// 1. Root-path server override. Every service is generated on the
//    project-scoped server template (https://api.supabase.com/v1/projects/{ref},
//    ref via x-stackQL-envVar SUPABASE_PROJECT_ID). The 27 paths that are not
//    project-scoped (the projects root and create, available regions, the
//    organization surface, branch-by-id, snippets, profile, oauth, and
//    /v1/projects/{ref} itself) keep their full /v1/... key and get a
//    path-level `servers` override back to https://api.supabase.com. any-sdk
//    resolves servers operation -> path item -> document, so the override
//    wins for these operations only. It is applied here because normalize
//    strips path-level servers from provider-dev/source.
//
// 2. Snippets cursor pagination. GET /v1/snippets is the only token-paginated
//    collection (cursor query parameter, `cursor` companion in the response
//    envelope); a method-level pagination config lets stackql follow it.
//
// 3. snake_case surface. The wire is snake_case almost everywhere; three
//    request bodies carry camelCase attributes (network-restrictions/apply:
//    dbAllowedCidrs / dbAllowedCidrsV6; ssl-enforcement PUT: requestedConfig;
//    storage config PATCH: fileSizeLimit). `request.nativeCasing: camel` on
//    those three methods lets the snake_case SQL keys resolve against them,
//    paired with `snake_case_aliases: true` on the provider config (Makefile
//    PROVIDER_CONFIG) which presents the handful of camelCase response
//    properties (currentConfig, appliedSuccessfully, connectionString, ...)
//    as snake_case columns. The oci/clickhouse precedent.
//
// 4. The query endpoint result binding. POST /database/query returns a bare
//    JSON array of row objects with query-dependent keys. pre_normalize
//    typed the 201 as V1RunQueryResultRows ({rows: [...]}); the wrap
//    transform attached here (the same trio the generator emits for
//    bare-array lists: overrideMediaType + schema_override + transform)
//    turns the array into that envelope, so `INSERT ... RETURNING rows`
//    yields one row whose `rows` column carries the result set (NOTES.md
//    finding 1, the newrelic blob posture). Applied to the read-only sibling
//    as well.
//
// 5. POST-backed reads. The generator applies stackql_object_key to GET
//    operations only; the network bans list is a POST read
//    ({banned_ipv4_addresses: [...]}) and gets its objectKey here.
//
// 6. Secrets bulk bodies. pre_normalize rewrote the bare-array request
//    bodies of POST/DELETE /secrets to their single-item object form; the
//    request transforms attached here wrap the marshalled object back into
//    the array the wire expects: `[{"name": ..., "value": ...}]` for the
//    create and `["name"]` for the delete (NOTES.md finding 8).
//
// 7. DELETE with a body. The generator emits requestBodyTranslate: naive
//    for POST/PUT/PATCH only, so a DELETE body would surface as
//    data__<attribute>; the two DELETEs that carry bodies (secrets, network
//    bans) get the naive translation here so their attributes are plain
//    WHERE keys.
//
// Usage: node provider-dev/scripts/post_process.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import { API_BASE_URL } from './lib/spec_helpers.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const servicesDir = path.join(repoRoot, 'provider-dev', 'openapi', 'src', 'supabase', 'v00.00.00000', 'services');
const QUERY_RESULT_SCHEMA_NAME = 'V1RunQueryResultRows';

// methods whose request bodies carry camelCase attributes
const CAMEL_BODY_METHODS = [
  ['network.yaml', 'network_restrictions', 'apply'],
  ['config.yaml', 'ssl_enforcement_configs', 'update'],
  ['config.yaml', 'storage_configs', 'update']
];

if (!fs.existsSync(servicesDir)) {
  console.error(`Error: ${servicesDir} not found - run the generate step first`);
  process.exit(1);
}

const errors = [];
const docs = new Map();
const counts = { rootPathsPinned: 0, refPaths: 0, nativeCasing: 0 };

for (const f of fs.readdirSync(servicesDir).filter((x) => x.endsWith('.yaml')).sort()) {
  const doc = yaml.load(fs.readFileSync(path.join(servicesDir, f), 'utf8'));
  docs.set(f, doc);

  // 1. root paths pinned to the API base; every other path must be rebased
  const srv = doc.servers?.[0];
  if (!srv?.variables?.ref?.['x-stackQL-envVar']) errors.push(`${f}: top-level server lacks the ref x-stackQL-envVar variable`);
  for (const [p, item] of Object.entries(doc.paths || {})) {
    if (p.startsWith('/v1/')) {
      item.servers = [{ url: API_BASE_URL }];
      counts.rootPathsPinned++;
    } else if (p.includes('{ref}')) {
      errors.push(`${f}: path ${p} still carries {ref} but was not kept as a root path`);
    } else {
      counts.refPaths++;
    }
  }
  const resources = doc.components?.['x-stackQL-resources'] || {};
  if (Object.keys(resources).length === 0 && f !== 'oauth.yaml') errors.push(`${f}: no x-stackQL-resources`);
}

const method = (f, resource, name) => {
  const m = docs.get(f)?.components?.['x-stackQL-resources']?.[resource]?.methods?.[name];
  if (!m) errors.push(`${f}: expected method ${resource}.${name} is missing`);
  return m;
};

// 2. snippets cursor pagination
const snippetsList = method('database.yaml', 'snippets', 'list');
if (snippetsList) {
  const op = docs.get('database.yaml').paths?.['/v1/snippets']?.get;
  if (!(op?.parameters || []).some((p) => p.name === 'cursor')) errors.push('database.yaml: GET /v1/snippets lost its cursor parameter');
  snippetsList.config = {
    ...(snippetsList.config || {}),
    pagination: {
      requestToken: { key: 'cursor', location: 'query' },
      responseToken: { key: '$.cursor', location: 'body' }
    }
  };
}

// 3. nativeCasing: camel on the camelCase-body methods
for (const [f, resource, name] of CAMEL_BODY_METHODS) {
  const m = method(f, resource, name);
  if (!m) continue;
  m.request = { ...(m.request || {}), nativeCasing: 'camel' };
  counts.nativeCasing++;
}

// 4. query result binding
const dbDoc = docs.get('database.yaml');
if (dbDoc && !dbDoc.components?.schemas?.[QUERY_RESULT_SCHEMA_NAME]) errors.push(`database.yaml: components.schemas.${QUERY_RESULT_SCHEMA_NAME} is missing (pre_normalize injects it)`);
for (const name of ['run', 'run_read_only']) {
  const m = method('database.yaml', 'queries', name);
  if (!m) continue;
  if (m.response?.openAPIDocKey !== '201') errors.push(`database.yaml: queries.${name} does not bind the 201 response`);
  m.response = {
    ...m.response,
    mediaType: 'application/json',
    openAPIDocKey: '201',
    overrideMediaType: 'application/json',
    schema_override: { $ref: `#/components/schemas/${QUERY_RESULT_SCHEMA_NAME}` },
    transform: {
      body: '{{- $wrapped := printf "{\\"rows\\":%s}" . -}}\n{{- $wrapped -}}',
      type: 'golang_template_text_v0.3.0'
    }
  };
}

// 5. POST-backed reads: objectKey
const bansList = method('network.yaml', 'network_bans', 'list');
if (bansList) bansList.response = { ...bansList.response, objectKey: '$.banned_ipv4_addresses' };

// 6. secrets bulk bodies: wrap the single-item object back into the array
const secretsCreate = method('secrets.yaml', 'secrets', 'create');
if (secretsCreate) {
  const op = docs.get('secrets.yaml').paths?.['/secrets']?.post;
  const schema = op?.requestBody?.content?.['application/json']?.schema;
  if (schema?.type === 'array' || !schema?.properties?.name) errors.push('secrets.yaml: POST /secrets body is not the single-item object pre_normalize writes');
  secretsCreate.request = { ...(secretsCreate.request || {}), transform: { type: 'golang_template_text_v0.3.0', body: '[{{ . }}]' } };
}
const secretsDelete = method('secrets.yaml', 'secrets', 'delete');
if (secretsDelete) {
  secretsDelete.request = { ...(secretsDelete.request || {}), transform: { type: 'golang_template_json_v0.3.0', body: '[{{ toJson .name }}]' } };
}

// 7. DELETE with a body: naive request-body translation
let naiveDeletes = 0;
for (const [f, resource, name] of [['secrets.yaml', 'secrets', 'delete'], ['network.yaml', 'network_bans', 'delete']]) {
  const m = method(f, resource, name);
  if (!m) continue;
  m.config = { ...(m.config || {}), requestBodyTranslate: { algorithm: 'naive' } };
  naiveDeletes++;
}

if (errors.length > 0) {
  console.error(`FAILED with ${errors.length} error(s), nothing written:`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
for (const [f, d] of docs) fs.writeFileSync(path.join(servicesDir, f), yaml.dump(d, { lineWidth: -1, noRefs: true }));
console.log(`post_process: pinned ${counts.rootPathsPinned} root path item(s) to ${API_BASE_URL} across ${docs.size} services (${counts.refPaths} project-scoped paths on the server template)`);
console.log(`post_process: snippets cursor pagination; request.nativeCasing: camel on ${counts.nativeCasing} methods; query result binding on queries.run / run_read_only; objectKey on network_bans.list; secrets bulk-body request transforms; naive body translation on ${naiveDeletes} DELETE methods`);
