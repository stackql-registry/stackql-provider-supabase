# CLAUDE.md

## Project

This repository builds and documents the `supabase` provider for [StackQL](https://github.com/stackql/stackql), enabling SQL-based query and provisioning operations against the Supabase Management API - organizations, projects, branches, edge functions, secrets, project configuration (auth/GoTrue settings, Postgres settings, pooler, API/PostgREST settings, storage config), custom domains and vanity subdomains, network restrictions and bans, SSL enforcement, backups and restore points, read replicas, and the project SQL query endpoint.

**Scope notes, recorded so they are never relitigated**: the per-project data APIs (PostgREST at `<ref>.supabase.co/rest/v1`, Realtime, Storage object I/O, GoTrue user-facing auth) are per-project hosts with per-project keys - a different surface, reserved as a possible future `supabase_project` sibling, out of scope here. The Management API is the provider.

The provider is built using the `@stackql/provider-utils` package and follows the repository pattern established in [`stackql-registry/stackql-provider-k8s`](https://github.com/stackql-registry/stackql-provider-k8s/tree/feature/provider-dev) (branch `feature/provider-dev`). Sibling-build NOTES.md findings are reused, not re-derived - hetzner/clickhouse (the lean fixed-host mould, and the rate-limit-as-design-input posture), snowflake (the statement-endpoint mapping decision framework), clickhouse (billable/heavyweight smoke gating).

## Positioning context

Supabase's official Terraform provider is self-labelled experimental, with community-documented coverage gaps (auth configuration, storage, much of the project surface). The citation is the vendor's own label - state it once, factually. This provider's counter is mechanical completeness from the vendor's published spec, and one capability the resource model does not attempt: the project SQL query endpoint surfaced in-session, so the control plane (projects, config, secrets) and the project database itself are queryable in one place - the snowflake/clickhouse control-plane-plus-data-plane story applied to Postgres. The audience is the largest of the current batch (the AI-builder community). Comparisons are expressed through capability statements and runnable examples, never editorializing.

## Spec source

The Management API serves its own OpenAPI document (NestJS-generated) - `https://api.supabase.com/api/v1-json` (verify the canonical path in phase 1 from the API reference, which is generated from it). `bin/fetch-spec.sh` downloads, validates with `@apidevtools/swagger-parser`, and pins (URL, date, hash) in `provider-dev/config/spec_pin.json`. Supabase ships fast - the drift CI job runs weekly, and refreshes are reviewed diffs, never silent regenerations. Beta-flagged endpoints (the SQL query endpoint among them) are mapped and labelled per the clickhouse beta convention.

## Design principles

- **Fixed server, PAT bearer auth** - `https://api.supabase.com`; `Authorization: Bearer` with a personal access token, env var `SUPABASE_ACCESS_TOKEN` (the CLI's convention - keep it). No server variables, no dotted-host concern.
- **Rate limit as a design input** - the Management API allows 60 requests per minute per token. The clickhouse precedent applies verbatim: harness pacing is a correctness concern, a 429 in CI is a harness bug, and the docs note the limit's implication for wide queries.
- **`ref`-scoped everything** - projects are addressed by reference ID (`/v1/projects/{ref}/...`); `ref` is the universal scoping parameter, `projects.list` the enumeration join pattern, taught once. Organization resources scope by `slug`.
- **The SQL query endpoint is the flagship** - `POST /v1/projects/{ref}/database/query` executes SQL against the project's Postgres and returns rows. The snowflake SubmitStatement decision framework governs the mapping (`EXEC` with `@query` vs `INSERT ... RETURNING`), decided in phase 1 on projection-quality evidence and applied once. Result rows are query-dependent - the JSON-blob projection is documented plainly per the newrelic NRQL precedent. Doc examples are read-shaped (`select ...`); the endpoint runs arbitrary SQL and the docs say so with appropriate caution.
- **Config-as-rows is the audit surface** - auth/GoTrue settings (signups enabled, MFA, password policy, OTP expiry), Postgres settings, SSL enforcement, and network restrictions per project are the posture queries that lead the docs: which projects allow signups, which lack SSL enforcement, which have `0.0.0.0/0` network access.
- **Edge functions map metadata-first** - function CRUD and secrets map; the deploy endpoint takes a function bundle (multipart/eszip) and is skipped per the standing binary exclusions, with the CLI noted as the deploy path. Function config updates map normally.
- **Update semantics per resource** - the API mixes PATCH and PUT; label `UPDATE` vs `REPLACE` honestly per the keycloak warning, confirmed per resource.
- **Pagination is an inventory confirmation** - most collections are bounded (projects per org); confirm per endpoint and record rather than assume.

## Toolchain rules

- Use the **latest** `@stackql/provider-utils` (see [npm](https://www.npmjs.com/package/@stackql/provider-utils)). Check for a newer version before starting work; do not pin to an old minor.
- Node.js >= 20. `type: module` in package.json.
- Wrap the two CLI entry points (`provider-dev-utils.mjs`, `docgen-utils.mjs`) as npm scripts, invoked through `node` (not `.bin` shims). Pass flags with npm's `--` separator.
- A local `stackql` binary is required for testing (`$STACKQL`, `./stackql`, or on `PATH`).

## Repository layout

```
provider-dev/
  downloaded/          # pinned spec snapshot
  source/              # cleaned + split per-service specs (build artifacts)
  config/              # spec pin, service names, all_services.csv
  openapi/src/supabase/       # generated provider output
  scripts/             # clean_specs.mjs, map_operations.mjs, pre_normalize.mjs, post_process.mjs
bin/                   # thin shell/node wrappers for npm scripts (mirror k8s repo)
tests/
  integration/         # mock Management API server + row-level assertions
  fixtures/            # seed definitions for the standing dev project
  smoke_test.py        # pystackql smoke suite
website/               # Docusaurus 3.10 microsite
CLAUDE.md
README.md              # k8s-README style, steps 0-8, incl the experimental-label citation (once) and scope notes
```

## Build pipeline

Every step is deterministic and re-runnable. Manual mapping decisions are applied as rules in scripts, never hand-edits to CSVs or specs. Validate-and-fail-without-writing is the standard for every script.

### 0. Fetch, pin, clean

`bin/fetch-spec.sh` per the spec-source section. `clean_specs.mjs` validates with `@apidevtools/swagger-parser`, applies deterministic fixes with a fix report (NestJS-generated specs are generally clean; expect enum and nullable quirks), fails without writing on anything unfixable.

### 1. Split into service specs

`npm run split` with `--provider-name supabase`. Final service split from the endpoint inventory (recorded as ordered path rules in `provider-dev/config/service_names.json`; deviations from the original candidate list are recorded in NOTES.md finding 12):

`organizations` (orgs, members, entitlements, project claims), `projects` (projects, org projects list, health, regions, upgrade, read replicas, restore, claim tokens, disk), `branches` (preview branches, action runs), `config` (auth config, signing keys, third-party auth, SSO providers, postgres config, pooler, pgbouncer, API/PostgREST settings, storage config, realtime config, SSL enforcement, pgsodium), `network` (restrictions, bans), `domains` (custom hostnames, vanity subdomains), `functions` (edge functions; function secrets do not exist as a distinct surface), `secrets` (project secrets, API keys, legacy API keys), `database` (the SQL query endpoint, migrations, backups, snippets, JIT access, readonly, typegen, webhooks, CLI login roles), `storage` (bucket admin - list only at management level), `billing` (addons), `analytics` (logs, usage counts, function stats), `advisors` (security/performance lints), `oauth` (OAuth-app user-agent flow - all skip-coded), `profile` (the PAT identity read)

### 2. Generate mappings

`npm run generate-mappings`, then `node provider-dev/scripts/map_operations.mjs`:

| Operation pattern | StackQL verb | Resource / method |
|---|---|---|
| GET collection | `SELECT` | `<resource>.list` (bare arrays wrapped by normalize; envelopes per inventory) |
| GET single | `SELECT` | `<resource>.get` |
| POST create | `INSERT` | `<resource>.create` |
| PATCH / PUT update (semantics per resource; keycloak warning applies) | `UPDATE` / `REPLACE` per finding | `<resource>.update` |
| DELETE | `DELETE` | `<resource>.delete` |
| `POST .../database/query` | per the phase 1 decision (snowflake framework) | `database.query` - the flagship |
| lifecycle actions (pause, restore, restart services, upgrade) | `EXEC` | `<resource>.<action>` |
| function bundle deploy (multipart/eszip) | skipped | binary, reason-coded; CLI noted as the path |

Resource names are plural snake_case (`projects`, `auth_configs`, `edge_functions`, `network_restrictions`), consistent with the sibling builds. The script validates: every generator-relevant operation mapped or explicitly skipped with a reason code, method names unique per resource, overloaded SQL verbs have unique required-parameter signatures. Fail without writing on any violation.

### 3. Normalize

`node provider-dev/scripts/pre_normalize.mjs`, then `npm run normalize -- --api-dir provider-dev/source`. Config objects (GoTrue settings are wide and flat - good columns; Postgres settings deep) lowered per shape, `json_extract` for the deep ones.

### 4. Generate the provider

```bash
rm -rf provider-dev/openapi/*
npm run generate-provider -- \
  --provider-name supabase \
  --input-dir provider-dev/source \
  --output-dir provider-dev/openapi/src/supabase \
  --config-path provider-dev/config/all_services.csv \
  --servers '[{"url": "https://api.supabase.com"}]' \
  --provider-config '{"auth": {"type": "bearer", "credentialsenvvar": "SUPABASE_ACCESS_TOKEN"}}' \
  --naive-req-body-translate \
  --overwrite
```

Pagination config per the inventory confirmation. Then `node provider-dev/scripts/post_process.mjs`: the query-endpoint binding per the phase 1 decision, plus whatever the integration tests surface.

### 5. Test

Same four layers as the k8s repo, in order:

1. **Offline validation** - local file registry, `SHOW SERVICES/RESOURCES/METHODS`, `DESCRIBE EXTENDED` on representative resources (`supabase.projects.projects`, `supabase.config.auth_configs`, `supabase.secrets.secrets`)
2. **Meta-route tests** - `npm run start-server` / `npm run test-meta-routes -- supabase --verbose` / `npm run stop-server`
3. **Integration tests** - `tests/integration/mock_supabase_server.mjs` serving real wire shapes; assert row-level results per archetype: list/single projection, `ref` routing, a secret `INSERT`/`DELETE` lifecycle, an auth-config `UPDATE`/`REPLACE` per the semantics finding, the query-endpoint mapping with its result projection, an `EXEC` lifecycle action, and the bearer token throughout
4. **Smoke tests** - `tests/smoke_test.py` (pystackql) against a **standing dev project** on the free tier (free-tier project creation is slow and capped at two, so the standing project is the target): read smokes across the surface, write lifecycles on cheap vectors (secrets, network restrictions, an edge function record, auth-config toggle-and-restore), a `database.query` round trip against a fixture table; the project create/pause/delete lifecycle runs only in a separately gated job (heavyweight - minutes per operation and quota-bound, the clickhouse gated-service precedent); serial pacing under 60 req/min throughout; `stackql-smoke-<stamp>` naming, breadcrumbs swept first; `--registry public` variant doubles as post-publish verification

Never run tests against a production organization or project.

### 6. Publish

Push the `supabase` dir to `providers/src` in a feature branch of [`stackql-provider-registry`](https://github.com/stackql/stackql-provider-registry) and follow the registry release flow. Verify with `registry pull supabase` against the dev registry.

### 7. Docs microsite

`website/` is Docusaurus 3.10 following the shared architecture: shared `stackql/docusaurus-config` vendored to `.shared-config/`; site-local files limited to `website/provider.js` (`providerName = 'supabase'`, `providerTitle = 'Supabase'`), thin config wrappers, shared components, and `static/CNAME` pinning `supabase-provider.stackql.io`.

- Author `headerContent1.txt` / `headerContent2.txt` in `provider-dev/docgen/provider-data/` (installation, PAT creation, `SUPABASE_ACCESS_TOKEN`, the `ref` scoping pattern, the rate limit note, the scope notes, example queries)
- `npm run generate-docs`, then `node website/scripts/sanitize-docs.mjs`
- Publish via GitHub Pages, DNS: `supabase-provider.stackql.io` CNAME -> `stackql.github.io.`

Lead the docs examples with the queries this provider exists for: the posture set (projects with signups enabled, MFA off, missing SSL enforcement, open network restrictions - project security audit in four `SELECT`s), project estate inventory across organizations, secrets and function inventory, branch hygiene - the flagship sequence (list projects, then `database.query` one of them: control plane to Postgres rows in two statements) - and one cross-provider join for the campaign: supabase projects alongside neon projects (the serverless Postgres estate) once the sibling ships.

### 8. CI

GitHub Actions: fetch + pin check + clean + build, integration tests against the mock, meta-route tests, and (secret-gated) the smoke suite against the standing dev project with the project-lifecycle job separately gated. Weekly spec-drift job. Model on the k8s repo's `build-and-test.yml`.

## Writing conventions

- README and docs copy: measured, precise, no hyperbole. Third-person or passive framing for descriptive copy. The experimental-label citation appears once, factually - never as a refrain.
- No em dashes; use `-`. No characters not on a QWERTY keyboard; use `->` for arrows.
- Sample queries follow the k8s README style: realistic, runnable, `json_extract` for nested fields.

## Non-negotiables

1. Latest `@stackql/provider-utils`, always
2. The k8s `feature/provider-dev` repo is the reference pattern; sibling-build NOTES.md findings are reused, not re-derived - deviate only with a documented reason in the README
3. Test harnesses pace under the 60 req/min limit - a 429 in CI is a harness bug
4. The project create/delete lifecycle never runs outside the gated job - free-tier quota is a shared resource
5. Deterministic scripts, never hand-edits to derived artifacts
6. Every regeneration is followed by the integration test suite before commit
7. Smoke tests restore any config they toggle and clean up everything they create
