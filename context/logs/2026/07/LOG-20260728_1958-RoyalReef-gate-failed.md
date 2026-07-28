---
apiVersion: processkit.projectious.work/v2
kind: LogEntry
metadata:
  id: LOG-20260728_1958-RoyalReef-gate-failed
  created: '2026-07-28T19:58:54+00:00'
spec:
  event_type: gate.failed
  timestamp: '2026-07-28T19:58:54+00:00'
  summary: Gate release-audit-clean failed
  subject: GATE-20260518_0556-BrightWolf-release-audit-clean
  subject_kind: Gate
  actor: codex
  details:
    evidence: dist/release-evidence/phase5-pk-doctor.json; dist/release-evidence/phase5-pk-release-audit.json
    reason: The audits completed but reported pre-existing processkit command-wrapper,
      skill-reference, vendored/application lockfile, and historical entity hygiene
      findings unrelated to the Signal Room patch.
---
