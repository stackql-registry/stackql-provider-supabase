# CLAUDE.md

## Project

This repository builds and documents the `supabase` provider for [StackQL](https://github.com/stackql/stackql), enabling SQL-based query and provisioning operations against the Supabase Management API - organizations and members, projects, preview branches, edge functions, secrets and API keys, project configuration (auth/GoTrue settings, Postgres settings, pooler, API/PostgREST settings, storage, realtime, SSL enforcement), custom domains and vanity subdomains, network restrictions and bans, backups and restore points, read replicas, add-ons, advisors, analytics, and the project SQL query endpoint.

**Scope notes, recorded so they are never relitigated**: the per-project data APIs (PostgREST at `<ref>.supabase.co/rest/v1`, Realtime, Storage object I/O, GoTrue user-facing auth) are per-project hosts with per-project keys - a different surface, reserved as a possible future `supabase_project` sibling, out of scope here. The Management API is the provider.

The provider is a type 1 (DIRECT) build from the vendor's published OpenAPI document using `@stackql/provider-utils`, in the lean fixed-host mould of the clickhouse/hetzner sibling repos (the reference implementation for structure, scripts, tests and docs is [`stackql-provider-clickhouse`](../../C/stackql-provider-clickhouse)). Sibling-build NOTES.md findings are reused, not re-derived - snowflake (the statement-endpoint mapping framework), clickhouse (rate limit as a design input, the org-scoped server template, gated smoke lifecycles), keycloak (PUT is not REPLACE without evidence), newrelic (the JSON-blob posture for query-dependent shapes), hetzner (deterministic spec fixes counted in the pin). Supabase-specific findings live in [NOTES.md](NOTES.md) - read it before changing a mapping.

## Positioning context

Supabase's official Terraform provider is labelled Public Alpha by the vendor (the "experimental" wording in earlier drafts was wrong - NOTES.md finding 17) and covers seven resources. State the label once, factually. This provider's counter is mechanical completeness from the vendor's published spec (158 operations, 14 services, 65 resources) and one capability the resource model does not attempt: the project SQL query endpoint surfaced in-session, so the control plane and the project database are queryable in one place. Comparisons are expressed through capability statements and runnable examples, never editorializing.

## Spec source

The Management API serves its own OpenAPI document (NestJS-generated) at `https://api.supabase.com/api/v1-json`. `bin/fetch-spec.sh` downloads, applies the deterministic fixes in `provider-dev/scripts/record_spec_pin.mjs` (six defect classes so far, counted in the pin), validates with `@apidevtools/swagger-parser`, and pins (URL, date, hash) in `provider-dev/config/spec_pin.json`. The snapshot in `provider-dev/downloaded/` is committed. Supabase ships fast - the weekly drift job opens an issue, and refreshes are reviewed diffs (`make refresh-spec`), never silent regenerations. A refresh that introduces a new 2019-09/2020-12 JSON Schema construct needs a new fix class in `record_spec_pin.mjs`, not a hand edit.

## Design decisions (settled - see NOTES.md for the evidence)

- **Bearer auth from `SUPABASE_ACCESS_TOKEN`** - the CLI's and the Terraform provider's variable. Fixed API base `https://api.supabase.com`.
- **Project scope is a server variable** - the split rebases the 141 operations under `/v1/projects/{ref}/` onto `https://api.supabase.com/v1/projects/{ref}` with `x-stackQL-envVar: SUPABASE_PROJECT_ID` (`provider-dev/config/servers.json`); the non-project paths keep their full path and are pinned to the API base by `post_process.mjs`. A `WHERE ref` value beats the environment. A JOIN cannot fan out over projects on `ref` - the docs teach the two-statement pattern (finding 13).
- **The query endpoint is `database.queries.run`, INSERT ... RETURNING rows** - one row whose `rows` column carries the result set (finding 1). The read-only sibling is EXEC-only.
- **snake_case surface** - `snake_case_aliases: true` on the provider config plus `request.nativeCasing: camel` on the three camelCase-body methods (finding 16). Everything else on the wire is already snake_case.
- **UPDATE values are strings** in the stackql engine (finding 14); INSERT and EXEC are typed. Document it; do not work around it in the provider.
- **Bare-array bodies** - secrets create/delete are single-item bodies wrapped by request transforms; the function bulk update is skip-coded (finding 8). DELETE bodies get naive translation in `post_process.mjs`.
- **Rate limit as a design input** - harness pacing is 1.2 s per statement; a 429 in CI is a harness bug (finding 6).
- **Labels** - `[Beta]`/`[Alpha]` and deprecations flow through from the vendor summaries.
- **Skip codes** (12 operations): `oauth_user_agent_flow` (the service is excluded from the provider entirely), `non_json_text_response`, `multipart_eszip_deploy`, `untyped_function_body`, `untyped_json_response`, `bare_array_bulk_body`, `head_count_endpoint`.

## Toolchain rules

- Use the **latest** `@stackql/provider-utils` and `@stackql/pgwire-lite` (check npm before starting work; do not pin to an old minor). Node.js >= 20, `type: module`.
- Docusaurus 3.10.x for the microsite; `showLastUpdateTime` is flipped on in `website/docusaurus.config.js`.
- WSL is the execution environment on this machine (GNU make, bash, a `stackql` binary on PATH, Python 3, yarn). Node steps also run from Windows.
- The two CLI entry points (`provider-dev-utils.mjs`, `docgen-utils.mjs`) are npm scripts invoked through `node`; the Makefile is the operator surface (`make help`).

## Repository layout

```
Makefile               # the pipeline: make all / make test / make smoke ...
bin/                   # fetch-spec.sh, split.mjs, server lifecycle, test-meta-routes.cjs
provider-dev/
  downloaded/          # pinned spec snapshot (committed)
  config/              # spec_pin.json, service_names.json, servers.json, endpoint_inventory.csv, all_services.csv
  scripts/             # record_spec_pin, build_inventory, map_operations, pre_normalize, post_process, lib/spec_helpers
  source/              # split + normalized per-service specs (build artifacts, committed)
  openapi/src/supabase # generated provider output (committed)
  docgen/provider-data # headerContent1.txt / headerContent2.txt (landing page)
tests/
  offline_validation.mjs
  integration/         # mock_supabase_server.mjs, run_integration_tests.mjs, probe.mjs
  smoke_test.py        # pystackql live suite (--live, --read-only, --with-project-lifecycle, --cleanup-only)
website/               # Docusaurus microsite (shared stackql/docusaurus-config vendored at build)
.github/workflows/     # build-and-test.yml (pin check, build, drift check, 3 test layers, gated smoke, weekly spec-drift), web deploys
```

## Build pipeline

`make all` runs deps -> fetch-spec (pin verify) -> inventory -> split -> mappings -> pre-normalize -> normalize -> generate (+ post-process) -> test-offline -> test-integration -> test-meta -> docs -> website. Every step is deterministic and re-runnable; manual mapping decisions are rules in `map_operations.mjs` (`RESOURCE_RULES`, `METHOD_RULES`) and skip codes in `lib/spec_helpers.mjs`, never hand-edits to CSVs or specs. `all_services.csv` is committed as the durable record of every operation -> resource.method mapping; a diff there on a regeneration is a breaking-change review (a method moving resource, a resource renamed), not noise. Validate-and-fail-without-writing is the standard for every script.

## Tests

1. `make test-offline` - `SHOW`/`DESCRIBE` against the local file registry (services, resources, verbs, env-var behaviour, snake aliases).
2. `make test-integration` - the mock Management API (`tests/integration/mock_supabase_server.mjs`, real wire shapes, bearer enforced) with row-level assertions per archetype. `tests/integration/probe.mjs "<sql>"` prints stackql output and the wire call for ad-hoc binding checks.
3. `make test-meta` - the meta-route walk over a local server.
4. `make smoke` / `make smoke-live` / `make smoke-read-only` / `make smoke-project-lifecycle` / `make smoke-cleanup` - live, against the standing free-tier dev project from `.env` (`SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_ID`). Free-tier cost: nothing. The project lifecycle only runs in its gated target.

Never run tests against a production organization or project.

## Publish and docs

Push the `supabase` dir to `providers/src` in a feature branch of [`stackql-provider-registry`](https://github.com/stackql/stackql-provider-registry) and follow the registry release flow; verify with `registry pull supabase` from the dev registry and `make smoke-live`. Docs: `make docs` (generate + sanitize, including the "required unless SUPABASE_PROJECT_ID is set" annotation) then `make website`; GitHub Pages with `supabase-provider.stackql.io` CNAME -> `stackql.github.io.`.

## Writing conventions

- README and docs copy: measured, precise, no hyperbole. Third-person or passive framing for descriptive copy.
- No em dashes; use `-`. No characters not on a QWERTY keyboard; use `->` for arrows.
- Sample queries follow the k8s README style: realistic, runnable, `json_extract` for nested fields; `"database"` double-quoted when selecting that column.

## Non-negotiables

1. Latest `@stackql/provider-utils`, always
2. The clickhouse repo is the reference pattern; sibling-build NOTES.md findings are reused, not re-derived - deviate only with a documented reason in NOTES.md
3. Test harnesses pace under the rate limit - a 429 in CI is a harness bug
4. The project create/delete lifecycle never runs outside the gated target - free-tier quota is a shared resource
5. Deterministic scripts, never hand-edits to derived artifacts
6. Every regeneration is followed by `make test` before commit
7. Smoke tests restore any config they toggle and clean up everything they create
