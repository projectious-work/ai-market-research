#!/usr/bin/env bash
# Phase 4 — Build + UI smoke test (gate: release-build-smoke-ok)
#
# Runs release-check.sh (validates JSON, rebuilds, sanity-checks artifact),
# then prompts for a manual confirmation that all 6 tabs render without
# JS errors. In non-interactive mode, fails unless RELEASE_AUTO_CONFIRM=1.
set -euo pipefail
REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)"
. "$REPO_ROOT/src/scripts/release/_lib.sh"
cd "$REPO_ROOT"

log_info "running release-check.sh"
bash src/scripts/release-check.sh

echo ""
log_info "MANUAL: open dist/dashboard.html in a browser"
log_info "  - Click through every tab (Dashboard, Models, Harnesses, Self-Hosting, Strategy, Sources)"
log_info "  - Confirm no JS console errors"
log_info "  - Confirm filter controls (reference model, jurisdiction, workload) still respond"
echo ""

if confirm "Manual smoke test passed?"; then
  log_ok "smoke test confirmed"
else
  log_fail "smoke test not confirmed"
  exit 1
fi
