#!/usr/bin/env bash
# Phase 6 — Documentation update (gate: release-docs-current)
#
# Shows the diff of README.md + docs/ since the previous tag and prompts
# for manual confirmation that docs reflect the release's content. For
# tooling-only releases with no user-facing change, set
# RELEASE_NO_DOC_CHANGE=1 to waive.
set -euo pipefail
REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)"
. "$REPO_ROOT/src/scripts/release/_lib.sh"
cd "$REPO_ROOT"

if [ "${RELEASE_NO_DOC_CHANGE:-0}" = "1" ]; then
  log_info "RELEASE_NO_DOC_CHANGE=1 → waiving docs check for this release"
  exit 0
fi

LAST_TAG="$(git describe --tags --abbrev=0 2>/dev/null || echo "")"
DOC_PATHS=(README.md AGENTS.md CLAUDE.md docs/)
existing=()
for p in "${DOC_PATHS[@]}"; do [ -e "$p" ] && existing+=("$p"); done

EV_DIR="$(ensure_evidence_dir)"
EV="$EV_DIR/phase6-docs-diff.txt"

if [ -n "$LAST_TAG" ]; then
  log_info "doc changes since $LAST_TAG:"
  set +e
  git diff --stat "$LAST_TAG"..HEAD -- "${existing[@]}" > "$EV"
  set -e
  if [ ! -s "$EV" ]; then
    log_warn "no doc changes since $LAST_TAG"
    log_warn "if this release has user-facing changes, the docs are likely stale"
    if ! confirm "Continue without doc updates?"; then
      log_fail "docs gate failed: no doc changes for a release that may need them"
      exit 1
    fi
  else
    cat "$EV" | sed 's/^/      /'
    echo ""
  fi
else
  log_info "no prior tag — first release; doc baseline assumed current"
fi

if confirm "Are README and other docs accurate for this release?"; then
  log_ok "docs confirmed current"
else
  log_fail "docs gate failed: maintainer says docs are stale"
  exit 1
fi
