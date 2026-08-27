#!/usr/bin/env python3
"""pystackql smoke test for the supabase (Supabase Management API) stackql provider.

Exercises the salient resources against a real, standing free-tier dev
project: read smokes over the control plane (profile, organizations, the
project estate, the posture set - auth config, Postgres config, SSL
enforcement, network restrictions - secrets, API keys, edge functions,
branches, health, add-ons, security lints, backups, storage) and cheap,
self-cleaning write lifecycles: a secret INSERT / SELECT / DELETE, an API key
INSERT / SELECT / DELETE, an edge function INSERT / UPDATE / DELETE, an
auth-config toggle-and-restore (which doubles as the string-typed UPDATE
probe, NOTES.md finding 14), an idempotent network-restrictions apply, and
the flagship query round trip - a fixture table created, populated, read
through `INSERT INTO supabase.database.queries ... RETURNING rows`, and
dropped. Only when explicitly requested with --with-project-lifecycle does it
create a project, wait for it to come up, pause it and delete it (minutes per
step, and the free tier caps active projects at two - the flag keeps that a
deliberate choice).

Everything created is named `stackql-smoke-<stamp>` (secrets
`STACKQL_SMOKE_<stamp>`); before running, the script sweeps breadcrumbs with
those prefixes so each run starts from a clean slate. Cost: the free tier
bills nothing for any of this; the query endpoint and config reads are free.

Credentials and target project come from the environment, exactly as the
provider itself reads them:

    export SUPABASE_ACCESS_TOKEN=sbp_...   # personal access token (bearer)
    export SUPABASE_PROJECT_ID=abcdefghijklmnopqrst   # the standing dev project's
                                                      # ref (x-stackQL-envVar)

Rate limiting: the Management API documents 120 requests per minute per user
(60 in older material; analytics and database context endpoints are lower).
Every statement is paced by INTER_REQUEST_DELAY_S; a 429 is a harness bug
and fails the run.

Never run this against a production organization or project.

Usage:
    pip install pystackql
    python tests/smoke_test.py                          # local provider-dev/openapi registry (default)
    python tests/smoke_test.py --live                   # the published provider in the stackql registry
    python tests/smoke_test.py --read-only              # read smokes only, no writes
    python tests/smoke_test.py --with-project-lifecycle # also the gated project create / pause / delete
    python tests/smoke_test.py --cleanup-only           # just sweep breadcrumbs
"""

from __future__ import annotations

import argparse
import json
import os
import re
import secrets as pysecrets
import sys
import time
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
SMOKE_PREFIX = "stackql-smoke-"
SECRET_PREFIX = "STACKQL_SMOKE_"
FIXTURE_TABLE = "public.stackql_smoke_fixture"
INTER_REQUEST_DELAY_S = 1.2  # ~50 req/min, under the documented limit with margin (NOTES.md finding 6)
# x-stackQL-envVar server variable resolution (SUPABASE_PROJECT_ID) landed in
# stackql v0.10.601 (any-sdk v0.5.4-alpha01, stackql/stackql#707). pystackql
# manages its own stackql binary, so the harness upgrades it when older.
MIN_STACKQL_VERSION = (0, 10, 601)

ERROR_RE = re.compile(
    r"http response status code: [45]|over HTTP error|error assembling|"
    r"cannot find matching operation|FindRoute|no matching operation|"
    r"cannot find any viable servers|parser error|panic|"
    r"no request body for operation|schema unsuitable|Unauthorized|Forbidden",
    re.I,
)
RATE_LIMIT_RE = re.compile(r"status code: 429|Too Many Requests|rate limit", re.I)


class Smoke:
    def __init__(self, args: argparse.Namespace) -> None:
        self.args = args
        self.stamp = str(int(time.time()))[-6:]
        self.name = f"{SMOKE_PREFIX}{self.stamp}"
        self.secret_name = f"{SECRET_PREFIX}{self.stamp}"
        self.results: list[tuple[str, str, str]] = []
        self.requests = 0

        for var in ("SUPABASE_ACCESS_TOKEN", "SUPABASE_PROJECT_ID"):
            if not os.environ.get(var):
                sys.exit(f"{var} is not set - see the module docstring")
        self.ref = os.environ["SUPABASE_PROJECT_ID"]

        from pystackql import StackQL

        if not args.live:
            reg_path = (BASE_DIR / "provider-dev" / "openapi").resolve()
            reg_url = "file://" + reg_path.as_posix()
            self.sq = StackQL(output="dict", custom_registry=reg_url)
            # pystackql only serialises {"url": ...}; a local file registry
            # additionally needs localDocRoot + nopVerify - patch the exec
            # params in place (compact JSON, shell-quoted).
            full = json.dumps(
                {"url": reg_url, "localDocRoot": reg_path.as_posix(), "verifyConfig": {"nopVerify": True}},
                separators=(",", ":"),
            )
            if sys.platform.startswith("win"):
                quoted = '"' + full.replace('"', '\\"') + '"'
            else:
                import shlex
                quoted = shlex.quote(full)
            params = self.sq.local_query_executor.params
            for i, p in enumerate(params):
                if p == "--registry":
                    params[i + 1] = quoted
                    break
        else:
            self.sq = StackQL(output="dict")
        self.ensure_stackql_version()

    def ensure_stackql_version(self) -> None:
        def parse(v: str) -> tuple[int, ...]:
            return tuple(int(x) for x in re.findall(r"\d+", str(v))[:3])

        current = parse(getattr(self.sq, "version", "") or "")
        if current and current >= MIN_STACKQL_VERSION:
            return
        print(f"stackql {self.sq.version} at {self.sq.bin_path} is older than "
              f"v{'.'.join(map(str, MIN_STACKQL_VERSION))} (x-stackQL-envVar support) - upgrading pystackql's binary")
        self.sq.upgrade(showprogress=False)
        if parse(self.sq.version) < MIN_STACKQL_VERSION:
            sys.exit(f"stackql {self.sq.version} is still too old after upgrade")

    # ------------------------------------------------------------------ core
    def q(self, sql: str):
        # serial pacing under the per-user rate limit
        if self.requests:
            time.sleep(INTER_REQUEST_DELAY_S)
        self.requests += 1
        try:
            if sql.lstrip().upper().startswith(("SELECT", "SHOW", "DESCRIBE")) or "RETURNING" in sql.upper():
                out = self.sq.execute(sql)
            else:
                out = self.sq.executeStmt(sql)
        except Exception as exc:  # noqa: BLE001
            return [], str(exc)
        text = json.dumps(out, default=str)
        if RATE_LIMIT_RE.search(text):
            return out if isinstance(out, list) else [out], "RATE LIMITED (429) - harness pacing bug: " + text
        if ERROR_RE.search(text):
            return out if isinstance(out, list) else [out], text
        if isinstance(out, list) and out and isinstance(out[0], dict) and "error" in out[0]:
            return out, text
        return out if isinstance(out, list) else [out], None

    def step(self, name: str, sql: str, expect_rows: bool = False, contains: str | None = None):
        rows, err = self.q(sql)
        if err:
            self.results.append((name, "FAIL", err[:200]))
            print(f"  FAIL  {name}  [{err[:140]}]")
            return None
        blob = json.dumps(rows, default=str)
        if expect_rows and not rows:
            self.results.append((name, "FAIL", "expected rows, got none"))
            print(f"  FAIL  {name}  [no rows]")
            return None
        if contains and contains not in blob:
            self.results.append((name, "FAIL", f"'{contains}' not in result"))
            print(f"  FAIL  {name}  ['{contains}' not in {blob[:100]}]")
            return None
        self.results.append((name, "PASS", ""))
        print(f"  PASS  {name}")
        return rows

    def note(self, name: str, ok: bool, detail: str = "") -> None:
        self.results.append((name, "PASS" if ok else "FAIL", detail))
        print(f"  {'PASS' if ok else 'FAIL'}  {name}{('  [' + detail[:120] + ']') if detail and not ok else ''}")

    def wait_for(self, name: str, sql: str, pred, timeout: int = 900, interval: int = 15):
        start = time.time()
        last = None
        while time.time() - start < timeout:
            rows, err = self.q(sql)
            last = err or json.dumps(rows, default=str)[:160]
            if not err and pred(rows):
                self.results.append((name, "PASS", f"{int(time.time() - start)}s"))
                print(f"  PASS  {name}  ({int(time.time() - start)}s)")
                return True
            time.sleep(interval)
        self.results.append((name, "FAIL", f"timeout: {last}"))
        print(f"  FAIL  {name}  [timeout: {last}]")
        return False

    @staticmethod
    def rows_of(blob) -> list:
        # the query endpoint result arrives as one row whose `rows` column
        # carries the result set (JSON text or already-parsed)
        if isinstance(blob, str):
            try:
                return json.loads(blob)
            except ValueError:
                return []
        return blob or []

    # ------------------------------------------------------- breadcrumb sweep
    def cleanup_breadcrumbs(self) -> None:
        print("== breadcrumb sweep ==")
        rows, err = self.q("SELECT name FROM supabase.secrets.secrets")
        if err:
            print(f"  WARN secrets sweep list failed: {err[:120]}")
        else:
            for r in rows:
                if str(r.get("name", "")).startswith(SECRET_PREFIX):
                    print(f"  sweeping secret {r['name']}")
                    self.q(f"DELETE FROM supabase.secrets.secrets WHERE name = '{r['name']}'")
        rows, err = self.q("SELECT slug FROM supabase.functions.edge_functions")
        if err:
            print(f"  WARN functions sweep list failed: {err[:120]}")
        else:
            for r in rows:
                if str(r.get("slug", "")).startswith(SMOKE_PREFIX):
                    print(f"  sweeping edge function {r['slug']}")
                    self.q(f"DELETE FROM supabase.functions.edge_functions WHERE function_slug = '{r['slug']}'")
        rows, err = self.q("SELECT id, name FROM supabase.secrets.api_keys")
        if err:
            print(f"  WARN api keys sweep list failed: {err[:120]}")
        else:
            for r in rows:
                if str(r.get("name", "")).startswith(SMOKE_PREFIX):
                    print(f"  sweeping api key {r['name']}")
                    self.q(f"DELETE FROM supabase.secrets.api_keys WHERE id = '{r['id']}'")
        self.q(f"INSERT INTO supabase.database.queries (query) SELECT 'drop table if exists {FIXTURE_TABLE}' RETURNING rows")
        if self.args.with_project_lifecycle or self.args.cleanup_only:
            rows, err = self.q("SELECT id, name, status FROM supabase.projects.projects")
            if err:
                print(f"  WARN projects sweep list failed: {err[:120]}")
                return
            for r in rows:
                if str(r.get("name", "")).startswith(SMOKE_PREFIX):
                    print(f"  sweeping project {r['name']} ({r['id']}, {r.get('status')})")
                    self.q(f"DELETE FROM supabase.projects.projects WHERE ref = '{r['id']}'")

    # -------------------------------------------------------------- read path
    def read_smokes(self) -> None:
        print("== read smokes ==")
        self.step("show services", "SHOW SERVICES IN supabase", expect_rows=True, contains="projects")
        self.step("profile (the PAT identity)", "SELECT primary_email, username FROM supabase.profile.profiles", expect_rows=True)
        orgs = self.step("organizations list", "SELECT id, slug, name FROM supabase.organizations.organizations", expect_rows=True)
        self.step("projects estate inventory", "SELECT id, name, region, status, organization_slug FROM supabase.projects.projects", expect_rows=True, contains=self.ref)
        self.step("project get (WHERE ref)", f"SELECT name, status, json_extract(\"database\", '$.version') AS pg FROM supabase.projects.projects WHERE ref = '{self.ref}'", expect_rows=True)
        if orgs:
            slug = orgs[0]["slug"]
            self.step("organization projects ($.projects, slug scope)", f"SELECT ref, name, status FROM supabase.projects.organization_projects WHERE slug = '{slug}'", expect_rows=True)
            self.step("organization members", f"SELECT user_name, role_name, mfa_enabled FROM supabase.organizations.members WHERE slug = '{slug}'", expect_rows=True)
        # the posture set (ref resolved from SUPABASE_PROJECT_ID - no WHERE)
        self.step("auth config posture (signups, MFA, password policy)", "SELECT disable_signup, mfa_totp_enroll_enabled, password_min_length, site_url, mailer_otp_exp FROM supabase.config.auth_configs", expect_rows=True)
        self.step("postgres config (flat columns)", "SELECT max_connections, statement_timeout, work_mem FROM supabase.config.postgres_configs", expect_rows=True)
        self.step("ssl enforcement (snake aliases)", "SELECT applied_successfully, json_extract(current_config, '$.database') AS db_ssl FROM supabase.config.ssl_enforcement_configs", expect_rows=True)
        self.step("network restrictions", "SELECT entitlement, status, json_extract(config, '$.dbAllowedCidrs') AS cidrs FROM supabase.network.network_restrictions", expect_rows=True)
        self.step("network bans (POST-backed read)", "SELECT banned_address, identifier FROM supabase.network.network_bans")
        self.step("postgrest config", "SELECT db_schema, max_rows FROM supabase.config.postgrest_configs", expect_rows=True)
        self.step("storage config (file_size_limit alias)", "SELECT file_size_limit, json_extract(features, '$.imageTransformation.enabled') AS image_transformation FROM supabase.config.storage_configs", expect_rows=True)
        self.step("pooler config", "SELECT identifier, pool_mode, default_pool_size, db_host FROM supabase.config.pooler_configs", expect_rows=True)
        self.step("secrets inventory", "SELECT name, updated_at FROM supabase.secrets.secrets")
        self.step("api keys", "SELECT id, name, type FROM supabase.secrets.api_keys", expect_rows=True)
        self.step("edge functions", "SELECT slug, name, status, verify_jwt FROM supabase.functions.edge_functions")
        self.step("branches", "SELECT id, name, git_branch, persistent, status FROM supabase.branches.branches")
        self.step("service health (services param)", "SELECT name, healthy, status FROM supabase.projects.service_health WHERE services = 'db'", expect_rows=True)
        self.step("add-ons ($.selected_addons)", "SELECT type, json_extract(variant, '$.id') AS variant FROM supabase.billing.addons")
        self.step("security lints ($.lints)", "SELECT name, level, title FROM supabase.advisors.security_lints")
        self.step("backups ($.backups)", "SELECT id, status, inserted_at FROM supabase.database.backups")
        self.step("storage buckets", "SELECT id, name, public FROM supabase.storage.buckets")
        self.step("migrations", "SELECT version, name FROM supabase.database.migrations")
        self.step("snippets (root path, cursor pagination)", "SELECT id, name FROM supabase.database.snippets")

    # ------------------------------------------------------------- write path
    def secret_lifecycle(self) -> None:
        name = self.secret_name
        print(f"== secret lifecycle ({name}) ==")
        self.step("secret INSERT (bare-array body wrapped)", f"INSERT INTO supabase.secrets.secrets (name, value) SELECT '{name}', 'smoke-{self.stamp}'")
        rows, err = self.q("SELECT name FROM supabase.secrets.secrets")
        self.note("secret visible after INSERT", not err and any(r.get("name") == name for r in rows), err or "not in list")
        self.step("secret DELETE (bare-array body wrapped)", f"DELETE FROM supabase.secrets.secrets WHERE name = '{name}'")
        rows, err = self.q("SELECT name FROM supabase.secrets.secrets")
        self.note("secret gone after DELETE", not err and all(r.get("name") != name for r in rows), err or "")

    def api_key_lifecycle(self) -> None:
        name = self.name
        print(f"== API key lifecycle ({name}) ==")
        self.step("api key INSERT (type secret)", f"INSERT INTO supabase.secrets.api_keys (type, name, description) SELECT 'secret', '{name}', 'stackql smoke'")
        rows, err = self.q("SELECT id, name FROM supabase.secrets.api_keys")
        key = next((r for r in rows or [] if r.get("name") == name), None)
        self.note("api key visible after INSERT", bool(key), err or "not in list")
        if not key:
            return
        self.step("api key get", f"SELECT name, type FROM supabase.secrets.api_keys WHERE id = '{key['id']}'", expect_rows=True, contains="secret")
        self.step("api key UPDATE (description)", f"UPDATE supabase.secrets.api_keys SET description = 'stackql smoke v2' WHERE id = '{key['id']}'")
        self.step("api key DELETE", f"DELETE FROM supabase.secrets.api_keys WHERE id = '{key['id']}'")
        rows, err = self.q("SELECT id FROM supabase.secrets.api_keys")
        self.note("api key gone after DELETE", not err and all(r.get("id") != key["id"] for r in rows), err or "")

    def edge_function_lifecycle(self) -> None:
        slug = self.name
        print(f"== edge function lifecycle ({slug}) - JSON create (vendor-deprecated in favour of the multipart deploy; the CLI is the deploy path) ==")
        body = 'Deno.serve(() => new Response("stackql smoke"))'
        self.step("edge function INSERT", f"INSERT INTO supabase.functions.edge_functions (slug, name, body, verify_jwt) SELECT '{slug}', 'stackql smoke', '{body}', true")
        rows, err = self.q(f"SELECT slug, name, status FROM supabase.functions.edge_functions WHERE function_slug = '{slug}'")
        if err or not rows:
            self.note("edge function visible after INSERT", False, err or "not found")
            return
        self.note("edge function visible after INSERT", True)
        self.step("edge function UPDATE (name)", f"UPDATE supabase.functions.edge_functions SET name = 'stackql smoke v2' WHERE function_slug = '{slug}'")
        self.step("edge function reflects UPDATE", f"SELECT name FROM supabase.functions.edge_functions WHERE function_slug = '{slug}'", expect_rows=True, contains="v2")
        self.step("edge function DELETE", f"DELETE FROM supabase.functions.edge_functions WHERE function_slug = '{slug}'")

    def auth_config_toggle(self) -> None:
        print("== auth config toggle-and-restore (string-typed UPDATE probe, NOTES.md finding 14) ==")
        rows, err = self.q("SELECT disable_signup FROM supabase.config.auth_configs")
        if err or not rows:
            self.note("auth config read before toggle", False, err or "no rows")
            return
        original = str(rows[0].get("disable_signup")).lower() in ("true", "1")
        flipped = "false" if original else "true"
        restore = "true" if original else "false"
        rows, err = self.q(f"UPDATE supabase.config.auth_configs SET disable_signup = '{flipped}'")
        if err:
            self.note("auth config UPDATE with a string-typed boolean is accepted by the API", False, err)
            return
        rows, err = self.q("SELECT disable_signup FROM supabase.config.auth_configs")
        toggled = not err and rows and str(rows[0].get("disable_signup")).lower() == flipped
        self.note(f"auth config UPDATE (disable_signup {original} -> {flipped}) applied - the API coerces string-typed values", bool(toggled), err or json.dumps(rows, default=str)[:120])
        rows, err = self.q(f"UPDATE supabase.config.auth_configs SET disable_signup = '{restore}'")
        rows2, err2 = self.q("SELECT disable_signup FROM supabase.config.auth_configs")
        restored = not err and not err2 and rows2 and str(rows2[0].get("disable_signup")).lower() == restore
        self.note("auth config restored", bool(restored), err or err2 or json.dumps(rows2, default=str)[:120])

    def network_restrictions_reapply(self) -> None:
        print("== network restrictions idempotent re-apply (EXEC with camelCase body) ==")
        rows, err = self.q("SELECT json_extract(config, '$.dbAllowedCidrs') AS v4, json_extract(config, '$.dbAllowedCidrsV6') AS v6 FROM supabase.network.network_restrictions")
        if err or not rows:
            self.note("network restrictions read", False, err or "no rows")
            return
        v4 = rows[0].get("v4") or "[]"
        v6 = rows[0].get("v6") or "[]"
        v4 = v4 if isinstance(v4, str) else json.dumps(v4)
        v6 = v6 if isinstance(v6, str) else json.dumps(v6)
        self.step("network_restrictions.apply EXEC (re-applies the current allow-lists)", f"EXEC supabase.network.network_restrictions.apply @db_allowed_cidrs = '{v4}', @db_allowed_cidrs_v6 = '{v6}'")
        self.step("network restrictions unchanged after re-apply", "SELECT status, json_extract(config, '$.dbAllowedCidrs') AS v4 FROM supabase.network.network_restrictions", expect_rows=True)

    def query_round_trip(self) -> None:
        print("== database query round trip (the flagship) ==")
        rows = self.step("queries.run INSERT ... RETURNING rows (select 1)", "INSERT INTO supabase.database.queries (query) SELECT 'select 1 as one' RETURNING rows", expect_rows=True)
        if rows:
            got = self.rows_of(rows[0].get("rows"))
            self.note("select 1 result flows through the rows column", bool(got) and str(got[0].get("one")) == "1", json.dumps(rows, default=str)[:120])
        self.step("fixture table create", f"INSERT INTO supabase.database.queries (query) SELECT 'create table if not exists {FIXTURE_TABLE} (id int primary key, label text, created_at timestamptz default now())' RETURNING rows")
        self.step("fixture rows insert", f"INSERT INTO supabase.database.queries (query) SELECT 'insert into {FIXTURE_TABLE} (id, label) values (1, ''alpha''), (2, ''beta'') on conflict do nothing' RETURNING rows")
        rows = self.step("fixture select through the query endpoint", f"INSERT INTO supabase.database.queries (query) SELECT 'select id, label from {FIXTURE_TABLE} order by id' RETURNING rows", expect_rows=True)
        if rows:
            got = self.rows_of(rows[0].get("rows"))
            self.note("fixture rows projected (2 rows, json_extract-addressable)", len(got) == 2 and got[1].get("label") == "beta", json.dumps(got, default=str)[:120])
        self.step("queries.run_read_only EXEC", f"EXEC supabase.database.queries.run_read_only @query = 'select count(*) from {FIXTURE_TABLE}'")
        self.step("read_only flag on the main method", f"INSERT INTO supabase.database.queries (query, read_only) SELECT 'select count(*) as n from {FIXTURE_TABLE}', true RETURNING rows", expect_rows=True)
        self.step("fixture table drop", f"INSERT INTO supabase.database.queries (query) SELECT 'drop table if exists {FIXTURE_TABLE}' RETURNING rows")

    def project_lifecycle(self) -> None:
        name = self.name
        print(f"== project lifecycle ({name}) - gated: minutes per step, free-tier quota ==")
        orgs, err = self.q("SELECT slug FROM supabase.organizations.organizations")
        proj, err2 = self.q(f"SELECT organization_slug, region FROM supabase.projects.projects WHERE ref = '{self.ref}'")
        if err or err2 or not orgs or not proj:
            self.note("project lifecycle prerequisites (org slug, region)", False, err or err2 or "no rows")
            return
        slug = proj[0].get("organization_slug") or orgs[0]["slug"]
        region = proj[0].get("region") or "us-east-1"
        db_pass = pysecrets.token_urlsafe(24)
        self.step("project INSERT (free plan, standing project's org and region)", f"INSERT INTO supabase.projects.projects (name, organization_slug, region, db_pass, plan) SELECT '{name}', '{slug}', '{region}', '{db_pass}', 'free'")
        found: dict = {}

        def seen(rows):
            p = next((r for r in rows if r.get("name") == name), None)
            if p:
                found.update(p)
            return bool(p)

        if not self.wait_for("project visible after INSERT", "SELECT id, name, status FROM supabase.projects.projects", seen, timeout=120, interval=10):
            return
        ref = found["id"]
        try:
            self.wait_for("project ACTIVE_HEALTHY", f"SELECT status FROM supabase.projects.projects WHERE ref = '{ref}'", lambda rows: rows and rows[0].get("status") == "ACTIVE_HEALTHY")
            self.step("new project auth config read", f"SELECT disable_signup FROM supabase.config.auth_configs WHERE ref = '{ref}'", expect_rows=True)
            self.step("project EXEC pause", f"EXEC supabase.projects.projects.pause @ref = '{ref}'")
            self.wait_for("project INACTIVE after pause", f"SELECT status FROM supabase.projects.projects WHERE ref = '{ref}'", lambda rows: rows and rows[0].get("status") == "INACTIVE")
        finally:
            self.step("project DELETE", f"DELETE FROM supabase.projects.projects WHERE ref = '{ref}'")
            self.wait_for("project gone", "SELECT id FROM supabase.projects.projects", lambda rows: all(r.get("id") != ref for r in rows), timeout=300)

    # ---------------------------------------------------------------- summary
    def summary(self) -> int:
        print("\n== summary ==")
        counts = {"PASS": 0, "FAIL": 0}
        for name, status, note in self.results:
            counts[status] = counts.get(status, 0) + 1
            if status != "PASS":
                print(f"  {status:5s} {name}  [{note[:110]}]")
        print(f"  {counts['PASS']} passed, {counts['FAIL']} failed; {self.requests} statements, paced at {INTER_REQUEST_DELAY_S}s "
              f"(registry: {'public' if self.args.live else 'local'}, project: {self.ref})")
        return 1 if counts["FAIL"] else 0


def main() -> int:
    ap = argparse.ArgumentParser(description="supabase provider smoke test")
    ap.add_argument("--live", action="store_true", help="run against the published provider in the stackql registry (default: the local provider-dev/openapi file registry)")
    ap.add_argument("--cleanup-only", action="store_true", help="sweep stackql-smoke-* breadcrumbs and exit")
    ap.add_argument("--read-only", action="store_true", help="read smokes only")
    ap.add_argument("--with-project-lifecycle", action="store_true",
                    help="also run the gated project create / pause / delete lifecycle (off by default: minutes per step, free-tier quota)")
    args = ap.parse_args()

    smoke = Smoke(args)
    print(f"supabase smoke test  registry={'public' if args.live else 'local'}  project={smoke.ref}  "
          f"name={smoke.name}  stackql={smoke.sq.version}")
    smoke.cleanup_breadcrumbs()
    if args.cleanup_only:
        return 0
    smoke.read_smokes()
    if not args.read_only:
        smoke.secret_lifecycle()
        smoke.api_key_lifecycle()
        smoke.edge_function_lifecycle()
        smoke.auth_config_toggle()
        smoke.network_restrictions_reapply()
        smoke.query_round_trip()
        if args.with_project_lifecycle:
            smoke.project_lifecycle()
    return smoke.summary()


if __name__ == "__main__":
    sys.exit(main())
