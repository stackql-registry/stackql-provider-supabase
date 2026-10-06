# StackQL supabase (Supabase Management API) provider build pipeline.
#
# Every step is deterministic and re-runnable; manual mapping decisions live
# in provider-dev/scripts, never in hand-edited artifacts. `make all` runs
# the full chain: fetch/verify the spec pin -> inventory -> split service
# specs -> mappings -> pre-normalize -> normalize -> generate -> post-process
# -> offline + integration + meta-route tests -> docs -> website build.
# `make smoke` (live, needs credentials) is separate so `all` never touches
# a real account.
#
# Requirements: Node >= 20, GNU make, a stackql binary ($STACKQL, ./stackql
# or on PATH), Python 3 (a venv with pystackql is created on demand for the
# smoke suite), yarn for the website. Runs under Linux / WSL / macOS.
#
# Live credentials for the smoke suite (never committed - .env is
# gitignored; `make smoke` sources it if present):
#   SUPABASE_ACCESS_TOKEN   personal access token (the CLI / Terraform variable)
#   SUPABASE_PROJECT_ID     the standing dev project's ref (x-stackQL-envVar
#                           target; the smoke suite runs against this project)

SHELL := bash
.DEFAULT_GOAL := help

PROVIDER := supabase
SOURCE_PROJECT ?= https://github.com/stackql-registry/stackql-provider-$(PROVIDER)
SERVICES_DIR := provider-dev/openapi/src/$(PROVIDER)
# The project-scoped server template ({ref} resolved from SUPABASE_PROJECT_ID
# via x-stackQL-envVar) is the single source of truth in
# provider-dev/config/servers.json - shared by bin/split.mjs and this file.
SERVERS := provider-dev/config/servers.json
# Bearer auth from SUPABASE_ACCESS_TOKEN; snake_case_aliases presents the
# handful of camelCase wire properties as snake_case columns (paired with
# request.nativeCasing: camel on the three camelCase-body methods, set in
# post_process) - the oci/clickhouse precedent.
PROVIDER_CONFIG := {"auth": {"type": "bearer", "credentialsenvvar": "SUPABASE_ACCESS_TOKEN"}, "snake_case_aliases": true}
# NOTE: no pagination config is shipped on the command line - the single
# cursor-paginated collection (snippets) is configured per method in
# post_process; every other collection returns the complete bounded result
# (verified in the endpoint inventory, NOTES.md finding 3).
VENV := .venv
PY := $(VENV)/bin/python
ENV_FILE := .env

.PHONY: help deps fetch-spec refresh-spec inventory split mappings pre-normalize normalize generate post-process build \
        test-offline test-integration test-meta test smoke smoke-live smoke-read-only smoke-project-lifecycle smoke-cleanup venv \
        docs website website-start clean all

help: ## show this help
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-24s %s\n", $$1, $$2}'

deps: ## install node dependencies (latest @stackql/provider-utils per package.json range)
	npm install

# ---------------------------------------------------------------- pipeline

fetch-spec: ## download the Management API spec and verify it against the pin (fails on drift)
	npm run fetch-spec

refresh-spec: ## download the spec and ACCEPT the upstream change (rewrites the pin - review the diff)
	npm run fetch-spec -- --update

inventory: ## build provider-dev/config/endpoint_inventory.csv from the pinned spec
	npm run build-inventory

split: ## split the pinned spec into per-service specs on the project-scoped server template
	npm run split -- --provider-name $(PROVIDER) --overwrite

mappings: ## regenerate all_services.csv from scratch and apply the deterministic verb mappings (fails on unmapped ops)
	rm -f provider-dev/config/all_services.csv
	npm run generate-mappings -- --provider-name $(PROVIDER) --input-dir provider-dev/source --output-dir provider-dev/config
	npm run map-operations

pre-normalize: ## supabase-specific spec adjustments (eszip variant, query result schema, legacy query params, secrets bodies, pooler duplicate)
	node provider-dev/scripts/pre_normalize.mjs

normalize: ## generic provider-utils normalize pass (allOf flatten, bare-array wrap, ...)
	npm run normalize -- --api-dir provider-dev/source

generate: ## generate the provider (bearer auth, project-scoped servers, naive request body translate)
	rm -rf provider-dev/openapi/*
	npm run generate-provider -- \
	  --provider-name $(PROVIDER) \
	  --input-dir provider-dev/source \
	  --output-dir $(SERVICES_DIR) \
	  --config-path provider-dev/config/all_services.csv \
	  --servers $(SERVERS) \
	  --provider-config '$(PROVIDER_CONFIG)' \
	  --naive-req-body-translate \
	  --overwrite
	$(MAKE) post-process

post-process: ## re-apply generated-provider fixes (root-path servers, pagination, casing, query binding, body transforms)
	node provider-dev/scripts/post_process.mjs

build: fetch-spec inventory split mappings pre-normalize normalize generate ## full spec -> provider pipeline

# ------------------------------------------------------------------- tests

test-offline: ## quick offline validation against the local file registry (SHOW / DESCRIBE)
	node tests/offline_validation.mjs

test-integration: ## row-level integration tests against the mock Management API
	node tests/integration/run_integration_tests.mjs

test-meta: ## meta-route suite against a local stackql server
	npm run start-server
	npm run test-meta-routes -- $(PROVIDER) || (npm run stop-server; exit 1)
	npm run stop-server

test: test-offline test-integration test-meta ## all non-live test layers

$(VENV)/bin/activate:
	python3 -m venv $(VENV)
	$(VENV)/bin/pip install --quiet --upgrade pip pystackql

venv: $(VENV)/bin/activate ## create the python venv with pystackql for the smoke suite

# `make smoke` sources .env when present so a developer checkout works
# without exporting anything; CI sets the variables from secrets.
with_env = set -a; [ -f $(ENV_FILE) ] && source <(tr -d '\r' < $(ENV_FILE)); set +a;

smoke: venv ## live smoke suite with the locally generated provider - reads + cheap write lifecycles (needs credentials)
	@$(with_env) $(PY) tests/smoke_test.py

smoke-live: venv ## live smoke suite against the PUBLISHED provider in the stackql registry (post-publish verification)
	@$(with_env) $(PY) tests/smoke_test.py --live

smoke-read-only: venv ## live read smokes only, no writes
	@$(with_env) $(PY) tests/smoke_test.py --read-only

smoke-project-lifecycle: venv ## live suite INCLUDING the gated project create / pause / delete lifecycle (minutes, free-tier quota)
	@$(with_env) $(PY) tests/smoke_test.py --with-project-lifecycle

smoke-cleanup: venv ## sweep stackql-smoke-* secrets, functions, API keys (and projects) and exit
	@$(with_env) $(PY) tests/smoke_test.py --cleanup-only

# -------------------------------------------------------------------- docs

docs: ## generate the website docs (snake_case surface), then sanitize
	npm run generate-docs -- \
	  --provider-name $(PROVIDER) \
	  --provider-dir ./$(SERVICES_DIR)/v00.00.00000 \
	  --output-dir ./website \
	  --provider-data-dir ./provider-dev/docgen/provider-data \
	  --snake-case-aliases \
	  --source-project $(SOURCE_PROJECT)
	node website/scripts/sanitize-docs.mjs

website: ## build the docusaurus microsite (vendors shared config first)
	cd website && yarn install && yarn build

website-start: ## run the docusaurus dev server
	cd website && yarn install && yarn start

clean: ## remove generated artifacts (provider output, docs, website build, test registry copy)
	rm -rf provider-dev/openapi/* website/build website/.docusaurus website/docs/services tests/integration/.registry-tmp

all: deps build test docs website ## everything non-live: deps, pipeline, tests, docs, site build
