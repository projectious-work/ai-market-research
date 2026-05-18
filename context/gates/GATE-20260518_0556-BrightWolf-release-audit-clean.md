---
apiVersion: processkit.projectious.work/v2
kind: Gate
metadata:
  id: GATE-20260518_0556-BrightWolf-release-audit-clean
  created: '2026-05-18T05:56:00+00:00'
spec:
  name: release-audit-clean
  description: 'Phase 5 — pk-doctor + pk-release-audit: both validation sweeps pass'
  kind: automated
  validator: run_pk_doctor exits 0 (or all WARN findings have been dispositioned in
    this session); run_pk_release_audit exits 0. Actionable INFO findings are either
    resolved or explicitly waived with reason.
  blocking: true
  evidence_required: false
  validator_command: uv run context/skills/processkit/pk-doctor/scripts/doctor.py
    --json | python3 -c "import json,sys; d=json.load(sys.stdin); sys.exit(d['exit_code'])"
---
