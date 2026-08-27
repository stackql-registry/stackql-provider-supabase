#!/usr/bin/env node

// Supabase-specific spec adjustments applied to provider-dev/source before
// the generic provider-utils normalize pass. Deterministic and idempotent;
// validates and fails without writing on any unexpected shape.
//
// 1. Edge function create/update: the JSON operations (POST /functions,
//    PATCH /functions/{function_slug}) declare two request media types,
//    application/vnd.denoland.eszip first and application/json second.
//    any-sdk binds the request body to the first declared media type, so the
//    eszip entry is removed and the JSON body (name, slug, verify_jwt, body,
//    ...) is the one the provider drives. Bundle deploys are the multipart
//    endpoint, skipped per the standing binary exclusion (the CLI is the
//    deploy path).
//
// 2. The two database query endpoints (POST /database/query and
//    /database/query/read-only) declare a 201 with no content. The wire body
//    is a bare JSON array of row objects with query-dependent keys (the
//    vendor's reference examples; confirmed against the mock in the
//    integration suite). A typed 201 is injected here so the generator emits
//    a normal response binding; post_process.mjs then attaches the wrap
//    transform that presents the array as one row with a `rows` JSON column
//    (NOTES.md finding 1).
//
// 3. Edge function create: POST /functions declares the function attributes
//    twice - as deprecated query parameters (slug, name, verify_jwt,
//    import_map, entrypoint_path, import_map_path, ezbr_sha256) and as the
//    JSON body. any-sdk binds an INSERT column to the query parameter first,
//    so the body arrived with only `body` set and the API rejected it. The
//    query duplicates are removed; the body is canonical.
//
// 4. Secrets bulk endpoints: POST /secrets takes a bare array of {name,
//    value} and DELETE /secrets a bare array of names. Naive request-body
//    translation lowers top-level object properties to columns and cannot
//    address a bare array, so each body is rewritten to its single-item
//    object form (one secret per statement - the Terraform resource's
//    granularity too); post_process.mjs attaches the request transform that
//    wraps the marshalled object back into the array the wire expects
//    (NOTES.md finding 8).
//
// 5. Pooler config: SupavisorConfigResponse carries both connection_string
//    and its camelCase duplicate connectionString. With snake_case_aliases
//    both present as `connection_string`, which collides in the row
//    projection (a DDL error at query time); the camelCase duplicate is
//    dropped.
//
// Usage: node provider-dev/scripts/pre_normalize.mjs [--dry-run]

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const sourceDir = path.join(repoRoot, 'provider-dev', 'source');
const dryRun = process.argv.includes('--dry-run');

export const QUERY_RESULT_SCHEMA_NAME = 'V1RunQueryResultRows';
export const QUERY_PATHS = ['/database/query', '/database/query/read-only'];
const ESZIP = 'application/vnd.denoland.eszip';

const files = fs.readdirSync(sourceDir).filter((f) => f.endsWith('.yaml')).sort();
if (files.length === 0) {
  console.error(`Error: no service specs in ${sourceDir} - run npm run split first`);
  process.exit(1);
}

const errors = [];
const stats = { eszip_request_variant_removed: 0, query_response_schema_injected: 0, function_create_query_duplicates_removed: 0, secrets_bulk_body_rewritten: 0, pooler_camel_duplicate_removed: 0 };
const pending = [];

// resolves a local $ref within the service document
const deref = (doc, node) => (node && node.$ref ? node.$ref.replace(/^#\//, '').split('/').reduce((a, k) => a?.[k], doc) : node);

for (const f of files) {
  const fp = path.join(sourceDir, f);
  const doc = yaml.load(fs.readFileSync(fp, 'utf8'));
  let touched = false;

  if (f === 'functions.yaml') {
    for (const [pathKey, item] of Object.entries(doc.paths || {})) {
      for (const verb of ['post', 'patch']) {
        const content = item[verb]?.requestBody?.content;
        if (!content || !(ESZIP in content)) continue;
        if (!content['application/json']) {
          errors.push(`${f}: ${verb.toUpperCase()} ${pathKey} declares ${ESZIP} without an application/json variant`);
          continue;
        }
        delete content[ESZIP];
        stats.eszip_request_variant_removed++;
        touched = true;
      }
    }
    if (stats.eszip_request_variant_removed === 0) errors.push(`${f}: expected the eszip request variant on the JSON function create/update, found none`);
    // 3. drop the deprecated query duplicates of the create/update body
    // attributes (POST /functions and PATCH /functions/{function_slug})
    const LEGACY_QUERY = new Set(['slug', 'name', 'verify_jwt', 'import_map', 'entrypoint_path', 'import_map_path', 'ezbr_sha256']);
    for (const [pathKey, verb] of [['/functions', 'post'], ['/functions/{function_slug}', 'patch']]) {
      const op = doc.paths?.[pathKey]?.[verb];
      if (!op) { errors.push(`${f}: expected ${verb.toUpperCase()} ${pathKey}`); continue; }
      const before = (op.parameters || []).length;
      op.parameters = (op.parameters || []).filter((p) => !(p.in === 'query' && LEGACY_QUERY.has(p.name)));
      stats.function_create_query_duplicates_removed += before - op.parameters.length;
      if (before === op.parameters.length) errors.push(`${f}: expected deprecated query duplicates on ${verb.toUpperCase()} ${pathKey}, found none`);
      touched = true;
    }
  }

  if (f === 'secrets.yaml') {
    // 4. secrets bulk bodies -> single-item object bodies (post_process wraps)
    const post = doc.paths?.['/secrets']?.post;
    const del = doc.paths?.['/secrets']?.delete;
    if (!post || !del) errors.push(`${f}: expected POST and DELETE /secrets`);
    else {
      const postSchema = deref(doc, post.requestBody?.content?.['application/json']?.schema);
      if (postSchema?.type !== 'array') errors.push(`${f}: POST /secrets body is no longer a bare array - revisit the secrets binding`);
      else {
        post.requestBody.content['application/json'].schema = { ...deref(doc, postSchema.items), description: 'One secret. The wire body is an array; the provider wraps this object into it (one secret per INSERT).' };
        stats.secrets_bulk_body_rewritten++;
      }
      const delSchema = deref(doc, del.requestBody?.content?.['application/json']?.schema);
      if (delSchema?.type !== 'array') errors.push(`${f}: DELETE /secrets body is no longer a bare array - revisit the secrets binding`);
      else {
        del.requestBody.content['application/json'].schema = {
          type: 'object',
          description: 'The secret to delete. The wire body is an array of names; the provider wraps this object into it (one secret per DELETE).',
          properties: { name: { type: 'string', description: 'Secret name' } },
          required: ['name']
        };
        stats.secrets_bulk_body_rewritten++;
      }
      touched = true;
    }
  }

  if (f === 'config.yaml') {
    // 5. drop the camelCase duplicate of connection_string on the pooler config
    const pooler = doc.components?.schemas?.SupavisorConfigResponse;
    if (!pooler?.properties?.connection_string) errors.push(`${f}: SupavisorConfigResponse.connection_string not found`);
    else if (pooler.properties.connectionString) {
      delete pooler.properties.connectionString;
      pooler.required = (pooler.required || []).filter((r) => r !== 'connectionString');
      stats.pooler_camel_duplicate_removed++;
      touched = true;
    }
  }

  if (f === 'database.yaml') {
    for (const p of QUERY_PATHS) {
      const op = doc.paths?.[p]?.post;
      if (!op) { errors.push(`${f}: expected POST ${p}`); continue; }
      const r201 = op.responses?.['201'];
      if (!r201) { errors.push(`${f}: POST ${p} has no 201 response`); continue; }
      if (r201.content && !r201.content['application/json']?.schema?.$ref?.endsWith(QUERY_RESULT_SCHEMA_NAME)) {
        errors.push(`${f}: POST ${p} 201 already declares content of an unexpected shape`);
        continue;
      }
      r201.content = { 'application/json': { schema: { $ref: `#/components/schemas/${QUERY_RESULT_SCHEMA_NAME}` } } };
      stats.query_response_schema_injected++;
      touched = true;
    }
    doc.components = doc.components || {};
    doc.components.schemas = doc.components.schemas || {};
    doc.components.schemas[QUERY_RESULT_SCHEMA_NAME] = {
      type: 'object',
      description: 'Result of a SQL statement run against the project database. The API returns a bare JSON array of row objects whose keys depend on the statement; the provider presents it as one row whose rows column carries the array (address values with json_extract).',
      properties: {
        rows: {
          type: 'array',
          description: 'The result rows as returned by Postgres, one object per row, keyed by column name.',
          items: { type: 'object', additionalProperties: true }
        }
      }
    };
  }

  pending.push({ fp, doc, touched });
}

if (errors.length > 0) {
  console.error(`FAILED with ${errors.length} error(s), nothing written:`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
if (!dryRun) {
  for (const { fp, doc, touched } of pending) if (touched) fs.writeFileSync(fp, yaml.dump(doc, { lineWidth: -1, noRefs: true }));
}
console.log(`pre_normalize: ${Object.entries(stats).map(([k, v]) => `${k}: ${v}`).join(', ')}${dryRun ? ' (dry run)' : ''}`);
