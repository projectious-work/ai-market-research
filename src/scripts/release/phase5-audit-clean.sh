#!/usr/bin/env bash
# Phase 5 — pk-doctor + pk-release-audit (gate: release-audit-clean)
#
# Runs both validation sweeps via their underlying scripts (not MCP tools,
# so the gate is provider-independent). Fails on non-zero exit or unresolved
# ERRORs.
set -euo pipefail
REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)"
. "$REPO_ROOT/src/scripts/release/_lib.sh"
cd "$REPO_ROOT"

DOCTOR="context/skills/processkit/pk-doctor/scripts/doctor.py"
AUDIT="context/skills/processkit/release-audit/scripts/release_audit.py"

run_check() {
  local name="$1" script="$2"
  if [ ! -f "$script" ]; then
    log_warn "$name script not found at $script — skipping"
    return 0
  fi
  log_info "running $name"
  local out rc
  set +e
  out=$(uv run "$script" --json 2>&1)
  rc=$?
  set -e
  EV_DIR="$(ensure_evidence_dir)"
  echo "$out" > "$EV_DIR/phase5-${name}.json"
  if [ "$rc" -ne 0 ]; then
    # Try to extract totals from JSON.
    local totals
    totals=$(echo "$out" | python3 -c "import json,sys;\
try:\
  d=json.loads(sys.stdin.read());\
  t=d.get('totals',{});\
  print(f\"ERROR={t.get('error',0)} WARN={t.get('warn',0)} INFO={t.get('info',0)}\")\
except Exception: print('(unparseable output)')" 2>/dev/null || echo "(no totals)")
    log_fail "$name failed (exit $rc): $totals"
    log_fail "evidence: $EV_DIR/phase5-${name}.json"
    return 1
  fi
  log_ok "$name clean"
}

overall=0
run_check pk-doctor       "$DOCTOR" || overall=1
run_check pk-release-audit "$AUDIT" || overall=1
exit "$overall"
