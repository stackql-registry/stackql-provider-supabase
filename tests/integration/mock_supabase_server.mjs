#!/usr/bin/env node

// Mock Supabase Management API for integration-testing the generated
// supabase provider without an account. Serves canned JSON in the wire
// shapes the real API declares in its OpenAPI document (snake_case
// throughout, a handful of camelCase properties on the storage config, SSL
// enforcement and network-restrictions surfaces): bare JSON arrays for the
// collection reads, typed objects for single reads and config singletons,
// {data, cursor} for the snippets page, {lints} / {backups} /
// {selected_addons} / {banned_ipv4_addresses} envelopes, an empty 201/200
// for the write-only endpoints, and a bare array of row objects for the
// database query endpoint. Errors are the NestJS {message, statusCode}
// shape. Mutable in-memory stores make the secrets, edge function, API key
// and auth-config lifecycles round-trip realistically.
//
// Every request must carry `Authorization: Bearer <EXPECTED_TOKEN>` or it is
// rejected 401 - this proves the provider's bearer wiring
// (SUPABASE_ACCESS_TOKEN).
//
// Two projects are served: REF_A (the one SUPABASE_PROJECT_ID resolves to in
// the tests) and REF_B (used to prove a WHERE ref value beats the
// environment). Any other ref is 404.
//
// The documented rate-limit headers are echoed so tests can see the
// contract shape (X-RateLimit-Limit / Remaining / Reset).
//
// Exports startMockServer() for the test runner; also runnable standalone:
//   node tests/integration/mock_supabase_server.mjs [port]

import http from 'http';
import { URL } from 'url';

export const EXPECTED_TOKEN = 'sbp_mock0123456789abcdef0123456789abcdef01234567';
export const ORG_SLUG = 'mock-org-slug';
export const ORG_ID = 'e0f1a2b3-c4d5-4e6f-8a7b-8c9d0e1f2a3b';
export const REF_A = 'abcdefghijklmnopqrst';
export const REF_B = 'tsrqponmlkjihgfedcba';
export const BRANCH_ID = '5f6e7d8c-9b0a-4f1e-8d2c-3b4a5c6d7e8f';
export const FUNCTION_SLUG = 'hello-world';
export const API_KEY_ID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';

const RATE_HEADERS = { 'X-RateLimit-Limit': '120', 'X-RateLimit-Remaining': '119', 'X-RateLimit-Reset': '60' };

let idCounter = 0;
function newId(prefix) {
  idCounter++;
  return `${prefix}${String(idCounter).padStart(4, '0')}-0000-4000-8000-000000000000`.slice(0, 36);
}

// ---------------------------------------------------------------------------
// Fixtures (shapes per the pinned OpenAPI document)
// ---------------------------------------------------------------------------

function projectObj(ref, name, status, region = 'ap-southeast-2') {
  return {
    id: ref, ref, organization_id: ORG_ID, organization_slug: ORG_SLUG, name, region,
    created_at: '2026-08-01T02:03:04.000Z', status,
    database: { host: `db.${ref}.supabase.co`, version: '17.4.1.054', postgres_engine: '17', release_channel: 'ga' }
  };
}

function authConfig() {
  return {
    api_max_request_duration: 10, db_max_pool_size: 10, disable_signup: false,
    external_anonymous_users_enabled: false, external_email_enabled: true, external_phone_enabled: false,
    external_github_enabled: true, external_github_client_id: 'Iv1.mock', external_github_secret: '',
    external_google_enabled: false, jwt_exp: 3600, mailer_autoconfirm: false, mailer_otp_exp: 3600,
    mailer_otp_length: 6, mfa_max_enrolled_factors: 10, mfa_totp_enroll_enabled: true, mfa_totp_verify_enabled: true,
    mfa_phone_enroll_enabled: false, mfa_phone_verify_enabled: false, mfa_web_authn_enroll_enabled: false,
    password_min_length: 6, password_required_characters: '', password_hibp_enabled: false,
    rate_limit_anonymous_users: 30, rate_limit_email_sent: 2, rate_limit_token_refresh: 150,
    security_captcha_enabled: false, security_manual_linking_enabled: false, security_refresh_token_reuse_interval: 10,
    security_update_password_require_reauthentication: false, sessions_timebox: 0, sessions_inactivity_timeout: 0,
    site_url: 'http://localhost:3000', uri_allow_list: '', sms_autoconfirm: false, sms_otp_exp: 60, sms_otp_length: 6,
    smtp_admin_email: null, smtp_host: null, smtp_port: null, smtp_user: null
  };
}

function apiKeyObj(id, name, type, extra = {}) {
  return {
    api_key: type === 'publishable' ? 'sb_publishable_mock' : 'sb_secret_mock', id, type, prefix: type === 'publishable' ? 'sb_publishable_' : 'sb_secret_',
    name, description: null, hash: null, secret_jwt_template: null,
    inserted_at: '2026-08-01T02:03:04.000Z', updated_at: '2026-08-01T02:03:04.000Z', ...extra
  };
}

function functionObj(slug, name, extra = {}) {
  return {
    id: newId('fn'), slug, name, status: 'ACTIVE', version: 1,
    created_at: 1754013784000, updated_at: 1754013784000, verify_jwt: true,
    import_map: false, entrypoint_path: `file:///src/index.ts`, import_map_path: null, ezbr_sha256: null, ...extra
  };
}

function branchObj() {
  return {
    id: BRANCH_ID, name: 'feature/preview', project_ref: 'previewbranchrefxxxx', parent_project_ref: REF_A,
    is_default: false, git_branch: 'feature/preview', pr_number: 42, latest_check_run_id: null, persistent: false,
    status: 'MIGRATIONS_PASSED', created_at: '2026-08-10T00:00:00.000Z', updated_at: '2026-08-10T00:00:00.000Z',
    review_requested_at: null, with_data: false, notify_url: null, deletion_scheduled_at: null, preview_project_status: 'ACTIVE_HEALTHY'
  };
}

function snippetObj(id, name) {
  return {
    id, inserted_at: '2026-08-10T00:00:00.000Z', updated_at: '2026-08-10T00:00:00.000Z', type: 'sql', visibility: 'user', name, description: null,
    project: { id: 12345, name: 'mock-dev' }, owner: { id: 1, username: 'mock' }, updated_by: { id: 1, username: 'mock' }, favorite: false
  };
}

function makeState() {
  return {
    projects: new Map([
      [REF_A, projectObj(REF_A, 'mock-dev', 'ACTIVE_HEALTHY')],
      [REF_B, projectObj(REF_B, 'mock-staging', 'INACTIVE', 'us-east-1')]
    ]),
    authConfigs: new Map([[REF_A, authConfig()], [REF_B, { ...authConfig(), disable_signup: true, mfa_totp_enroll_enabled: false }]]),
    secrets: new Map([
      [REF_A, new Map([['SEED_SECRET', { name: 'SEED_SECRET', value: 'seed-value', updated_at: '2026-08-01T02:03:04.000Z' }]])],
      [REF_B, new Map()]
    ]),
    apiKeys: new Map([[REF_A, new Map([[API_KEY_ID, apiKeyObj(API_KEY_ID, 'default', 'publishable')]])], [REF_B, new Map()]]),
    functions: new Map([[REF_A, new Map([[FUNCTION_SLUG, functionObj(FUNCTION_SLUG, 'Hello World')]])], [REF_B, new Map()]]),
    networkRestrictions: new Map([
      [REF_A, { entitlement: 'allowed', config: { dbAllowedCidrs: ['0.0.0.0/0'], dbAllowedCidrsV6: ['::/0'] }, old_config: null, status: 'applied', updated_at: '2026-08-01T02:03:04.000Z', applied_at: '2026-08-01T02:03:04.000Z' }],
      [REF_B, { entitlement: 'allowed', config: { dbAllowedCidrs: ['203.0.113.0/24'], dbAllowedCidrsV6: [] }, old_config: null, status: 'applied', updated_at: '2026-08-01T02:03:04.000Z', applied_at: '2026-08-01T02:03:04.000Z' }]
    ]),
    sslEnforcement: new Map([[REF_A, { currentConfig: { database: false }, appliedSuccessfully: true }], [REF_B, { currentConfig: { database: true }, appliedSuccessfully: true }]]),
    storageConfig: new Map([[REF_A, { fileSizeLimit: 52428800, features: { imageTransformation: { enabled: true }, s3Protocol: { enabled: false }, icebergCatalog: { enabled: false } }, capabilities: { list_v2: true, iceberg_catalog: false }, external: { upstreamTargetMode: 'off', upstreamS3Endpoint: null, upstreamS3Region: null }, migrationVersion: 'iceberg-catalog-flag-on-buckets', databasePoolMode: 'single_use' }]]),
    paused: [],
    queries: [],
    authFailures: 0
  };
}

// ---------------------------------------------------------------------------
// HTTP plumbing
// ---------------------------------------------------------------------------

function send(res, code, body) {
  const headers = { ...RATE_HEADERS };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  res.writeHead(code, headers);
  res.end(body === undefined ? '' : JSON.stringify(body));
}
function fail(res, code, message) { send(res, code, { message, statusCode: code }); }

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => { data += c; });
    req.on('end', () => {
      if (!data) return resolve(null);
      try { resolve(JSON.parse(data)); } catch { resolve({ _raw: data }); }
    });
  });
}

// the query endpoint: a tiny fixture-driven "Postgres"
function runQuery(sql) {
  const q = String(sql || '').trim().toLowerCase();
  if (/^select\s+1\s+as\s+one/.test(q)) return [{ one: 1 }];
  if (/from\s+stackql_smoke_fixture/.test(q)) return [{ id: 1, label: 'alpha', created_at: '2026-08-01T00:00:00+00:00' }, { id: 2, label: 'beta', created_at: '2026-08-02T00:00:00+00:00' }];
  if (/^select\s+count\(\*\)/.test(q)) return [{ count: 2 }];
  if (/^(create|insert|drop|update|delete)/.test(q)) return [];
  return [{ result: 'ok' }];
}

export function startMockServer(port = 0) {
  const state = makeState();
  const log = [];
  const authOk = (h) => {
    const m = /^bearer\s+(\S+)$/i.exec(h || '');
    return !!m && m[1] === EXPECTED_TOKEN;
  };

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const body = await readBody(req);
    const entry = {
      method: req.method, path: url.pathname, query: Object.fromEntries(url.searchParams),
      authorization: req.headers['authorization'] || '', contentType: req.headers['content-type'] || '', body
    };
    log.push(entry);

    if (!authOk(req.headers['authorization'])) {
      state.authFailures++;
      return fail(res, 401, 'Unauthorized');
    }

    const p = url.pathname;
    const m = req.method;

    // --- account-scoped roots
    if (p === '/v1/profile' && m === 'GET') return send(res, 200, { gotrue_id: 'c2d3e4f5-a6b7-4c8d-9e0f-1a2b3c4d5e6f', primary_email: 'dev@example.com', username: 'mock-dev' });
    if (p === '/v1/organizations' && m === 'GET') return send(res, 200, [{ id: ORG_ID, slug: ORG_SLUG, name: 'Mock Org' }]);
    if (p === `/v1/organizations/${ORG_SLUG}` && m === 'GET') return send(res, 200, { id: ORG_ID, name: 'Mock Org', plan: 'free', opt_in_tags: [], allowed_release_channels: ['ga'] });
    if (p === `/v1/organizations/${ORG_SLUG}/members` && m === 'GET') return send(res, 200, [{ user_id: 'c2d3e4f5-a6b7-4c8d-9e0f-1a2b3c4d5e6f', user_name: 'mock-dev', email: 'dev@example.com', role_name: 'Owner', mfa_enabled: true, avatar_url: '' }]);
    if (p === `/v1/organizations/${ORG_SLUG}/projects` && m === 'GET') return send(res, 200, { projects: [...state.projects.values()].map(({ database, ...rest }) => rest), pagination: { offset: 0, limit: 20, total: state.projects.size } });
    if (p.startsWith('/v1/organizations/')) return fail(res, 404, 'Organization not found');
    if (p === '/v1/projects' && m === 'GET') return send(res, 200, [...state.projects.values()]);
    if (p === '/v1/projects' && m === 'POST') {
      const ref = 'newprojectrefxxxxxxx';
      state.projects.set(ref, projectObj(ref, body?.name || 'unnamed', 'COMING_UP', body?.region || 'us-east-1'));
      const { database, ...rest } = state.projects.get(ref);
      return send(res, 201, rest);
    }
    if (p === '/v1/projects/available-regions' && m === 'GET') return send(res, 200, { recommendations: { smartGroup: { name: 'Asia Pacific', code: 'apac', type: 'smartGroup' }, specific: [{ name: 'Sydney', code: 'ap-southeast-2', type: 'specific' }] } });
    if (p === '/v1/snippets' && m === 'GET') {
      const cursor = url.searchParams.get('cursor');
      if (!cursor) return send(res, 200, { data: [snippetObj('11111111-1111-4111-8111-111111111111', 'audit users'), snippetObj('22222222-2222-4222-8222-222222222222', 'slow queries')], cursor: 'page-two' });
      if (cursor === 'page-two') return send(res, 200, { data: [snippetObj('33333333-3333-4333-8333-333333333333', 'vacuum stats')] });
      return send(res, 200, { data: [] });
    }
    if (p === `/v1/branches/${BRANCH_ID}` && m === 'GET') return send(res, 200, { ref: 'previewbranchrefxxxx', postgres_version: '17.4.1.054', postgres_engine: '17', release_channel: 'ga', status: 'ACTIVE_HEALTHY', db_host: 'db.previewbranchrefxxxx.supabase.co', db_port: 5432, db_user: 'postgres', db_pass: 'redacted', jwt_secret: 'redacted' });
    if (p === `/v1/branches/${BRANCH_ID}` && m === 'PATCH') return send(res, 200, { ...branchObj(), persistent: !!body?.persistent, git_branch: body?.git_branch || 'feature/preview' });
    if (p === `/v1/branches/${BRANCH_ID}` && m === 'DELETE') return send(res, 200, { message: 'ok' });

    // --- project-scoped
    const pm = p.match(/^\/v1\/projects\/([a-z]{20})(\/.*)?$/);
    if (!pm) return fail(res, 404, `Cannot ${m} ${p}`);
    const ref = pm[1];
    const rest = pm[2] || '';
    const project = state.projects.get(ref);
    if (!project) return fail(res, 404, 'Project not found');
    entry.ref = ref;

    if (rest === '') {
      if (m === 'GET') return send(res, 200, project);
      if (m === 'PATCH') { if (body?.name) project.name = body.name; return send(res, 200, { ref, name: project.name, status: project.status }); }
      if (m === 'DELETE') { state.projects.delete(ref); return send(res, 200, { id: project.id, ref, name: project.name }); }
    }
    if (rest === '/pause' && m === 'POST') { project.status = 'PAUSING'; state.paused.push(ref); return send(res, 200); }
    if (rest === '/restart' && m === 'POST') { project.status = 'RESTARTING'; return send(res, 200); }
    if (rest === '/health' && m === 'GET') return send(res, 200, [
      { name: 'auth', healthy: true, status: 'ACTIVE_HEALTHY', info: { name: 'GoTrue', version: '2.180.0', description: 'GoTrue is a user registration and authentication API' } },
      { name: 'db', healthy: true, status: 'ACTIVE_HEALTHY' },
      { name: 'realtime', healthy: false, status: 'UNHEALTHY', error: 'connection refused' }
    ]);

    // config surfaces
    if (rest === '/config/auth') {
      const cfg = state.authConfigs.get(ref);
      if (m === 'GET') return send(res, 200, cfg);
      if (m === 'PATCH') { Object.assign(cfg, body || {}); return send(res, 200, cfg); }
    }
    if (rest === '/config/database/postgres' && m === 'GET') return send(res, 200, { effective_cache_size: '3GB', max_connections: 60, shared_buffers: '256MB', statement_timeout: '2min', work_mem: '4MB', session_replication_role: 'origin', log_connections: true, log_duration: false });
    if (rest === '/config/database/pooler' && m === 'GET') return send(res, 200, [{ identifier: ref, database_type: 'PRIMARY', is_using_scram_auth: true, db_user: 'postgres', db_host: `aws-0-ap-southeast-2.pooler.supabase.com`, db_port: 6543, db_name: 'postgres', connection_string: 'postgresql://postgres.mock:[YOUR-PASSWORD]@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres', connectionString: 'postgresql://postgres.mock:[YOUR-PASSWORD]@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres', default_pool_size: 15, max_client_conn: 200, pool_mode: 'transaction' }]);
    if (rest === '/postgrest' && m === 'GET') return send(res, 200, { db_schema: 'public, graphql_public', max_rows: 1000, db_extra_search_path: 'public, extensions', db_pool: null, jwt_secret: 'redacted' });
    if (rest === '/ssl-enforcement') {
      const cfg = state.sslEnforcement.get(ref);
      if (m === 'GET') return send(res, 200, cfg);
      if (m === 'PUT') {
        if (!body?.requestedConfig) return fail(res, 400, 'requestedConfig is required');
        cfg.currentConfig = { ...body.requestedConfig };
        return send(res, 200, cfg);
      }
    }
    if (rest === '/config/storage') {
      const cfg = state.storageConfig.get(ref) || state.storageConfig.get(REF_A);
      if (m === 'GET') return send(res, 200, cfg);
      if (m === 'PATCH') {
        if (body && 'fileSizeLimit' in body) cfg.fileSizeLimit = body.fileSizeLimit;
        if (body?.features) cfg.features = { ...cfg.features, ...body.features };
        return send(res, 200);
      }
    }

    // network
    if (rest === '/network-restrictions') {
      const nr = state.networkRestrictions.get(ref);
      if (m === 'GET') return send(res, 200, nr);
      if (m === 'PATCH') { nr.config = { ...nr.config, ...(body || {}) }; nr.status = 'stored'; return send(res, 200, nr); }
    }
    if (rest === '/network-restrictions/apply' && m === 'POST') {
      const nr = state.networkRestrictions.get(ref);
      nr.old_config = nr.config;
      nr.config = { dbAllowedCidrs: body?.dbAllowedCidrs || [], dbAllowedCidrsV6: body?.dbAllowedCidrsV6 || [] };
      nr.status = 'applied';
      return send(res, 201, nr);
    }
    if (rest === '/network-bans/retrieve/enriched' && m === 'POST') return send(res, 201, { banned_ipv4_addresses: [{ banned_address: '198.51.100.7', identifier: 'postgres', requester_ip: null }, { banned_address: '198.51.100.8', identifier: 'postgres', requester_ip: null }] });
    if (rest === '/network-bans/retrieve' && m === 'POST') return send(res, 201, { banned_ipv4_addresses: ['198.51.100.7', '198.51.100.8'] });
    if (rest === '/network-bans' && m === 'DELETE') {
      if (!Array.isArray(body?.ipv4_addresses)) return fail(res, 400, 'ipv4_addresses must be an array');
      return send(res, 200);
    }

    // secrets and keys
    if (rest === '/secrets') {
      const store = state.secrets.get(ref);
      if (m === 'GET') return send(res, 200, [...store.values()]);
      if (m === 'POST') {
        if (!Array.isArray(body)) return fail(res, 400, 'body must be an array of {name, value}');
        for (const s of body) {
          if (!s?.name || typeof s.value !== 'string') return fail(res, 400, 'each secret needs name and value');
          store.set(s.name, { name: s.name, value: s.value, updated_at: '2026-08-27T00:00:00.000Z' });
        }
        return send(res, 201);
      }
      if (m === 'DELETE') {
        if (!Array.isArray(body)) return fail(res, 400, 'body must be an array of secret names');
        for (const n of body) store.delete(n);
        return send(res, 200);
      }
    }
    if (rest === '/api-keys') {
      const store = state.apiKeys.get(ref);
      if (m === 'GET') {
        const reveal = url.searchParams.get('reveal') === 'true';
        return send(res, 200, [...store.values()].map((k) => (reveal ? k : { ...k, api_key: null })));
      }
      if (m === 'POST') {
        if (!body?.name || !body?.type) return fail(res, 400, 'name and type are required');
        const id = newId('ak');
        store.set(id, apiKeyObj(id, body.name, body.type, { description: body.description || null }));
        return send(res, 201, store.get(id));
      }
    }
    let mm = rest.match(/^\/api-keys\/([^/]+)$/);
    if (mm) {
      const store = state.apiKeys.get(ref);
      const key = store.get(mm[1]);
      if (!key) return fail(res, 404, 'API key not found');
      if (m === 'GET') return send(res, 200, key);
      if (m === 'PATCH') { for (const f of ['name', 'description']) if (body && f in body) key[f] = body[f]; return send(res, 200, key); }
      if (m === 'DELETE') { store.delete(mm[1]); return send(res, 200, key); }
    }
    if (rest === '/api-keys/legacy' && m === 'GET') return send(res, 200, { enabled: true });

    // edge functions
    if (rest === '/functions') {
      const store = state.functions.get(ref);
      if (m === 'GET') return send(res, 200, [...store.values()]);
      if (m === 'POST') {
        if (!body?.slug || !body?.name || typeof body.body !== 'string') return fail(res, 400, 'slug, name and body are required');
        const fn = functionObj(body.slug, body.name, { verify_jwt: body.verify_jwt !== false });
        store.set(body.slug, fn);
        return send(res, 201, fn);
      }
    }
    mm = rest.match(/^\/functions\/([^/]+)$/);
    if (mm) {
      const store = state.functions.get(ref);
      const fn = store.get(mm[1]);
      if (!fn) return fail(res, 404, 'Function not found');
      if (m === 'GET') return send(res, 200, fn);
      if (m === 'PATCH') { if (body?.name) fn.name = body.name; if (body && 'verify_jwt' in body) fn.verify_jwt = body.verify_jwt; fn.version++; return send(res, 200, fn); }
      if (m === 'DELETE') { store.delete(mm[1]); return send(res, 200); }
    }

    // branches (project-scoped)
    if (rest === '/branches' && m === 'GET') return send(res, 200, ref === REF_A ? [branchObj()] : []);

    // billing, advisors, storage, database
    if (rest === '/billing/addons' && m === 'GET') return send(res, 200, {
      selected_addons: [{ type: 'compute_instance', variant: { id: 'ci_micro', name: 'Micro', price: { description: 'Hourly', type: 'usage', interval: 'hourly', amount: 0.01344 }, meta: { cpu_cores: 2, cpu_dedicated: false, memory_gb: 1 } } }],
      available_addons: [{ type: 'pitr', name: 'Point in time recovery', variants: [{ id: 'pitr_7', name: '7 days', price: { description: 'Monthly', type: 'fixed', interval: 'monthly', amount: 100 } }] }]
    });
    if (rest === '/advisors/security' && m === 'GET') return send(res, 200, { lints: [
      { name: 'rls_disabled_in_public', title: 'RLS Disabled in Public', level: 'ERROR', facing: 'EXTERNAL', categories: ['SECURITY'], description: 'Detects tables in the public schema without RLS', detail: 'Table public.events is public but RLS has not been enabled.', remediation: 'https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public', metadata: { name: 'events', schema: 'public', type: 'table' }, cache_key: 'rls_disabled_in_public_public_events' },
      { name: 'auth_otp_long_expiry', title: 'Auth OTP long expiry', level: 'WARN', facing: 'EXTERNAL', categories: ['SECURITY'], description: 'OTP expiry exceeds recommended threshold', detail: 'Email OTP expiry is set to more than an hour.', remediation: 'https://supabase.com/docs/guides/platform/going-into-prod#security', metadata: { type: 'auth', entity: 'Auth' }, cache_key: 'auth_otp_long_expiry' }
    ] });
    if (rest === '/storage/buckets' && m === 'GET') return send(res, 200, [{ id: 'avatars', name: 'avatars', owner: '', created_at: '2026-08-01T02:03:04.000Z', updated_at: '2026-08-01T02:03:04.000Z', public: true }]);
    if (rest === '/database/backups' && m === 'GET') return send(res, 200, { region: project.region, walg_enabled: true, pitr_enabled: false, backups: [{ id: 1001, is_physical_backup: false, status: 'COMPLETED', inserted_at: '2026-08-26T00:00:00.000Z' }, { id: 1002, is_physical_backup: false, status: 'COMPLETED', inserted_at: '2026-08-27T00:00:00.000Z' }], physical_backup_data: {} });
    if (rest === '/database/migrations' && m === 'GET') return send(res, 200, [{ version: '20260801000000', name: 'init' }, { version: '20260810000000', name: 'add_events' }]);
    if (rest === '/database/query' && m === 'POST') {
      if (typeof body?.query !== 'string') return fail(res, 400, 'query is required');
      state.queries.push({ ref, ...body });
      return send(res, 201, runQuery(body.query));
    }
    if (rest === '/database/query/read-only' && m === 'POST') {
      if (typeof body?.query !== 'string') return fail(res, 400, 'query is required');
      state.queries.push({ ref, readOnlyEndpoint: true, ...body });
      return send(res, 201, runQuery(body.query));
    }

    return fail(res, 404, `Cannot ${m} ${p}`);
  });

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => resolve({ server, port: server.address().port, log, state }));
  });
}

if (process.argv[1]?.endsWith('mock_supabase_server.mjs')) {
  const p = Number(process.argv[2] || 0);
  const { port } = await startMockServer(p);
  console.log(`mock Supabase Management API listening on http://127.0.0.1:${port}`);
  console.log(`expects: Authorization: Bearer ${EXPECTED_TOKEN}; projects ${REF_A}, ${REF_B}; organization ${ORG_SLUG}`);
}
