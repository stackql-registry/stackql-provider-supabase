#!/usr/bin/env bash
# Ad-hoc live probe: runs one SQL statement against the local provider-dev
# registry with credentials from .env and prints the stackql JSON output.
# Usage: bash tests/live_probe.sh "<sql>" [--raw <api path>]
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; source <(tr -d '\r' < .env); set +a
ROOT="$(pwd)/provider-dev/openapi"
REG="{\"url\":\"file://$ROOT\",\"localDocRoot\":\"$ROOT\",\"verifyConfig\":{\"nopVerify\":true}}"
stackql exec --registry "$REG" -o json "$1" 2>&1
if [ "${2:-}" = "--raw" ]; then
  echo "--- raw GET $3 ---"
  curl -s -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" "https://api.supabase.com$3"
  echo
fi
