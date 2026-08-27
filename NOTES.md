# NOTES

Findings from the build, answered with evidence where possible. Sources: the pinned spec snapshot `provider-dev/downloaded/supabase-v1.json` (refreshed 2026-08-27, upstream sha256 `660e5634fab8...`, see `provider-dev/config/spec_pin.json`), the endpoint inventory (`provider-dev/config/endpoint_inventory.csv`), the mock-server integration suite (`tests/integration/`), probes of the stackql engine (v0.10.605) against the mock, the vendor's API reference and Terraform provider source, and the sibling NOTES.md findings (snowflake, clickhouse, keycloak, newrelic, hetzner) - reused, not re-derived. Findings that require a live token are marked for the smoke suite; see Blockers.

## 1. The query endpoint mapping (flagship) - decided: INSERT ... RETURNING rows

`POST /v1/projects/{ref}/database/query` (`v1-run-a-query`, `[Beta]`) executes SQL against the project's Postgres. Request body: `query` (string, required), `parameters` (array, optional), `read_only` (boolean, optional). A sibling `POST .../database/query/read-only` (`v1-read-only-query`, `[Beta]`) runs as `supabase_read_only_user` and takes `query` + `parameters` only.

The snowflake SubmitStatement decision framework applied:

- **SELECT is ruled out** on the any-sdk gap snowflake recorded: `query` is a required request-body property and select statements do not route WHERE parameters into request bodies.
- **INSERT ... RETURNING wins on projection quality**, proven against the mock. The 201 declares no content in the spec; `pre_normalize.mjs` types it as `V1RunQueryResultRows` (`{rows: [...]}`) and `post_process.mjs` attaches the wrap transform (the same overrideMediaType + schema_override + transform trio the generator emits for bare-array lists), so `INSERT INTO supabase.database.queries (ref, query) SELECT '<ref>', 'select ...' RETURNING rows` returns one row whose `rows` column carries the result set - the newrelic NRQL posture (`json_extract(rows, '$[0].count')`). The integration suite asserts the wire body (`{query}`, `{query, read_only: true}`), the 2-row fixture result flowing through the `rows` column, and the read-only sibling.
- The resource is `database.queries` with `run` (INSERT) and `run_read_only` (EXEC). Two INSERT methods with the same required-parameter signature (`ref`) would clash, and the main method already takes `read_only` in its body, so the sibling is EXEC-only.
- EXEC on `run` also works for fire-and-forget statements (prints the status line).

**Doc framing:** examples are read-shaped; the endpoint runs arbitrary SQL as the service role and the docs say so; result rows are query-dependent and arrive as one JSON value; both endpoints carry the vendor's `[Beta]` label.

**For the smoke suite:** the round trip creates `public.stackql_smoke_fixture`, inserts two rows, reads them back through `RETURNING rows`, runs `run_read_only`, and drops the table. Whether `parameters` binds `$1`-style placeholders is still unconfirmed live.

## 2. Spec quality and deterministic fixes - six defect classes over two refreshes

The NestJS-generated document leaks JSON Schema 2019-09/2020-12 syntax into an OpenAPI 3.0 document. Fixed deterministically in `record_spec_pin.mjs` before validation and counted in the pin (hetzner precedent); a class absent from a snapshot counts 0:

- `type_null_to_nullable` (5): `"type": "null"` -> `nullable: true` (the JIT list anyOf discriminants, the deprecated always-null create-project fields).
- `hide_definitions_removed` (0, was 1): the `hideDefinitions` `@nestjs/swagger` artifact key - gone from the current spec.
- `property_names_removed` (3, new 2026-08): `propertyNames` on the api-keys `secret_jwt_template` free-form object.
- `exclusive_bound_lowered` (3, new 2026-08): numeric `exclusiveMinimum` on `DiskAutoscaleConfig` -> `minimum` + boolean flag (the clickhouse pre_normalize precedent).
- `schema_dialect_key_removed` (2, new 2026-08): a literal `$schema` key inside the reworked jit-access oneOf.
- `const_to_enum` (2, new 2026-08): `const: unavailable` -> `enum: [unavailable]`.

swagger-parser 12 validates clean after fixes. The canonical spec path `https://api.supabase.com/api/v1-json` is confirmed from the vendor's API reference introduction; `/api/v1` serves the Swagger UI.

**2026-08-27 refresh vs the 2026-07-14 pin:** 169 -> 170 operations (one added: `GET /v1/projects/{ref}/analytics/endpoints/metrics`, a Prometheus/OpenMetrics text scrape - skip-coded `non_json_text_response` per the clickhouse prometheus precedent), 146 -> 148 schemas, 86 schemas changed (mostly description and validation tightening; the jit-access read went from untyped JSON to a typed oneOf), `JitStateResponse` removed.

## 3. Pagination - confirmed: one cursor collection configured, two offset windows parameter-driven

- `GET /v1/snippets` (`cursor`, `limit`; response `{data, cursor}`) - configured as method-level pagination on `snippets.list` in `post_process.mjs` (`requestToken cursor/query`, `responseToken $.cursor/body`) and proven against a two-page mock fixture (3 rows, second call carries `cursor=page-two`).
- `GET /v1/projects/{ref}/actions` (`offset`, `limit`) and `GET /v1/organizations/{slug}/projects` (`offset`, `limit`, response `{projects, pagination}`) - offset arithmetic is not expressible in any-sdk's token pagination (keycloak finding); exposed as optional WHERE parameters (parameter-driven windowing).

Every other collection returns the complete bounded result. Any leftover WHERE key with no matching parameter is appended as a query parameter by any-sdk, so `reveal`, `services`, `sql`, `iso_timestamp_start` and the like are predicate pushdowns without configuration (proven: `WHERE reveal = 'true'` on `api_keys`, `WHERE services = 'auth'` on `service_health`, which requires it).

## 4. Update semantics - 16 PATCH, 9 PUT; all UPDATE, and every UPDATE value is a string

The keycloak finding stands: PUT does not imply replace semantics and none has been proven live, so PUT and PATCH both map as `UPDATE`. The PUT list: `api-keys/legacy`, `jit-access`, `pgsodium`, `ssl-enforcement`, `sso/providers/{id}`, `config/database/postgres`, `database/jit`, `database/migrations` (mapped as the EXEC `upsert`), `functions` (bulk, skip-coded - finding 8).

The larger finding is engine-side (finding 14): stackql marshals every `UPDATE ... SET` value as a JSON string. The auth-config toggle-and-restore in the smoke suite is therefore also the coercion probe: `UPDATE supabase.config.auth_configs SET disable_signup = 'true'` sends `{"disable_signup": "true"}`; whether the Management API's validation coerces it is the first thing the live run establishes. Nothing moves to `REPLACE` without live evidence.

## 5. GoTrue and Postgres config shapes - both wide and flat: columns

Measured from the pinned spec and asserted offline: the auth config response declares 237 flat properties (`DESCRIBE` shows > 200 columns - `disable_signup`, `mfa_totp_enroll_enabled`, `password_min_length`, `site_url`, `external_github_enabled`, ...); the Postgres config response 38 flat properties. Both lower to columns with no `json_extract`. Deep shapes that take the JSON-blob posture: the backups envelope (mapped as `backups.list` on `$.backups`, the envelope fields dropped), service health `info`, add-on `variant`, upgrade eligibility arrays, `available_regions` recommendations, the analytics `result` arrays (query-dependent - blob posture like the query endpoint), `network_restrictions.config` (`json_extract(config, '$.dbAllowedCidrs')`).

## 6. Rate limit - the reference now says 120/min; pacing stays at 1.2 s

The API reference (2026-08) states 120 requests per minute per user, scoped per project/organization, with stricter exceptions (analytics 30/min; database context 10/min and 1/s), `429` for the remainder of the minute, and `X-RateLimit-Limit/Remaining/Reset` headers. Older material said 60. The harness constant `INTER_REQUEST_DELAY_MS = 1200` (~50/min) transfers from clickhouse and stays: it is under either figure with margin. A 429 in CI is a harness bug and fails the run. The mock echoes the header shape. The unauthenticated 401 path returns no rate-limit headers; the authenticated shape is recorded on the first live run.

## 7. Beta and deprecated labelling

35 operations carry `[Beta]` and 1 `[Alpha]` (`PATCH network-restrictions`); the prefix is the first token of the generated method description, so per-method labelling flows through verbatim (clickhouse convention) and the landing page summarizes the beta surface. 5 operations are deprecated: the advisors pair, `logs.all`, `database/context` and `POST /v1/projects/{ref}/functions` - all stay mapped with the deprecation carried into docs. The vendor deprecating the JSON function create in favour of the excluded multipart deploy means API-side function creation may eventually disappear; the CLI is the deploy path, noted in docs.

## 8. Bare-array request bodies - secrets wrapped per statement, function bulk update skipped

`POST /v1/projects/{ref}/secrets` takes a bare array of `{name, value}` and `DELETE /v1/projects/{ref}/secrets` a bare array of names (a DELETE with a required body). Naive body translation cannot address a bare array (the first generation sent no body at all). Settled with any-sdk's request transform: `pre_normalize.mjs` rewrites each body schema to its single-item object form (`{name, value}` / `{name}`) and `post_process.mjs` attaches a `request.transform` that wraps the marshalled object back into the array (`[{{ . }}]` on the text template; `[{{ toJson .name }}]` on the JSON template). One secret per statement - the Terraform resource's granularity too. Proven on the wire in the integration suite (`[{"name":"STACKQL_SMOKE_IT","value":"v1"}]` and `["STACKQL_SMOKE_IT"]`).

`PUT /v1/projects/{ref}/functions` (bulk update, bare array of function objects) has no per-statement surface - the single-function PATCH is the update path - and is skip-coded `bare_array_bulk_body`.

DELETE bodies in general: the generator emits `requestBodyTranslate: naive` for POST/PUT/PATCH only, so a DELETE body attribute surfaces as `data__<name>`; `post_process.mjs` adds the naive translation to the two DELETEs with bodies (`secrets.delete`, `network_bans.delete`) so `WHERE name = ...` / `WHERE ipv4_addresses = '[...]'` are the surface.

## 9. Bare-array list wrap keys - provider-utils sets them

13 list reads return top-level bare arrays. provider-utils normalize marks them (`x-stackql-bare-array-wrap`, wrapper key derived from the operationId: `v1_list_all_projects`, `v1_get_services_health`, ...) and generate emits the objectKey + wrap transform + schema override; `stackql_object_key` stays blank in the CSV for them and no `METHOD_RULES` are needed. Envelope reads carry their keys in the CSV (`$.keys`, `$.items`, `$.available_versions`, `$.projects`, `$.data`, `$.backups`, `$.lints`, `$.selected_addons`, `$.databases`). One exception: the generator applies the CSV objectKey to GET operations only, so the POST-backed `network_bans.list` (`$.banned_ipv4_addresses`) gets its objectKey in `post_process.mjs`.

## 10. Untyped JSON responses - one typed by the refresh, one skipped

`jit-access` (GET/PUT) is now a typed oneOf (`{state, appliedSuccessfully}` | `{state: unavailable, unavailableReason}`) after the 2026-08 refresh and maps as `jit_access_configs`. `GET /v1/projects/{ref}/database/openapi` still declares an empty schema; normalize converts it to a string and it projects no columns (the meta-route walk flags it), so it is skip-coded `untyped_json_response` - the project's PostgREST OpenAPI document has marginal value in SQL. The function body read stays skip-coded.

## 11. Network bans read via POST

`POST /v1/projects/{ref}/network-bans/retrieve/enriched` (no body, 201 `{banned_ipv4_addresses: [{banned_address, identifier, requester_ip}]}`) is `network_bans.list` (select); the plain `/retrieve` (string rows) is the EXEC `retrieve`. A POST-backed SELECT with no body routes fine (proven). `DELETE /network-bans` carries `{ipv4_addresses}` (finding 8).

## 12. Service split - 14 services emitted, oauth classified but excluded

The final split (`provider-dev/config/service_names.json`) keeps the candidate list's core and adds what the inventory surfaced: `analytics`, `advisors`, `profile`. `oauth` (the OAuth-app user-agent flow) is classified so the inventory records its 4 operations reason-coded, but the rule carries `"excluded": true` and `bin/split.mjs` does not emit it - every operation in it is skip-coded and an empty service fails the meta-route walk. Function secrets do not exist as a distinct surface; `api-keys` sit in `secrets`; storage admin at management level is the bucket list plus the storage config (in `config`); billing is add-ons only; JIT access config sits in `database`. 14 services, 65 resources, 158 methods (71 selectable).

Resource naming decisions beyond the mechanical derivation (all rules in `map_operations.mjs`): `branch_configs` (the branch-by-id detail read, a different shape from the project-scoped `branches` list/get), `action_runs`, `edge_functions` (the CLAUDE.md name), `queries`, `databases` (the deprecated metadata list plus `update_password`), `jit_access` / `jit_role_mappings` / `jit_invites` / `jit_access_configs` (the two plain reads on `/database/jit` and `/database/jit/list` would clash on signature in one resource), `restore_points`, `backup_schedules`, `readonly_mode`, `typescript_types`, `network_bans`, `logs` / `all_logs` / `api_counts` / `api_request_counts` / `function_stats`, `performance_lints` / `security_lints`, `disable_branching` (the DELETE that disables preview branching is an action, not a row delete), `upsert` (the migrations PUT), `claim` (the organization project claim POST).

## 13. Project scope as a server variable - ref from SUPABASE_PROJECT_ID; joins do not fan out

141 of 170 operations live under `/v1/projects/{ref}/...`. The split rebases them onto the server template `https://api.supabase.com/v1/projects/{ref}` (`provider-dev/config/servers.json`) with `x-stackQL-envVar: SUPABASE_PROJECT_ID` on the `ref` variable - the clickhouse organization precedent (any-sdk v0.5.4-alpha01 / stackql v0.10.601+). Every other path (the projects root and create, available regions, the organization surface, branch-by-id, snippets, profile, and `/v1/projects/{ref}` itself) keeps its full path and `post_process.mjs` pins it to the bare API base with a path-level `servers` override (any-sdk resolves servers operation -> path item -> document). Proven: with the variable set `ref` disappears from `SHOW METHODS` required params; `WHERE ref = ...` beats the environment; unset with no WHERE fails with "cannot find any viable servers"; `projects.get` keeps `ref` as a path parameter. The env var name follows the dashboard's "Project ID" label (Terraform reads only `SUPABASE_ACCESS_TOKEN`; the CLI CI examples use `SUPABASE_PROJECT_ID`).

Consequence: **a JOIN cannot fan out over projects on `ref`**. The config singletons do not echo `ref` in their rows, so `projects p JOIN auth_configs a ON a.ref = p.ref` returns nothing (the inner read runs once, for the environment's project). The estate posture pattern is two statements - list projects, then per-`ref` reads composed with `UNION ALL` - and the docs teach it that way. Recorded so it is not rediscovered.

## 14. Engine typing of statement values - INSERT and EXEC are typed, UPDATE is strings

Probed against the mock (stackql v0.10.605):

- `INSERT ... SELECT ..., true, 'micro'` marshals typed JSON (`"kps_enabled": true`).
- `EXEC ... @db_allowed_cidrs = '["203.0.113.0/24"]'` parses JSON-shaped strings into arrays; but EXEC cannot carry a boolean at all (`true`/`false` is a parser error, `'true'` and `1` fail the schema type check).
- `UPDATE ... SET x = <value>` accepts string and number literals only (`true` is "RHS of type BoolVal not yet supported"; `json('true')` serialises the parser AST into the body) and marshals both as strings: `SET disable_signup = 'true', jwt_exp = 7200` sends `{"disable_signup": "true", "jwt_exp": "7200"}`.

So UPDATE of boolean/numeric config fields depends on the API coercing strings. The docs state that UPDATE values are sent as strings; the smoke suite's auth-config toggle is the live probe (finding 4). Two parser keywords also affect the surface: the `database` column on `projects` must be double-quoted (`json_extract("database", '$.version')`), and `body` (the edge function source) works as a column name.

## 15. Edge function create/update - legacy query parameters shadowed the body

`POST /functions` and `PATCH /functions/{function_slug}` declare their attributes twice: as deprecated query parameters (`slug`, `name`, `verify_jwt`, `import_map`, `entrypoint_path`, `import_map_path`, `ezbr_sha256`) and as the JSON body. any-sdk bound the INSERT columns to the query parameters first and the API rejected the body (`slug, name and body are required`). `pre_normalize.mjs` removes the 14 query duplicates; the body is canonical. The same script drops the `application/vnd.denoland.eszip` request variant (declared first, so any-sdk would have sent that content type) - the JSON create is the mapped path, the CLI the deploy path.

## 16. snake_case surface - three camelCase corners

The wire is snake_case almost everywhere. camelCase appears on: `ssl-enforcement` (`currentConfig`, `appliedSuccessfully`, body `requestedConfig`), `config/storage` (`fileSizeLimit`, `migrationVersion`, `databasePoolMode`, body `fileSizeLimit`), `network-restrictions/apply` (body `dbAllowedCidrs`, `dbAllowedCidrsV6`), `upgrade/status` (`databaseUpgradeStatus`), `jit-access` (`appliedSuccessfully`, `unavailableReason`) and the pooler config (`connectionString`, a duplicate of `connection_string`). `snake_case_aliases: true` on the provider config presents the response properties as snake columns; `request.nativeCasing: camel` on the three methods with camelCase bodies (`network_restrictions.apply`, `ssl_enforcement_configs.update`, `storage_configs.update`) lets snake SQL keys resolve (proven on the wire: `requested_config` -> `requestedConfig`, `file_size_limit` -> `fileSizeLimit`, `db_allowed_cidrs` -> `dbAllowedCidrs`). The pooler duplicate collided under aliasing (two `connection_string` columns, a DDL error at query time) and `pre_normalize.mjs` drops the camelCase copy. Nested JSON keeps wire casing (`json_extract(config, '$.dbAllowedCidrs')`).

## 17. Vendor labelling of the Terraform provider - "Public Alpha", not "experimental"

The word "experimental" does not appear in the Terraform provider's README or docs. The vendor's own label is Public Alpha (the Supabase features page lists "Terraform provider" at stage "Public Alpha"); the registry tier is "community". The provider covers 7 resources and 4 data sources (project, settings with api/auth/database/network/storage/ssl_enforcement blocks, branch, edge_function via the multipart deploy, edge_function_secrets, apikey, third_party_auth); the `pooler` settings block is declared but never read or written. It reads `SUPABASE_ACCESS_TOKEN` (and `SUPABASE_API_ENDPOINT` for the endpoint). CLAUDE.md and the README copy use the Public Alpha label.

## Blockers / for the live smoke run

- **No `SUPABASE_ACCESS_TOKEN` or standing dev project in this environment.** The repository is prepared for a colleague with a Supabase account to run `make smoke` (see `.env.example`). The first live run establishes: the string-typed UPDATE coercion (findings 4 and 14 - the auth-config toggle), whether the JSON edge function create still works (deprecated), the authenticated rate-limit headers (finding 6), `parameters` binding on the query endpoint (finding 1), and project-creation timing for the gated lifecycle (`make smoke-project-lifecycle`; free tier: two active projects, paused projects do not count).
- **Gated project lifecycle**: create (free plan, the standing project's org and region) -> wait `ACTIVE_HEALTHY` (the Terraform provider waits up to 5 minutes) -> `pause` -> wait `INACTIVE` -> delete. Never outside the gated target.

## Testing requirements (carried from CLAUDE.md)

Four layers, in order: offline validation (`make test-offline`: 38 checks over `SHOW`/`DESCRIBE`), integration tests against `tests/integration/mock_supabase_server.mjs` (`make test-integration`: 66 row-level checks, bearer token asserted throughout), meta-route tests (`make test-meta`: 14 services, 65 resources, 158 methods), and the pystackql smoke suite (`make smoke`, `make smoke-live` against the published provider) against the standing dev project - serial pacing at 1.2 s, `stackql-smoke-<stamp>` / `STACKQL_SMOKE_<stamp>` naming, breadcrumbs swept first, everything created cleaned up, config toggles restored. Never against a production organization or project.
