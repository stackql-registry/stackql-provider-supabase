# `supabase` provider for [`stackql`](https://github.com/stackql/stackql)

This repository builds and documents the `supabase` provider for StackQL, enabling SQL-based query and provisioning operations against the [Supabase Management API](https://supabase.com/docs/reference/api/introduction) - organizations, projects, branches, edge functions, secrets, project configuration (auth, Postgres, pooler, API, storage), custom domains, network restrictions, SSL enforcement, backups, read replicas, and the project SQL query endpoint.

## Scope

The provider maps the Management API at `https://api.supabase.com`. The per-project data APIs (PostgREST at `<ref>.supabase.co/rest/v1`, Realtime, Storage object I/O, GoTrue user-facing auth) are per-project hosts with per-project keys - a different surface, reserved as a possible future `supabase_project` sibling provider and out of scope here.

Supabase's official Terraform provider is labelled experimental by the vendor. This provider's coverage is generated mechanically from the vendor's published OpenAPI document, and it includes one capability outside the resource model: the project SQL query endpoint surfaced in-session, so the control plane (projects, config, secrets) and the project database itself are queryable in one place.

## Design Principles

1. **Fixed server, PAT bearer auth** - the base URL is the literal `https://api.supabase.com` with no server variables. Authentication is `Authorization: Bearer` with a personal access token in the `SUPABASE_ACCESS_TOKEN` environment variable (the Supabase CLI's convention).
2. **Spec fetch is pinned** - the Management API serves its own unversioned OpenAPI document at `https://api.supabase.com/api/v1-json` (the vendor's API reference is generated from it). `bin/fetch-spec.sh` downloads, validates and pins it (URL, date, sha256) in `provider-dev/config/spec_pin.json`; the snapshot in `provider-dev/downloaded/` is committed so every refresh is a reviewed diff, never a silent regeneration.
3. **Rate limit as a design input** - the Management API allows 60 requests per minute per token. Test harnesses run serially and pace under the limit; a 429 in CI is a harness bug, not a retry case. Wide queries (a list join fanning out to per-`ref` reads) consume the budget quickly - the docs note the implication.
4. **`ref`-scoped everything** - projects are addressed by reference ID (`/v1/projects/{ref}/...`); `ref` is the universal scoping parameter and `projects.list` the enumeration join pattern. Organization resources scope by `slug`.
5. **Config-as-rows is the audit surface** - auth settings, Postgres settings, SSL enforcement and network restrictions per project are the posture queries the docs lead with.
6. **Deterministic pipeline** - every step is scripted and re-runnable; manual mapping decisions are rules in scripts, never hand-edits to derived artifacts. Scripts validate and fail without writing.
7. **Update semantics labelled honestly** - the API mixes PATCH and PUT; `UPDATE` vs `REPLACE` is confirmed per resource before it is labelled.

Cross-build findings from the sibling providers (hetzner, clickhouse, snowflake, keycloak, newrelic NOTES.md) are reused, not re-derived. Supabase-specific findings are recorded in [NOTES.md](NOTES.md).

## Prerequisites

- Node.js >= 20
- `npm install` (uses the latest `@stackql/provider-utils`)
- a local `stackql` binary for testing (`$STACKQL`, `./stackql`, or on `PATH`; `bin/start-server.sh` downloads one if missing)
- for live smoke tests: a Supabase free-tier account, a personal access token in `SUPABASE_ACCESS_TOKEN`, and a standing dev project (never a production organization or project)

## 0. Download and Pin the Spec

```bash
npm run fetch-spec            # verify against the recorded pin
npm run fetch-spec -- --update  # accept an upstream change (reviewed refresh)
```

Validates with `@apidevtools/swagger-parser` and fails without writing on validation errors or a pin mismatch.

Pinned snapshot (2026-07-14): `Supabase API (v1)`, OpenAPI 3.0.0, stated version 1.0.0, 114 paths, 169 operations, upstream sha256 `a7cb394180...`. Two deterministic fixes are applied before validation and recorded in the pin: 3 `"type": "null"` schemas rewritten to `nullable: true` (JSON Schema 2020-12 syntax the NestJS generator leaks into an OpenAPI 3.0 document) and 1 `hideDefinitions` artifact key removed.

## 1. Endpoint Inventory and Service Split

```bash
npm run build-inventory
```

Writes `provider-dev/config/endpoint_inventory.csv`: one row per operation with `ref`/`slug` scoping, pagination parameters (most collections are bounded - the inventory records the per-endpoint confirmation), request body kind (multipart/eszip/form/bare-array flagged), update-verb semantics presumption, the vendor's `[Beta]`/`[Alpha]` label, the deprecated flag, response shape, proposed service/resource/verb, and a skip reason where an operation is not mapped.

The service split is recorded as ordered path rules in `provider-dev/config/service_names.json` (first match wins, unmatched paths fail the build).

Inventory of the pinned snapshot: 169 operations, 160 mapped and 9 skipped with reason codes (4 `oauth_user_agent_flow`, 2 `non_json_text_response`, 1 `multipart_eszip_deploy`, 1 `untyped_function_body`, 1 `head_count_endpoint`). 35 operations carry the vendor's `[Beta]` label and 1 carries `[Alpha]`; 5 are marked deprecated. 143 operations scope by project `ref`, 6 by organization `slug`, 8 by branch id, 12 by the token itself.

| Proposed verb | Operations |
|---|---|
| `SELECT` | 71 |
| `EXEC` | 28 |
| `UPDATE` | 23 |
| `INSERT` | 20 |
| `DELETE` | 18 |

Pagination confirmation: only three endpoints carry paging parameters (`GET /v1/snippets` cursor/limit, `GET /v1/projects/{ref}/actions` offset/limit, `GET /v1/organizations/{slug}/projects` offset/limit) - every other collection returns the complete bounded result. Offset/limit windowing is parameter-driven (WHERE-clause usable), not a traversal scheme to configure.

## 2. Split into Service Specs

```bash
npm run split -- --provider-name supabase --overwrite
# or a subset:
npm run split -- --provider-name supabase --services projects,config,secrets --overwrite
```

## 3. Generate Mappings

```bash
npm run generate-mappings -- --input-dir provider-dev/source --output-dir provider-dev/config
npm run map-operations
```

`map_operations.mjs` populates the `stackql_*` columns in `provider-dev/config/all_services.csv` deterministically (mapping decisions are rules in the script, never CSV edits) and fails without writing on unmapped operations, duplicate methods, or required-parameter signature clashes.

## Status

Phase 1 is complete: the spec is pinned and validated (two deterministic fixes), the 169-operation inventory is built (160 mapped, 9 reason-coded skips), the 15-service split is recorded, and the pilot services (`projects`, `config`, `secrets` - 69 operations, 28 resources) are mapped end to end through split -> generate-mappings -> map-operations with all consistency checks passing. The query-endpoint mapping decision is provisionally `INSERT ... RETURNING` per the snowflake framework, pending live projection evidence (see NOTES.md finding 1). Normalize, provider generation, tests, publication and docs follow in later phases; [NOTES.md](NOTES.md) records the findings, open questions and blockers.

## License

MIT - see [LICENSE](LICENSE).

## Contributing

Issues and pull requests welcome. Regenerations must be followed by the integration test suite before commit; test harnesses must pace under the 60 requests per minute Management API limit and clean up everything they create.
