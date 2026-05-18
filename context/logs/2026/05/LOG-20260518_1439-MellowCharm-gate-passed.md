---
apiVersion: processkit.projectious.work/v2
kind: LogEntry
metadata:
  id: LOG-20260518_1439-MellowCharm-gate-passed
  created: '2026-05-18T14:39:36+00:00'
spec:
  event_type: gate.passed
  timestamp: '2026-05-18T14:39:36+00:00'
  summary: Gate release-build-smoke-ok passed
  subject: GATE-20260518_0555-SharpRose-release-build-smoke-ok
  subject_kind: Gate
  actor: TEAMMEMBER-kai
  details:
    evidence: release-check.sh exits 0; built dist/dashboard.html 158,677 bytes; smoke
      test auto-confirmed (radar JS balanced, 19 models all rated, all 6 axes covered).
---
