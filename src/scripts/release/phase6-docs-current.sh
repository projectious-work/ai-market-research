#!/usr/bin/env bash
# Phase 6 — Documentation update (gate: release-docs-current)
#
# Shows the diff of README.md + docs/ since the previous tag and prompts
# for manual confirmation that docs reflect the release's content. For
# tooling-only releases with no user-facing change, set
# RELEASE_NO_DOC_CHANGE=1 to waive.
set -eo pipefail
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

# ── License safeguard ────────────────────────────────────────────────
# Verify README carries the retroactive license note and that the
# license name in it matches the LICENSE file's first line.
echo ""
log_info "── license safeguard ──"

[ -f LICENSE ] || { log_fail "no LICENSE file at repo root"; exit 1; }
[ -f README.md ] || { log_fail "no README.md at repo root"; exit 1; }

# Extract license name from LICENSE first line: "MIT License", "Apache
# License 2.0", "BSD 3-Clause License", etc. Heuristic: take everything
# before " License" (case-insensitive).
LIC_LINE="$(head -1 LICENSE | tr -d '\r')"
LIC_NAME="$(echo "$LIC_LINE" | sed -E 's/[[:space:]]+[Ll]icense.*$//; s/[[:space:]]+$//')"
[ -n "$LIC_NAME" ] || { log_fail "could not extract license name from LICENSE first line: '$LIC_LINE'"; exit 1; }
log_info "LICENSE declares: $LIC_NAME"

# README must mention the correct license name AND the retroactive phrase.
if ! grep -qE "$LIC_NAME[[:space:]]+License" README.md; then
  log_fail "README.md does not reference '$LIC_NAME License' — update the License section"
  exit 1
fi
if ! grep -qiE "historical commits[[:space:]]+and[[:space:]]+tags" README.md; then
  log_fail "README.md missing retroactive license phrase ('historical commits and tags')"
  log_fail "the release-process safeguard requires this exact wording in the License section"
  exit 1
fi
log_ok "README carries the retroactive '$LIC_NAME License' note covering historical commits + tags"
