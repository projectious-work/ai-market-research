#!/usr/bin/env bash
# Deprecated: the published site is now the branded Hugo site built by
# docs/scripts/build-docs.sh, not a raw dist/dashboard.html copied to gh-pages
# root. This wrapper delegates to docs/scripts/deploy-docs.sh so existing
# callers (and muscle memory) keep working.
#
# Canonical entry point: docs/scripts/deploy-docs.sh
set -euo pipefail
ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
echo "note: src/scripts/deploy.sh is deprecated -- use docs/scripts/deploy-docs.sh" >&2
exec bash "$ROOT_DIR/docs/scripts/deploy-docs.sh" "$@"
