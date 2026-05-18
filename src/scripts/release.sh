#!/usr/bin/env bash
# release.sh — phase orchestrator for the 10-phase release process
# (DEC-20260518_0554-DaringCoral, ART-20260518_0557-CheerfulTrout).
#
# Each phase is a separate script in src/scripts/release/phaseN-*.sh.
# This orchestrator dispatches phase scripts in order, halting on the
# first non-zero exit. Provider-independent: bash + python3 + git + gh
# + curl. Does not call MCP tools; an agent wrapping this run may
# record `evaluate_gate` after each phase.
#
# Usage:
#   release.sh --list
#       List phases with their names and gate IDs.
#
#   release.sh --phase N [<version>] [--notes "..."]
#       Run only phase N (0..9). VERSION must be passed for phases that
#       need it (0, 7, 8, 9); see per-phase scripts for required env.
#
#   release.sh --from A --to B [<version>] [--notes "..."]
#       Run phases A through B inclusive.
#
#   release.sh --all <version> --notes "..."
#       Run all 10 phases (a full release).
#
# Per-phase environment overrides:
#   RELEASE_NONINTERACTIVE=1   skip y/N prompts (paired with explicit confirms)
#   RELEASE_AUTO_CONFIRM=1     treat all manual confirms as yes (use with care)
#   RELEASE_NO_DATA_CHANGE=1   waive phase 1 (data refresh)
#   RELEASE_NO_DOC_CHANGE=1    waive phase 6 (docs)
#   RELEASE_SITE_URL=<url>     override phase 9's target URL
#   NOTES="..."                release notes for phases 7 and 8
#   SCOPE_NOTE="..."           scope paragraph for phase 0
set -euo pipefail

REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
PHASE_DIR="$REPO_ROOT/src/scripts/release"

# Phase ordinal → (script-basename, gate-name)
PHASES=(
  "phase0-scope            release-scope-decided"
  "phase1-data-refresh     release-data-refreshed"
  "phase2-citations-valid  release-citations-valid"
  "phase3-privacy-clean    release-privacy-clean"
  "phase4-build-smoke      release-build-smoke-ok"
  "phase5-audit-clean      release-audit-clean"
  "phase6-docs-current     release-docs-current"
  "phase7-notes-drafted    release-notes-drafted"
  "phase8-cut              release-cut"
  "phase9-post-verified    release-post-verified"
)
PHASE_COUNT=${#PHASES[@]}

usage() { sed -n '2,33p' "$0"; exit "${1:-0}"; }

list_phases() {
  echo "Release process phases (DEC-20260518_0554-DaringCoral):"
  echo ""
  printf "  %-3s %-25s %s\n" "#" "Script" "Gate"
  printf "  %-3s %-25s %s\n" "-" "------" "----"
  local i=0
  for entry in "${PHASES[@]}"; do
    read -r script gate <<<"$entry"
    printf "  %-3s %-25s %s\n" "$i" "$script.sh" "$gate"
    i=$((i + 1))
  done
}

# Parse args.
MODE=""; PHASE_N=""; FROM_N=""; TO_N=""
VERSION=""; NOTES="${NOTES:-}"
while [ $# -gt 0 ]; do
  case "$1" in
    --list)       MODE="list"; shift ;;
    --phase)      MODE="phase";  PHASE_N="$2"; shift 2 ;;
    --from)       MODE="${MODE:-range}"; FROM_N="$2"; shift 2 ;;
    --to)         MODE="${MODE:-range}"; TO_N="$2";   shift 2 ;;
    --all)        MODE="all"; shift ;;
    --notes)      NOTES="$2"; shift 2 ;;
    -h|--help)    usage 0 ;;
    -*)           echo "unknown flag: $1" >&2; usage 2 ;;
    *)
      if [ -z "$VERSION" ]; then VERSION="$1"; shift
      else echo "unexpected arg: $1" >&2; usage 2; fi ;;
  esac
done

[ -z "$MODE" ] && usage 2

if [ "$MODE" = "list" ]; then list_phases; exit 0; fi

# Determine start/end.
start=0; end=$((PHASE_COUNT - 1))
case "$MODE" in
  phase) start="$PHASE_N";   end="$PHASE_N" ;;
  range) start="${FROM_N:-0}"; end="${TO_N:-$end}" ;;
  all)   : ;;  # full range
esac

# Validate bounds.
if ! [[ "$start" =~ ^[0-9]+$ && "$end" =~ ^[0-9]+$ ]] \
  || [ "$start" -lt 0 ] || [ "$end" -ge "$PHASE_COUNT" ] || [ "$start" -gt "$end" ]; then
  echo "invalid phase range: $start..$end (have 0..$((PHASE_COUNT - 1)))" >&2
  exit 2
fi

# Export the env phase scripts may consume.
export VERSION NOTES

cd "$REPO_ROOT"

echo "Running phases $start..$end$( [ -n "$VERSION" ] && echo " for v$VERSION" )"
echo ""

overall=0
for i in $(seq "$start" "$end"); do
  entry="${PHASES[$i]}"
  read -r script gate <<<"$entry"
  echo "═══ Phase $i — $script  ($gate) ═══"
  if bash "$PHASE_DIR/$script.sh"; then
    echo ""
  else
    rc=$?
    echo ""
    echo "✗ phase $i ($script / $gate) failed with exit $rc"
    overall=$rc
    break
  fi
done

if [ "$overall" -eq 0 ]; then
  echo "All requested phases ($start..$end) passed."
fi
exit "$overall"
