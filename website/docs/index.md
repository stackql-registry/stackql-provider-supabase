---
title: supabase
hide_title: false
hide_table_of_contents: false
keywords:
  - supabase
  - supabase management api
  - postgres
  - edge functions
  - stackql
  - infrastructure-as-code
  - configuration-as-data
  - cloud inventory
  - security posture
description: Query, provision and manage Supabase organizations, projects, branches, edge functions, secrets, auth and Postgres configuration, network restrictions and the project database itself using SQL
custom_edit_url: null
image: /img/stackql-supabase-provider-featured-image.png
id: 'provider-intro'
---

import CopyableCode from '@site/src/components/CopyableCode/CopyableCode';

Query, provision and operate the Supabase control plane using SQL - organizations and members, the project estate, preview branches, edge functions, secrets and API keys, project configuration (auth, Postgres, pooler, API, storage, realtime, SSL enforcement), custom domains, network restrictions and bans, backups and restore points, add-ons, security and performance advisors, and the project SQL query endpoint, so the control plane and the project database itself are queryable in one place. The project security posture (which projects allow signups, lack MFA or SSL enforcement, or accept connections from anywhere) and the estate inventory are the queries this provider exists for.


:::info[Provider Summary] 

total services: __14__  
total resources: __65__  

:::

See also:
[[` SHOW `]](https://stackql.io/docs/language-spec/show) [[` DESCRIBE `]](https://stackql.io/docs/language-spec/describe)  [[` REGISTRY `]](https://stackql.io/docs/language-spec/registry)
* * *

## Installation

To pull the latest version of the `supabase` provider, run the following command:

```bash
REGISTRY PULL supabase;
```
> To view previous provider versions or to pull a specific provider version, see [here](https://stackql.io/docs/language-spec/registry).

## Scope

This provider covers the Supabase Management API at `https://api.supabase.com` (the control plane): organizations, projects, branches, functions, secrets, configuration, domains, networking, backups, billing add-ons, advisors, analytics and the project SQL query endpoint. The per-project data APIs (PostgREST at `<ref>.supabase.co/rest/v1`, Realtime, Storage object I/O, GoTrue user-facing auth) are per-project hosts with per-project keys - a different surface, reserved as a possible future `supabase_project` sibling provider. Supabase's official Terraform provider is labelled Public Alpha by the vendor and covers seven resources; this provider's surface is generated mechanically from the vendor's published OpenAPI document (159 operations across 15 services).

## Authentication

The provider authenticates with a personal access token as a bearer token. Create one in the Supabase dashboard under Account -> Access Tokens, export it as <CopyableCode code="SUPABASE_ACCESS_TOKEN" /> (the same variable the Supabase CLI and the Terraform provider read), and StackQL picks it up with no further configuration:

```bash
export SUPABASE_ACCESS_TOKEN='sbp_...'
export SUPABASE_PROJECT_ID='abcdefghijklmnopqrst'   # optional, see project scope
```

or using PowerShell:

```powershell
$env:SUPABASE_ACCESS_TOKEN = 'sbp_...'
$env:SUPABASE_PROJECT_ID = 'abcdefghijklmnopqrst'
```

## Project scope

Most resources are scoped to a project, addressed by its reference (`ref` - the Project ID shown in the dashboard under Settings -> General). `ref` is a server variable resolved from the <CopyableCode code="SUPABASE_PROJECT_ID" /> environment variable when it is set, so queries against one project need no `WHERE ref` clause:

```sql
SELECT disable_signup, mfa_totp_enroll_enabled, password_min_length
FROM supabase.config.auth_configs;
```

A `WHERE ref = '...'` value always takes precedence over the environment, which is how a single session addresses several projects. With the variable unset, `ref` is a required parameter on every project-scoped method (visible in `SHOW METHODS`) and must be supplied per query. To discover project refs:

```sql
SELECT id, name, region, status, organization_slug FROM supabase.projects.projects;
```

Organization resources scope by `slug`; preview branches by `branch_id_or_ref`.

## Rate limit

The Management API allows a fixed number of requests per minute per user (documented as 120, with lower limits on analytics and database context endpoints) and answers `429 Too Many Requests` for the remainder of the minute. Queries that fan out across many projects (a config read for every project in the estate) consume the budget quickly; sequence wide scans rather than issuing them in parallel.

## Beta endpoints

The vendor labels part of the surface `[Beta]` (and one endpoint `[Alpha]`); the label is carried through as the first line of each method's description. The query endpoint, network restrictions and bans, custom domains, SSL enforcement, read replicas, JIT access and the upgrade surface are beta. A few operations are deprecated by the vendor (the advisors reads, `logs.all`, the database context read and the JSON edge function create) and stay mapped with the deprecation noted. Refreshes of the provider are reviewed spec diffs against a content-hash pin.

## Example queries

### Project estate inventory

Every project the token can see, with status and region:

```sql
SELECT id, name, region, status, organization_slug, created_at
FROM supabase.projects.projects
ORDER BY organization_slug, name;
```

### Project security posture in four statements

With `SUPABASE_PROJECT_ID` set to the project under review. Signups, MFA and password policy:

```sql
SELECT disable_signup, external_anonymous_users_enabled,
       mfa_totp_enroll_enabled, mfa_phone_enroll_enabled,
       password_min_length, password_hibp_enabled, mailer_otp_exp
FROM supabase.config.auth_configs;
```

SSL enforcement on the database:

```sql
SELECT applied_successfully,
       json_extract(current_config, '$.database') AS ssl_enforced
FROM supabase.config.ssl_enforcement_configs;
```

Network restrictions - `0.0.0.0/0` means any address may reach the database:

```sql
SELECT entitlement, status,
       json_extract(config, '$.dbAllowedCidrs') AS allowed_v4,
       json_extract(config, '$.dbAllowedCidrsV6') AS allowed_v6
FROM supabase.network.network_restrictions;
```

The vendor's own security lints for the project:

```sql
SELECT name, level, title, json_extract(metadata, '$.name') AS object
FROM supabase.advisors.security_lints
WHERE level = 'ERROR';
```

To review several projects in one statement, address each by `ref`:

```sql
SELECT 'abcdefghijklmnopqrst' AS ref, disable_signup, mfa_totp_enroll_enabled
FROM supabase.config.auth_configs WHERE ref = 'abcdefghijklmnopqrst'
UNION ALL
SELECT 'tsrqponmlkjihgfedcba', disable_signup, mfa_totp_enroll_enabled
FROM supabase.config.auth_configs WHERE ref = 'tsrqponmlkjihgfedcba';
```

### Control plane to Postgres rows in two statements

List the projects, then query one of them. The query endpoint runs arbitrary SQL against the project database as the service role; the result rows depend on the statement and arrive as one row whose `rows` column carries the result set:

```sql
SELECT id, name FROM supabase.projects.projects;

INSERT INTO supabase.database.queries (ref, query)
SELECT 'abcdefghijklmnopqrst',
       'select schemaname, relname, n_live_tup from pg_stat_user_tables order by n_live_tup desc limit 10'
RETURNING rows;
```

Address values in the result with `json_extract(rows, '$[0].relname')`. The statement is executed as written - a `drop table` is a `drop table`; prefer the `read_only` flag (`INSERT ... (ref, query, read_only) SELECT ..., true`) or the `run_read_only` method for inspection queries.

### Secrets and function inventory

```sql
SELECT name, updated_at FROM supabase.secrets.secrets;

SELECT slug, name, status, verify_jwt, version
FROM supabase.functions.edge_functions;
```

### Branch hygiene

Preview branches that are not persistent and have not been updated recently:

```sql
SELECT name, git_branch, status, persistent, updated_at
FROM supabase.branches.branches
WHERE persistent = false
ORDER BY updated_at;
```

### Provisioning

Secrets are created one per statement (the wire call is the bulk endpoint):

```sql
INSERT INTO supabase.secrets.secrets (name, value)
SELECT 'STRIPE_WEBHOOK_SECRET', 'whsec_...';

DELETE FROM supabase.secrets.secrets WHERE name = 'STRIPE_WEBHOOK_SECRET';
```

Configuration is updated in place (`UPDATE` sends only the columns you set; values are sent as strings):

```sql
UPDATE supabase.config.auth_configs
SET disable_signup = 'true', password_min_length = '12';
```

Network restrictions are applied with an `EXEC` (the body takes the allow-lists as JSON arrays):

```sql
EXEC supabase.network.network_restrictions.apply
  @db_allowed_cidrs = '["203.0.113.0/24"]',
  @db_allowed_cidrs_v6 = '[]';
```

Project lifecycle operations are `EXEC` methods on `projects.projects`:

```sql
EXEC supabase.projects.projects.pause @ref = 'abcdefghijklmnopqrst';
EXEC supabase.projects.projects.restore @ref = 'abcdefghijklmnopqrst';
```

### The serverless Postgres estate

Supabase projects alongside Neon projects, once the `neon` provider ships:

```sql
SELECT 'supabase' AS platform, name, region, status
FROM supabase.projects.projects
UNION ALL
SELECT 'neon', name, region_id, NULL
FROM neon.projects.projects;
```


## Services
<div class="row">
<div class="providerDocColumn">
<a href="/services/advisors/">advisors</a><br />
<a href="/services/analytics/">analytics</a><br />
<a href="/services/billing/">billing</a><br />
<a href="/services/branches/">branches</a><br />
<a href="/services/config/">config</a><br />
<a href="/services/database/">database</a><br />
<a href="/services/domains/">domains</a><br />
</div>
<div class="providerDocColumn">
<a href="/services/functions/">functions</a><br />
<a href="/services/network/">network</a><br />
<a href="/services/organizations/">organizations</a><br />
<a href="/services/profile/">profile</a><br />
<a href="/services/projects/">projects</a><br />
<a href="/services/secrets/">secrets</a><br />
<a href="/services/storage/">storage</a><br />
</div>
</div>
