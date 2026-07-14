// Shared helpers for the Supabase Management API spec scripts
// (build_inventory.mjs, map_operations.mjs, bin/split.mjs): service
// resolution, response shape classification, beta/deprecated detection,
// skip rules, and naming utilities. Single-sourced so the inventory and the
// authoritative mapping can never disagree on classification.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Verbs that map to StackQL methods. HEAD (the action-run count endpoint)
// appears in the inventory only, reason-coded, via INVENTORY_VERBS.
export const HTTP_VERBS = ['get', 'post', 'put', 'patch', 'delete'];
export const INVENTORY_VERBS = ['get', 'post', 'put', 'patch', 'delete', 'head'];

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const serviceNamesPath = path.join(repoRoot, 'provider-dev', 'config', 'service_names.json');

export function camelToSnake(s) {
  return String(s).replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/[-. ]/g, '_').toLowerCase();
}

export function pathParams(pathKey) {
  return (pathKey.match(/\{[^}]+\}/g) || []).map((s) => s.slice(1, -1));
}

// Scoping parameter for the row-address pattern taught in the docs:
// projects are addressed by {ref}, organization resources by {slug};
// account-scoped paths (the PAT's own surface) have neither.
export function scopeOf(pathKey) {
  const params = pathParams(pathKey);
  if (params.includes('ref')) return 'ref';
  if (params.includes('slug')) return 'slug';
  if (params.includes('branch_id_or_ref')) return 'branch';
  return 'account';
}

// Resolves local $refs against the containing spec document
export function makeResolver(spec) {
  return function resolve(schema, depth = 0) {
    if (!schema || depth > 10) return schema;
    if (schema.$ref) {
      const parts = schema.$ref.replace(/^#\//, '').split('/');
      let node = spec;
      for (const p of parts) node = node?.[p];
      return resolve(node, depth + 1);
    }
    return schema;
  };
}

// Service resolution from the ordered path rules in service_names.json.
// Every operation path must match a rule; a miss is an error the caller
// must surface (fail without writing).
export function makeServiceResolver() {
  const config = JSON.parse(fs.readFileSync(serviceNamesPath, 'utf8'));
  const rules = config.rules.map((r) => ({ re: new RegExp(r.pathRegex), service: r.service }));
  return function resolveService(pathKey) {
    for (const rule of rules) {
      if (rule.re.test(pathKey)) return rule.service;
    }
    return null;
  };
}

export function success2xx(op) {
  const codes = Object.keys(op.responses || {}).filter((c) => /^2/.test(c)).sort();
  for (const code of codes) {
    const content = op.responses[code].content || {};
    const jsonType = Object.keys(content).find((m) => m.includes('json'));
    if (jsonType && content[jsonType].schema) return { code, schema: content[jsonType].schema, mediaTypes: Object.keys(content) };
    if (Object.keys(content).length > 0) return { code, schema: null, mediaTypes: Object.keys(content) };
  }
  return { code: codes[0] || null, schema: null, mediaTypes: [] };
}

// Response shapes for the Supabase Management API. Unlike the uniform
// $.result envelope of clickhouse, this NestJS-generated spec is
// heterogeneous, so the shape taxonomy is descriptive and the object key for
// list reads is a per-resource mapping decision (hetzner precedent):
//   bare-array   - top-level array (list reads; normalize wraps these)
//   object       - typed object (single reads, config singletons, and
//                  entity-with-array-fields responses; arrayKeys records
//                  the top-level array-typed properties so envelope-style
//                  collection reads are visible in the inventory)
//   scalar       - top-level string/number
//   untyped-json - JSON declared with an empty schema (no projectable
//                  columns; the newrelic blob posture applies if mapped)
//   non-json     - non-JSON content types
//   none         - no 2xx content (writes, lifecycle actions, and the
//                  database query endpoint, whose 201 declares no body)
export function classifyResponseShape(op, resolve) {
  const { schema, mediaTypes } = success2xx(op);
  if (!schema) {
    if (mediaTypes.length > 0) return { shape: 'non-json', arrayKeys: [], mediaTypes };
    return { shape: 'none', arrayKeys: [], mediaTypes };
  }
  const s = resolve(schema);
  if (!s || Object.keys(s).length === 0) return { shape: 'untyped-json', arrayKeys: [], mediaTypes };
  if (s.type === 'array') return { shape: 'bare-array', arrayKeys: [], mediaTypes };
  if (s.type === 'string' || s.type === 'number' || s.type === 'integer' || s.type === 'boolean') {
    return { shape: 'scalar', arrayKeys: [], mediaTypes };
  }
  const props = s.properties || {};
  if (Object.keys(props).length === 0) return { shape: 'untyped-json', arrayKeys: [], mediaTypes };
  const arrayKeys = Object.entries(props)
    .filter(([, p]) => resolve(p)?.type === 'array')
    .map(([k]) => k);
  return { shape: 'object', arrayKeys, mediaTypes };
}

// The vendor labels pre-GA operations with a [Beta] / [Alpha] summary
// prefix; both are carried through to the docs per the clickhouse
// convention (the label is the first line of the generated method doc).
export function classifyBeta(op) {
  const summary = op.summary || '';
  if (/^\[beta\]/i.test(summary)) return 'beta';
  if (/^\[alpha\]/i.test(summary)) return 'alpha';
  return '';
}

// Request body classification: json / form / multipart / eszip, and whether
// the body is a bare array (the secrets bulk delete takes a raw string
// array, which --naive-req-body-translate cannot lower to named params -
// recorded so the finding is never silently lost).
export function classifyRequestBody(op, resolve) {
  if (!op.requestBody) return { has: 'n', kinds: [], bareArray: false };
  const rb = resolve(op.requestBody);
  const content = rb?.content || {};
  const kinds = Object.keys(content);
  const jsonType = kinds.find((m) => m.includes('json'));
  let bareArray = false;
  if (jsonType) {
    const s = resolve(content[jsonType].schema);
    if (s?.type === 'array') bareArray = true;
  }
  return { has: 'y', kinds, bareArray };
}

// Pagination-style query parameters present on the operation. Most Supabase
// Management API collections are bounded and complete; anything reported
// here is a per-endpoint confirmation to record (snippets and the
// organization projects list paginate; everything else does not).
const PAGINATION_PARAM_NAMES = ['limit', 'offset', 'page', 'pageSize', 'page_size', 'cursor', 'nextPageToken', 'maxResults', 'startAt'];
export function paginationParams(op, pathItem, resolve) {
  const params = [...(pathItem?.parameters || []), ...(op.parameters || [])]
    .map((p) => resolve(p))
    .filter((p) => p && p.in === 'query')
    .map((p) => p.name);
  return params.filter((n) => PAGINATION_PARAM_NAMES.includes(n));
}

// Update semantics flags per the keycloak warning: the verb records the
// vendor's choice, the presumption is labelled until the toggle-and-restore
// probe against the standing dev project confirms it per resource.
export function updateSemantics(verb) {
  if (verb === 'patch') return 'patch-partial-presumed';
  if (verb === 'put') return 'put-replace-unverified';
  return '';
}

// ---------------------------------------------------------------------------
// Resource and verb derivation, shared by build_inventory.mjs (draft columns)
// and map_operations.mjs (authoritative mapping)
// ---------------------------------------------------------------------------

// PATCH/PUT on these trailing static segments is a state/credential command
// on the parent resource (EXEC), not an entity update
export const ACTION_SEGMENTS = new Set(['password', 'status']);

// POST on these trailing static segments is an action on the parent
// resource (EXEC), not a create. The database query endpoints are drafted
// here provisionally; the flagship mapping decision (snowflake framework,
// EXEC vs INSERT ... RETURNING) is recorded in NOTES.md and applied in
// map_operations.mjs once evidence against the standing project lands.
export const POST_EXEC_SEGMENTS = new Set([
  'pause', 'restart', 'restore', 'cancel', 'push', 'merge', 'reset',
  'activate', 'initialize', 'reverify', 'apply', 'shutdown', 'enable',
  'undo', 'setup', 'remove', 'temporary-disable', 'check-availability',
  'accept', 'restore-pitr', 'query', 'read-only', 'upgrade'
]);

// Strips /v1/, then iteratively strips scoping pairs (a static segment
// followed by a path parameter) while more segments follow:
// projects/{ref}/database/backups -> database/backups. The last stripped
// parent is kept so action segments can resolve to it.
export function scopedSegments(pathKey) {
  let segs = pathKey.replace(/^\/v1\//, '').split('/').filter(Boolean);
  let parent = null;
  while (segs.length > 2 && !segs[0].startsWith('{') && segs[1].startsWith('{')) {
    parent = segs[0];
    segs = segs.slice(2);
  }
  return { segs, parent };
}

export function deriveResource(pathKey, verb, service, pluralizeFn) {
  const { segs, parent } = scopedSegments(pathKey);
  let statics = segs.filter((s) => !s.startsWith('{'));
  const last = statics[statics.length - 1];
  // an action segment names a method on the scoping parent, not a resource
  if (verb !== 'get' && ACTION_SEGMENTS.has(last)) {
    statics = statics.slice(0, -1);
    if (statics.length === 0 && parent) statics = [parent];
  }
  if (verb === 'post' && POST_EXEC_SEGMENTS.has(last)) {
    statics = statics.slice(0, -1);
    if (statics.length === 0 && parent) statics = [parent];
  }
  if (statics.length === 0 && parent) statics = [parent];
  // drop a leading segment that just restates the service name
  if (statics.length > 1 && camelToSnake(statics[0]) === service) statics = statics.slice(1);
  const snake = statics.map(camelToSnake);
  const lastSnake = snake[snake.length - 1];
  return [...snake.slice(0, -1), pluralizeFn(lastSnake)].join('_');
}

export function deriveVerb(verb, pathKey) {
  const { segs } = scopedSegments(pathKey);
  const statics = segs.filter((s) => !s.startsWith('{'));
  const last = statics[statics.length - 1];
  if (verb === 'get') return 'select';
  if (verb === 'delete') return 'delete';
  if (verb === 'patch' || verb === 'put') return ACTION_SEGMENTS.has(last) ? 'exec' : 'update';
  // post
  if (POST_EXEC_SEGMENTS.has(last) || ACTION_SEGMENTS.has(last)) return 'exec';
  return 'insert';
}

// Skip rules for operations that stay visible in the CSV artifacts but are
// not mapped to StackQL methods.
//   multipart_eszip_deploy - the function bundle deploy takes
//     multipart/form-data (eszip); standing binary exclusion, the Supabase
//     CLI is the deploy path
//   oauth_user_agent_flow - the /v1/oauth surface is the OAuth-app
//     (on-behalf-of-user) flow: browser redirects and a form-urlencoded
//     token exchange, not the PAT surface this provider maps
//   untyped_function_body - the function body read declares an empty JSON
//     object; no projectable columns (source retrieval is a CLI concern)
//   head_count_endpoint - HEAD has no StackQL verb; the action-run count
//     is derivable from the list read
export function skipReason(pathKey, op, resolve, verb) {
  if (verb === 'head') return 'head_count_endpoint';
  if (/\/functions\/deploy$/.test(pathKey)) return 'multipart_eszip_deploy';
  if (/^\/v1\/oauth\//.test(pathKey)) return 'oauth_user_agent_flow';
  if (/\/functions\/\{[^}]+\}\/body$/.test(pathKey)) return 'untyped_function_body';
  return '';
}
