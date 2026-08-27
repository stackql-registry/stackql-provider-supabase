#!/usr/bin/env node

// Quick offline validation of the generated provider against the local file
// registry - no network, no server. Runs SHOW SERVICES / SHOW RESOURCES /
// SHOW METHODS and DESCRIBE EXTENDED over representative resources and
// asserts expected counts and mappings, including the x-stackQL-envVar
// behaviour of the ref server variable (SUPABASE_PROJECT_ID). Exit 1 on any
// failure.
//
// Usage: node tests/offline_validation.mjs
// Binary resolution: $STACKQL, ./stackql(.exe), then PATH.

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const regPath = path.join(repoRoot, 'provider-dev', 'openapi').replace(/\\/g, '/');
const registry = JSON.stringify({ url: `file://${regPath}`, localDocRoot: regPath, verifyConfig: { nopVerify: true } });

function findBinary() {
  if (process.env.STACKQL && fs.existsSync(process.env.STACKQL)) return process.env.STACKQL;
  for (const name of ['stackql', 'stackql.exe']) {
    const local = path.join(repoRoot, name);
    if (fs.existsSync(local)) return local;
  }
  return 'stackql'; // PATH
}
const bin = findBinary();

function runSql(sql, envOverrides = {}) {
  return new Promise((resolve) => {
    const env = { ...process.env, ...envOverrides };
    for (const [k, v] of Object.entries(envOverrides)) if (v === undefined) delete env[k];
    const child = spawn(bin, [`--registry=${registry}`, 'exec', sql, '--output', 'json'], { cwd: repoRoot, env });
    let stdout = '', stderr = '';
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    child.on('close', (code) => {
      let rows = [];
      try { rows = JSON.parse(stdout) ?? []; } catch { rows = []; }
      resolve({ code, rows, stdout, stderr });
    });
    child.on('error', (err) => resolve({ code: -1, rows: [], stdout: '', stderr: String(err) }));
  });
}

const results = [];
function check(name, cond, note = '') {
  results.push({ name, pass: !!cond, note });
  console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${name}${cond ? '' : `  [${String(note).slice(0, 200)}]`}`);
}

// oauth (the OAuth-app user-agent flow) is classified in the inventory but
// excluded from the provider: every operation in it is skip-coded
const EXPECTED_SERVICES = ['advisors', 'analytics', 'billing', 'branches', 'config', 'database', 'domains', 'functions', 'network', 'organizations', 'profile', 'projects', 'secrets', 'storage'];
const EXPECTED_RESOURCES = {
  advisors: ['performance_lints', 'security_lints'],
  analytics: ['all_logs', 'api_counts', 'api_request_counts', 'function_stats', 'logs'],
  billing: ['addons'],
  branches: ['action_runs', 'branch_configs', 'branches'],
  config: ['auth_configs', 'auth_signing_keys', 'legacy_signing_keys', 'pgbouncer_configs', 'pgsodium_configs', 'pooler_configs', 'postgres_configs', 'postgrest_configs', 'realtime_configs', 'ssl_enforcement_configs', 'sso_providers', 'storage_configs', 'third_party_auth_integrations'],
  database: ['backup_schedules', 'backups', 'cli_login_roles', 'databases', 'jit_access', 'jit_access_configs', 'jit_invites', 'jit_role_mappings', 'migrations', 'queries', 'readonly_mode', 'restore_points', 'snippets', 'typescript_types', 'webhooks'],
  domains: ['custom_hostnames', 'vanity_subdomains'],
  functions: ['edge_functions'],
  network: ['network_bans', 'network_restrictions'],
  organizations: ['entitlements', 'members', 'organizations', 'project_claims'],
  profile: ['profiles'],
  projects: ['available_regions', 'claim_tokens', 'disk_autoscale_configs', 'disk_configs', 'disk_utilization', 'organization_projects', 'projects', 'read_replicas', 'restore_versions', 'service_health', 'upgrade_eligibility', 'upgrade_status'],
  secrets: ['api_keys', 'legacy_api_keys', 'secrets'],
  storage: ['buckets']
};
const NO_ENV = { SUPABASE_PROJECT_ID: undefined };
const WITH_ENV = { SUPABASE_PROJECT_ID: 'abcdefghijklmnopqrst' };

console.log(`stackql: ${bin}`);
let r = await runSql('SHOW SERVICES IN supabase');
check('SHOW SERVICES (14)', r.rows.length === 14 && EXPECTED_SERVICES.every((s) => r.rows.some((x) => x.name === s)), r.stderr || JSON.stringify(r.rows.map((x) => x.name)));

let resourceTotal = 0;
for (const [svc, expected] of Object.entries(EXPECTED_RESOURCES)) {
  r = await runSql(`SHOW RESOURCES IN supabase.${svc}`);
  const names = r.rows.map((x) => x.name).sort();
  resourceTotal += names.length;
  check(`SHOW RESOURCES IN supabase.${svc} (${expected.length})`, JSON.stringify(names) === JSON.stringify(expected), r.stderr || JSON.stringify(names));
}
check('65 resources in total', resourceTotal === 65, String(resourceTotal));

// projects.projects: verbs and the root-path ref parameter
r = await runSql('SHOW METHODS IN supabase.projects.projects', NO_ENV);
const byName = Object.fromEntries(r.rows.map((m) => [m.MethodName, m]));
check('projects.projects methods (10)', r.rows.length === 10, JSON.stringify(Object.keys(byName)));
check('projects.projects verbs (list/get SELECT, create INSERT, update UPDATE, delete DELETE, pause/restart/restore/upgrade/cancel_restore EXEC)',
  byName.list?.SQLVerb === 'SELECT' && byName.get?.SQLVerb === 'SELECT' && byName.create?.SQLVerb === 'INSERT' && byName.update?.SQLVerb === 'UPDATE' && byName.delete?.SQLVerb === 'DELETE' && ['pause', 'restart', 'restore', 'upgrade', 'cancel_restore'].every((m) => byName[m]?.SQLVerb === 'EXEC'), JSON.stringify(byName));
check('projects.list has no required params; projects.get requires ref (root path parameter)', !String(byName.list?.RequiredParams || '').trim() && String(byName.get?.RequiredParams || '').includes('ref'), JSON.stringify([byName.list, byName.get]));
check('projects.create requires db_pass, name, organization_slug (naive body translate)', ['db_pass', 'name', 'organization_slug'].every((p) => String(byName.create?.RequiredParams || '').includes(p)), JSON.stringify(byName.create));

// ref server variable: required only when SUPABASE_PROJECT_ID is unset
r = await runSql('SHOW METHODS IN supabase.config.auth_configs', NO_ENV);
check('auth_configs: ref is required when SUPABASE_PROJECT_ID is unset', r.rows.length === 2 && r.rows.every((m) => String(m.RequiredParams).includes('ref')), JSON.stringify(r.rows));
r = await runSql('SHOW METHODS IN supabase.config.auth_configs', WITH_ENV);
check('auth_configs: ref is optional when SUPABASE_PROJECT_ID is set (x-stackQL-envVar)', r.rows.length === 2 && r.rows.every((m) => !String(m.RequiredParams).includes('ref')), JSON.stringify(r.rows));

// the flagship
r = await runSql('SHOW METHODS IN supabase.database.queries', NO_ENV);
const q = Object.fromEntries(r.rows.map((m) => [m.MethodName, m]));
check('queries.run is INSERT requiring query and ref; run_read_only is EXEC', q.run?.SQLVerb === 'INSERT' && /query/.test(q.run?.RequiredParams) && /ref/.test(q.run?.RequiredParams) && q.run_read_only?.SQLVerb === 'EXEC', JSON.stringify(r.rows));

// DESCRIBE EXTENDED on the representative resources
r = await runSql('DESCRIBE EXTENDED supabase.config.auth_configs');
const authCols = r.rows.map((c) => c.name);
check('DESCRIBE auth_configs is wide and flat (disable_signup, mfa_totp_enroll_enabled, password_min_length, site_url; > 200 columns)', authCols.length > 200 && ['disable_signup', 'mfa_totp_enroll_enabled', 'password_min_length', 'site_url', 'external_github_enabled'].every((c) => authCols.includes(c)), `${authCols.length} columns`);
r = await runSql('DESCRIBE EXTENDED supabase.config.postgres_configs');
check('DESCRIBE postgres_configs is flat (max_connections, statement_timeout, work_mem)', ['max_connections', 'statement_timeout', 'work_mem', 'session_replication_role'].every((c) => r.rows.some((x) => x.name === c)), JSON.stringify(r.rows.map((c) => c.name)));
r = await runSql('DESCRIBE EXTENDED supabase.config.ssl_enforcement_configs');
check('DESCRIBE ssl_enforcement_configs presents snake aliases (current_config, applied_successfully)', ['current_config', 'applied_successfully'].every((c) => r.rows.some((x) => x.name === c)) && !r.rows.some((x) => x.name === 'currentConfig'), JSON.stringify(r.rows.map((c) => c.name)));
r = await runSql('DESCRIBE EXTENDED supabase.config.pooler_configs');
check('DESCRIBE pooler_configs has connection_string once (camel duplicate dropped)', r.rows.filter((x) => x.name === 'connection_string').length === 1 && ['pool_mode', 'default_pool_size', 'db_host'].every((c) => r.rows.some((x) => x.name === c)), JSON.stringify(r.rows.map((c) => c.name)));
r = await runSql('DESCRIBE EXTENDED supabase.projects.projects');
check('DESCRIBE projects has id, ref, name, region, status, database', ['id', 'ref', 'name', 'region', 'status', 'database', 'organization_slug'].every((c) => r.rows.some((x) => x.name === c)), JSON.stringify(r.rows.map((c) => c.name)));
r = await runSql('DESCRIBE EXTENDED supabase.secrets.secrets');
check('DESCRIBE secrets (bare-array wrap) has name, value, updated_at', ['name', 'value', 'updated_at'].every((c) => r.rows.some((x) => x.name === c)), JSON.stringify(r.rows.map((c) => c.name)));
r = await runSql('DESCRIBE EXTENDED supabase.network.network_restrictions');
check('DESCRIBE network_restrictions has entitlement, config, status', ['entitlement', 'config', 'status', 'applied_at'].every((c) => r.rows.some((x) => x.name === c)), JSON.stringify(r.rows.map((c) => c.name)));
r = await runSql('DESCRIBE EXTENDED supabase.network.network_bans');
check('DESCRIBE network_bans projects the enriched ban rows ($.banned_ipv4_addresses)', ['banned_address', 'identifier'].every((c) => r.rows.some((x) => x.name === c)), JSON.stringify(r.rows.map((c) => c.name)));
r = await runSql('DESCRIBE EXTENDED supabase.advisors.security_lints');
check('DESCRIBE security_lints projects the lint rows ($.lints)', ['name', 'level', 'title', 'remediation'].every((c) => r.rows.some((x) => x.name === c)), JSON.stringify(r.rows.map((c) => c.name)));
r = await runSql('DESCRIBE EXTENDED supabase.database.queries');
check('DESCRIBE queries is not selectable (INSERT ... RETURNING rows is the surface)', /not supported/i.test(r.stdout + r.stderr), r.stdout);

// method parameter surfaces
r = await runSql('SHOW METHODS IN supabase.functions.edge_functions', WITH_ENV);
const fn = Object.fromEntries(r.rows.map((m) => [m.MethodName, m]));
check('edge_functions.create requires body, name, slug (legacy query duplicates removed); no bulk_update', ['body', 'name', 'slug'].every((p) => String(fn.create?.RequiredParams || '').includes(p)) && !fn.bulk_update, JSON.stringify(r.rows));
r = await runSql('SHOW METHODS IN supabase.secrets.secrets', WITH_ENV);
const sec = Object.fromEntries(r.rows.map((m) => [m.MethodName, m]));
check('secrets.create requires name, value; secrets.delete requires name (single-item bodies)', /name/.test(sec.create?.RequiredParams) && /value/.test(sec.create?.RequiredParams) && sec.delete?.RequiredParams === 'name', JSON.stringify(r.rows));
r = await runSql('SHOW METHODS IN supabase.network.network_bans', WITH_ENV);
const nb = Object.fromEntries(r.rows.map((m) => [m.MethodName, m]));
check('network_bans.delete requires ipv4_addresses (naive body translate on DELETE)', nb.delete?.RequiredParams === 'ipv4_addresses' && nb.list?.SQLVerb === 'SELECT' && nb.retrieve?.SQLVerb === 'EXEC', JSON.stringify(r.rows));
r = await runSql('SHOW METHODS IN supabase.database.snippets');
check('snippets list/get (cursor pagination configured on list)', r.rows.some((m) => m.MethodName === 'list' && m.SQLVerb === 'SELECT') && r.rows.some((m) => m.MethodName === 'get' && /id/.test(m.RequiredParams)), JSON.stringify(r.rows));
r = await runSql('SHOW METHODS IN supabase.branches.branches', WITH_ENV);
const br = Object.fromEntries(r.rows.map((m) => [m.MethodName, m]));
check('branches: list/get/create on the project, update/delete/push/merge/reset/restore by branch_id_or_ref, disable_branching EXEC', br.list && br.get && br.create?.SQLVerb === 'INSERT' && /branch_id_or_ref/.test(br.delete?.RequiredParams) && ['push', 'merge', 'reset', 'restore', 'disable_branching'].every((m) => br[m]?.SQLVerb === 'EXEC'), JSON.stringify(r.rows));

const failed = results.filter((x) => !x.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length) process.exit(1);
