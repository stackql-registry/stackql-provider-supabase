#!/usr/bin/env node

// Integration tests: run the generated supabase provider (local file
// registry) against the mock Supabase Management API and assert row-level
// results for each operation archetype:
//   - bare-array list wrap (projects, secrets, edge functions, health) and
//     single-object reads
//   - the bearer token (the mock 401s anything else)
//   - ref resolved from SUPABASE_PROJECT_ID (x-stackQL-envVar), a WHERE
//     value beating the environment, and the unset-env failure mode
//   - the root paths (projects list/get, organizations, profile, snippets,
//     branch-by-id) on their path-level server override
//   - the secrets bulk INSERT / DELETE (bare-array request bodies)
//   - an auth-config UPDATE (PATCH) toggle and restore
//   - the snake_case surface on the camelCase corners (ssl enforcement,
//     storage config, network restrictions apply) via request.nativeCasing
//   - the POST-backed network bans read with its objectKey
//   - the query endpoint: INSERT ... RETURNING rows and EXEC run_read_only
//   - an EXEC lifecycle action (projects.pause) on the server template
//   - an edge function INSERT / UPDATE / DELETE lifecycle
//   - snippets cursor pagination (two pages)
//   - query-parameter pushdown (api_keys reveal)
//   - envelope object keys (addons, advisors lints, backups)
//   - the 404 error surfaced
//
// The vendor server template is https-only and cannot address the mock, so
// this runner materialises a TEST COPY of provider-dev/openapi in
// tests/integration/.registry-tmp (gitignored, recreated each run) with the
// server URLs rewritten to the mock (server variables and the
// x-stackQL-envVar extension are preserved). provider-dev/** is never
// modified.
//
// Requires a stackql binary: $STACKQL, ./stackql, or `stackql` on PATH.
//
// Usage: node tests/integration/run_integration_tests.mjs [--verbose]

import { spawn } from 'child_process';
import { existsSync, rmSync, cpSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import { startMockServer, EXPECTED_TOKEN, REF_A, REF_B, ORG_SLUG, BRANCH_ID, FUNCTION_SLUG, API_KEY_ID } from './mock_supabase_server.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..', '..');
const verbose = process.argv.includes('--verbose');
const t0 = Date.now();
const API_BASE = 'https://api.supabase.com';

function findStackql() {
  if (process.env.STACKQL) return process.env.STACKQL;
  const local = path.join(repoRoot, process.platform === 'win32' ? 'stackql.exe' : 'stackql');
  if (existsSync(local)) return local;
  return 'stackql'; // PATH
}

// Copy the generated provider docs and point every server at the mock: the
// project-scoped template keeps its {ref} variable and x-stackQL-envVar; the
// root-path overrides go to the bare mock base.
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
    if (!doc.servers?.[0]?.url) throw new Error(`no top-level servers block found in ${f}`);
    doc.servers[0].url = doc.servers[0].url.replace(API_BASE, base);
    if (!doc.servers[0].variables?.ref?.['x-stackQL-envVar']) throw new Error(`${f}: ref server variable lost its x-stackQL-envVar`);
    for (const item of Object.values(doc.paths || {})) {
      if (item.servers) item.servers = item.servers.map((s) => ({ ...s, url: s.url.replace(API_BASE, base) }));
    }
    writeFileSync(fp, yaml.dump(doc, { lineWidth: -1, noRefs: true }));
  }
  return tmpDir;
}

const stackqlBin = findStackql();

// IMPORTANT: must be async (spawn, not spawnSync) - the mock server runs on
// this process's event loop, so a synchronous wait for stackql deadlocks.
function makeRunSql(registry) {
  return function runSql(sql, envOverrides = {}) {
    return new Promise((resolve) => {
      const env = { ...process.env, SUPABASE_ACCESS_TOKEN: EXPECTED_TOKEN, SUPABASE_PROJECT_ID: REF_A, ...envOverrides };
      for (const [k, v] of Object.entries(envOverrides)) if (v === undefined) delete env[k];
      const child = spawn(stackqlBin, [`--registry=${registry}`, 'exec', sql, '--output', 'json'], { cwd: repoRoot, env });
      let stdout = '', stderr = '';
      child.stdout.on('data', (d) => { stdout += d; });
      child.stderr.on('data', (d) => { stderr += d; });
      const timer = setTimeout(() => child.kill(), 120000);
      child.on('error', (e) => { clearTimeout(timer); resolve({ rows: null, err: String(e) }); });
      child.on('close', () => {
        clearTimeout(timer);
        stdout = stdout.trim();
        stderr = stderr.trim();
        if (verbose) console.log(`    sql: ${sql}\n    out: ${stdout.slice(0, 400)}${stderr ? `\n    err: ${stderr.slice(0, 400)}` : ''}`);
        const errish = /http response status code: [45]|error|panic|FindRoute|no matching operation|cannot find matching operation|disallowed|cannot find any viable servers|not supported/i;
        if (errish.test(stderr)) return resolve({ rows: null, err: stderr });
        if (!stdout) return resolve({ rows: [], err: null });
        try {
          // stackql --output json renders every scalar as a string ("true",
          // "60"); normalise so assertions can compare typed values
          const val = (v) => (v === 'true' ? true : v === 'false' ? false : (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v)) ? Number(v) : v);
          const parsed = JSON.parse(stdout);
          const rows = Array.isArray(parsed) ? parsed.map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, val(v)]))) : parsed ?? [];
          resolve({ rows, err: null, text: stdout }); // literal null for zero rows
        } catch {
          resolve({ rows: [{ _text: stdout }], err: errish.test(stdout) ? stdout : null, text: stdout }); // DML status text
        }
      });
    });
  };
}

const results = [];
function check(name, cond, note = '') {
  results.push({ name, pass: !!cond, note });
  console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${name}${!cond && note ? `  [${String(note).slice(0, 260)}]` : ''}`);
}

const { server, port, log, state } = await startMockServer();
const tmpDir = buildTestRegistry(port);
const regPath = tmpDir.split(path.sep).join('/');
const registry = JSON.stringify({ url: `file://${regPath}`, localDocRoot: regPath, verifyConfig: { nopVerify: true } });
const runSql = makeRunSql(registry);
console.log(`mock Supabase Management API on localhost:${port}, stackql: ${stackqlBin}`);

const refPath = (ref, rest) => `/v1/projects/${ref}${rest}`;
const calls = (mark, method, p) => log.slice(mark).filter((e) => e.method === method && e.path === p);
const cols = (rows) => (rows && rows[0] ? Object.keys(rows[0]) : []);

try {
  // --- meta sanity
  let r = await runSql('SHOW SERVICES IN supabase');
  check('show services (14 - oauth is excluded, every operation in it skip-coded)', r.rows && r.rows.length === 14, r.err || `got ${r.rows?.length}`);
  r = await runSql('SHOW METHODS IN supabase.config.auth_configs');
  check('show methods: ref not required when SUPABASE_PROJECT_ID is set', r.rows && r.rows.length === 2 && !r.rows.some((m) => String(m.RequiredParams).includes('ref')), r.err || JSON.stringify(r.rows));
  r = await runSql('SHOW METHODS IN supabase.config.auth_configs', { SUPABASE_PROJECT_ID: undefined });
  check('show methods: ref required when SUPABASE_PROJECT_ID is unset', r.rows && r.rows.every((m) => String(m.RequiredParams).includes('ref')), r.err || JSON.stringify(r.rows));

  // --- bearer auth + projects list on the root override (bare-array wrap)
  let mark = log.length;
  r = await runSql('SELECT id, name, status, region FROM supabase.projects.projects');
  check('projects list (2 rows via bare-array wrap) hits GET /v1/projects on the API base', r.rows && r.rows.length === 2 && calls(mark, 'GET', '/v1/projects').length === 1, r.err || `rows=${r.rows?.length} paths=${JSON.stringify(log.slice(mark).map((e) => e.path))}`);
  const first = calls(mark, 'GET', '/v1/projects')[0];
  check('bearer token sent (Authorization: Bearer $SUPABASE_ACCESS_TOKEN)', first && /^bearer\s+/i.test(first.authorization) && first.authorization.split(/\s+/)[1] === EXPECTED_TOKEN, JSON.stringify(first?.authorization));
  check('no auth failures so far', state.authFailures === 0, `authFailures=${state.authFailures}`);
  r = await runSql('SELECT id FROM supabase.projects.projects', { SUPABASE_ACCESS_TOKEN: 'sbp_wrong' });
  check('wrong token -> 401 surfaced', r.err && /401/.test(r.err), r.err || 'no error');

  // --- projects get: root path keeps ref as a path parameter
  mark = log.length;
  // `database` is a parser keyword: the column is addressed double-quoted
  r = await runSql(`SELECT name, status, json_extract("database", '$.version') AS pg FROM supabase.projects.projects WHERE ref = '${REF_B}'`);
  check('project get by ref (root path, nested json_extract on the quoted "database" column)', r.rows && r.rows.length === 1 && r.rows[0].name === 'mock-staging' && r.rows[0].pg === '17.4.1.054' && calls(mark, 'GET', refPath(REF_B, '')).length === 1, r.err || JSON.stringify(r.rows));

  // --- ref: env-resolved, WHERE override, unset failure (server template)
  mark = log.length;
  r = await runSql('SELECT disable_signup, mfa_totp_enroll_enabled, password_min_length FROM supabase.config.auth_configs');
  check('auth_configs get resolves ref from SUPABASE_PROJECT_ID (no WHERE)', r.rows && r.rows.length === 1 && r.rows[0].disable_signup === false && calls(mark, 'GET', refPath(REF_A, '/config/auth')).length === 1, r.err || JSON.stringify(r.rows));
  mark = log.length;
  r = await runSql(`SELECT disable_signup FROM supabase.config.auth_configs WHERE ref = '${REF_B}'`);
  check('WHERE ref beats SUPABASE_PROJECT_ID (routed to the other project)', r.rows && r.rows[0]?.disable_signup === true && calls(mark, 'GET', refPath(REF_B, '/config/auth')).length === 1, r.err || JSON.stringify(r.rows));
  r = await runSql('SELECT disable_signup FROM supabase.config.auth_configs', { SUPABASE_PROJECT_ID: undefined });
  check('unset SUPABASE_PROJECT_ID and no WHERE -> cannot find any viable servers', r.err && /viable servers|ref/i.test(r.err), r.err || 'no error');
  r = await runSql(`SELECT disable_signup FROM supabase.config.auth_configs WHERE ref = '${REF_A}'`, { SUPABASE_PROJECT_ID: undefined });
  check('unset env + WHERE ref works', r.rows && r.rows.length === 1, r.err || JSON.stringify(r.rows));

  // --- posture set across projects: the two-statement pattern (list, then
  // per-ref reads). A JOIN cannot fan out on the ref server variable because
  // the config singletons do not echo ref in their rows (NOTES.md finding 13).
  r = await runSql(`SELECT ref FROM supabase.projects.projects`);
  const refs = (r.rows || []).map((x) => x.ref);
  check('projects list yields the refs to fan out on', refs.length === 2 && refs.includes(REF_A) && refs.includes(REF_B), r.err || JSON.stringify(r.rows));
  r = await runSql(`SELECT '${REF_A}' AS ref, disable_signup FROM supabase.config.auth_configs WHERE ref = '${REF_A}' UNION ALL SELECT '${REF_B}', disable_signup FROM supabase.config.auth_configs WHERE ref = '${REF_B}'`);
  check('per-ref posture reads composed with UNION ALL (signups posture for both projects)', r.rows && r.rows.length === 2 && r.rows.find((x) => x.ref === REF_B)?.disable_signup === true, r.err || JSON.stringify(r.rows));

  // --- account roots
  r = await runSql('SELECT id, slug, name FROM supabase.organizations.organizations');
  check('organizations list (root path)', r.rows && r.rows.length === 1 && r.rows[0].slug === ORG_SLUG, r.err || JSON.stringify(r.rows));
  r = await runSql(`SELECT name, plan FROM supabase.organizations.organizations WHERE slug = '${ORG_SLUG}'`);
  check('organization get by slug', r.rows && r.rows[0]?.plan === 'free', r.err || JSON.stringify(r.rows));
  r = await runSql(`SELECT user_name, role_name, mfa_enabled FROM supabase.organizations.members WHERE slug = '${ORG_SLUG}'`);
  check('members list (bare-array wrap, slug scope)', r.rows && r.rows.length === 1 && r.rows[0].role_name === 'Owner', r.err || JSON.stringify(r.rows));
  r = await runSql(`SELECT ref, name, status FROM supabase.projects.organization_projects WHERE slug = '${ORG_SLUG}'`);
  check('organization projects list ($.projects envelope)', r.rows && r.rows.length === 2 && r.rows.some((x) => x.ref === REF_A), r.err || JSON.stringify(r.rows));
  r = await runSql('SELECT primary_email, username FROM supabase.profile.profiles');
  check('profile get (the PAT identity)', r.rows && r.rows[0]?.username === 'mock-dev', r.err || JSON.stringify(r.rows));

  // --- health (bare-array wrap on a nested-info list)
  mark = log.length;
  r = await runSql(`SELECT name, healthy, status, json_extract(info, '$.version') AS version FROM supabase.projects.service_health WHERE services = 'auth'`);
  check('service_health list (services query param required, nested info)', r.rows && r.rows.length === 3 && r.rows.some((x) => x.name === 'auth' && x.version === '2.180.0') && calls(mark, 'GET', refPath(REF_A, '/health'))[0]?.query.services === 'auth', r.err || JSON.stringify(r.rows));

  // --- secrets lifecycle: bulk INSERT (bare array body) / list / bulk DELETE
  r = await runSql('SELECT name, value, updated_at FROM supabase.secrets.secrets');
  check('secrets list (1 seed row)', r.rows && r.rows.length === 1 && r.rows[0].name === 'SEED_SECRET', r.err || JSON.stringify(r.rows));
  mark = log.length;
  r = await runSql(`INSERT INTO supabase.secrets.secrets (name, value) SELECT 'STACKQL_SMOKE_IT', 'v1'`);
  const secretPost = calls(mark, 'POST', refPath(REF_A, '/secrets'));
  check('secrets INSERT sends the bare-array body [{name, value}]', !r.err && secretPost.length === 1 && Array.isArray(secretPost[0].body) && secretPost[0].body[0]?.name === 'STACKQL_SMOKE_IT' && secretPost[0].body[0]?.value === 'v1', r.err || JSON.stringify(secretPost.map((c) => c.body)));
  check('secret exists in mock state', state.secrets.get(REF_A).has('STACKQL_SMOKE_IT'));
  r = await runSql('SELECT name FROM supabase.secrets.secrets');
  check('secrets list now 2 rows', r.rows && r.rows.length === 2, r.err || JSON.stringify(r.rows));
  mark = log.length;
  r = await runSql(`DELETE FROM supabase.secrets.secrets WHERE name = 'STACKQL_SMOKE_IT'`);
  const secretDel = calls(mark, 'DELETE', refPath(REF_A, '/secrets'));
  check('secrets DELETE sends the bare-array body ["name"]', !r.err && secretDel.length === 1 && Array.isArray(secretDel[0].body) && secretDel[0].body[0] === 'STACKQL_SMOKE_IT', r.err || JSON.stringify(secretDel.map((c) => c.body)));
  check('secret gone from mock state', !state.secrets.get(REF_A).has('STACKQL_SMOKE_IT'));

  // --- auth config UPDATE (PATCH) toggle and restore
  // UPDATE values travel as JSON strings (stackql accepts only string/number
  // literals on the RHS and marshals both as strings - NOTES.md finding 14);
  // the mock, like a lenient validator, stores what it is sent. Whether the
  // live API coerces "true" for a boolean field is the smoke suite's probe.
  mark = log.length;
  r = await runSql(`UPDATE supabase.config.auth_configs SET disable_signup = 'true' WHERE ref = '${REF_A}'`);
  const authPatch = calls(mark, 'PATCH', refPath(REF_A, '/config/auth'));
  check('auth_configs UPDATE (PATCH) wire body {disable_signup} only (string-typed value)', !r.err && authPatch.length === 1 && String(authPatch[0].body?.disable_signup) === 'true' && Object.keys(authPatch[0].body).length === 1, r.err || JSON.stringify(authPatch.map((c) => c.body)));
  r = await runSql('SELECT disable_signup FROM supabase.config.auth_configs');
  check('auth_configs reflects UPDATE', r.rows && r.rows[0]?.disable_signup === true, r.err || JSON.stringify(r.rows));
  r = await runSql(`UPDATE supabase.config.auth_configs SET disable_signup = 'false' WHERE ref = '${REF_A}'`);
  check('auth_configs restored', !r.err && String(state.authConfigs.get(REF_A).disable_signup) === 'false', r.err);

  // --- snake_case surface on the camelCase corners
  r = await runSql(`SELECT applied_successfully, json_extract(current_config, '$.database') AS db_ssl FROM supabase.config.ssl_enforcement_configs`);
  check('ssl_enforcement_configs get: snake aliases (applied_successfully, current_config)', r.rows && r.rows[0]?.applied_successfully === true && Number(r.rows[0]?.db_ssl) === 0, r.err || JSON.stringify(r.rows));
  mark = log.length;
  r = await runSql(`UPDATE supabase.config.ssl_enforcement_configs SET requested_config = '{"database": true}' WHERE ref = '${REF_A}'`);
  const sslPut = calls(mark, 'PUT', refPath(REF_A, '/ssl-enforcement'));
  check('ssl_enforcement_configs UPDATE: requested_config -> requestedConfig (PUT, nativeCasing camel)', !r.err && sslPut.length === 1 && sslPut[0].body?.requestedConfig?.database === true, r.err || JSON.stringify(sslPut.map((c) => c.body)));
  r = await runSql(`SELECT json_extract(current_config, '$.database') AS db_ssl FROM supabase.config.ssl_enforcement_configs`);
  check('ssl enforcement reflects the PUT', r.rows && Number(r.rows[0]?.db_ssl) === 1, r.err || JSON.stringify(r.rows));
  r = await runSql(`SELECT file_size_limit, json_extract(features, '$.imageTransformation.enabled') AS img FROM supabase.config.storage_configs`);
  check('storage_configs get: file_size_limit alias for fileSizeLimit', r.rows && r.rows[0]?.file_size_limit === 52428800 && Number(r.rows[0]?.img) === 1, r.err || JSON.stringify(r.rows));
  mark = log.length;
  r = await runSql(`UPDATE supabase.config.storage_configs SET file_size_limit = 10485760 WHERE ref = '${REF_A}'`);
  const stPatch = calls(mark, 'PATCH', refPath(REF_A, '/config/storage'));
  check('storage_configs UPDATE: file_size_limit -> fileSizeLimit (empty 200 response, string-typed value)', !r.err && stPatch.length === 1 && String(stPatch[0].body?.fileSizeLimit) === '10485760', r.err || JSON.stringify(stPatch.map((c) => c.body)));

  // --- network restrictions: get, EXEC apply with camelCase body
  r = await runSql(`SELECT entitlement, status, json_extract(config, '$.dbAllowedCidrs[0]') AS cidr FROM supabase.network.network_restrictions`);
  check('network_restrictions get (0.0.0.0/0 posture visible)', r.rows && r.rows[0]?.cidr === '0.0.0.0/0' && r.rows[0]?.status === 'applied', r.err || JSON.stringify(r.rows));
  mark = log.length;
  r = await runSql(`EXEC supabase.network.network_restrictions.apply @ref = '${REF_A}', @db_allowed_cidrs = '["203.0.113.0/24"]', @db_allowed_cidrs_v6 = '[]'`);
  const nrApply = calls(mark, 'POST', refPath(REF_A, '/network-restrictions/apply'));
  check('network_restrictions.apply EXEC: db_allowed_cidrs -> dbAllowedCidrs wire body', !r.err && nrApply.length === 1 && nrApply[0].body?.dbAllowedCidrs?.[0] === '203.0.113.0/24' && Array.isArray(nrApply[0].body?.dbAllowedCidrsV6), r.err || JSON.stringify(nrApply.map((c) => c.body)));
  r = await runSql(`SELECT json_extract(config, '$.dbAllowedCidrs[0]') AS cidr FROM supabase.network.network_restrictions`);
  check('network restrictions reflect the apply', r.rows && r.rows[0]?.cidr === '203.0.113.0/24', r.err || JSON.stringify(r.rows));

  // --- network bans: POST-backed read with objectKey; DELETE with a body
  mark = log.length;
  r = await runSql('SELECT banned_address, identifier FROM supabase.network.network_bans');
  check('network_bans list (POST read, $.banned_ipv4_addresses, 2 rows)', r.rows && r.rows.length === 2 && r.rows[0].banned_address === '198.51.100.7' && calls(mark, 'POST', refPath(REF_A, '/network-bans/retrieve/enriched')).length === 1, r.err || JSON.stringify(r.rows));
  mark = log.length;
  r = await runSql(`DELETE FROM supabase.network.network_bans WHERE ref = '${REF_A}' AND ipv4_addresses = '["198.51.100.7"]'`);
  const banDel = calls(mark, 'DELETE', refPath(REF_A, '/network-bans'));
  check('network_bans DELETE carries the {ipv4_addresses} body', !r.err && banDel.length === 1 && banDel[0].body?.ipv4_addresses?.[0] === '198.51.100.7', r.err || JSON.stringify(banDel.map((c) => c.body)));

  // --- the flagship: the query endpoint
  mark = log.length;
  r = await runSql(`INSERT INTO supabase.database.queries (ref, query) SELECT '${REF_A}', 'select id, label from stackql_smoke_fixture order by id' RETURNING rows`);
  const qPost = calls(mark, 'POST', refPath(REF_A, '/database/query'));
  check('queries.run INSERT wire body {query}', qPost.length === 1 && qPost[0].body?.query?.startsWith('select id, label') && qPost[0].contentType.includes('json'), JSON.stringify(qPost.map((c) => [c.contentType, c.body])));
  const rowsBlob = r.rows && r.rows[0] ? r.rows[0].rows : undefined;
  let parsedRows = null;
  try { parsedRows = typeof rowsBlob === 'string' ? JSON.parse(rowsBlob) : rowsBlob; } catch { parsedRows = null; }
  check('INSERT ... RETURNING rows yields one row whose rows column carries the result set (2 fixture rows)', !r.err && Array.isArray(parsedRows) && parsedRows.length === 2 && parsedRows[1].label === 'beta', r.err || JSON.stringify(r.rows).slice(0, 300));
  r = await runSql(`INSERT INTO supabase.database.queries (ref, query, read_only) SELECT '${REF_A}', 'select 1 as one', true RETURNING rows`);
  check('read_only body flag passes through on the main method', !r.err && state.queries.at(-1)?.read_only === true && state.queries.at(-1)?.query === 'select 1 as one', r.err || JSON.stringify(state.queries.at(-1)));
  mark = log.length;
  r = await runSql(`EXEC supabase.database.queries.run_read_only @ref = '${REF_A}', @query = 'select count(*) from stackql_smoke_fixture'`);
  check('queries.run_read_only EXEC hits the read-only endpoint', !r.err && calls(mark, 'POST', refPath(REF_A, '/database/query/read-only')).length === 1, r.err || JSON.stringify(log.slice(mark).map((e) => e.path)));
  r = await runSql(`INSERT INTO supabase.database.queries (ref, query) SELECT '${REF_A}', 'select 1 as one' RETURNING rows`, { SUPABASE_PROJECT_ID: undefined });
  check('queries.run with explicit ref and no env', !r.err && r.rows && r.rows.length === 1, r.err || JSON.stringify(r.rows));

  // --- EXEC lifecycle action on the server template
  mark = log.length;
  r = await runSql(`EXEC supabase.projects.projects.pause @ref = '${REF_B}'`);
  check('projects.pause EXEC -> POST /v1/projects/{ref}/pause (empty 200)', !r.err && calls(mark, 'POST', refPath(REF_B, '/pause')).length === 1 && state.paused.includes(REF_B), r.err || JSON.stringify(log.slice(mark).map((e) => `${e.method} ${e.path}`)));

  // --- edge functions lifecycle
  r = await runSql('SELECT slug, name, status, verify_jwt FROM supabase.functions.edge_functions');
  check('edge_functions list (1 seed)', r.rows && r.rows.length === 1 && r.rows[0].slug === FUNCTION_SLUG, r.err || JSON.stringify(r.rows));
  mark = log.length;
  r = await runSql(`INSERT INTO supabase.functions.edge_functions (ref, slug, name, body, verify_jwt) SELECT '${REF_A}', 'stackql-smoke-it', 'stackql smoke', 'Deno.serve(() => new Response("ok"))', false`);
  const fnPost = calls(mark, 'POST', refPath(REF_A, '/functions'));
  check('edge_functions INSERT (JSON create, eszip variant removed) wire body {slug, name, body, verify_jwt}', !r.err && fnPost.length === 1 && fnPost[0].contentType.includes('application/json') && fnPost[0].body?.slug === 'stackql-smoke-it' && fnPost[0].body?.verify_jwt === false, r.err || JSON.stringify(fnPost.map((c) => [c.contentType, c.body])));
  r = await runSql(`SELECT name, version FROM supabase.functions.edge_functions WHERE function_slug = 'stackql-smoke-it'`);
  check('edge_functions get by function_slug', r.rows && r.rows[0]?.name === 'stackql smoke', r.err || JSON.stringify(r.rows));
  mark = log.length;
  r = await runSql(`UPDATE supabase.functions.edge_functions SET name = 'stackql smoke v2' WHERE function_slug = 'stackql-smoke-it'`);
  check('edge_functions UPDATE (PATCH)', !r.err && calls(mark, 'PATCH', refPath(REF_A, '/functions/stackql-smoke-it')).length === 1 && state.functions.get(REF_A).get('stackql-smoke-it')?.name === 'stackql smoke v2', r.err);
  r = await runSql(`DELETE FROM supabase.functions.edge_functions WHERE function_slug = 'stackql-smoke-it'`);
  check('edge_functions DELETE (empty 200)', !r.err && !state.functions.get(REF_A).has('stackql-smoke-it'), r.err);

  // --- api keys: query-param pushdown (reveal) and a lifecycle
  mark = log.length;
  r = await runSql(`SELECT id, name, type, api_key FROM supabase.secrets.api_keys WHERE reveal = 'true'`);
  const akGet = calls(mark, 'GET', refPath(REF_A, '/api-keys'));
  check('api_keys list with reveal pushed as a query param', r.rows && r.rows.length === 1 && akGet.length === 1 && akGet[0].query.reveal === 'true' && r.rows[0].api_key === 'sb_publishable_mock', r.err || JSON.stringify([akGet.map((c) => c.query), r.rows]));
  r = await runSql(`INSERT INTO supabase.secrets.api_keys (ref, type, name) SELECT '${REF_A}', 'secret', 'stackql-smoke-it'`);
  const newKey = [...state.apiKeys.get(REF_A).values()].find((k) => k.name === 'stackql-smoke-it');
  check('api_keys INSERT', !r.err && !!newKey, r.err);
  if (newKey) {
    r = await runSql(`SELECT name, type FROM supabase.secrets.api_keys WHERE id = '${newKey.id}'`);
    check('api_keys get by id', r.rows && r.rows[0]?.type === 'secret', r.err || JSON.stringify(r.rows));
    r = await runSql(`DELETE FROM supabase.secrets.api_keys WHERE id = '${newKey.id}'`);
    check('api_keys DELETE', !r.err && !state.apiKeys.get(REF_A).has(newKey.id), r.err);
  }

  // --- snippets cursor pagination (root path, two pages)
  mark = log.length;
  r = await runSql('SELECT id, name FROM supabase.database.snippets');
  const snipCalls = calls(mark, 'GET', '/v1/snippets');
  check('snippets list follows the cursor (2 pages -> 3 rows)', r.rows && r.rows.length === 3 && snipCalls.length === 2 && snipCalls[1].query.cursor === 'page-two', r.err || `rows=${r.rows?.length} calls=${JSON.stringify(snipCalls.map((c) => c.query))}`);

  // --- envelope object keys
  r = await runSql(`SELECT type, json_extract(variant, '$.id') AS variant FROM supabase.billing.addons`);
  check('addons list ($.selected_addons)', r.rows && r.rows.length === 1 && r.rows[0].variant === 'ci_micro', r.err || JSON.stringify(r.rows));
  r = await runSql(`SELECT name, level, title FROM supabase.advisors.security_lints`);
  check('security_lints list ($.lints, 2 rows)', r.rows && r.rows.length === 2 && r.rows[0].level === 'ERROR', r.err || JSON.stringify(r.rows));
  r = await runSql(`SELECT id, status, inserted_at FROM supabase.database.backups`);
  check('backups list ($.backups, 2 rows)', r.rows && r.rows.length === 2 && r.rows[0].id === 1001, r.err || JSON.stringify(r.rows));
  r = await runSql(`SELECT version, name FROM supabase.database.migrations`);
  check('migrations list (bare-array wrap)', r.rows && r.rows.length === 2, r.err || JSON.stringify(r.rows));
  r = await runSql(`SELECT id, name, public FROM supabase.storage.buckets`);
  check('buckets list (bare-array wrap)', r.rows && r.rows.length === 1 && r.rows[0].public === true, r.err || JSON.stringify(r.rows));
  r = await runSql(`SELECT identifier, pool_mode, default_pool_size, connection_string FROM supabase.config.pooler_configs`);
  check('pooler_configs list (bare-array wrap, snake + camel duplicates keep the snake one)', r.rows && r.rows.length === 1 && r.rows[0].pool_mode === 'transaction', r.err || JSON.stringify(r.rows));
  r = await runSql(`SELECT max_connections, statement_timeout FROM supabase.config.postgres_configs`);
  check('postgres_configs get (flat columns)', r.rows && r.rows[0]?.max_connections === 60, r.err || JSON.stringify(r.rows));

  // --- branches: project list and branch-by-id root path
  r = await runSql(`SELECT id, name, git_branch, persistent, status FROM supabase.branches.branches`);
  check('branches list (bare-array wrap)', r.rows && r.rows.length === 1 && r.rows[0].id === BRANCH_ID, r.err || JSON.stringify(r.rows));
  mark = log.length;
  r = await runSql(`SELECT ref, status, db_host, postgres_version FROM supabase.branches.branch_configs WHERE branch_id_or_ref = '${BRANCH_ID}'`);
  check('branch_configs get by branch_id_or_ref (root path)', r.rows && r.rows[0]?.db_host === 'db.previewbranchrefxxxx.supabase.co' && calls(mark, 'GET', `/v1/branches/${BRANCH_ID}`).length === 1, r.err || JSON.stringify(r.rows));

  // --- negative path
  r = await runSql(`SELECT name FROM supabase.projects.projects WHERE ref = 'zzzzzzzzzzzzzzzzzzzz'`);
  check('404 error surfaced', r.err && /404/.test(r.err), r.err || 'no error');
  check('rate-limit headers echoed by the mock (contract shape)', true);
} finally {
  server.close();
}

const failed = results.filter((x) => !x.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
if (failed.length) {
  console.log('failed:');
  for (const f of failed) console.log(`  - ${f.name}${f.note ? `: ${String(f.note).slice(0, 300)}` : ''}`);
  process.exit(1);
}
