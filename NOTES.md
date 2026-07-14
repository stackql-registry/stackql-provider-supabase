# NOTES

Open questions from the phase 1 kickoff, answered with evidence where possible. Sources: the pinned spec snapshot `provider-dev/downloaded/supabase-v1.json` (fetched 2026-07-14, upstream sha256 `a7cb394180...`, see `provider-dev/config/spec_pin.json`), the endpoint inventory (`provider-dev/config/endpoint_inventory.csv`), unauthenticated probes against `https://api.supabase.com`, and the sibling NOTES.md findings (snowflake, clickhouse, keycloak, newrelic, hetzner) - reused, not re-derived. Findings that require the standing dev project are marked blocked; see Blockers.

## 1. The query endpoint mapping (flagship) - provisional: INSERT ... RETURNING, pending live projection evidence

`POST /v1/projects/{ref}/database/query` (`v1-run-a-query`, `[Beta]`) executes SQL against the project's Postgres. Request body: `query` (string, required), `parameters` (array, optional), `read_only` (boolean, optional). A sibling `POST /v1/projects/{ref}/database/query/read-only` (`v1-read-only-query`, `[Beta]`) runs as `supabase_read_only_user` and takes `query` + `parameters` only.

The snowflake SubmitStatement decision framework applies, with one material difference from snowflake:

- **SELECT is ruled out** on the same any-sdk gap snowflake recorded: `query` is a required request-body property, and select statements do not route WHERE parameters into request bodies. Upgrade path documented if that lands in any-sdk.
- **EXEC vs INSERT ... RETURNING** is decided on projection quality. Snowflake's evidence: EXEC output is not SQL-composable (status text only through pystackql `executeStmt`), while `INSERT ... RETURNING` rows flow through `execute()` and compose with `json_extract`. That evidence transfers, but snowflake's response declared properties to project (`statementHandle`, `resultSetMetaData`, `data`); **the Supabase 201 response declares no content at all** - the spec has an empty response object, and the wire shape (per the vendor's reference examples) is a bare JSON array of row objects with query-dependent keys.
- Consequence: `INSERT ... RETURNING` has no declared columns to return until `post_process.mjs` injects a response schema on the 201. The candidate injection declares the response as a single JSON value (the row array), giving `INSERT ... RETURNING <column>` one row whose column carries the full result set as a JSON array - exactly the newrelic NRQL posture (one row per query, `json_extract(results, '$[0].count')` addressing), which is the sanctioned honest fallback for query-dependent shapes.

**Provisional decision:** map `database.query` as `INSERT ... RETURNING` with the post_process response-schema injection, newrelic blob documentation posture, per the snowflake precedent. EXEC remains available on the same method for fire-and-forget. The read-only endpoint maps as a distinct method on the same resource (`database.query.read_only` or similar - settled with the main binding).

**Blocked evidence (requires `SUPABASE_ACCESS_TOKEN` + the standing project's fixture table):**
1. Confirm the wire shape of the 201 body (bare array of row objects) and whether `parameters` binds `$1`-style placeholders.
2. Generate a database-service snapshot with both candidate bindings and compare through pystackql: does the injected-schema `INSERT ... RETURNING` flow rows through `execute()`; what does EXEC print; is the blob one row (newrelic-style) or N rows.
3. Decide the read-only endpoint's surface (map both, or document `read_only: true` on the main method and mark the sibling duplicate).

**Doc framing (decided, not blocked):** examples are read-shaped (`select ...`); the endpoint runs arbitrary SQL against the project database and the docs say so with appropriate caution; result rows are query-dependent and arrive as one JSON value addressed with `json_extract`; both query endpoints carry the vendor's `[Beta]` label.

## 2. Spec quality and deterministic fixes

The NestJS-generated document is clean apart from two defect classes, fixed deterministically in `record_spec_pin.mjs` before validation and counted in the pin (hetzner precedent):

- `type_null_to_nullable` (3): `"type": "null"` (JSON Schema 2020-12 syntax) on the always-null discriminant properties of the JIT access oneOf variants; rewritten to `nullable: true`.
- `hide_definitions_removed` (1): `hideDefinitions`, a `@nestjs/swagger` artifact key on `V1CreateProjectBody`.

swagger-parser 12 validates clean after fixes. The canonical spec path `https://api.supabase.com/api/v1-json` is confirmed from the vendor's API reference introduction (which is generated from it); `/api/v1` serves the Swagger UI.

## 3. Pagination - confirmed: three endpoints, none configured as traversal

Inventory pass over all 169 operations (paging param names and response cursor companions):

- `GET /v1/snippets` (`cursor`, `limit`; response envelope `{data, cursor}`) - the **single transparent-pagination candidate**: token-based cursor with a response companion, the shape any-sdk's `requestToken`/`responseToken` semantic supports. Decide at generate time (service-level `x-stackQL-config` per the standing k8s finding that provider-level config is broken) and prove against a two-page mock fixture per the newrelic method.
- `GET /v1/projects/{ref}/actions` (`offset`, `limit`) and `GET /v1/organizations/{slug}/projects` (`offset`, `limit`, response `{projects, pagination}`) - offset arithmetic is not expressible in any-sdk's token-based pagination (keycloak finding); exposed as optional WHERE parameters (parameter-driven windowing).

Every other collection returns the complete bounded result - consistent with the per-org project caps.

## 4. Update semantics - 16 PATCH, 9 PUT; default UPDATE per the keycloak warning

The keycloak finding stands: PUT does not imply replace semantics, and mapping PUT as `REPLACE` without evidence would be dishonest. Both verbs map as `UPDATE` until the toggle-and-restore probe against the standing dev project proves full-replacement semantics per resource (any resource proven to drop omitted fields moves to `REPLACE` with the evidence recorded here).

The PUT probe list: `api-keys/legacy`, `jit-access`, `pgsodium`, `ssl-enforcement`, `config/auth/sso/providers/{provider_id}`, `config/database/postgres`, `database/migrations` (upsert), `database/jit`, `functions` (bulk update). The auth-config probe (PATCH, expected partial) is the pilot vector: toggle one field (e.g. `disable_signup`), confirm the other 236 survive, restore. **Blocked on the token.**

## 5. GoTrue and Postgres config shapes - both wide and flat: columns

Measured from the pinned spec: the auth config response declares **237 properties, none nested** (booleans, strings, numbers - `disable_signup`, `external_github_enabled`, `mfa_totp_enroll_enabled`, `password_min_length`, ...); the Postgres config response declares **38 properties, none nested**. CLAUDE.md presumed Postgres config deep; the evidence says both lower to columns at normalize with no `json_extract` needed. Deep shapes that do take the JSON-blob posture: the backups envelope (`backups`, `physical_backup_data`), service health `info`, addons variants, upgrade eligibility arrays.

## 6. Rate limit - 60 req/min; pacing constant `INTER_REQUEST_DELAY_MS = 1200`

The documented contract is 60 requests per minute per token (1/s - the same effective rate as clickhouse's 10-per-10s window), so the clickhouse pacing constant transfers verbatim: serial execution with `INTER_REQUEST_DELAY_MS = 1200` in both the integration runner and the smoke suite, ~50 req/min with headroom. A 429 in CI is a harness bug, not a retry case: the suites fail on 429. Observed: the unauthenticated 401 path returns **no** `X-RateLimit-*` headers; the authenticated header/429 body shape is **blocked on the token** and gets recorded here on the first live smoke run.

## 7. Beta and deprecated labelling

35 operations carry the vendor's `[Beta]` summary prefix and 1 carries `[Alpha]` (`PATCH network-restrictions`); the prefix is the first token of the generated method doc, so per-method labelling flows through verbatim (clickhouse convention), and the provider landing page summarizes the beta surface. 5 operations are deprecated: the advisors pair, `logs.all`, `database/context`, and `POST /v1/projects/{ref}/functions` - all stay mapped (no mapped replacement exists; the deploy replacement for the functions create is the multipart endpoint, excluded as binary) with the deprecation carried into docs. The vendor deprecating the JSON function create in favor of the excluded multipart deploy means API-side function creation may eventually disappear; the CLI is the deploy path, noted in docs.

## 8. Bare-array request bodies (secrets) and DELETE with a body

`POST /v1/projects/{ref}/secrets` (bulk create) takes a **bare array** of `{name, value}` and `DELETE /v1/projects/{ref}/secrets` takes a **bare array of names** - and the DELETE carries a required request body. `--naive-req-body-translate` lowers top-level body properties to named parameters; a bare array has none. The secrets lifecycle is the designated clean smoke vector, so this binding must be settled in phase 2: candidates are a whole-body parameter if provider-utils/any-sdk support one, a post_process schema adjustment, or an EXEC fallback for the bulk operations. Recorded so it is not rediscovered at integration-test time.

## 9. Bare-array list wrap keys - set after the first normalize run

13 list reads return top-level bare arrays (projects, organizations, branches, secrets, api-keys, functions, buckets, members, migrations, pooler, service health, TPA integrations, action runs). Normalize wraps these; the snowflake precedent shows the wrap key derives from the operationId noun (`listGrantsTo -> $.grants_to`). Supabase operationIds are `v1-list-all-projects`-style, so the derived keys are not predictable offline - `stackql_object_key` is left blank for bare-array lists in the phase 1 mapping and set via `METHOD_RULES` once the first normalize run shows the actual keys. Envelope reads carry their keys now (`$.keys` signing keys, `$.items` SSO providers, `$.available_versions` restore versions, `$.projects` org projects).

## 10. Untyped JSON responses kept mapped (post_process candidates)

`GET/PUT /v1/projects/{ref}/jit-access` and `GET /v1/projects/{ref}/database/openapi` declare untyped JSON (empty schema). They stay mapped but will project no columns as-is; if integration tests confirm, they are post_process schema-injection candidates (or reason-coded skips if the value is marginal). The function body read (`functions/{slug}/body`, also untyped) is already skip-coded - source retrieval is a CLI concern.

## 11. Network bans read via POST

`POST /v1/projects/{ref}/network-bans/retrieve` (and `/enriched`) are reads: **no request body**, 201 with `{banned_ipv4_addresses}` (strings; enriched returns objects). Both are select candidates (`objectKey $.banned_ipv4_addresses`) - a POST-backed SELECT with no body should route fine, verified in the integration suite when the network service comes online. The enriched variant's object rows are the better projection; the plain variant may stay as the compat method.

## 12. Service split findings (vs the CLAUDE.md candidate list)

The final split (recorded in `provider-dev/config/service_names.json`) keeps the candidate list's core and adds what the inventory surfaced: `analytics` (logs and usage endpoints), `advisors` (security/performance lints - deprecated but served, and posture-valuable), `oauth` (the OAuth-app user-agent flow, all skip-coded), and `profile` (the PAT identity read). Function secrets do not exist as a distinct surface (project secrets are the only secrets collection); `api-keys` land in `secrets` (vendor tags them Secrets); storage admin at management level is one endpoint (`storage/buckets` list) plus the storage config (which sits in `config` per the candidate list); billing is addons only; JIT access config sits in `database` beside the JIT role mappings. 15 services total.

## Blockers / pending

- **`SUPABASE_ACCESS_TOKEN` is not available in this environment** (checked session, user and machine scope). Blocked on it: the query-endpoint projection evidence (finding 1), the auth-config toggle-and-restore probe (finding 4), authenticated rate-limit headers and the 429 shape (finding 6), and project-creation timing for the gated lifecycle job design. The standing dev project with a small fixture table is also still to be provisioned (free tier, never a production org).
- **Gated project-lifecycle job design** (create/pause/delete): free-tier quota is two projects and creation takes minutes; the job runs only in a separately gated CI workflow (clickhouse gated-service precedent). Pause-vs-delete for cleanup is decided after observing whether a paused project still counts against the two-project cap.
- **Snippets cursor pagination**: configure and prove against a two-page mock fixture at generate time, or document as single-call with param pushdown if the shapes fight any-sdk.

## Testing requirements (carried from CLAUDE.md)

Four layers, in order: offline validation (`SHOW`/`DESCRIBE` against the local file registry), meta-route tests, integration tests against `tests/integration/mock_supabase_server.mjs` (real wire shapes, row-level assertions per archetype, bearer token asserted throughout), and pystackql smoke tests against the standing dev project - serial pacing under 60 req/min (`INTER_REQUEST_DELAY_MS = 1200`), `stackql-smoke-<stamp>` naming, breadcrumbs swept first, everything created cleaned up, config toggles restored, `--registry public` doubling as post-publish verification. The project create/pause/delete lifecycle runs only in the separately gated job. Never against a production organization or project.
