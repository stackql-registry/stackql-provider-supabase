# Project guidance

This file is the canonical, tool-neutral guidance for work in this repository. Claude Code and GitHub Copilot entry points refer here; Codex should use this file directly. Keep project rules here rather than duplicating them in tool-specific files.

## Project scope and architecture

- This repository builds the StackQL `supabase` provider for the Supabase Management API at `https://api.supabase.com`. Per-project data APIs (PostgREST, Realtime, Storage object I/O, and GoTrue user-facing auth) use separate hosts and keys and are out of scope for this provider.
- The provider is a type 1 (DIRECT) build from the vendor's published OpenAPI document using `@stackql/provider-utils`. Use [stackql-provider-clickhouse](../../C/stackql-provider-clickhouse) as the reference for structure, scripts, tests, and docs.
- Reuse established findings from sibling provider builds rather than re-deriving them. Read [NOTES.md](NOTES.md) before changing a mapping; document any justified deviation from prior findings there.
- Describe the official Supabase Terraform provider as Public Alpha, factually and without editorializing. Ground coverage claims in the published-spec inventory. Explain the project's SQL endpoint as a capability beyond the resource model through capability statements and runnable examples, not editorializing.

## Spec and generated artifacts

- The source spec is `https://api.supabase.com/api/v1-json`. `bin/fetch-spec.sh` applies deterministic fixes in `provider-dev/scripts/record_spec_pin.mjs`, validates the result, and verifies the URL, date, and hash in `provider-dev/config/spec_pin.json`. Fix classes are counted in the pin; the downloaded snapshot is committed.
- Treat spec refreshes as reviewed diffs (`make refresh-spec`), not silent regeneration. If a refresh introduces a new JSON Schema 2019-09/2020-12 construct, add a deterministic fix class in `record_spec_pin.mjs`; never hand-edit the downloaded spec.
- Mapping decisions belong in `provider-dev/scripts/map_operations.mjs` (`RESOURCE_RULES`, `METHOD_RULES`) and skip codes in `provider-dev/scripts/lib/spec_helpers.mjs`. Do not hand-edit generated specs, provider output, or mapping CSVs.
- `provider-dev/config/all_services.csv` is the durable operation-to-resource/method record. Review any changed mapping, resource name, or method name as a potentially breaking change.
- Build scripts must remain deterministic and validate inputs before writing output. After any regeneration, run `make test` before committing.

## Settled provider behavior

- Use bearer authentication from `SUPABASE_ACCESS_TOKEN` and the fixed API base `https://api.supabase.com`.
- The split rebases project-scoped operations onto the project server template in `provider-dev/config/servers.json` with `x-stackQL-envVar: SUPABASE_PROJECT_ID`; `provider-dev/scripts/post_process.mjs` pins non-project paths to the API base. A `WHERE ref` value takes precedence over the environment. A join cannot fan out across projects on `ref`; document and use the two-statement pattern.
- The project SQL endpoint is `database.queries.run`, using `INSERT ... RETURNING rows`; it returns one row whose `rows` value contains the result set. The read-only sibling is EXEC-only.
- Keep the SQL surface snake_case (`snake_case_aliases: true`). Retain `request.nativeCasing: camel` for the three camelCase-body methods.
- StackQL marshals UPDATE values as strings; INSERT and EXEC remain typed. Do not work around this in the provider; document the behavior. Map both PUT and PATCH as UPDATE unless full-replacement semantics are proven for a resource.
- Preserve request transforms for the secrets create/delete single-item bodies. The function bulk update remains skip-coded; DELETE bodies use the existing naive translation in `post_process.mjs`.
- Test harness requests are paced at 1.2 seconds per statement. A 429 in CI indicates a harness problem, not a retry case.
- Preserve vendor `[Beta]`/`[Alpha]` labels and deprecation markers.
- Preserve the 12 skipped operations and their codes: `oauth_user_agent_flow` (the service is excluded), `non_json_text_response`, `multipart_eszip_deploy`, `untyped_function_body`, `untyped_json_response`, `bare_array_bulk_body`, and `head_count_endpoint`.

## Toolchain and validation

- Use the latest `@stackql/provider-utils` and `@stackql/pgwire-lite`; check npm before work and do not pin an old minor. Use Node.js >= 20 and `type: module`.
- The microsite uses Docusaurus 3.10.x; preserve `showLastUpdateTime` in `website/docusaurus.config.js`.
- The Makefile is the operator surface (`make help`). Use its targets rather than invoking pipeline steps ad hoc. The npm entry points `provider-dev-utils.mjs` and `docgen-utils.mjs` are invoked through `node`.
- `make test` runs the credential-free offline, integration, and meta-route test layers. The live smoke suite uses the standing free-tier development project and credentials from the environment or gitignored `.env`; see [README.md](README.md) and [.env.example](.env.example).
- Never run tests against a production organization or project. The project create/pause/delete lifecycle runs only through its gated target. Smoke tests must restore configuration they toggle and clean up everything they create.

## Documentation and publishing

- Keep README and docs copy measured and precise. Use third-person or passive framing for descriptive copy; avoid hyperbole.
- Use hyphens instead of em dashes and `->` for arrows. Use only characters available on a QWERTY keyboard. Sample queries should be realistic and runnable, use `json_extract` for nested fields, and double-quote `database` when selecting that column.
- See [README.md](README.md) for prerequisites, the full build and test workflow, docs generation, and publishing. See [NOTES.md](NOTES.md) for mapping evidence and settled technical findings.
