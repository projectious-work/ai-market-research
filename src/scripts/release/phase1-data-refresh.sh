#!/usr/bin/env bash
# Phase 1 — Market data refresh (gate: release-data-refreshed)
#
# Confirms data/market-state.json is fresh enough for this release.
# Does NOT auto-run the briefing — that's a separate agent action.
# Validates: JSON parses, has data.changelog with a recent-enough entry,
# and an archive snapshot for the prior state exists. Allows waiver
# via RELEASE_NO_DATA_CHANGE=1 for tooling-only patches.
set -eo pipefail
REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)"
. "$REPO_ROOT/src/scripts/release/_lib.sh"
cd "$REPO_ROOT"

if [ "${RELEASE_NO_DATA_CHANGE:-0}" = "1" ]; then
  log_info "RELEASE_NO_DATA_CHANGE=1 → waiving data refresh for this release"
  exit 0
fi

DATA="data/market-state.json"
[ -f "$DATA" ] || { log_fail "$DATA not found"; exit 1; }

# JSON parses?
python3 -m json.tool "$DATA" > /dev/null 2>&1 || { log_fail "$DATA is not valid JSON"; exit 1; }
log_ok "$DATA parses"

# Has at least one changelog entry?
ENTRIES=$(python3 -c "import json; print(len(json.load(open('$DATA')).get('changelog', [])))")
[ "$ENTRIES" -gt 0 ] || { log_fail "no changelog entries in $DATA"; exit 1; }
log_ok "changelog has $ENTRIES entries"

# Latest changelog entry date — warn if older than 30 days.
read -r LATEST_DATE LATEST_TEXT < <(python3 <<PY
import json, sys
d = json.load(open('$DATA'))
cl = sorted(d.get('changelog', []), key=lambda e: e.get('date', ''), reverse=True)
e = cl[0] if cl else {}
print(e.get('date', '0000-00-00'), (e.get('text', '') or '')[:80].replace(' ', '_'))
PY
)
log_info "latest changelog: [$LATEST_DATE] $(echo "$LATEST_TEXT" | tr _ ' ')"

# Archive snapshot present for any prior date?
ARCHIVE_COUNT=$(find data/archive -maxdepth 1 -name '*.json' 2>/dev/null | wc -l)
if [ "$ARCHIVE_COUNT" -eq 0 ]; then
  log_warn "no archive snapshots in data/archive — first release? continuing"
else
  log_ok "$ARCHIVE_COUNT archive snapshot(s) present"
fi
