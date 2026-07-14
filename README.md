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

## 1. Endpoint Inventory and Service Split

```bash
npm run build-inventory
```

Writes `provider-dev/config/endpoint_inventory.csv`: one row per operation with `ref`/`slug` scoping, pagination parameters (most collections are bounded - the inventory records the per-endpoint confirmation), request body kind (multipart/eszip/form/bare-array flagged), update-verb semantics presumption, the vendor's `[Beta]`/`[Alpha]` label, the deprecated flag, response shape, proposed service/resource/verb, and a skip reason where an operation is not mapped.

The service split is recorded as ordered path rules in `provider-dev/config/service_names.json` (first match wins, unmatched paths fail the build).

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

Phase 1 (spec acquisition, endpoint inventory, service split, pilot mappings for `projects`, `config` and `secrets`) is in progress. Normalize, provider generation, tests, publication and docs follow in later phases; see [NOTES.md](NOTES.md) for open questions and evidence.

## License

MIT - see [LICENSE](LICENSE).

## Contributing

Issues and pull requests welcome. Regenerations must be followed by the integration test suite before commit; test harnesses must pace under the 60 requests per minute Management API limit and clean up everything they create.
