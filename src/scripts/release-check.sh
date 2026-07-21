#!/usr/bin/env bash
# Minimal release-prep validation for the prototype dashboard.
#
# This is intentionally local and deterministic:
#   1. Validate the canonical JSON state.
#   2. Rebuild the dashboard artifact.
#   3. Confirm the generated artifact exists and no template placeholder
#      leaked through the build.
#
# It does not cut tags, publish assets, or touch processkit state.
set -euo pipefail

REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

echo "validating canonical Git email"
bash src/scripts/check-git-email.sh

echo "validating data/market-state.json"
python3 -m json.tool data/market-state.json > /dev/null

echo "building dist/dashboard.html"
bash src/scripts/build.sh

if [ ! -s dist/dashboard.html ]; then
  echo "fatal: dist/dashboard.html missing or empty after build" >&2
  exit 1
fi

if grep -q "__MARKET_DATA__" dist/dashboard.html; then
  echo "fatal: build output still contains __MARKET_DATA__" >&2
  exit 1
fi

echo "release-check ok"
