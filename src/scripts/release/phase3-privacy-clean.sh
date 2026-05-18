#!/usr/bin/env bash
# Phase 3 — Security & data privacy sweep (gate: release-privacy-clean)
#
# Grep delivered surface for personal-data markers listed in
# src/scripts/release/privacy-markers.txt (gitignored). Missing or empty
# markers file is a WARN, not a FAIL — so a fresh clone can run the
# orchestrator without the maintainer's marker list.
set -euo pipefail
REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)"
. "$REPO_ROOT/src/scripts/release/_lib.sh"
cd "$REPO_ROOT"

MARKERS_FILE="src/scripts/release/privacy-markers.txt"
SEARCH_PATHS=(src data dist .claude/agents README.md AGENTS.md CLAUDE.md LICENSE)

if [ ! -f "$MARKERS_FILE" ]; then
  log_warn "no $MARKERS_FILE — copy privacy-markers.txt.template and add your markers"
  log_warn "sweep skipped; gate not asserting cleanliness this run"
  exit 0
fi

# Build alternation pattern from non-blank, non-comment lines.
patterns=$(grep -vE '^\s*$|^\s*#' "$MARKERS_FILE" | paste -sd '|' -)
if [ -z "$patterns" ]; then
  log_warn "markers file is empty — no patterns to check"
  exit 0
fi

# Narrow search to existing paths only.
existing=()
for p in "${SEARCH_PATHS[@]}"; do
  [ -e "$p" ] && existing+=("$p")
done

set +e
hits=$(grep -riIE --color=never "$patterns" "${existing[@]}" 2>/dev/null)
set -e

if [ -n "$hits" ]; then
  EV_DIR="$(ensure_evidence_dir)"
  EV="$EV_DIR/phase3-privacy-hits.txt"
  echo "$hits" > "$EV"
  count=$(echo "$hits" | wc -l)
  log_fail "$count personal-data hit(s) across delivered surface — see $EV"
  echo "$hits" | head -10 | sed 's/^/         /'
  [ "$count" -gt 10 ] && echo "         (+$((count - 10)) more in evidence file)"
  exit 1
fi

n_patterns=$(echo "$patterns" | tr '|' '\n' | wc -l)
log_ok "0 hits across ${#existing[@]} paths for $n_patterns marker(s)"
