#!/usr/bin/env bash
# Phase 7 — Release notes assembly (gate: release-notes-drafted)
#
# Drafts release notes from data.changelog (most recent N entries) and
# git log since the previous tag. Writes the draft to evidence dir; the
# operator finalises and passes the final text to phase 8 via $NOTES.
set -eo pipefail
REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)"
. "$REPO_ROOT/src/scripts/release/_lib.sh"
cd "$REPO_ROOT"

VERSION="${VERSION:-}"
[ -n "$VERSION" ] || { log_fail "VERSION not set"; exit 2; }

EV_DIR="$(ensure_evidence_dir)"
EV="$EV_DIR/phase7-notes-v${VERSION}.md"

LAST_TAG="$(git describe --tags --abbrev=0 2>/dev/null || echo "")"
{
  echo "# Draft release notes — v$VERSION"
  echo ""
  echo "Generated at $(date -u +%Y-%m-%dT%H:%M:%SZ). Edit, then pass the"
  echo "final text to phase 8 (release-cut) via the NOTES env var."
  echo ""
  echo "## Changelog deltas (most recent 8)"
  echo ""
  python3 - <<'PY'
import json
d = json.load(open("data/market-state.json"))
for e in (d.get("changelog") or [])[:8]:
    print(f"- [{e.get('date','?')}] [{e.get('tag','?')}] {e.get('text','')}")
PY
  echo ""
  if [ -n "$LAST_TAG" ]; then
    echo "## Commits since $LAST_TAG"
    echo ""
    git log "${LAST_TAG}..HEAD" --oneline | sed 's/^/- /'
  else
    echo "## Recent commits (no prior tag)"
    echo ""
    git log --oneline -10 | sed 's/^/- /'
  fi
  echo ""
  echo "## Live"
  echo "- https://projectious-work.github.io/ai-market-research/"
} > "$EV"

log_ok "draft notes → $EV"

if [ -n "${NOTES:-}" ]; then
  log_ok "NOTES env var is set ($(echo "$NOTES" | wc -c) chars); phase 8 will use it"
else
  log_warn "NOTES env var not set — phase 8 will fall back to a generic message"
  log_info "edit $EV and set NOTES='<final text>' before running phase 8"
fi
