# `supabase` provider for [`stackql`](https://github.com/stackql/stackql)

This repository builds and documents the `supabase` provider for StackQL, enabling SQL-based query and provisioning operations against the [Supabase Management API](https://supabase.com/docs/reference/api/introduction) - organizations and members, projects, preview branches, edge functions, secrets and API keys, project configuration (auth, Postgres, pooler, API, storage, realtime, SSL enforcement), custom domains, network restrictions and bans, backups and restore points, read replicas, add-ons, advisors, analytics, and the project SQL query endpoint.

## Scope

The provider maps the Management API at `https://api.supabase.com` (the control plane). The per-project data APIs (PostgREST at `<ref>.supabase.co/rest/v1`, Realtime, Storage object I/O, GoTrue user-facing auth) are per-project hosts with per-project keys - a different surface, reserved as a possible future `supabase_project` sibling provider and out of scope here.

Supabase's official Terraform provider is labelled Public Alpha by the vendor and covers seven resources. This provider's coverage is generated mechanically from the vendor's published OpenAPI document - 158 operations across 14 services and 65 resources - and includes one capability outside the resource model: the project SQL query endpoint surfaced in-session, so the control plane (projects, config, secrets) and the project database itself are queryable in one place.

## Design Principles

1. **Fixed server, PAT bearer auth** - the API base is the literal `https://api.supabase.com`. Authentication is `Authorization: Bearer` with a personal access token in the `SUPABASE_ACCESS_TOKEN` environment variable (the Supabase CLI's and the Terraform provider's convention).
2. **Project scope is a server variable** - 144 of the 170 operations address a project by `ref`; all but the project get/update/delete (which keep their root path) are generated on the server template `https://api.supabase.com/v1/projects/{ref}` with `ref` resolved from `SUPABASE_PROJECT_ID` (`x-stackQL-envVar`) when it is set, so single-project queries need no `WHERE ref` clause. A `WHERE ref = '...'` value always takes precedence.
3. **Spec fetch is pinned** - the Management API serves its own unversioned OpenAPI document at `https://api.supabase.com/api/v1-json`. `bin/fetch-spec.sh` downloads, fixes deterministically, validates and pins it (URL, date, sha256) in `provider-dev/config/spec_pin.json`; the snapshot is committed so every refresh is a reviewed diff.
4. **Rate limit as a design input** - the Management API allows a fixed number of requests per minute per user (documented as 120; lower on analytics and database context endpoints). Test harnesses run serially and pace at 1.2 s; a 429 in CI is a harness bug, not a retry case.
5. **Config-as-rows is the audit surface** - auth settings (237 flat columns), Postgres settings, SSL enforcement and network restrictions per project are the posture queries the docs lead with.
6. **The query endpoint is the flagship** - `INSERT INTO supabase.database.queries (ref, query) SELECT ... RETURNING rows` runs SQL against the project database and returns the result set as one row's `rows` column.
7. **Deterministic pipeline** - every step is scripted and re-runnable; mapping decisions are rules in scripts, never hand-edits to derived artifacts. `provider-dev/config/all_services.csv` is committed as the durable record of every operation -> resource.method mapping, so a regeneration that moves or renames a method is a reviewable diff.
8. **Update semantics labelled honestly** - the API mixes PATCH and PUT; both map as `UPDATE` until full-replacement semantics are proven per resource.

Cross-build findings from the sibling providers (clickhouse, hetzner, snowflake, keycloak, newrelic NOTES.md) are reused, not re-derived. Supabase-specific findings - the query endpoint decision, the spec fix classes, the project-scope server variable, the engine's string-typed `UPDATE` values, the bare-array secrets bodies - are recorded in [NOTES.md](NOTES.md).

## Prerequisites

- Node.js >= 20
- A local `stackql` binary for testing (`$STACKQL`, `./stackql`, or on `PATH`; `bin/start-server.sh` downloads one only if none is found)
- GNU make and bash (Linux, WSL or macOS); Python 3 and yarn for the smoke suite and the website
- For live smoke tests: a Supabase account, a personal access token, and a standing free-tier dev project (never a production organization or project)

Install dependencies:

```bash
npm install
```

### Makefile

Every step below is wrapped as a `make` target (`make help` lists them). The composite targets:

```bash
make all      # deps, full pipeline (fetch/pin verify, inventory, split, mappings, pre-normalize,
              # normalize, generate, post-process), offline + integration + meta-route tests,
              # docs generation, website build - no credentials needed
make test     # the three credential-free test layers
make smoke    # live smoke suite against the standing dev project (sources .env if present)
```

`make all` never touches a real account - the live suites are separate targets (`smoke`, `smoke-live` against the published provider, `smoke-read-only`, `smoke-project-lifecycle` for the gated project create/pause/delete, `smoke-cleanup` to sweep breadcrumbs). Live credentials are read from the environment or a gitignored `.env` file (see `.env.example`):

```bash
SUPABASE_ACCESS_TOKEN=sbp_...          # personal access token
SUPABASE_PROJECT_ID=abcdefghijklmnopqrst   # the standing dev project's ref
```

## 0. Download and Pin the Spec

```bash
make fetch-spec      # verify against the recorded pin (fails on drift)
make refresh-spec    # accept an upstream change (rewrites the pin - review the diff)
```

Pinned snapshot (2026-08-27): `Supabase API (v1)`, OpenAPI 3.0.0, 115 paths, 170 operations, upstream sha256 `660e5634fab8...`. Six deterministic fix classes are applied before validation and counted in the pin: `"type": "null"` -> `nullable: true` (5), `propertyNames` removed (3), numeric `exclusiveMinimum` lowered to the 3.0 form (3), `$schema` dialect keys removed (2), `const` -> `enum` (2), and `hideDefinitions` (0 in this snapshot). The 2026-08 refresh added one operation (a Prometheus metrics scrape, skipped as text) and changed 86 schemas.

## 1. Endpoint Inventory and Service Split

```bash
make inventory
```

Writes `provider-dev/config/endpoint_inventory.csv`: one row per operation with `ref`/`slug` scoping, pagination parameters, request body kind (multipart/eszip/bare-array flagged), update-verb semantics presumption, the vendor's `[Beta]`/`[Alpha]` label, the deprecated flag, response shape, proposed service/resource/verb, and a skip reason where an operation is not mapped.

Inventory of the pinned snapshot: 170 operations, 158 mapped and 12 skipped with reason codes (4 `oauth_user_agent_flow`, 3 `non_json_text_response`, 1 `multipart_eszip_deploy`, 1 `untyped_function_body`, 1 `untyped_json_response`, 1 `bare_array_bulk_body`, 1 `head_count_endpoint`). 35 operations carry `[Beta]`, 1 `[Alpha]`, 5 are deprecated. 144 operations scope by project `ref`, 6 by organization `slug`, 8 by branch id, 12 by the token itself.

The service split is recorded as ordered path rules in `provider-dev/config/service_names.json` (first match wins, unmatched paths fail the build; `oauth` is classified but excluded from the provider since every operation in it is skip-coded):

| Service | Resources |
|---|---|
| `projects` | projects, organization_projects, available_regions, service_health, restore_versions, upgrade_eligibility, upgrade_status, read_replicas, claim_tokens, disk_configs, disk_autoscale_configs, disk_utilization |
| `organizations` | organizations, members, entitlements, project_claims |
| `branches` | branches, branch_configs, action_runs |
| `config` | auth_configs, auth_signing_keys, legacy_signing_keys, sso_providers, third_party_auth_integrations, postgres_configs, pooler_configs, pgbouncer_configs, postgrest_configs, storage_configs, realtime_configs, ssl_enforcement_configs, pgsodium_configs |
| `network` | network_restrictions, network_bans |
| `domains` | custom_hostnames, vanity_subdomains |
| `functions` | edge_functions |
| `secrets` | secrets, api_keys, legacy_api_keys |
| `database` | queries, migrations, backups, backup_schedules, restore_points, snippets, databases, jit_access, jit_role_mappings, jit_invites, jit_access_configs, readonly_mode, typescript_types, webhooks, cli_login_roles |
| `storage` | buckets |
| `billing` | addons |
| `analytics` | logs, all_logs, api_counts, api_request_counts, function_stats |
| `advisors` | security_lints, performance_lints |
| `profile` | profiles |

## 2. Split into Service Specs

```bash
make split
```

`bin/split.mjs` splits by the path rules, then rebases every project-scoped path onto the server template in `provider-dev/config/servers.json` (dropping the `/v1/projects/{ref}` prefix and the `ref` path parameter, which becomes the server variable). The 18 non-project paths keep their full path and are pinned back to the API base by the post-process step.

## 3. Generate Mappings

```bash
make mappings
```

Regenerates `provider-dev/config/all_services.csv` from scratch and populates the `stackql_*` columns deterministically (`map_operations.mjs`: resource derivation from the path, `RESOURCE_RULES` and `METHOD_RULES` for the named exceptions). Validates before writing: every operation mapped or skipped with a reason, every spec operation present in the CSV, `(resource, method)` unique per service, and unique required-parameter signatures per `(resource, sqlVerb)`.

| Operation pattern | StackQL verb | Resource / method |
|---|---|---|
| GET collection | `SELECT` | `<resource>.list` (bare arrays wrapped by normalize; envelopes carry their key) |
| GET single / config singleton | `SELECT` | `<resource>.get` |
| POST create | `INSERT` | `<resource>.create` |
| PATCH / PUT edit | `UPDATE` | `<resource>.update` |
| DELETE | `DELETE` | `<resource>.delete` |
| `POST .../database/query` | `INSERT` (`RETURNING rows`) | `database.queries.run`; the read-only sibling is `EXEC queries.run_read_only` |
| lifecycle actions (pause, restart, restore, upgrade, branch push/merge/reset, hostname activate, ...) | `EXEC` | `<resource>.<action>` |
| POST-backed reads (network bans) | `SELECT` | `network_bans.list` |

Mapped: 71 `SELECT`, 17 `INSERT`, 21 `UPDATE`, 17 `DELETE`, 32 `EXEC`.

## 4. Normalize the Service Specs

```bash
make pre-normalize normalize
```

`pre_normalize.mjs` applies the Supabase-specific adjustments (the eszip request variant and the deprecated query-parameter duplicates on the edge function create/update, the query endpoint's result schema, the secrets bulk bodies rewritten to single-item objects, the pooler config's camelCase duplicate column); the provider-utils normalize pass then flattens `allOf`, lowers `oneOf`/`anyOf`, and wraps the 13 bare-array list responses.

## 5. Generate the Provider

```bash
make generate
```

which runs:

```bash
rm -rf provider-dev/openapi/*
npm run generate-provider -- \
  --provider-name supabase \
  --input-dir provider-dev/source \
  --output-dir provider-dev/openapi/src/supabase \
  --config-path provider-dev/config/all_services.csv \
  --servers provider-dev/config/servers.json \
  --provider-config '{"auth": {"type": "bearer", "credentialsenvvar": "SUPABASE_ACCESS_TOKEN"}, "snake_case_aliases": true}' \
  --naive-req-body-translate \
  --overwrite
node provider-dev/scripts/post_process.mjs
```

`--naive-req-body-translate` exposes top-level request body properties as columns, so `INSERT INTO supabase.secrets.secrets (name, value) ...` and `UPDATE supabase.config.auth_configs SET disable_signup = 'true'` render the wire bodies as written. `post_process.mjs` pins the non-project paths to the API base (path-level `servers`), configures cursor pagination on `snippets.list`, sets `request.nativeCasing: camel` on the three camelCase-body methods, attaches the query endpoint's result binding, the POST-backed `network_bans.list` objectKey, the secrets request transforms (single-item object -> the bare array the wire expects) and naive body translation on the two DELETEs with bodies, and validates that every other path is project-relative.

### Server parameters

The only server variable is `ref`. With `SUPABASE_PROJECT_ID` exported it is resolved automatically:

```sql
SELECT disable_signup, mfa_totp_enroll_enabled FROM supabase.config.auth_configs;
```

A `WHERE ref = '...'` value takes precedence (one session, several projects); with the variable unset the parameter is required and listed by `SHOW METHODS`. `projects.list`, the organization surface, `profile` and `snippets` need neither. A JOIN cannot fan out over projects on `ref` (the config rows do not echo it); the estate posture pattern is a projects list followed by per-`ref` reads composed with `UNION ALL`.

### Authentication

Provider config: `{"auth": {"type": "bearer", "credentialsenvvar": "SUPABASE_ACCESS_TOKEN"}}`. A different variable can be passed at runtime with `--auth='{"supabase": {"type": "bearer", "credentialsenvvar": "..."}}'`.

### Value typing

`INSERT` and `EXEC` send typed JSON (booleans, numbers, JSON-shaped strings parsed into arrays). The stackql engine marshals every `UPDATE ... SET` value as a string (`SET disable_signup = 'true', password_min_length = '12'`); whether the Management API coerces string-typed booleans and numbers is established by the live smoke suite's auth-config toggle (NOTES.md finding 14).

## 6. Test the Provider

Four layers, in order. Every regeneration is followed by the first three before commit (`make test`); the fourth is live.

### Validate offline

```bash
make test-offline          # node tests/offline_validation.mjs
```

`SHOW SERVICES` / `SHOW RESOURCES` / `SHOW METHODS` and `DESCRIBE EXTENDED` against the local file registry - 38 checks: the 14 services and 65 resources, the verb mapping on `projects.projects`, that `ref` is required only when `SUPABASE_PROJECT_ID` is unset, the `queries.run` INSERT binding, the wide flat auth config (> 200 columns), the snake_case aliases on SSL enforcement, the pooler duplicate dropped, the single-item secrets bodies, the naive DELETE body on `network_bans`, the branch method split.

### Integration tests (mock Management API - no account required)

```bash
make test-integration      # add -- --verbose for per-query output
```

Runs the provider against an in-process mock of the Management API ([tests/integration/mock_supabase_server.mjs](tests/integration/mock_supabase_server.mjs)) serving the wire shapes the spec declares and enforcing the bearer token. The runner materialises a test copy of the registry with the server URLs pointed at the mock (server variables and the `x-stackQL-envVar` extension preserved) and asserts 66 row-level checks: bare-array wraps and single reads, the bearer header, `SUPABASE_PROJECT_ID` resolution vs a `WHERE ref` override vs the unset failure mode, the root paths on their overrides, the secrets bulk `INSERT`/`DELETE` wire bodies, an auth-config `UPDATE` toggle and restore, the snake_case corners (`requested_config` -> `requestedConfig`, `file_size_limit` -> `fileSizeLimit`, `db_allowed_cidrs` -> `dbAllowedCidrs`), the POST-backed bans read and the DELETE with a body, the query endpoint (`INSERT ... RETURNING rows` flowing a 2-row fixture, the `read_only` flag, the read-only sibling), an `EXEC` lifecycle action, an edge function lifecycle, API key pushdown and lifecycle, snippets cursor pagination across two pages, the envelope object keys, and the 404. [tests/integration/probe.mjs](tests/integration/probe.mjs) runs ad-hoc statements against the mock and prints the wire calls.

### Meta-route test suite

```bash
make test-meta             # npm run start-server / test-meta-routes -- supabase / stop-server
```

Walks every service, resource and method over a local wire server: 14 services, 65 resources, 158 methods, 71 selectable, no failures.

### Smoke tests (live)

```bash
make smoke                   # reads + cheap write lifecycles + the query round trip (local registry)
make smoke-live              # the same against the published provider (post-publish verification)
make smoke-read-only         # read smokes only
make smoke-project-lifecycle # additionally the gated project create / pause / delete (minutes, free-tier quota)
make smoke-cleanup           # sweep stackql-smoke-* breadcrumbs
```

[tests/smoke_test.py](tests/smoke_test.py) (pystackql) runs against the standing free-tier dev project named by `SUPABASE_PROJECT_ID`: read smokes (profile, organizations, the project estate, the posture set, secrets, API keys, edge functions, branches, health, add-ons, security lints, backups, storage, migrations, snippets) and self-cleaning write lifecycles - a secret `INSERT`/`SELECT`/`DELETE`, an API key `INSERT`/`SELECT`/`UPDATE`/`DELETE`, an edge function `INSERT`/`UPDATE`/`DELETE` (the vendor-deprecated JSON create), an auth-config toggle-and-restore (the string-typed `UPDATE` probe), an idempotent network-restrictions re-apply, and the query round trip (fixture table created, populated, read through `RETURNING rows`, dropped). Everything is named `stackql-smoke-<stamp>` / `STACKQL_SMOKE_<stamp>` and swept first. Free-tier cost: nothing. Statements are paced at 1.2 s; a 429 fails the run. The harness upgrades pystackql's managed stackql binary to >= v0.10.601 when older. Never run this against a production organization or project.

The live suite has not yet been run from this repository (no token in the build environment); NOTES.md lists what the first run establishes.

### UAT

```bash
set -a; source .env; set +a
REG_ROOT="$(pwd)/provider-dev/openapi"
REG="{\"url\":\"file://${REG_ROOT}\",\"localDocRoot\":\"${REG_ROOT}\",\"verifyConfig\":{\"nopVerify\":true}}"
stackql --registry="${REG}" shell
```

### CI

[.github/workflows/build-and-test.yml](.github/workflows/build-and-test.yml): pin check + build + generation-drift check, offline validation, integration tests, meta-route tests and docs generation on every push and PR; the secret-gated live smoke suite (never the project lifecycle) on pushes; and a weekly `spec-drift` job that fetches the served spec, compares it with the pin, and opens a `spec-drift` issue when it moves. The web workflows build and deploy the microsite from `main`.

## 7. Publish the Provider

To publish, push the `supabase` dir to `providers/src` in a feature branch of the [`stackql-provider-registry`](https://github.com/stackql/stackql-provider-registry) and follow the [registry release flow](https://github.com/stackql/stackql-provider-registry/blob/dev/docs/build-and-deployment.md). Pull and verify from the dev registry:

```bash
export DEV_REG="{ \"url\": \"https://registry-dev.stackql.app/providers\" }"
stackql --registry="${DEV_REG}" shell
```

```sql
registry pull supabase;
```

then `make smoke-live`.

## 8. Generate Web Docs

The doc microsite (`website/`) is Docusaurus 3.10 and follows the shared architecture used by the other provider microsites: navbar/footer/theme/plugin configuration lives in [`stackql/docusaurus-config`](https://github.com/stackql/docusaurus-config), vendored into `.shared-config/` at build time. Site-local files are limited to the provider identity (`website/provider.js`), thin wrappers (`docusaurus.config.js` flips `showLastUpdateTime` on so every page carries a "Last updated on" stamp), the shared components/theme under `src/`, and static assets including `static/CNAME` (`supabase-provider.stackql.io`).

```bash
make docs        # generate-docs --snake-case-aliases + website/scripts/sanitize-docs.mjs
make website     # yarn install && yarn build (vendors the shared config; needs GitHub access)
make website-start
```

`headerContent1.txt` / `headerContent2.txt` in `provider-dev/docgen/provider-data/` supply the landing page: installation, scope, token creation and the env var convention, project scope, the rate limit, beta labelling, and the example queries (estate inventory, the project security posture in four statements, control plane to Postgres rows in two statements, secrets and function inventory, branch hygiene, provisioning, and the serverless Postgres estate query alongside neon). `sanitize-docs.mjs` escapes MDX-hostile description text and annotates every generated `ref` example "required unless SUPABASE_PROJECT_ID is set".

To publish, select GitHub Actions as the Pages source and create the DNS record (the served hostname is pinned by `website/static/CNAME`):

| Source Domain | Record Type | Target |
|---|---|---|
| supabase-provider.stackql.io | CNAME | stackql.github.io. |

## License

MIT - see [LICENSE](LICENSE).

## Contributing

Issues and pull requests welcome. Regenerations must be followed by `make test` before commit; test harnesses must pace under the Management API rate limit and clean up everything they create.
