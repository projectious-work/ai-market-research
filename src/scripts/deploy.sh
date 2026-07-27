#!/usr/bin/env bash
# Deprecated: the published site is now the Hugo/Docsy site built by
# scripts/build-docs.sh, not a raw dist/dashboard.html copied to gh-pages
# root. This wrapper delegates to scripts/deploy-docs.sh so existing
# callers (and muscle memory) keep working.
#
# Canonical entry point: scripts/deploy-docs.sh
set -euo pipefail
ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
echo "note: src/scripts/deploy.sh is deprecated -- use scripts/deploy-docs.sh" >&2
exec bash "$ROOT_DIR/scripts/deploy-docs.sh" "$@"
